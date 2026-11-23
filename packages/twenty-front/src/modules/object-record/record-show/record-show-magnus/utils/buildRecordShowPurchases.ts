import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordShowSummaryPurchasesConfig } from '@/object-record/record-show/record-show-magnus/types/RecordShowSummaryConfig';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isNonEmptyString } from '@sniptt/guards';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export type RecordShowPurchase = {
  id: string;
  date: string | null;
  amount: number | null;
  currencyCode: string | null;
  source: string | null;
  product: string | null;
  isRefund: boolean;
};

export type RecordShowPurchases = {
  purchases: RecordShowPurchase[];
  purchaseCount: number;
  total: number;
  currencyCode: string | null;
};

// Valor de SELECT vira o rotulo da opcao ("KIWIFY" -> "Kiwify"); TEXT fica como esta.
const readLabel = (
  record: ObjectRecord,
  fieldMetadataItem: FieldMetadataItem | null,
): string | null => {
  if (!isDefined(fieldMetadataItem)) {
    return null;
  }

  const value: unknown = record[fieldMetadataItem.name];

  if (!isNonEmptyString(value)) {
    return null;
  }

  if (fieldMetadataItem.type !== FieldMetadataType.SELECT) {
    return value;
  }

  return (
    fieldMetadataItem.options?.find((option) => option.value === value)
      ?.label ?? value
  );
};

const readAmount = (
  record: ObjectRecord,
  fieldMetadataItem: FieldMetadataItem | null,
): { amount: number | null; currencyCode: string | null } => {
  const value = isDefined(fieldMetadataItem)
    ? record[fieldMetadataItem.name]
    : null;
  const amountMicros = value?.amountMicros;

  return {
    amount:
      amountMicros === null || amountMicros === undefined
        ? null
        : Number(amountMicros) / 1_000_000,
    currencyCode: isNonEmptyString(value?.currencyCode)
      ? value.currencyCode
      : null,
  };
};

// Magnus (Fase D): compras da pessoa (Kiwify, Hotmart, manual), da mais recente para a mais antiga, com o total.
export const buildRecordShowPurchases = (
  records: ObjectRecord[],
  config: RecordShowSummaryPurchasesConfig,
): RecordShowPurchases => {
  const purchases = records.map((record) => {
    const dateValue: unknown = isDefined(config.dateFieldMetadataItem)
      ? record[config.dateFieldMetadataItem.name]
      : null;

    const { amount, currencyCode } = readAmount(
      record,
      config.amountFieldMetadataItem,
    );

    return {
      id: record.id,
      date: isNonEmptyString(dateValue) ? dateValue : null,
      amount,
      currencyCode,
      source: readLabel(record, config.sourceFieldMetadataItem),
      product: readLabel(record, config.productFieldMetadataItem),
      // Estorno entra com valor negativo (objeto pagamento da Diamond): fica na lista, mas nao conta como compra
      isRefund: amount !== null && amount < 0,
    };
  });

  purchases.sort((purchaseA, purchaseB) => {
    if (purchaseA.date === purchaseB.date) {
      return 0;
    }

    if (purchaseA.date === null) {
      return 1;
    }

    if (purchaseB.date === null) {
      return -1;
    }

    return purchaseB.date.localeCompare(purchaseA.date);
  });

  return {
    purchases,
    purchaseCount: purchases.filter((purchase) => !purchase.isRefund).length,
    total: purchases.reduce((sum, purchase) => sum + (purchase.amount ?? 0), 0),
    currencyCode:
      purchases.find((purchase) => purchase.currencyCode !== null)
        ?.currencyCode ?? null,
  };
};
