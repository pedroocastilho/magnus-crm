import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { RecordBoardColumnCardContainerSkeletonLoader } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnCardContainerSkeletonLoader';

// Magnus (19/11/2026): lugar reservado do cartao que ainda nao chegou perto da tela.
// Mesmo visual dos cartoes "carregando" do quadro (RecordBoardColumnLoadingSkeletonCards).
const StyledPlaceholderCardContainer = styled.div`
  background-color: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.background.quaternary};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-shadow:
    0px 4px 8px 0px ${themeCssVariables.color.gray2},
    0px 0px 4px 0px ${themeCssVariables.color.gray2};
  color: ${themeCssVariables.font.color.primary};
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

export const RecordBoardCardPlaceholder = () => (
  <StyledPlaceholderCardContainer data-testid="record-board-card-placeholder">
    <RecordBoardColumnCardContainerSkeletonLoader />
  </StyledPlaceholderCardContainer>
);
