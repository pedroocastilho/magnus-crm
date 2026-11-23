import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardSignalsContext } from '@/object-record/record-board/record-board-signals/contexts/RecordBoardSignalsContext';
import { scrollRecordBoardToColumn } from '@/object-record/record-board/record-board-signals/utils/scrollRecordBoardToColumn';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { styled } from '@linaria/react';
import { useContext, useEffect, useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledStageButton = styled.button`
  align-items: center;
  background: ${themeCssVariables.background.boardColumn};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: 999px;
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: 6px;
  min-height: 32px;
  padding: 0 ${themeCssVariables.spacing[3]};
  white-space: nowrap;

  &[aria-current='true'] {
    background: ${themeCssVariables.accent.accent3};
    border-color: ${themeCssVariables.accent.accent8};
    color: ${themeCssVariables.accent.accent11};
  }

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.accent.accent8};
    outline-offset: 1px;
  }
`;

const StyledDot = styled.span`
  border-radius: 999px;
  flex-shrink: 0;
  height: 8px;
  width: 8px;
`;

const StyledCount = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-feature-settings: 'tnum';
`;

// Uma etapa da faixa do celular: cor da etapa, nome e quantidade de cartoes.
export const RecordBoardMobileStageButton = ({
  recordGroupId,
  columnIndex,
  isActive,
}: {
  recordGroupId: string;
  columnIndex: number;
  isActive: boolean;
}) => {
  const { recordBoardId } = useContext(RecordBoardContext);
  const { columnSummaries } = useContext(RecordBoardSignalsContext);
  const recordGroupDefinition = useAtomFamilyStateValue(
    recordGroupDefinitionFamilyState,
    recordGroupId,
  );
  const buttonRef = useRef<HTMLButtonElement>(null);

  // A faixa acompanha a coluna aberta: a etapa ativa sempre fica a vista.
  useEffect(() => {
    if (isActive) {
      buttonRef.current?.scrollIntoView({
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }, [isActive]);

  if (!isDefined(recordGroupDefinition)) {
    return null;
  }

  const count = columnSummaries.get(recordGroupDefinition.value ?? '')?.count;
  const color = /^[a-z]+$/.test(recordGroupDefinition.color ?? '')
    ? recordGroupDefinition.color
    : 'gray';

  return (
    <StyledStageButton
      ref={buttonRef}
      type="button"
      aria-current={isActive ? 'true' : undefined}
      onClick={() => scrollRecordBoardToColumn(recordBoardId, columnIndex)}
    >
      <StyledDot style={{ backgroundColor: `var(--t-color-${color}9)` }} />
      {recordGroupDefinition.title}
      {isDefined(count) && <StyledCount>{count}</StyledCount>}
    </StyledStageButton>
  );
};
