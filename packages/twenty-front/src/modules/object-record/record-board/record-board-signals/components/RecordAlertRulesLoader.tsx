import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { RecordAlertRulesLoadEffect } from '@/object-record/record-board/record-board-signals/components/RecordAlertRulesLoadEffect';
import { RECORD_ALERT_RULE_OBJECT_NAME_SINGULAR } from '@/object-record/record-board/record-board-signals/constants/RecordAlertRuleObjectNameSingular';
import { isDefined } from 'twenty-shared/utils';

// Magnus (R8): sem o objeto de regras (ou sem leitura dele), nao consulta nada e nenhum alerta aparece.
export const RecordAlertRulesLoader = () => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const ruleObjectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular ===
        RECORD_ALERT_RULE_OBJECT_NAME_SINGULAR && objectMetadataItem.isActive,
  );

  const { canReadObjectRecords } = useObjectPermissionsForObject(
    ruleObjectMetadataItem?.id ?? '',
  );

  return isDefined(ruleObjectMetadataItem) && canReadObjectRecords ? (
    <RecordAlertRulesLoadEffect />
  ) : null;
};
