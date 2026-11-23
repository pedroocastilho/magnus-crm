import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { RecordFieldsScopeContextProvider } from '@/object-record/record-field-list/contexts/RecordFieldsScopeContext';
import { RecordFieldListComponentInstanceContext } from '@/object-record/record-field-list/states/contexts/RecordFieldListComponentInstanceContext';
import { FieldsWidgetCellEditModePortal } from '@/page-layout/widgets/fields/components/FieldsWidgetCellEditModePortal';
import { FieldsWidgetCellHoveredPortal } from '@/page-layout/widgets/fields/components/FieldsWidgetCellHoveredPortal';
import { FieldsWidgetFieldList } from '@/page-layout/widgets/fields/components/FieldsWidgetFieldList';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

type RecordShowMagnusTopFieldsProps = {
  fieldMetadataItems: FieldMetadataItem[];
};

// Magnus (Fase D): etapa, produto, temperatura e dono no topo da ficha, trocaveis ali mesmo.
// Mesma edicao dos campos do Twenty (lista de campos + portais de edicao), so com estes campos.
export const RecordShowMagnusTopFields = ({
  fieldMetadataItems,
}: RecordShowMagnusTopFieldsProps) => {
  const targetRecord = useTargetRecord();
  const { isInSidePanel } = useLayoutRenderingContext();
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetRecord.targetObjectNameSingular,
  });

  const instanceId = `magnus-top-fields-${targetRecord.id}${isInSidePanel ? '-side-panel' : ''}`;

  return (
    <RecordFieldsScopeContextProvider value={{ scopeInstanceId: instanceId }}>
      <RecordFieldListComponentInstanceContext.Provider value={{ instanceId }}>
        <StyledFields>
          <FieldsWidgetFieldList
            fields={fieldMetadataItems.map((fieldMetadataItem, index) => ({
              fieldMetadataItem,
              position: index,
              isVisible: true,
              globalIndex: index,
            }))}
            instanceId={instanceId}
          />
        </StyledFields>
        <FieldsWidgetCellHoveredPortal
          objectMetadataItem={objectMetadataItem}
          recordId={targetRecord.id}
          flattenedFieldMetadataItems={fieldMetadataItems}
        />
        <FieldsWidgetCellEditModePortal
          objectMetadataItem={objectMetadataItem}
          recordId={targetRecord.id}
          flattenedFieldMetadataItems={fieldMetadataItems}
        />
      </RecordFieldListComponentInstanceContext.Provider>
    </RecordFieldsScopeContextProvider>
  );
};
