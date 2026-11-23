import { type RecordBoardCardSignals } from '@/object-record/record-board/record-board-signals/types/RecordBoardCardSignals';
import { type RecordBoardSignalsConfig } from '@/object-record/record-board/record-board-signals/types/RecordBoardSignalsConfig';
import {
  getDaysInStage,
  getNextContactSignal,
  getStaleLevel,
} from '@/object-record/record-board/record-board-signals/utils/getRecordBoardCardTimeSignals';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

type RecordValues = Record<string, unknown>;

const readString = (value: unknown) =>
  typeof value === 'string' && value.length > 0 ? value : null;

const readObject = (value: unknown): RecordValues | null =>
  typeof value === 'object' && value !== null ? (value as RecordValues) : null;

// Nome do dono: membro do workspace ({ firstName, lastName }) ou registro com nome em texto.
const readOwnerName = (owner: RecordValues): string | null => {
  const name = owner.name;

  if (typeof name === 'string') {
    return name.trim() || null;
  }

  const fullName = readObject(name);

  if (isDefined(fullName)) {
    const joined = [fullName.firstName, fullName.lastName]
      .filter((part): part is string => isNonEmptyString(part))
      .join(' ')
      .trim();

    return joined || null;
  }

  return null;
};

// So aceita cor simples do tema (ex.: "pink"), porque o valor vira nome de variavel CSS.
const isThemeColorName = (color: unknown): color is string =>
  typeof color === 'string' && /^[a-z]+$/.test(color);

// Link do WhatsApp so com http(s), para o botao nunca abrir outro esquema.
const readHttpUrl = (value: unknown): string | null => {
  const url = readString(value);

  return url !== null && /^https?:\/\//i.test(url) ? url : null;
};

export const getRecordBoardCardSignals = ({
  record,
  config,
  now,
  stageValue,
}: {
  record: RecordValues;
  config: RecordBoardSignalsConfig;
  now: Date;
  stageValue?: string | null;
}): RecordBoardCardSignals => {
  // Cartao em etapa de fechamento (Venda, Perdido) nao fica "parado" nem cobra proximo contato.
  const isFinalStage =
    isNonEmptyString(stageValue) &&
    config.finalStageValues.includes(stageValue);

  const colorField = config.colorFieldMetadataItem;
  const colorValue = isDefined(colorField)
    ? readString(record[colorField.name])
    : null;
  const colorOption = isDefined(colorField)
    ? colorField.options?.find((option) => option.value === colorValue)
    : undefined;

  const daysInStage = isDefined(config.stageSinceFieldMetadataItem)
    ? getDaysInStage(
        readString(record[config.stageSinceFieldMetadataItem.name]),
        now,
      )
    : null;

  const ownerRecord = isDefined(config.ownerFieldMetadataItem)
    ? readObject(record[config.ownerFieldMetadataItem.name])
    : null;
  const ownerName = isDefined(ownerRecord) ? readOwnerName(ownerRecord) : null;

  const amountValue = isDefined(config.amountFieldMetadataItem)
    ? readObject(record[config.amountFieldMetadataItem.name])
    : null;
  // amountMicros pode chegar como numero ou texto, dependendo da versao da API.
  const amountMicros =
    typeof amountValue?.amountMicros === 'string'
      ? Number(amountValue.amountMicros)
      : amountValue?.amountMicros;

  const nextContact = isDefined(config.nextContactFieldMetadataItem)
    ? getNextContactSignal(
        readString(record[config.nextContactFieldMetadataItem.name]),
        now,
      )
    : null;

  const whatsappValue = isDefined(config.whatsappFieldMetadataItem)
    ? readObject(record[config.whatsappFieldMetadataItem.name])
    : null;

  return {
    stripe:
      isDefined(colorOption) && isThemeColorName(colorOption.color)
        ? { label: colorOption.label, color: colorOption.color }
        : null,
    daysInStage,
    staleLevel: isFinalStage
      ? 'none'
      : getStaleLevel(daysInStage, config.attentionDays, config.staleDays),
    nextContact:
      isFinalStage &&
      (nextContact?.state === 'empty' || nextContact?.state === 'overdue')
        ? null
        : nextContact,
    owner:
      isDefined(ownerRecord) && ownerName !== null
        ? {
            name: ownerName,
            avatarUrl: readString(ownerRecord.avatarUrl),
            colorSeed: readString(ownerRecord.id) ?? ownerName,
          }
        : null,
    amount:
      typeof amountMicros === 'number' && Number.isFinite(amountMicros)
        ? {
            amount: amountMicros / 1_000_000,
            currencyCode: readString(amountValue?.currencyCode),
          }
        : null,
    whatsappUrl: readHttpUrl(whatsappValue?.primaryLinkUrl),
  };
};
