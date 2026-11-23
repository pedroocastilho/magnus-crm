import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { RecordBoardSignalsContext } from '@/object-record/record-board/record-board-signals/contexts/RecordBoardSignalsContext';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconAlertTriangle } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledStale = styled.div`
  align-items: center;
  color: ${themeCssVariables.color.tomato11};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[1]} 0;
`;

// Magnus (Fase B): segunda linha do cabecalho, so quando ha cartoes parados acima do limite.
export const RecordBoardColumnSummaryLine = () => {
  const { columnDefinition } = useContext(RecordBoardColumnContext);
  const { config, columnSummaries } = useContext(RecordBoardSignalsContext);

  const staleCount =
    columnSummaries.get(columnDefinition.value ?? '')?.staleCount ?? 0;

  if (!isDefined(config) || staleCount === 0) {
    return null;
  }

  return (
    <StyledStale>
      <IconAlertTriangle size={12} stroke={2} />
      {staleCount} {staleCount === 1 ? 'parado' : 'parados'} há mais de{' '}
      {config.staleDays} dias
    </StyledStale>
  );
};
