import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardSignalsContext } from '@/object-record/record-board/record-board-signals/contexts/RecordBoardSignalsContext';
import { getRecordBoardCardSignals } from '@/object-record/record-board/record-board-signals/utils/getRecordBoardCardSignals';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useContext, useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useRecordBoardCardSignals = (recordId: string) => {
  const { config, now } = useContext(RecordBoardSignalsContext);
  const { selectFieldMetadataItem } = useContext(RecordBoardContext);
  const recordStore = useAtomFamilyStateValue(recordStoreFamilyState, recordId);
  const stageValue = recordStore?.[selectFieldMetadataItem.name];

  return useMemo(
    () =>
      isDefined(config) && isDefined(recordStore)
        ? getRecordBoardCardSignals({
            record: recordStore as Record<string, unknown>,
            config,
            now,
            stageValue: typeof stageValue === 'string' ? stageValue : null,
          })
        : null,
    [config, recordStore, now, stageValue],
  );
};
