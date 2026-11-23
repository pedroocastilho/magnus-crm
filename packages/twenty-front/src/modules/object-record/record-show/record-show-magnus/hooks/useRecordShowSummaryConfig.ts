import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { recordBoardSignalsConfigRowsState } from '@/object-record/record-board/record-board-signals/states/recordBoardSignalsConfigRowsState';
import { resolveRecordShowSummaryConfig } from '@/object-record/record-show/record-show-magnus/utils/resolveRecordShowSummaryConfig';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMemo } from 'react';

// Magnus (Fase D): mesma "Configuracao do quadro" do quadro, lida para a ficha.
export const useRecordShowSummaryConfig = (objectNameSingular: string) => {
  const recordBoardSignalsConfigRows = useAtomStateValue(
    recordBoardSignalsConfigRowsState,
  );
  const { objectMetadataItems } = useObjectMetadataItems();

  return useMemo(
    () =>
      resolveRecordShowSummaryConfig({
        configRows: recordBoardSignalsConfigRows,
        objectNameSingular,
        objectMetadataItems,
      }),
    [recordBoardSignalsConfigRows, objectNameSingular, objectMetadataItems],
  );
};
