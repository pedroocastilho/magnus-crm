import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { RECORD_BOARD_SIGNALS_DEFAULT_ATTENTION_DAYS } from '@/object-record/record-board/record-board-signals/constants/RecordBoardSignalsDefaultAttentionDays';
import { RECORD_BOARD_SIGNALS_DEFAULT_STALE_DAYS } from '@/object-record/record-board/record-board-signals/constants/RecordBoardSignalsDefaultStaleDays';
import { type RecordBoardSignalsConfigRow } from '@/object-record/record-board/record-board-signals/types/RecordBoardSignalsConfig';
import {
  findFieldOfType,
  parseStageValues,
  toPositiveDays,
} from '@/object-record/record-board/record-board-signals/utils/resolveRecordBoardSignalsConfig';
import {
  type RecordShowSummaryConfig,
  type RecordShowSummaryPurchasesConfig,
} from '@/object-record/record-show/record-show-magnus/types/RecordShowSummaryConfig';
import { isNonEmptyString } from '@sniptt/guards';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const TEXT_OR_SELECT = [FieldMetadataType.SELECT, FieldMetadataType.TEXT];
const DATE_TYPES = [FieldMetadataType.DATE_TIME, FieldMetadataType.DATE];

const resolvePurchases = (
  row: RecordBoardSignalsConfigRow,
  objectMetadataItems: EnrichedObjectMetadataItem[],
): RecordShowSummaryPurchasesConfig | null => {
  if (!isNonEmptyString(row.objetoCompras)) {
    return null;
  }

  const objectMetadataItem = objectMetadataItems.find(
    (candidate) =>
      candidate.nameSingular === row.objetoCompras?.trim() &&
      candidate.isActive,
  );

  if (!isDefined(objectMetadataItem)) {
    return null;
  }

  const fields = objectMetadataItem.fields;
  const personFieldMetadataItem = findFieldOfType(
    fields,
    row.campoComprasPessoa,
    [FieldMetadataType.RELATION],
  );

  // Sem a ligacao com a pessoa nao da para achar as compras.
  if (!isDefined(personFieldMetadataItem)) {
    return null;
  }

  return {
    objectMetadataItem,
    personFieldMetadataItem,
    amountFieldMetadataItem: findFieldOfType(fields, row.campoComprasValor, [
      FieldMetadataType.CURRENCY,
    ]),
    dateFieldMetadataItem: findFieldOfType(
      fields,
      row.campoComprasData,
      DATE_TYPES,
    ),
    sourceFieldMetadataItem: findFieldOfType(
      fields,
      row.campoComprasOrigem,
      TEXT_OR_SELECT,
    ),
    productFieldMetadataItem: findFieldOfType(
      fields,
      row.campoComprasProduto,
      TEXT_OR_SELECT,
    ),
  };
};

// Magnus (Fase D): a ficha usa a linha do objeto sem visao (a do quadro geral); sem ela, a primeira do objeto.
// Devolve null quando o objeto nao tem linha ou nenhum campo vale: a ficha fica como a do Twenty.
export const resolveRecordShowSummaryConfig = ({
  configRows,
  objectNameSingular,
  objectMetadataItems,
}: {
  configRows: RecordBoardSignalsConfigRow[];
  objectNameSingular: string;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}): RecordShowSummaryConfig | null => {
  const rowsOfObject = configRows.filter(
    (row) => row.objeto?.trim() === objectNameSingular,
  );
  const row =
    rowsOfObject.find((candidate) => !isNonEmptyString(candidate.visao)) ??
    rowsOfObject.at(0);

  const objectMetadataItem = objectMetadataItems.find(
    (candidate) => candidate.nameSingular === objectNameSingular,
  );

  if (!isDefined(row) || !isDefined(objectMetadataItem)) {
    return null;
  }

  const fields = objectMetadataItem.fields;
  const attentionDays = toPositiveDays(
    row.diasAtencao,
    RECORD_BOARD_SIGNALS_DEFAULT_ATTENTION_DAYS,
  );

  const config: RecordShowSummaryConfig = {
    stageFieldMetadataItem: findFieldOfType(fields, row.campoEtapa, [
      FieldMetadataType.SELECT,
    ]),
    temperatureFieldMetadataItem: findFieldOfType(
      fields,
      row.campoTemperatura,
      [FieldMetadataType.SELECT],
    ),
    productFieldMetadataItem: findFieldOfType(
      fields,
      row.campoProduto,
      TEXT_OR_SELECT,
    ),
    ownerFieldMetadataItem: findFieldOfType(fields, row.campoDono, [
      FieldMetadataType.RELATION,
    ]),
    campaignFieldMetadataItem: findFieldOfType(
      fields,
      row.campoCampanha,
      TEXT_OR_SELECT,
    ),
    personFieldMetadataItem: findFieldOfType(fields, row.campoPessoa, [
      FieldMetadataType.RELATION,
    ]),
    nextContactFieldMetadataItem: findFieldOfType(
      fields,
      row.campoProximoContato,
      DATE_TYPES,
    ),
    stageSinceFieldMetadataItem: findFieldOfType(
      fields,
      row.campoEtapaDesde,
      DATE_TYPES,
    ),
    amountFieldMetadataItem: findFieldOfType(fields, row.campoValor, [
      FieldMetadataType.CURRENCY,
    ]),
    whatsappFieldMetadataItem: findFieldOfType(fields, row.campoWhatsapp, [
      FieldMetadataType.LINKS,
    ]),
    attentionDays,
    staleDays: Math.max(
      toPositiveDays(row.diasParado, RECORD_BOARD_SIGNALS_DEFAULT_STALE_DAYS),
      attentionDays,
    ),
    finalStageValues: parseStageValues(row.etapasFinais),
    purchases: null,
  };

  // Compras so fazem sentido com a pessoa do cartao.
  if (isDefined(config.personFieldMetadataItem)) {
    config.purchases = resolvePurchases(row, objectMetadataItems);
  }

  const hasAnyField = [
    config.stageFieldMetadataItem,
    config.temperatureFieldMetadataItem,
    config.productFieldMetadataItem,
    config.ownerFieldMetadataItem,
    config.campaignFieldMetadataItem,
    config.nextContactFieldMetadataItem,
    config.stageSinceFieldMetadataItem,
    config.amountFieldMetadataItem,
    config.whatsappFieldMetadataItem,
    config.purchases,
  ].some(isDefined);

  return hasAnyField ? config : null;
};
