import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { RECORD_ALERT_RULE_GQL_FIELDS } from '@/object-record/record-board/record-board-signals/constants/RecordAlertRuleGqlFields';
import { RECORD_ALERT_RULE_OBJECT_NAME_SINGULAR } from '@/object-record/record-board/record-board-signals/constants/RecordAlertRuleObjectNameSingular';
import { recordAlertRulesState } from '@/object-record/record-board/record-board-signals/states/recordAlertRulesState';
import { type RecordAlertRuleRow } from '@/object-record/record-board/record-board-signals/types/RecordAlertRule';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useEffect } from 'react';

// So e montado quando o objeto "Regra de alerta" existe e o papel pode ler.
export const RecordAlertRulesLoadEffect = () => {
  const setRecordAlertRules = useSetAtomState(recordAlertRulesState);

  const { records, loading } = useFindManyRecords({
    objectNameSingular: RECORD_ALERT_RULE_OBJECT_NAME_SINGULAR,
    recordGqlFields: RECORD_ALERT_RULE_GQL_FIELDS,
    limit: 200,
  });

  useEffect(() => {
    if (!loading) {
      setRecordAlertRules(records as unknown as RecordAlertRuleRow[]);
    }
  }, [loading, records, setRecordAlertRules]);

  return null;
};
