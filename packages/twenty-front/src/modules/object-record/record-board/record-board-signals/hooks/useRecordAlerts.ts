import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { recordAlertRulesState } from '@/object-record/record-board/record-board-signals/states/recordAlertRulesState';
import { type RecordAlert } from '@/object-record/record-board/record-board-signals/types/RecordAlertRule';
import { buildRecordAlertFacts } from '@/object-record/record-board/record-board-signals/utils/buildRecordAlertFacts';
import { getRecordAlerts } from '@/object-record/record-board/record-board-signals/utils/getRecordAlerts';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

export type RecordAlertFields = {
  stageFieldMetadataItem: FieldMetadataItem | null;
  finalStageValues: string[];
  stageSinceFieldMetadataItem: FieldMetadataItem | null;
  nextContactFieldMetadataItem: FieldMetadataItem | null;
  amountFieldMetadataItem: FieldMetadataItem | null;
  ownerFieldMetadataItem: FieldMetadataItem | null;
};

// Magnus (R8): alertas de um cartao, usados no quadro e na ficha. Sem regras ou sem campos = lista vazia.
export const useRecordAlerts = ({
  recordId,
  objectNameSingular,
  fields,
  now,
}: {
  recordId: string;
  objectNameSingular: string;
  fields: RecordAlertFields | null;
  now: Date;
}): RecordAlert[] => {
  const recordAlertRules = useAtomStateValue(recordAlertRulesState);
  const recordStore = useAtomFamilyStateValue(recordStoreFamilyState, recordId);

  return useMemo(
    () =>
      recordAlertRules.length === 0 ||
      !isDefined(fields) ||
      !isDefined(recordStore)
        ? []
        : getRecordAlerts({
            rules: recordAlertRules,
            facts: buildRecordAlertFacts({
              record: recordStore as Record<string, unknown>,
              objectNameSingular,
              ...fields,
              now,
            }),
            now,
          }),
    [recordAlertRules, fields, recordStore, objectNameSingular, now],
  );
};
