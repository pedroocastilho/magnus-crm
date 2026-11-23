import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { buildRecordShowPurchases } from '@/object-record/record-show/record-show-magnus/utils/buildRecordShowPurchases';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { FieldMetadataType } from 'twenty-shared/types';

const field = (
  name: string,
  type: FieldMetadataType,
  options?: { value: string; label: string }[],
): FieldMetadataItem =>
  ({
    id: name,
    name,
    type,
    isActive: true,
    label: name,
    options,
  }) as FieldMetadataItem;

const CONFIG = {
  objectMetadataItem: {} as EnrichedObjectMetadataItem,
  personFieldMetadataItem: field('pessoa', FieldMetadataType.RELATION),
  amountFieldMetadataItem: field('valor', FieldMetadataType.CURRENCY),
  dateFieldMetadataItem: field('pagoEm', FieldMetadataType.DATE_TIME),
  sourceFieldMetadataItem: field('plataforma', FieldMetadataType.SELECT, [
    { value: 'KIWIFY', label: 'Kiwify' },
    { value: 'HOTMART', label: 'Hotmart' },
  ]),
  productFieldMetadataItem: field('produto', FieldMetadataType.TEXT),
};

const record = (values: Record<string, unknown>) =>
  ({ id: String(values.id), ...values }) as ObjectRecord;

describe('buildRecordShowPurchases', () => {
  it('should list purchases newest first with option labels and the total', () => {
    const result = buildRecordShowPurchases(
      [
        record({
          id: 'a',
          pagoEm: '2026-10-01T12:00:00.000Z',
          valor: { amountMicros: 97000000, currencyCode: 'BRL' },
          plataforma: 'KIWIFY',
          produto: 'Renda Automatica',
        }),
        record({ id: 'b', pagoEm: null, valor: null, plataforma: 'MANUAL' }),
        record({
          id: 'd',
          pagoEm: '2026-11-19T12:00:00.000Z',
          valor: { amountMicros: -97000000, currencyCode: 'BRL' },
          plataforma: 'KIWIFY',
          produto: 'Renda Automatica',
        }),
        record({
          id: 'c',
          pagoEm: '2026-11-18T12:00:00.000Z',
          valor: { amountMicros: 1997000000, currencyCode: 'BRL' },
          plataforma: 'HOTMART',
          produto: '',
        }),
      ],
      CONFIG,
    );

    expect(
      result.purchases.map((purchase) => [
        purchase.id,
        purchase.amount,
        purchase.source,
        purchase.product,
        purchase.isRefund,
      ]),
    ).toEqual([
      ['d', -97, 'Kiwify', 'Renda Automatica', true],
      ['c', 1997, 'Hotmart', null, false],
      ['a', 97, 'Kiwify', 'Renda Automatica', false],
      ['b', null, 'MANUAL', null, false],
    ]);
    // o estorno abate do total e nao conta como compra
    expect([result.purchaseCount, result.total, result.currencyCode]).toEqual([
      3,
      1997,
      'BRL',
    ]);
  });

  it('should return an empty list when there is nothing', () => {
    expect(buildRecordShowPurchases([], CONFIG)).toEqual({
      purchases: [],
      purchaseCount: 0,
      total: 0,
      currencyCode: null,
    });
  });
});
