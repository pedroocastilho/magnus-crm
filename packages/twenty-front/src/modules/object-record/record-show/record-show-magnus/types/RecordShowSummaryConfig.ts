import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

// Magnus (Fase D): compras da pessoa do cartao (ex.: objeto "pagamento").
export type RecordShowSummaryPurchasesConfig = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  personFieldMetadataItem: FieldMetadataItem;
  amountFieldMetadataItem: FieldMetadataItem | null;
  dateFieldMetadataItem: FieldMetadataItem | null;
  sourceFieldMetadataItem: FieldMetadataItem | null;
  productFieldMetadataItem: FieldMetadataItem | null;
};

// Magnus (Fase D): o que a ficha mostra no topo e no resumo; null = campo desligado.
export type RecordShowSummaryConfig = {
  stageFieldMetadataItem: FieldMetadataItem | null;
  temperatureFieldMetadataItem: FieldMetadataItem | null;
  productFieldMetadataItem: FieldMetadataItem | null;
  ownerFieldMetadataItem: FieldMetadataItem | null;
  campaignFieldMetadataItem: FieldMetadataItem | null;
  personFieldMetadataItem: FieldMetadataItem | null;
  nextContactFieldMetadataItem: FieldMetadataItem | null;
  stageSinceFieldMetadataItem: FieldMetadataItem | null;
  amountFieldMetadataItem: FieldMetadataItem | null;
  whatsappFieldMetadataItem: FieldMetadataItem | null;
  attentionDays: number;
  staleDays: number;
  // R8: etapas de fechamento (sem alertas), as mesmas do quadro
  finalStageValues: string[];
  purchases: RecordShowSummaryPurchasesConfig | null;
};
