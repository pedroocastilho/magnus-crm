import { StopPropagationContainer } from '@/object-record/record-board/record-board-card/components/StopPropagationContainer';
import { RecordBoardCardContext } from '@/object-record/record-board/record-board-card/contexts/RecordBoardCardContext';
import { RecordBoardCardAlerts } from '@/object-record/record-board/record-board-signals/components/RecordBoardCardAlerts';
import { RecordBoardCardQuickActionsMenu } from '@/object-record/record-board/record-board-signals/components/RecordBoardCardQuickActionsMenu';
import { RecordBoardCardSignalsContext } from '@/object-record/record-board/record-board-signals/contexts/RecordBoardCardSignalsContext';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/data-display';
import {
  IconAlertCircle,
  IconCheck,
  IconCircleDashed,
  IconClock,
  IconDotsVertical,
} from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { formatCurrencyShort } from '~/utils/format/formatCurrencyShort';

const StyledFooter = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  margin-top: ${themeCssVariables.spacing[1]};
  padding: 6px 10px ${themeCssVariables.spacing[2]};
`;

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  min-height: 20px;
  min-width: 0;
`;

// Estado do proximo contato: cor + icone + texto (nunca so a cor).
const StyledNextContact = styled.span`
  align-items: center;
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &[data-state='future'] {
    color: ${themeCssVariables.color.green11};
  }

  &[data-state='today'] {
    color: ${themeCssVariables.color.amber11};
  }

  &[data-state='overdue'] {
    color: ${themeCssVariables.color.tomato11};
  }

  &[data-state='empty'] {
    color: ${themeCssVariables.font.color.tertiary};
  }
`;

const StyledOwner = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  flex: 1 1 auto;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledAmount = styled.span`
  color: ${themeCssVariables.font.color.primary};
  flex-shrink: 0;
  font-feature-settings: 'tnum';
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin-left: auto;
`;

const StyledActions = styled.div`
  flex-shrink: 0;
  margin-right: calc(-1 * ${themeCssVariables.spacing[1]});
`;

const NEXT_CONTACT_ICONS = {
  future: IconCheck,
  today: IconClock,
  overdue: IconAlertCircle,
  empty: IconCircleDashed,
} as const;

// Magnus (Fase B): rodape do cartao com proximo contato, dono, valor e acoes rapidas (R8: alertas no topo).
// So aparece quando o quadro tem configuracao; cada parte so aparece se o campo dela estiver configurado.
export const RecordBoardCardFooter = () => {
  const { recordId, isDragOverlay } = useContext(RecordBoardCardContext);
  const signals = useContext(RecordBoardCardSignalsContext);

  if (!isDefined(signals)) {
    return null;
  }

  const { nextContact, owner, amount } = signals;
  const NextContactIcon = isDefined(nextContact)
    ? NEXT_CONTACT_ICONS[nextContact.state]
    : null;
  const quickActionsDropdownId = `record-board-card-quick-actions-${recordId}`;

  return (
    <StyledFooter>
      <RecordBoardCardAlerts />
      {isDefined(nextContact) && isDefined(NextContactIcon) && (
        <StyledRow>
          <StyledNextContact data-state={nextContact.state}>
            <NextContactIcon size={14} stroke={1.8} />
            {nextContact.label}
          </StyledNextContact>
        </StyledRow>
      )}
      <StyledRow>
        <StyledOwner>
          {isDefined(owner) && (
            <>
              <Avatar
                size="sm"
                avatarUrl={owner.avatarUrl}
                placeholder={owner.name}
                placeholderColorSeed={owner.colorSeed}
                type="rounded"
              />
              {owner.name}
            </>
          )}
        </StyledOwner>
        {isDefined(amount) && (
          <StyledAmount>
            {formatCurrencyShort(amount.amount, {
              currencyCode: amount.currencyCode,
            })}
          </StyledAmount>
        )}
        {!isDragOverlay && (
          <StyledActions>
            <StopPropagationContainer>
              <Dropdown
                dropdownId={quickActionsDropdownId}
                dropdownPlacement="bottom-end"
                clickableComponent={
                  <LightIconButton
                    accent="tertiary"
                    aria-label="Ações rápidas"
                    Icon={IconDotsVertical}
                  />
                }
                dropdownComponents={
                  <RecordBoardCardQuickActionsMenu
                    dropdownId={quickActionsDropdownId}
                  />
                }
              />
            </StopPropagationContainer>
          </StyledActions>
        )}
      </StyledRow>
    </StyledFooter>
  );
};
