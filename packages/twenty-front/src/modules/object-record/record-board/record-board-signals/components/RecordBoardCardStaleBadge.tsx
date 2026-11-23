import { RecordBoardCardSignalsContext } from '@/object-record/record-board/record-board-signals/contexts/RecordBoardCardSignalsContext';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { isDefined } from 'twenty-shared/utils';

// Selo "Xd": ambar no limite de atencao, vermelho alaranjado (tomato) no limite de parado.
// O vermelho fica longe do bordo da marca e nunca depende so da cor: o numero esta escrito.
const StyledBadge = styled.span`
  border-radius: ${themeCssVariables.border.radius.sm};
  flex-shrink: 0;
  font-feature-settings: 'tnum';
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  line-height: 16px;
  margin-left: ${themeCssVariables.spacing[1]};
  padding: 0 ${themeCssVariables.spacing[1]};

  &[data-level='attention'] {
    background-color: ${themeCssVariables.color.amber3};
    color: ${themeCssVariables.color.amber11};
  }

  &[data-level='stale'] {
    background-color: ${themeCssVariables.color.tomato3};
    color: ${themeCssVariables.color.tomato11};
  }
`;

export const RecordBoardCardStaleBadge = () => {
  const signals = useContext(RecordBoardCardSignalsContext);

  if (
    !isDefined(signals) ||
    signals.staleLevel === 'none' ||
    signals.daysInStage === null
  ) {
    return null;
  }

  const days = signals.daysInStage;

  return (
    <StyledBadge
      data-level={signals.staleLevel}
      title={`Nesta etapa há ${days} ${days === 1 ? 'dia' : 'dias'}`}
      aria-label={`Nesta etapa há ${days} ${days === 1 ? 'dia' : 'dias'}`}
    >
      {days}d
    </StyledBadge>
  );
};
