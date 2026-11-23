import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardMobileStageButton } from '@/object-record/record-board/record-board-signals/components/RecordBoardMobileStageButton';
import { getRecordBoardScrollWrapperInstanceId } from '@/object-record/record-board/record-board-signals/utils/getRecordBoardScrollWrapperInstanceId';
import { visibleRecordGroupIdsComponentFamilySelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentFamilySelector';
import { scrollWrapperScrollLeftComponentState } from '@/ui/utilities/scroll/states/scrollWrapperScrollLeftComponentState';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { ViewType } from '@/views/types/ViewType';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledStrip = styled.nav`
  background: ${themeCssVariables.background.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[1]};
  overflow-x: auto;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

// Magnus (Fase B): faixa fixa de etapas no celular, para pular de coluna sem arrastar a tela.
// Cada coluna mede 100vw - 40px e tem um vao de 8px, entao o passo e a largura da tela - 32px.
export const RecordBoardMobileStageStrip = () => {
  const { recordBoardId } = useContext(RecordBoardContext);

  const visibleRecordGroupIds = useAtomComponentFamilySelectorValue(
    visibleRecordGroupIdsComponentFamilySelector,
    ViewType.KANBAN,
  );

  const scrollWrapperScrollLeft = useAtomComponentStateValue(
    scrollWrapperScrollLeftComponentState,
    getRecordBoardScrollWrapperInstanceId(recordBoardId),
  );

  if (visibleRecordGroupIds.length === 0) {
    return null;
  }

  const columnStep = Math.max(1, window.innerWidth - 32);
  const activeColumnIndex = Math.min(
    visibleRecordGroupIds.length - 1,
    Math.round(scrollWrapperScrollLeft / columnStep),
  );

  return (
    <StyledStrip aria-label="Etapas do quadro">
      {visibleRecordGroupIds.map((recordGroupId, index) => (
        <RecordBoardMobileStageButton
          key={recordGroupId}
          recordGroupId={recordGroupId}
          columnIndex={index}
          isActive={index === activeColumnIndex}
        />
      ))}
    </StyledStrip>
  );
};
