import { type RecordAlertRuleRow } from '@/object-record/record-board/record-board-signals/types/RecordAlertRule';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// Magnus (R8): regras de alerta do workspace (poucas, carregadas uma vez junto com a configuracao do quadro).
export const recordAlertRulesState = createAtomState<RecordAlertRuleRow[]>({
  key: 'recordAlertRulesState',
  defaultValue: [],
});
