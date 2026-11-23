import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { RecordAlertRulesLoader } from '@/object-record/record-board/record-board-signals/components/RecordAlertRulesLoader';
import { RecordBoardSignalsConfigLoadEffect } from '@/object-record/record-board/record-board-signals/components/RecordBoardSignalsConfigLoadEffect';
import { RECORD_BOARD_SIGNALS_CONFIG_OBJECT_NAME_SINGULAR } from '@/object-record/record-board/record-board-signals/constants/RecordBoardSignalsConfigObjectNameSingular';
import { isDefined } from 'twenty-shared/utils';

// Magnus (Fase B): sem o objeto de configuracao, nao consulta nada e o quadro fica como o do Twenty.
// Papel sem leitura do objeto tambem nao consulta (evita o aviso de erro na tela).
// R8: as regras de alerta so carregam junto com a configuracao (sem ela o cartao nao tem os sinais).
export const RecordBoardSignalsConfigLoader = () => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const configObjectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular ===
        RECORD_BOARD_SIGNALS_CONFIG_OBJECT_NAME_SINGULAR &&
      objectMetadataItem.isActive,
  );

  const { canReadObjectRecords } = useObjectPermissionsForObject(
    configObjectMetadataItem?.id ?? '',
  );

  return isDefined(configObjectMetadataItem) && canReadObjectRecords ? (
    <>
      <RecordBoardSignalsConfigLoadEffect />
      <RecordAlertRulesLoader />
    </>
  ) : null;
};
