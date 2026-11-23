import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardCardContext } from '@/object-record/record-board/record-board-card/contexts/RecordBoardCardContext';
import { RecordAlertList } from '@/object-record/record-board/record-board-signals/components/RecordAlertList';
import { RecordBoardSignalsContext } from '@/object-record/record-board/record-board-signals/contexts/RecordBoardSignalsContext';
import { useRecordAlerts } from '@/object-record/record-board/record-board-signals/hooks/useRecordAlerts';
import { useContext, useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

// Magnus (R8): ate 2 alertas no cartao do quadro (o resto no "+N"); a ficha mostra todos.
export const RecordBoardCardAlerts = () => {
  const { recordId } = useContext(RecordBoardCardContext);
  const { objectMetadataItem, selectFieldMetadataItem } =
    useContext(RecordBoardContext);
  const { config, now } = useContext(RecordBoardSignalsContext);

  const fields = useMemo(
    () =>
      isDefined(config)
        ? {
            stageFieldMetadataItem: selectFieldMetadataItem,
            finalStageValues: config.finalStageValues,
            stageSinceFieldMetadataItem: config.stageSinceFieldMetadataItem,
            nextContactFieldMetadataItem: config.nextContactFieldMetadataItem,
            amountFieldMetadataItem: config.amountFieldMetadataItem,
            ownerFieldMetadataItem: config.ownerFieldMetadataItem,
          }
        : null,
    [config, selectFieldMetadataItem],
  );

  const alerts = useRecordAlerts({
    recordId,
    objectNameSingular: objectMetadataItem.nameSingular,
    fields,
    now,
  });

  return alerts.length > 0 ? (
    <RecordAlertList alerts={alerts} maxVisible={2} />
  ) : null;
};
