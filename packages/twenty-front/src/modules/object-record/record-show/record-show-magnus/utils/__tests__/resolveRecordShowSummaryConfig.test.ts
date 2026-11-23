import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { resolveRecordShowSummaryConfig } from '@/object-record/record-show/record-show-magnus/utils/resolveRecordShowSummaryConfig';
import { FieldMetadataType } from 'twenty-shared/types';

const field = (name: string, type: FieldMetadataType): FieldMetadataItem =>
  ({
    id: `id-${name}`,
    name,
    type,
    isActive: true,
    label: name,
  }) as FieldMetadataItem;

const object = (
  nameSingular: string,
  fields: FieldMetadataItem[],
): EnrichedObjectMetadataItem =>
  ({
    id: `obj-${nameSingular}`,
    nameSingular,
    isActive: true,
    fields,
  }) as unknown as EnrichedObjectMetadataItem;

const OBJECTS = [
  object('opportunity', [
    field('stage', FieldMetadataType.SELECT),
    field('temperatura', FieldMetadataType.SELECT),
    field('produto', FieldMetadataType.SELECT),
    field('campanha', FieldMetadataType.TEXT),
    field('owner', FieldMetadataType.RELATION),
    field('pointOfContact', FieldMetadataType.RELATION),
    field('proximoContato', FieldMetadataType.DATE),
    field('naEtapaDesde', FieldMetadataType.DATE_TIME),
    field('amount', FieldMetadataType.CURRENCY),
    field('linkConversa', FieldMetadataType.LINKS),
  ]),
  object('pagamento', [
    field('pessoa', FieldMetadataType.RELATION),
    field('valor', FieldMetadataType.CURRENCY),
    field('pagoEm', FieldMetadataType.DATE_TIME),
    field('plataforma', FieldMetadataType.SELECT),
    field('produto', FieldMetadataType.SELECT),
  ]),
];

const ROW = {
  id: 'linha',
  objeto: 'opportunity',
  visao: null,
  campoEtapa: 'stage',
  campoTemperatura: 'temperatura',
  campoProduto: 'produto',
  campoCampanha: 'campanha',
  campoDono: 'owner',
  campoPessoa: 'pointOfContact',
  campoProximoContato: 'proximoContato',
  campoEtapaDesde: 'naEtapaDesde',
  campoValor: 'amount',
  campoWhatsapp: 'linkConversa',
  diasAtencao: 2,
  diasParado: 5,
  objetoCompras: 'pagamento',
  campoComprasPessoa: 'pessoa',
  campoComprasValor: 'valor',
  campoComprasData: 'pagoEm',
  campoComprasOrigem: 'plataforma',
  campoComprasProduto: 'produto',
};

describe('resolveRecordShowSummaryConfig', () => {
  it('should return null when the object has no row', () => {
    expect(
      resolveRecordShowSummaryConfig({
        configRows: [{ ...ROW, objeto: 'ligacao' }],
        objectNameSingular: 'opportunity',
        objectMetadataItems: OBJECTS,
      }),
    ).toBeNull();
  });

  it('should resolve the summary fields and the purchases of the person', () => {
    const config = resolveRecordShowSummaryConfig({
      configRows: [ROW],
      objectNameSingular: 'opportunity',
      objectMetadataItems: OBJECTS,
    });

    expect(config?.stageFieldMetadataItem?.name).toBe('stage');
    expect(config?.campaignFieldMetadataItem?.name).toBe('campanha');
    expect(config?.whatsappFieldMetadataItem?.name).toBe('linkConversa');
    expect([config?.attentionDays, config?.staleDays]).toEqual([2, 5]);
    expect(config?.purchases?.objectMetadataItem.nameSingular).toBe(
      'pagamento',
    );
    expect(config?.purchases?.dateFieldMetadataItem?.name).toBe('pagoEm');
    expect(config?.purchases?.sourceFieldMetadataItem?.name).toBe('plataforma');
  });

  it('should prefer the row without view and ignore fields of the wrong type', () => {
    const config = resolveRecordShowSummaryConfig({
      configRows: [
        { ...ROW, id: 'da-visao', visao: 'v1', campoEtapa: 'temperatura' },
        { ...ROW, campoValor: 'stage', campoCampanha: 'naoExiste' },
      ],
      objectNameSingular: 'opportunity',
      objectMetadataItems: OBJECTS,
    });

    expect(config?.stageFieldMetadataItem?.name).toBe('stage');
    expect(config?.amountFieldMetadataItem).toBeNull();
    expect(config?.campaignFieldMetadataItem).toBeNull();
  });

  it('should leave purchases off without the person of the card or the purchases object', () => {
    expect(
      resolveRecordShowSummaryConfig({
        configRows: [{ ...ROW, campoPessoa: null }],
        objectNameSingular: 'opportunity',
        objectMetadataItems: OBJECTS,
      })?.purchases,
    ).toBeNull();

    expect(
      resolveRecordShowSummaryConfig({
        configRows: [{ ...ROW, objetoCompras: 'naoExiste' }],
        objectNameSingular: 'opportunity',
        objectMetadataItems: OBJECTS,
      })?.purchases,
    ).toBeNull();
  });
});
