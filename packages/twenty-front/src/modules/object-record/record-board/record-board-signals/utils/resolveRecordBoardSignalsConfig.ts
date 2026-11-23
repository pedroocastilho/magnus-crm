import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { RECORD_BOARD_SIGNALS_DEFAULT_ATTENTION_DAYS } from '@/object-record/record-board/record-board-signals/constants/RecordBoardSignalsDefaultAttentionDays';
import { RECORD_BOARD_SIGNALS_DEFAULT_STALE_DAYS } from '@/object-record/record-board/record-board-signals/constants/RecordBoardSignalsDefaultStaleDays';
import {
  type RecordBoardSignalsConfig,
  type RecordBoardSignalsConfigRow,
} from '@/object-record/record-board/record-board-signals/types/RecordBoardSignalsConfig';
import { FieldMetadataType } from 'twenty-shared/types';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

export const findFieldOfType = (
  fields: FieldMetadataItem[],
  fieldName: string | null | undefined,
  acceptedTypes: FieldMetadataType[],
): FieldMetadataItem | null => {
  if (!isNonEmptyString(fieldName)) {
    return null;
  }

  const field = fields.find(
    (candidate) =>
      candidate.name === fieldName.trim() && candidate.isActive !== false,
  );

  return isDefined(field) && acceptedTypes.includes(field.type) ? field : null;
};

export const toPositiveDays = (
  value: number | null | undefined,
  fallback: number,
) =>
  typeof value === 'number' && Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : fallback;

// Lista de valores de etapa separados por virgula (ex.: "FECHADO_GANHOU, FECHADO_PERDIDO").
export const parseStageValues = (value: string | null | undefined): string[] =>
  isNonEmptyString(value)
    ? value
        .split(',')
        .map((stageValue) => stageValue.trim())
        .filter(isNonEmptyString)
    : [];

// Escolhe a linha da visao; sem ela, a linha do objeto sem visao preenchida.
// Devolve null quando nada se aplica ou nenhum campo e valido: o quadro fica como o do Twenty.
export const resolveRecordBoardSignalsConfig = ({
  configRows,
  objectNameSingular,
  fields,
  viewId,
}: {
  configRows: RecordBoardSignalsConfigRow[];
  objectNameSingular: string;
  fields: FieldMetadataItem[];
  viewId: string | null | undefined;
}): RecordBoardSignalsConfig | null => {
  const rowsOfObject = configRows.filter(
    (row) => row.objeto?.trim() === objectNameSingular,
  );

  const rowOfView = isNonEmptyString(viewId)
    ? rowsOfObject.find((row) => row.visao?.trim() === viewId)
    : undefined;

  const row =
    rowOfView ?? rowsOfObject.find((row) => !isNonEmptyString(row.visao));

  if (!isDefined(row)) {
    return null;
  }

  const attentionDays = toPositiveDays(
    row.diasAtencao,
    RECORD_BOARD_SIGNALS_DEFAULT_ATTENTION_DAYS,
  );
  const staleDays = Math.max(
    toPositiveDays(row.diasParado, RECORD_BOARD_SIGNALS_DEFAULT_STALE_DAYS),
    attentionDays,
  );

  const config: RecordBoardSignalsConfig = {
    colorFieldMetadataItem: findFieldOfType(fields, row.campoCor, [
      FieldMetadataType.SELECT,
    ]),
    nextContactFieldMetadataItem: findFieldOfType(
      fields,
      row.campoProximoContato,
      [FieldMetadataType.DATE_TIME, FieldMetadataType.DATE],
    ),
    stageSinceFieldMetadataItem: findFieldOfType(fields, row.campoEtapaDesde, [
      FieldMetadataType.DATE_TIME,
      FieldMetadataType.DATE,
    ]),
    ownerFieldMetadataItem: findFieldOfType(fields, row.campoDono, [
      FieldMetadataType.RELATION,
    ]),
    amountFieldMetadataItem: findFieldOfType(fields, row.campoValor, [
      FieldMetadataType.CURRENCY,
    ]),
    whatsappFieldMetadataItem: findFieldOfType(fields, row.campoWhatsapp, [
      FieldMetadataType.LINKS,
    ]),
    attentionDays,
    staleDays,
    finalStageValues: parseStageValues(row.etapasFinais),
  };

  const hasAnySignal = [
    config.colorFieldMetadataItem,
    config.nextContactFieldMetadataItem,
    config.stageSinceFieldMetadataItem,
    config.ownerFieldMetadataItem,
    config.amountFieldMetadataItem,
    config.whatsappFieldMetadataItem,
  ].some(isDefined);

  return hasAnySignal ? config : null;
};

// Ids dos campos que a consulta do quadro precisa trazer mesmo quando nao estao visiveis.
export const getRecordBoardSignalsFieldMetadataIds = (
  config: RecordBoardSignalsConfig | null,
): string[] =>
  isDefined(config)
    ? [
        config.colorFieldMetadataItem,
        config.nextContactFieldMetadataItem,
        config.stageSinceFieldMetadataItem,
        config.ownerFieldMetadataItem,
        config.amountFieldMetadataItem,
        config.whatsappFieldMetadataItem,
      ]
        .filter(isDefined)
        .map((field) => field.id)
    : [];
