import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { recordBoardSignalsConfigRowsState } from '@/object-record/record-board/record-board-signals/states/recordBoardSignalsConfigRowsState';
import { resolveRecordBoardSignalsConfig } from '@/object-record/record-board/record-board-signals/utils/resolveRecordBoardSignalsConfig';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useMemo } from 'react';

export const useRecordBoardSignalsConfig = (
  objectMetadataItem: EnrichedObjectMetadataItem,
) => {
  const recordBoardSignalsConfigRows = useAtomStateValue(
    recordBoardSignalsConfigRowsState,
  );
  const { currentView } = useGetCurrentViewOnly();
  const viewId = currentView?.id;

  return useMemo(
    () =>
      resolveRecordBoardSignalsConfig({
        configRows: recordBoardSignalsConfigRows,
        objectNameSingular: objectMetadataItem.nameSingular,
        fields: objectMetadataItem.fields,
        viewId,
      }),
    [recordBoardSignalsConfigRows, objectMetadataItem, viewId],
  );
};
