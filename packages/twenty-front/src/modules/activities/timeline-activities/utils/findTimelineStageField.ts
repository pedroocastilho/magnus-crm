import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const DEFAULT_STAGE_FIELD_NAMES = ['stage', 'etapa'];

// Magnus (Fase D): campo de etapa da linha do tempo. Vale o da "Configuracao do quadro";
// sem ela, um SELECT chamado "stage" ou "etapa" (trajetoria e filtro de etapas para todos os objetos).
export const findTimelineStageField = (
  fields: FieldMetadataItem[],
  configuredStageField: FieldMetadataItem | null | undefined,
): FieldMetadataItem | null =>
  isDefined(configuredStageField)
    ? configuredStageField
    : (fields.find(
        (field) =>
          field.type === FieldMetadataType.SELECT &&
          field.isActive !== false &&
          DEFAULT_STAGE_FIELD_NAMES.includes(field.name),
      ) ?? null);
