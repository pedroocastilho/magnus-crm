import { RecordBoardCardSignalsContext } from '@/object-record/record-board/record-board-signals/contexts/RecordBoardCardSignalsContext';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { isDefined } from 'twenty-shared/utils';

const StyledStripeContainer = styled.div`
  padding: ${themeCssVariables.spacing[2]} 10px 0;
`;

// Traco de 20x4px na cor da opcao (passo 9), com o nome para leitor de tela e tooltip nativo.
const StyledStripe = styled.div`
  border-radius: ${themeCssVariables.border.radius.pill};
  height: 4px;
  width: 20px;
`;

export const RecordBoardCardStripe = () => {
  const signals = useContext(RecordBoardCardSignalsContext);

  if (!isDefined(signals?.stripe)) {
    return null;
  }

  return (
    <StyledStripeContainer>
      <StyledStripe
        role="img"
        aria-label={signals.stripe.label}
        title={signals.stripe.label}
        style={{
          backgroundColor: `var(--t-color-${signals.stripe.color}9)`,
        }}
      />
    </StyledStripeContainer>
  );
};
