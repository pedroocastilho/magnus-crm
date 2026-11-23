import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordAlertFacts } from '@/object-record/record-board/record-board-signals/types/RecordAlertRule';
import { getDaysInStage } from '@/object-record/record-board/record-board-signals/utils/getRecordBoardCardTimeSignals';
import { isNonEmptyString } from '@sniptt/guards';
import {
  computeRelationGqlFieldJoinColumnName,
  isDefined,
} from 'twenty-shared/utils';

type RecordValues = Record<string, unknown>;

const readString = (value: unknown) =>
  typeof value === 'string' && value.length > 0 ? value : null;

// Dono preenchido: relacao carregada ({ id }) ou so a coluna de ligacao (ownerId).
const hasRelation = (record: RecordValues, field: FieldMetadataItem) => {
  const related = record[field.name];

  if (typeof related === 'object' && related !== null && 'id' in related) {
    return isNonEmptyString((related as RecordValues).id);
  }

  const joinColumnName =
    field.settings?.joinColumnName ??
    computeRelationGqlFieldJoinColumnName({ name: field.name });

  return isNonEmptyString(record[joinColumnName]);
};

const hasPositiveAmount = (value: unknown) => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const amountMicros = Number((value as RecordValues).amountMicros);

  return Number.isFinite(amountMicros) && amountMicros > 0;
};

// Magnus (R8): o mesmo retrato do cartao para o quadro e para a ficha (campos da "Configuracao do quadro").
export const buildRecordAlertFacts = ({
  record,
  objectNameSingular,
  stageFieldMetadataItem,
  finalStageValues,
  stageSinceFieldMetadataItem,
  nextContactFieldMetadataItem,
  amountFieldMetadataItem,
  ownerFieldMetadataItem,
  now,
}: {
  record: RecordValues;
  objectNameSingular: string;
  stageFieldMetadataItem: FieldMetadataItem | null;
  finalStageValues: string[];
  stageSinceFieldMetadataItem: FieldMetadataItem | null;
  nextContactFieldMetadataItem: FieldMetadataItem | null;
  amountFieldMetadataItem: FieldMetadataItem | null;
  ownerFieldMetadataItem: FieldMetadataItem | null;
  now: Date;
}): RecordAlertFacts => {
  const stageValue = isDefined(stageFieldMetadataItem)
    ? readString(record[stageFieldMetadataItem.name])
    : null;
  const stageLabel =
    stageFieldMetadataItem?.options?.find(
      (option) => option.value === stageValue,
    )?.label ?? null;

  return {
    objectNameSingular,
    stageValue,
    stageLabel,
    isFinalStage: stageValue !== null && finalStageValues.includes(stageValue),
    daysInStage: isDefined(stageSinceFieldMetadataItem)
      ? getDaysInStage(
          readString(record[stageSinceFieldMetadataItem.name]),
          now,
        )
      : null,
    nextContactAt: isDefined(nextContactFieldMetadataItem)
      ? readString(record[nextContactFieldMetadataItem.name])
      : null,
    hasNextContactField: isDefined(nextContactFieldMetadataItem),
    hasAmount: isDefined(amountFieldMetadataItem)
      ? hasPositiveAmount(record[amountFieldMetadataItem.name])
      : null,
    hasOwner: isDefined(ownerFieldMetadataItem)
      ? hasRelation(record, ownerFieldMetadataItem)
      : null,
  };
};
