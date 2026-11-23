import { type RecordAlert } from '@/object-record/record-board/record-board-signals/types/RecordAlertRule';
import { styled } from '@linaria/react';
import { IconAlertTriangle } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 2px;
  list-style: none;
  margin: 0;
  min-width: 0;
  padding: 0;
`;

// Icone + texto (nunca so a cor). Atencao em ambar, urgente em vermelho alaranjado, longe do bordo da marca.
const StyledItem = styled.li`
  align-items: flex-start;
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  line-height: 18px;
  min-width: 0;
  padding: 1px ${themeCssVariables.spacing[1]};

  &[data-level='attention'] {
    background-color: ${themeCssVariables.color.amber3};
    color: ${themeCssVariables.color.amber11};
  }

  &[data-level='urgent'] {
    background-color: ${themeCssVariables.color.tomato3};
    color: ${themeCssVariables.color.tomato11};
  }

  & > svg {
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const StyledText = styled.span`
  min-width: 0;
  overflow-wrap: anywhere;
`;

type RecordAlertListProps = {
  alerts: RecordAlert[];
  maxVisible?: number;
};

// Magnus (R8): lista de alertas do cartao. No quadro mostra os primeiros e "+N" com o resto no title.
export const RecordAlertList = ({
  alerts,
  maxVisible,
}: RecordAlertListProps) => {
  const visible =
    maxVisible === undefined ? alerts : alerts.slice(0, maxVisible);
  const hidden = alerts.slice(visible.length);

  return (
    <StyledList aria-label="Alertas">
      {visible.map((alert, index) => (
        <StyledItem
          key={alert.ruleId}
          data-level={alert.level}
          title={
            index === visible.length - 1 && hidden.length > 0
              ? hidden.map((hiddenAlert) => hiddenAlert.label).join('\n')
              : undefined
          }
        >
          <IconAlertTriangle size={14} stroke={1.8} />
          <StyledText>
            {alert.label}
            {index === visible.length - 1 && hidden.length > 0
              ? ` +${hidden.length}`
              : ''}
          </StyledText>
        </StyledItem>
      ))}
    </StyledList>
  );
};
