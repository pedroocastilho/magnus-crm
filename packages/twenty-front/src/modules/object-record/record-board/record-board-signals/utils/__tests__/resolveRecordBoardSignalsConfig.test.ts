import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import {
  getRecordBoardSignalsFieldMetadataIds,
  resolveRecordBoardSignalsConfig,
} from '@/object-record/record-board/record-board-signals/utils/resolveRecordBoardSignalsConfig';
import { FieldMetadataType } from 'twenty-shared/types';

const field = (
  name: string,
  type: FieldMetadataType,
  isActive = true,
): FieldMetadataItem =>
  ({
    id: `id-${name}`,
    name,
    type,
    isActive,
    label: name,
  }) as FieldMetadataItem;

const FIELDS = [
  field('produto', FieldMetadataType.SELECT),
  field('proximoContato', FieldMetadataType.DATE_TIME),
  field('naEtapaDesde', FieldMetadataType.DATE_TIME),
  field('owner', FieldMetadataType.RELATION),
  field('amount', FieldMetadataType.CURRENCY),
  field('chamarNoWhatsapp', FieldMetadataType.LINKS),
  field('name', FieldMetadataType.TEXT),
  field('campoDesligado', FieldMetadataType.SELECT, false),
];

const ROW_OBJECT = {
  id: 'linha-objeto',
  objeto: 'opportunity',
  visao: null,
  campoCor: 'produto',
  campoProximoContato: 'proximoContato',
  campoEtapaDesde: 'naEtapaDesde',
  diasAtencao: null,
  diasParado: null,
  campoDono: 'owner',
  campoValor: 'amount',
  campoWhatsapp: 'chamarNoWhatsapp',
  etapasFinais: ' FECHADO_GANHOU, ,FECHADO_PERDIDO ',
};

describe('resolveRecordBoardSignalsConfig', () => {
  it('should return null when nothing is configured for the object', () => {
    expect(
      resolveRecordBoardSignalsConfig({
        configRows: [],
        objectNameSingular: 'opportunity',
        fields: FIELDS,
        viewId: 'v1',
      }),
    ).toBeNull();

    expect(
      resolveRecordBoardSignalsConfig({
        configRows: [{ ...ROW_OBJECT, objeto: 'ligacao' }],
        objectNameSingular: 'opportunity',
        fields: FIELDS,
        viewId: 'v1',
      }),
    ).toBeNull();
  });

  it('should resolve fields and default limits from the object row', () => {
    const config = resolveRecordBoardSignalsConfig({
      configRows: [ROW_OBJECT],
      objectNameSingular: 'opportunity',
      fields: FIELDS,
      viewId: 'v1',
    });

    expect(config?.colorFieldMetadataItem?.name).toBe('produto');
    expect(config?.nextContactFieldMetadataItem?.name).toBe('proximoContato');
    expect(config?.stageSinceFieldMetadataItem?.name).toBe('naEtapaDesde');
    expect(config?.ownerFieldMetadataItem?.name).toBe('owner');
    expect(config?.amountFieldMetadataItem?.name).toBe('amount');
    expect(config?.whatsappFieldMetadataItem?.name).toBe('chamarNoWhatsapp');
    expect(config?.attentionDays).toBe(2);
    expect(config?.staleDays).toBe(5);
    expect(config?.finalStageValues).toEqual([
      'FECHADO_GANHOU',
      'FECHADO_PERDIDO',
    ]);
    expect(getRecordBoardSignalsFieldMetadataIds(config)).toHaveLength(6);
  });

  it('should prefer the row of the current view', () => {
    const config = resolveRecordBoardSignalsConfig({
      configRows: [
        ROW_OBJECT,
        {
          id: 'linha-visao',
          objeto: 'opportunity',
          visao: 'v1',
          campoEtapaDesde: 'naEtapaDesde',
          diasAtencao: 3,
          diasParado: 7,
        },
      ],
      objectNameSingular: 'opportunity',
      fields: FIELDS,
      viewId: 'v1',
    });

    expect(config?.colorFieldMetadataItem).toBeNull();
    expect(config?.attentionDays).toBe(3);
    expect(config?.staleDays).toBe(7);
  });

  it('should ignore fields with the wrong type, inactive or missing', () => {
    const config = resolveRecordBoardSignalsConfig({
      configRows: [
        {
          id: 'x',
          objeto: 'opportunity',
          campoCor: 'campoDesligado',
          campoProximoContato: 'name',
          campoValor: 'naoExiste',
        },
      ],
      objectNameSingular: 'opportunity',
      fields: FIELDS,
      viewId: null,
    });

    expect(config).toBeNull();
  });

  it('should keep the stale limit at or above the attention limit', () => {
    const config = resolveRecordBoardSignalsConfig({
      configRows: [{ ...ROW_OBJECT, diasAtencao: 6, diasParado: 4 }],
      objectNameSingular: 'opportunity',
      fields: FIELDS,
      viewId: null,
    });

    expect(config?.attentionDays).toBe(6);
    expect(config?.staleDays).toBe(6);
  });
});
