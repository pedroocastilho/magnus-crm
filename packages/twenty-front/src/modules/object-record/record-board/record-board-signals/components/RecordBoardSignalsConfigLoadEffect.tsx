import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { RECORD_BOARD_SIGNALS_CONFIG_GQL_FIELDS } from '@/object-record/record-board/record-board-signals/constants/RecordBoardSignalsConfigGqlFields';
import { RECORD_BOARD_SIGNALS_CONFIG_OBJECT_NAME_SINGULAR } from '@/object-record/record-board/record-board-signals/constants/RecordBoardSignalsConfigObjectNameSingular';
import { recordBoardSignalsConfigRowsState } from '@/object-record/record-board/record-board-signals/states/recordBoardSignalsConfigRowsState';
import { type RecordBoardSignalsConfigRow } from '@/object-record/record-board/record-board-signals/types/RecordBoardSignalsConfig';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useEffect } from 'react';

// So e montado quando o objeto "Configuracao do quadro" existe no workspace.
export const RecordBoardSignalsConfigLoadEffect = () => {
  const setRecordBoardSignalsConfigRows = useSetAtomState(
    recordBoardSignalsConfigRowsState,
  );

  const { records, loading } = useFindManyRecords({
    objectNameSingular: RECORD_BOARD_SIGNALS_CONFIG_OBJECT_NAME_SINGULAR,
    recordGqlFields: RECORD_BOARD_SIGNALS_CONFIG_GQL_FIELDS,
    limit: 200,
  });

  useEffect(() => {
    if (!loading) {
      setRecordBoardSignalsConfigRows(
        records as unknown as RecordBoardSignalsConfigRow[],
      );
    }
  }, [loading, records, setRecordBoardSignalsConfigRows]);

  return null;
};
