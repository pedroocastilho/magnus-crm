import { getFieldMetadataItemGqlFieldName } from '@/object-metadata/utils/getFieldMetadataItemGqlFieldName';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardCardContext } from '@/object-record/record-board/record-board-card/contexts/RecordBoardCardContext';
import { RecordBoardCardSignalsContext } from '@/object-record/record-board/record-board-signals/contexts/RecordBoardCardSignalsContext';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSectionLabel } from '@/ui/layout/dropdown/components/DropdownMenuSectionLabel';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconArrowRight, IconBrandWhatsapp } from 'twenty-ui/icon';
import { MenuItem } from 'twenty-ui/navigation';

// Magnus (Fase B, R12): acoes do dia a dia sem abrir a ficha.
// "Proxima etapa" cobre o follow-up feito (Follow-up 1 -> 2 -> ...); mover usa a mesma
// atualizacao da tela, entao o quadro reposiciona o cartao e as automacoes rodam igual.
export const RecordBoardCardQuickActionsMenu = ({
  dropdownId,
}: {
  dropdownId: string;
}) => {
  const { recordId, isRecordReadOnly } = useContext(RecordBoardCardContext);
  const { selectFieldMetadataItem, updateOneRecord } =
    useContext(RecordBoardContext);
  const signals = useContext(RecordBoardCardSignalsContext);
  const recordStore = useAtomFamilyStateValue(recordStoreFamilyState, recordId);
  const { closeDropdown } = useCloseDropdown();

  const stageFieldName = getFieldMetadataItemGqlFieldName(
    selectFieldMetadataItem,
  );
  const currentStage = recordStore?.[stageFieldName] as
    | string
    | null
    | undefined;

  const stageOptions = [...(selectFieldMetadataItem.options ?? [])].sort(
    (optionA, optionB) => optionA.position - optionB.position,
  );
  const currentIndex = stageOptions.findIndex(
    (option) => option.value === currentStage,
  );
  const nextStage =
    currentIndex >= 0 ? stageOptions[currentIndex + 1] : undefined;

  const canMove = !isRecordReadOnly && isDefined(updateOneRecord);

  const moveToStage = (stageValue: string) => {
    closeDropdown(dropdownId);

    if (!canMove || stageValue === currentStage) {
      return;
    }

    updateOneRecord({
      idToUpdate: recordId,
      updateOneRecordInput: { [stageFieldName]: stageValue },
    });
  };

  const openWhatsapp = () => {
    closeDropdown(dropdownId);

    if (isDefined(signals?.whatsappUrl)) {
      window.open(signals.whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <DropdownContent>
      <DropdownMenuItemsContainer>
        {isDefined(signals?.whatsappUrl) && (
          <MenuItem
            LeftIcon={IconBrandWhatsapp}
            text="Chamar no WhatsApp"
            onClick={openWhatsapp}
          />
        )}
        {canMove && isDefined(nextStage) && (
          <MenuItem
            LeftIcon={IconArrowRight}
            text={`Próxima etapa: ${nextStage.label}`}
            onClick={() => moveToStage(nextStage.value)}
          />
        )}
      </DropdownMenuItemsContainer>
      {canMove && stageOptions.length > 1 && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuSectionLabel label="Mover para" />
          <DropdownMenuItemsContainer hasMaxHeight>
            {stageOptions
              .filter((option) => option.value !== currentStage)
              .map((option) => (
                <MenuItem
                  key={option.id ?? option.value}
                  text={option.label}
                  onClick={() => moveToStage(option.value)}
                />
              ))}
          </DropdownMenuItemsContainer>
        </>
      )}
    </DropdownContent>
  );
};
