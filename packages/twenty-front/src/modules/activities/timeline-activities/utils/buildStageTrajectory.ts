import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
import { isNonEmptyString } from '@sniptt/guards';
import { parseTimelineActivityAction } from 'twenty-shared/timeline';
import { isDefined } from 'twenty-shared/utils';

export type StageTrajectoryStep = {
  stage: string;
  // null = entrou antes do primeiro evento carregado (a linha do tempo ainda nao veio inteira)
  since: Date | null;
  until: Date;
  durationMs: number | null;
  isCurrent: boolean;
};

type StageChange = { at: Date; before: string | null; after: string };

const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;
const MILLISECONDS_PER_DAY = 24 * MILLISECONDS_PER_HOUR;

const toValidDate = (value: string | null | undefined): Date | null => {
  if (!isNonEmptyString(value)) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

const toStageChange = (
  event: TimelineActivity,
  stageFieldName: string,
): StageChange | null => {
  const at = toValidDate(event.createdAt);
  const diff = event.properties?.diff?.[stageFieldName];
  const before: unknown = diff?.before;
  const after: unknown = diff?.after;

  if (at === null || !isNonEmptyString(after) || after === before) {
    return null;
  }

  return { at, before: isNonEmptyString(before) ? before : null, after };
};

// Magnus (Fase D): por onde o cartao passou, com a data de entrada e quanto tempo ficou em cada etapa.
// Monta a partir das trocas de etapa da linha do tempo; sem troca, so a etapa de hoje desde a criacao.
export const buildStageTrajectory = ({
  events,
  stageFieldName,
  currentStage,
  recordCreatedAt,
  isTimelineComplete,
  now,
}: {
  events: TimelineActivity[];
  stageFieldName: string;
  currentStage: string | null | undefined;
  recordCreatedAt: string | null | undefined;
  isTimelineComplete: boolean;
  now: Date;
}): StageTrajectoryStep[] => {
  const stageChanges = events
    .filter(
      (event) =>
        parseTimelineActivityAction(event.name) === 'updated' &&
        isDefined(event.properties?.diff?.[stageFieldName]),
    )
    .map((event) => toStageChange(event, stageFieldName))
    .filter(isDefined)
    .sort((changeA, changeB) => changeA.at.getTime() - changeB.at.getTime());

  const createdAt = toValidDate(recordCreatedAt);
  const firstChange = stageChanges.at(0);
  const steps: { stage: string; since: Date | null }[] = [];

  if (firstChange === undefined) {
    if (isNonEmptyString(currentStage)) {
      steps.push({ stage: currentStage, since: createdAt });
    }
  } else {
    if (firstChange.before !== null) {
      steps.push({
        stage: firstChange.before,
        since: isTimelineComplete ? createdAt : null,
      });
    }

    for (const change of stageChanges) {
      // Mesma etapa duas vezes seguidas (evento repetido): fica a primeira entrada.
      if (steps.at(-1)?.stage !== change.after) {
        steps.push({ stage: change.after, since: change.at });
      }
    }
  }

  return steps.map((step, index) => {
    const until = steps.at(index + 1)?.since ?? now;

    return {
      stage: step.stage,
      since: step.since,
      until,
      durationMs:
        step.since === null
          ? null
          : Math.max(0, until.getTime() - step.since.getTime()),
      isCurrent: index === steps.length - 1,
    };
  });
};

// "menos de 1h", "5h", "1 dia", "12 dias"
export const formatStageDuration = (durationMs: number | null): string => {
  if (durationMs === null) {
    return '';
  }

  if (durationMs < MILLISECONDS_PER_HOUR) {
    return 'menos de 1h';
  }

  if (durationMs < MILLISECONDS_PER_DAY) {
    return `${Math.floor(durationMs / MILLISECONDS_PER_HOUR)}h`;
  }

  const days = Math.floor(durationMs / MILLISECONDS_PER_DAY);

  return `${days} ${days === 1 ? 'dia' : 'dias'}`;
};
