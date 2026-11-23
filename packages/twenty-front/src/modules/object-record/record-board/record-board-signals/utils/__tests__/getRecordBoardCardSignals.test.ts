import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordBoardSignalsConfig } from '@/object-record/record-board/record-board-signals/types/RecordBoardSignalsConfig';
import { getRecordBoardCardSignals } from '@/object-record/record-board/record-board-signals/utils/getRecordBoardCardSignals';
import { FieldMetadataType } from 'twenty-shared/types';

const field = (
  name: string,
  type: FieldMetadataType,
  extra: Partial<FieldMetadataItem> = {},
): FieldMetadataItem =>
  ({
    id: `id-${name}`,
    name,
    type,
    label: name,
    ...extra,
  }) as FieldMetadataItem;

const CONFIG: RecordBoardSignalsConfig = {
  colorFieldMetadataItem: field('produto', FieldMetadataType.SELECT, {
    options: [
      {
        id: 'o1',
        value: 'CIRCULO_AURA',
        label: 'Círculo Aura',
        color: 'pink',
        position: 0,
      },
      {
        id: 'o2',
        value: 'ESTRANHO',
        label: 'Estranho',
        color: 'var(--x)',
        position: 1,
      },
    ],
  } as Partial<FieldMetadataItem>),
  nextContactFieldMetadataItem: field(
    'proximoContato',
    FieldMetadataType.DATE_TIME,
  ),
  stageSinceFieldMetadataItem: field(
    'naEtapaDesde',
    FieldMetadataType.DATE_TIME,
  ),
  ownerFieldMetadataItem: field('owner', FieldMetadataType.RELATION),
  amountFieldMetadataItem: field('amount', FieldMetadataType.CURRENCY),
  whatsappFieldMetadataItem: field('chamarNoWhatsapp', FieldMetadataType.LINKS),
  attentionDays: 2,
  staleDays: 5,
  finalStageValues: ['FECHADO_GANHOU', 'FECHADO_PERDIDO'],
};

const NOW = new Date(2026, 10, 20, 10, 0, 0);

describe('getRecordBoardCardSignals', () => {
  it('should compute every signal from a full record', () => {
    const signals = getRecordBoardCardSignals({
      config: CONFIG,
      now: NOW,
      record: {
        produto: 'CIRCULO_AURA',
        naEtapaDesde: new Date(2026, 10, 14, 9, 0, 0).toISOString(),
        proximoContato: new Date(2026, 10, 20, 15, 30, 0).toISOString(),
        owner: {
          id: 'm1',
          name: { firstName: 'Mariana', lastName: 'Lima' },
          avatarUrl: '',
        },
        amount: { amountMicros: '1997000000', currencyCode: 'BRL' },
        chamarNoWhatsapp: { primaryLinkUrl: 'https://wa.me/5511999999999' },
      },
    });

    expect(signals.stripe).toEqual({ label: 'Círculo Aura', color: 'pink' });
    expect(signals.daysInStage).toBe(6);
    expect(signals.staleLevel).toBe('stale');
    expect(signals.nextContact).toEqual({
      state: 'today',
      label: 'Hoje, 15:30',
    });
    expect(signals.owner).toEqual({
      name: 'Mariana Lima',
      avatarUrl: null,
      colorSeed: 'm1',
    });
    expect(signals.amount).toEqual({ amount: 1997, currencyCode: 'BRL' });
    expect(signals.whatsappUrl).toBe('https://wa.me/5511999999999');
  });

  it('should drop unsafe or empty values', () => {
    const signals = getRecordBoardCardSignals({
      config: CONFIG,
      now: NOW,
      record: {
        produto: 'ESTRANHO',
        naEtapaDesde: null,
        proximoContato: null,
        owner: null,
        amount: { amountMicros: null, currencyCode: 'BRL' },
        chamarNoWhatsapp: { primaryLinkUrl: 'ftp://exemplo.com/arquivo' },
      },
    });

    expect(signals.stripe).toBeNull();
    expect(signals.daysInStage).toBeNull();
    expect(signals.staleLevel).toBe('none');
    expect(signals.nextContact).toEqual({
      state: 'empty',
      label: 'Sem próximo contato',
    });
    expect(signals.owner).toBeNull();
    expect(signals.amount).toBeNull();
    expect(signals.whatsappUrl).toBeNull();
  });

  it('should not mark a card in a final stage as stale', () => {
    const record = {
      naEtapaDesde: new Date(2026, 9, 1, 9, 0, 0).toISOString(),
      proximoContato: new Date(2026, 10, 1, 9, 0, 0).toISOString(),
    };

    const signals = getRecordBoardCardSignals({
      config: CONFIG,
      now: NOW,
      record,
      stageValue: 'FECHADO_GANHOU',
    });

    expect(signals.staleLevel).toBe('none');
    expect(signals.nextContact).toBeNull();

    const openSignals = getRecordBoardCardSignals({
      config: CONFIG,
      now: NOW,
      record,
      stageValue: 'FOLLOW_UP_1',
    });

    expect(openSignals.staleLevel).toBe('stale');
    expect(openSignals.nextContact?.state).toBe('overdue');
  });

  it('should keep a scheduled next contact in a final stage', () => {
    const signals = getRecordBoardCardSignals({
      config: CONFIG,
      now: NOW,
      record: { proximoContato: '2026-11-21' },
      stageValue: 'FECHADO_GANHOU',
    });

    expect(signals.nextContact).toEqual({ state: 'future', label: 'Amanhã' });
  });

  it('should skip signals whose field is not configured', () => {
    const signals = getRecordBoardCardSignals({
      config: {
        ...CONFIG,
        nextContactFieldMetadataItem: null,
        amountFieldMetadataItem: null,
      },
      now: NOW,
      record: {
        proximoContato: NOW.toISOString(),
        amount: { amountMicros: 10 },
      },
    });

    expect(signals.nextContact).toBeNull();
    expect(signals.amount).toBeNull();
  });
});
