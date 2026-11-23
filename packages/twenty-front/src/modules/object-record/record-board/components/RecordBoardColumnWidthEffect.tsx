import { useContext, useLayoutEffect } from 'react';

import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RECORD_BOARD_COLUMN_WIDTH_CSS_VARIABLE_NAME } from '@/object-record/record-board/constants/RecordBoardColumnWidthCssVariableName';
import { RECORD_BOARD_SIGNALS_MOBILE_COLUMN_WIDTH } from '@/object-record/record-board/record-board-signals/constants/RecordBoardSignalsMobileColumnWidth';
import { RecordBoardSignalsContext } from '@/object-record/record-board/record-board-signals/contexts/RecordBoardSignalsContext';
import { getRecordBoardHtmlId } from '@/object-record/record-board/utils/getRecordBoardHtmlId';
import { setRecordBoardColumnWidthCssVariable } from '@/object-record/record-board/utils/setRecordBoardColumnWidthCssVariable';
import { recordIndexKanbanColumnWidthComponentState } from '@/object-record/record-index/states/recordIndexKanbanColumnWidthComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';

export const RecordBoardColumnWidthEffect = () => {
  const { recordBoardId } = useContext(RecordBoardContext);

  const recordIndexKanbanColumnWidth = useAtomComponentStateValue(
    recordIndexKanbanColumnWidthComponentState,
  );

  const { config: recordBoardSignalsConfig } = useContext(
    RecordBoardSignalsContext,
  );
  const isMobile = useIsMobile();
  const isMobileSignalsBoard = isMobile && isDefined(recordBoardSignalsConfig);

  useLayoutEffect(() => {
    // Magnus (Fase B): no celular com o quadro configurado a coluna ocupa quase a tela.
    if (isMobileSignalsBoard) {
      document
        .getElementById(getRecordBoardHtmlId(recordBoardId))
        ?.style.setProperty(
          RECORD_BOARD_COLUMN_WIDTH_CSS_VARIABLE_NAME,
          RECORD_BOARD_SIGNALS_MOBILE_COLUMN_WIDTH,
        );

      return;
    }

    setRecordBoardColumnWidthCssVariable(
      recordBoardId,
      recordIndexKanbanColumnWidth,
    );
  }, [recordBoardId, recordIndexKanbanColumnWidth, isMobileSignalsBoard]);

  return null;
};
