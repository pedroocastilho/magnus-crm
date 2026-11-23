import { getRecordBoardScrollWrapperHtmlId } from '@/object-record/record-board/record-board-signals/utils/getRecordBoardScrollWrapperHtmlId';
import { isDefined } from 'twenty-shared/utils';

// Leva a rolagem horizontal do quadro ate a coluna escolhida na faixa de etapas.
export const scrollRecordBoardToColumn = (
  recordBoardId: string,
  columnIndex: number,
) => {
  const scrollWrapper = document.getElementById(
    getRecordBoardScrollWrapperHtmlId(recordBoardId),
  );
  const column = scrollWrapper?.querySelector(
    `[data-board-column-index="${columnIndex}"]`,
  );

  if (!isDefined(scrollWrapper) || !isDefined(column)) {
    return;
  }

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;

  scrollWrapper.scrollTo({
    left:
      column.getBoundingClientRect().left -
      scrollWrapper.getBoundingClientRect().left +
      scrollWrapper.scrollLeft,
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
  });
};
