import {
  type RecordAlertFacts,
  type RecordAlertRuleRow,
} from '@/object-record/record-board/record-board-signals/types/RecordAlertRule';
import { getRecordAlerts } from '@/object-record/record-board/record-board-signals/utils/getRecordAlerts';

const NOW = new Date('2026-11-20T15:00:00.000Z');

const facts = (extra: Partial<RecordAlertFacts> = {}): RecordAlertFacts => ({
  objectNameSingular: 'ligacao',
  stageValue: 'OFERTA_APRESENTADA',
  stageLabel: 'Oferta apresentada',
  isFinalStage: false,
  daysInStage: 6,
  nextContactAt: null,
  hasNextContactField: true,
  hasAmount: true,
  hasOwner: true,
  ...extra,
});

const rule = (extra: Partial<RecordAlertRuleRow>): RecordAlertRuleRow => ({
  id: 'r1',
  ativo: true,
  ...extra,
});

describe('getRecordAlerts', () => {
  it('dispara "parado 5 dias em Oferta apresentada" pelo valor ou pelo nome da etapa', () => {
    const porValor = rule({
      condicao: 'PARADO_NA_ETAPA',
      etapas: 'OFERTA_APRESENTADA',
      dias: 5,
      nivel: 'URGENTE',
    });
    const porNome = { ...porValor, etapas: 'oferta apresentada' };

    expect(
      getRecordAlerts({ rules: [porValor], facts: facts(), now: NOW }),
    ).toEqual([
      {
        ruleId: 'r1',
        label: 'Parado há 6 dias em Oferta apresentada',
        level: 'urgent',
      },
    ]);
    expect(
      getRecordAlerts({ rules: [porNome], facts: facts(), now: NOW }),
    ).toHaveLength(1);
    expect(
      getRecordAlerts({
        rules: [porValor],
        facts: facts({ daysInStage: 4 }),
        now: NOW,
      }),
    ).toEqual([]);
    expect(
      getRecordAlerts({
        rules: [porValor],
        facts: facts({ stageValue: 'QUALIFICADO', stageLabel: 'Qualificado' }),
        now: NOW,
      }),
    ).toEqual([]);
  });

  it('respeita aba, regra desligada e etapa de fechamento', () => {
    const parado = rule({
      condicao: 'PARADO_NA_ETAPA',
      dias: 2,
      objeto: 'opportunity',
    });

    expect(
      getRecordAlerts({ rules: [parado], facts: facts(), now: NOW }),
    ).toEqual([]);
    expect(
      getRecordAlerts({
        rules: [{ ...parado, objeto: 'ligacao', ativo: false }],
        facts: facts(),
        now: NOW,
      }),
    ).toEqual([]);
    expect(
      getRecordAlerts({
        rules: [{ ...parado, objeto: '' }],
        facts: facts({ isFinalStage: true }),
        now: NOW,
      }),
    ).toEqual([]);
  });

  it('contato atrasado conta os dias desde o horario marcado', () => {
    const atrasado = rule({ condicao: 'CONTATO_ATRASADO', dias: 2 });

    expect(
      getRecordAlerts({
        rules: [atrasado],
        facts: facts({ nextContactAt: '2026-11-17T14:00:00.000Z' }),
        now: NOW,
      }).map((alert) => alert.label),
    ).toEqual(['Contato atrasado há 3 dias']);
    expect(
      getRecordAlerts({
        rules: [atrasado],
        facts: facts({ nextContactAt: '2026-11-19T14:00:00.000Z' }),
        now: NOW,
      }),
    ).toEqual([]);
    expect(
      getRecordAlerts({
        rules: [atrasado],
        facts: facts({ nextContactAt: '2026-11-21T14:00:00.000Z' }),
        now: NOW,
      }),
    ).toEqual([]);
  });

  it('campos vazios so contam quando o campo existe no quadro', () => {
    const regras = [
      rule({ id: 'a', condicao: 'SEM_PROXIMO_CONTATO', dias: 1 }),
      rule({ id: 'b', condicao: 'SEM_VALOR' }),
      rule({ id: 'c', condicao: 'SEM_DONO', nivel: 'URGENTE' }),
    ];

    expect(
      getRecordAlerts({
        rules: regras,
        facts: facts({ hasAmount: false, hasOwner: false }),
        now: NOW,
      }).map((alert) => alert.ruleId),
    ).toEqual(['c', 'a', 'b']);
    expect(
      getRecordAlerts({
        rules: regras,
        facts: facts({
          hasNextContactField: false,
          hasAmount: null,
          hasOwner: null,
        }),
        now: NOW,
      }),
    ).toEqual([]);
  });

  it('mensagem propria com {dias} e {etapa}; frase repetida aparece uma vez', () => {
    const regras = [
      rule({
        id: 'a',
        condicao: 'PARADO_NA_ETAPA',
        dias: 5,
        mensagem: 'Cobrar retorno: {dias} em {etapa}',
      }),
      rule({
        id: 'b',
        condicao: 'PARADO_NA_ETAPA',
        dias: 3,
        mensagem: 'Cobrar retorno: {dias} em {etapa}',
      }),
    ];

    expect(
      getRecordAlerts({ rules: regras, facts: facts(), now: NOW }),
    ).toEqual([
      {
        ruleId: 'a',
        label: 'Cobrar retorno: 6 dias em Oferta apresentada',
        level: 'attention',
      },
    ]);
  });
});
