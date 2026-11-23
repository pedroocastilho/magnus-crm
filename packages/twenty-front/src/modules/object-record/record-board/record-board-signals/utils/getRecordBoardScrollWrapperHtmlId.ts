import { getRecordBoardScrollWrapperInstanceId } from '@/object-record/record-board/record-board-signals/utils/getRecordBoardScrollWrapperInstanceId';

// Mesmo id que o ScrollWrapper monta para o quadro em RecordBoard.
export const getRecordBoardScrollWrapperHtmlId = (recordBoardId: string) =>
  `scroll-wrapper-${getRecordBoardScrollWrapperInstanceId(recordBoardId)}`;
