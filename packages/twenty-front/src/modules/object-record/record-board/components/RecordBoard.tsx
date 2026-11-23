import { css } from '@linaria/core';
import { styled } from '@linaria/react';

import { useContext, useRef } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { RecordBoardColumnWidthEffect } from '@/object-record/record-board/components/RecordBoardColumnWidthEffect';
import { RecordBoardColumns } from '@/object-record/record-board/components/RecordBoardColumns';
import { RecordBoardDragSelect } from '@/object-record/record-board/components/RecordBoardDragSelect';
import { RecordBoardEffects } from '@/object-record/record-board/components/RecordBoardEffects';
import { RecordBoardFetchMoreInViewTriggerComponent } from '@/object-record/record-board/components/RecordBoardFetchMoreInViewTriggerComponent';
import { RecordBoardHeader } from '@/object-record/record-board/components/RecordBoardHeader';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardMobileStageStrip } from '@/object-record/record-board/record-board-signals/components/RecordBoardMobileStageStrip';
import { RecordBoardSignalsContext } from '@/object-record/record-board/record-board-signals/contexts/RecordBoardSignalsContext';
import { getRecordBoardScrollWrapperInstanceId } from '@/object-record/record-board/record-board-signals/utils/getRecordBoardScrollWrapperInstanceId';
import { isRecordBoardViewSettingsReadOnlyComponentState } from '@/object-record/record-board/states/isRecordBoardViewSettingsReadOnlyComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';

import { getRecordBoardHtmlId } from '@/object-record/record-board/utils/getRecordBoardHtmlId';
import { RecordBoardDndKitProvider } from '@/object-record/record-board/record-board-dnd/providers/RecordBoardDndKitProvider';
import { isDefined } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';

// Magnus (Fase B): no celular com o quadro configurado, a rolagem encaixa em cada coluna.
// "proximity" para nao brigar com a rolagem automatica ao arrastar um cartao.
const recordBoardMobileSnapClassName = css`
  scroll-snap-type: x proximity;
`;

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 100%;
  position: relative;
`;

const StyledContainerContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: min-content;
  min-height: calc(100% - ${themeCssVariables.spacing[2]});
`;

const StyledBoardContentContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

export const RecordBoard = () => {
  const { recordBoardId } = useContext(RecordBoardContext);
  const boardRef = useRef<HTMLDivElement>(null);

  const isRecordBoardViewSettingsReadOnly = useAtomComponentStateValue(
    isRecordBoardViewSettingsReadOnlyComponentState,
  );

  const { config: recordBoardSignalsConfig } = useContext(
    RecordBoardSignalsContext,
  );
  const isMobile = useIsMobile();
  const isMobileSignalsBoard = isMobile && isDefined(recordBoardSignalsConfig);

  return (
    <>
      {isMobileSignalsBoard && <RecordBoardMobileStageStrip />}
      <ScrollWrapper
        componentInstanceId={getRecordBoardScrollWrapperInstanceId(
          recordBoardId,
        )}
        className={
          isMobileSignalsBoard ? recordBoardMobileSnapClassName : undefined
        }
      >
        <RecordBoardEffects />
        <RecordBoardColumnWidthEffect />
        <StyledContainerContainer id={getRecordBoardHtmlId(recordBoardId)}>
          <RecordBoardHeader />
          <StyledBoardContentContainer>
            <StyledContainer ref={boardRef}>
              <RecordBoardDndKitProvider>
                <RecordBoardColumns />
              </RecordBoardDndKitProvider>
              {!isRecordBoardViewSettingsReadOnly && (
                <RecordBoardDragSelect boardRef={boardRef} />
              )}
              <RecordBoardFetchMoreInViewTriggerComponent />
            </StyledContainer>
          </StyledBoardContentContainer>
        </StyledContainerContainer>
      </ScrollWrapper>
    </>
  );
};
