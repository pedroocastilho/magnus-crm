import {
  type RecordAlert,
  type RecordAlertFacts,
  type RecordAlertRuleRow,
} from '@/object-record/record-board/record-board-signals/types/RecordAlertRule';
import { parseStageValues } from '@/object-record/record-board/record-board-signals/utils/resolveRecordBoardSignalsConfig';
import { isNonEmptyString } from '@sniptt/guards';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

const plural = (days: number) => `${days} ${days === 1 ? 'dia' : 'dias'}`;

const normalize = (value: string) =>
  value.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();

const toDays = (value: number | null | undefined) =>
  typeof value === 'number' && Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : 0;

// Campo DATE ("2026-11-20") vale como meia-noite local; DATE_TIME como veio.
const parseDate = (value: string | null | undefined): Date | null => {
  if (!isNonEmptyString(value)) {
    return null;
  }

  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00`)
    : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

// A etapa da regra aceita o valor interno (OFERTA_APRESENTADA) ou o nome que aparece na tela (Oferta apresentada).
const matchesStage = (rule: RecordAlertRuleRow, facts: RecordAlertFacts) => {
  const stages = parseStageValues(rule.etapas);

  if (stages.length === 0) {
    return true;
  }

  return stages.some(
    (stage) =>
      stage === facts.stageValue ||
      (isNonEmptyString(facts.stageLabel) &&
        normalize(stage) === normalize(facts.stageLabel)),
  );
};

// Quantos dias o cartao esta "na condicao" (para o texto), ou null quando a regra nao dispara.
const evaluateCondition = (
  rule: RecordAlertRuleRow,
  facts: RecordAlertFacts,
  now: Date,
): number | null => {
  const minimumDays = toDays(rule.dias);
  const days = facts.daysInStage;
  const stayedLongEnough = minimumDays === 0 || (days ?? -1) >= minimumDays;

  switch (rule.condicao) {
    case 'PARADO_NA_ETAPA':
      return days !== null && days >= Math.max(minimumDays, 1) ? days : null;
    case 'CONTATO_ATRASADO': {
      const date = parseDate(facts.nextContactAt);

      if (date === null || date.getTime() >= now.getTime()) {
        return null;
      }

      const overdueDays = Math.floor(
        (now.getTime() - date.getTime()) / MILLISECONDS_PER_DAY,
      );

      return overdueDays >= minimumDays ? overdueDays : null;
    }
    case 'SEM_PROXIMO_CONTATO':
      return facts.hasNextContactField &&
        parseDate(facts.nextContactAt) === null &&
        stayedLongEnough
        ? (days ?? 0)
        : null;
    case 'SEM_VALOR':
      return facts.hasAmount === false && stayedLongEnough ? (days ?? 0) : null;
    case 'SEM_DONO':
      return facts.hasOwner === false && stayedLongEnough ? (days ?? 0) : null;
    default:
      return null;
  }
};

const defaultLabel = (
  rule: RecordAlertRuleRow,
  days: number,
  stageLabel: string,
) => {
  switch (rule.condicao) {
    case 'PARADO_NA_ETAPA':
      return `Parado há ${plural(days)} em ${stageLabel}`;
    case 'CONTATO_ATRASADO':
      return days === 0
        ? 'Contato atrasado'
        : `Contato atrasado há ${plural(days)}`;
    case 'SEM_PROXIMO_CONTATO':
      return 'Sem próximo contato';
    case 'SEM_VALOR':
      return 'Sem valor';
    default:
      return 'Sem dono';
  }
};

// Magnus (R8): regras da gestao aplicadas a um cartao aberto. Cartao em etapa de fechamento nunca tem alerta.
// Mensagem da regra aceita {dias} e {etapa}. Urgentes primeiro; mesma frase de duas regras aparece uma vez.
export const getRecordAlerts = ({
  rules,
  facts,
  now,
}: {
  rules: RecordAlertRuleRow[];
  facts: RecordAlertFacts;
  now: Date;
}): RecordAlert[] => {
  if (facts.isFinalStage) {
    return [];
  }

  const stageLabel = facts.stageLabel ?? facts.stageValue ?? 'esta etapa';
  const alerts: (RecordAlert & { position: number })[] = [];

  for (const rule of rules) {
    if (rule.ativo === false) {
      continue;
    }

    if (
      isNonEmptyString(rule.objeto) &&
      rule.objeto.trim() !== facts.objectNameSingular
    ) {
      continue;
    }

    if (!matchesStage(rule, facts)) {
      continue;
    }

    const days = evaluateCondition(rule, facts, now);

    if (days === null) {
      continue;
    }

    const label = isNonEmptyString(rule.mensagem)
      ? rule.mensagem
          .replace(/\{dias\}/g, plural(days))
          .replace(/\{etapa\}/g, stageLabel)
          .trim()
      : defaultLabel(rule, days, stageLabel);

    if (alerts.some((alert) => alert.label === label)) {
      continue;
    }

    alerts.push({
      ruleId: rule.id,
      label,
      level: rule.nivel === 'URGENTE' ? 'urgent' : 'attention',
      position: rule.position ?? 0,
    });
  }

  return alerts
    .sort(
      (first, second) =>
        Number(second.level === 'urgent') - Number(first.level === 'urgent') ||
        first.position - second.position,
    )
    .map(({ ruleId, label, level }) => ({ ruleId, label, level }));
};
