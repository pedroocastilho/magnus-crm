import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { EMPTY_QUERY } from '@/object-record/constants/EmptyQuery';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { generateGroupByAggregateQuery } from '@/object-record/record-aggregate/utils/generateGroupByAggregateQuery';
import { type RecordBoardSignalsConfig } from '@/object-record/record-board/record-board-signals/types/RecordBoardSignalsConfig';
import {
  buildRecordBoardColumnSummaries,
  type RecordBoardColumnSummary,
  type RecordBoardGroupByQueryResult,
} from '@/object-record/record-board/record-board-signals/utils/buildRecordBoardColumnSummaries';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { getAvailableAggregationsFromObjectFields } from '@/object-record/utils/getAvailableAggregationsFromObjectFields';
import { buildGroupByFieldObject } from '@/page-layout/widgets/graph/utils/buildGroupByFieldObject';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useQuery } from '@apollo/client/react';
import { useMemo } from 'react';
import {
  combineFilters,
  computeRecordGqlOperationFilter,
  isDefined,
  turnAnyFieldFilterIntoRecordGqlFilter,
} from 'twenty-shared/utils';
import { AggregateOperations } from '~/generated-metadata/graphql';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

// Magnus (Fase B): resumo de cada coluna (quantidade, total em R$ e parados) respeitando
// os filtros e a busca da visao. Sem configuracao do quadro nao consulta nada.
export const useRecordBoardColumnSummaries = ({
  objectMetadataItem,
  groupByFieldMetadataItem,
  config,
  now,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
  groupByFieldMetadataItem: FieldMetadataItem | null | undefined;
  config: RecordBoardSignalsConfig | null;
  now: Date;
}): Map<string, RecordBoardColumnSummary> => {
  const apolloCoreClient = useApolloCoreClient();

  const currentRecordFilterGroups = useAtomComponentStateValue(
    currentRecordFilterGroupsComponentState,
  );
  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
  );
  const anyFieldFilterValue = useAtomComponentStateValue(
    anyFieldFilterValueComponentState,
  );
  const { filterValueDependencies } = useFilterValueDependencies();
  const flattenedFieldMetadataItems = useAtomStateValue(
    flattenedFieldMetadataItemsSelector,
  );

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const amountGqlField = useMemo(() => {
    if (!isDefined(config?.amountFieldMetadataItem)) {
      return null;
    }

    const availableAggregations = getAvailableAggregationsFromObjectFields(
      objectMetadataItem.readableFields,
    );

    return (
      availableAggregations[config.amountFieldMetadataItem.name]?.[
        AggregateOperations.SUM
      ] ?? null
    );
  }, [config?.amountFieldMetadataItem, objectMetadataItem.readableFields]);

  const summaryQuery = useMemo(
    () =>
      generateGroupByAggregateQuery({
        objectMetadataItem,
        aggregateOperationGqlFields: [
          'totalCount',
          ...(isDefined(amountGqlField) ? [amountGqlField] : []),
        ],
      }),
    [objectMetadataItem, amountGqlField],
  );

  const staleQuery = useMemo(
    () =>
      isDefined(config?.stageSinceFieldMetadataItem)
        ? generateGroupByAggregateQuery({
            objectMetadataItem,
            aggregateOperationGqlFields: ['totalCount'],
          })
        : EMPTY_QUERY,
    [objectMetadataItem, config?.stageSinceFieldMetadataItem],
  );

  const viewFilter = computeRecordGqlOperationFilter({
    filterValueDependencies,
    recordFilters: currentRecordFilters,
    recordFilterGroups: currentRecordFilterGroups,
    fieldMetadataItems: flattenedFieldMetadataItems,
  });

  const { recordGqlOperationFilter: anyFieldFilter } =
    turnAnyFieldFilterIntoRecordGqlFilter({
      fields: objectMetadataItem.fields,
      filterValue: anyFieldFilterValue,
    });

  const baseFilter = combineFilters([anyFieldFilter, viewFilter]);

  const groupBy = isDefined(groupByFieldMetadataItem)
    ? buildGroupByFieldObject({ field: groupByFieldMetadataItem })
    : null;

  const shouldSkip =
    !isDefined(config) ||
    !isDefined(groupBy) ||
    !objectPermissions.canReadObjectRecords;

  // Limite arredondado ao minuto para a consulta nao mudar a cada render.
  const staleLimitIso = useMemo(() => {
    if (!isDefined(config)) {
      return null;
    }

    const limit = new Date(
      now.getTime() - config.staleDays * MILLISECONDS_PER_DAY,
    );
    limit.setSeconds(0, 0);

    return limit.toISOString();
  }, [config, now]);

  const { data: summaryData } = useQuery<RecordBoardGroupByQueryResult>(
    summaryQuery,
    {
      skip: shouldSkip,
      variables: { filter: baseFilter, groupBy },
      client: apolloCoreClient,
    },
  );

  const stageSinceFieldName = config?.stageSinceFieldMetadataItem?.name;

  const { data: staleData } = useQuery<RecordBoardGroupByQueryResult>(
    staleQuery,
    {
      skip:
        shouldSkip ||
        !isDefined(stageSinceFieldName) ||
        !isDefined(staleLimitIso),
      variables: {
        filter: combineFilters([
          baseFilter,
          isDefined(stageSinceFieldName)
            ? { [stageSinceFieldName]: { lt: staleLimitIso } }
            : {},
        ]),
        groupBy,
      },
      client: apolloCoreClient,
    },
  );

  return useMemo(
    () =>
      shouldSkip
        ? new Map()
        : buildRecordBoardColumnSummaries({
            queryResultGqlFieldName: `${objectMetadataItem.namePlural}GroupBy`,
            summaryData,
            staleData: isDefined(stageSinceFieldName) ? staleData : undefined,
            amountGqlField,
            finalStageValues: config?.finalStageValues,
          }),
    [
      config?.finalStageValues,
      shouldSkip,
      objectMetadataItem.namePlural,
      summaryData,
      staleData,
      stageSinceFieldName,
      amountGqlField,
    ],
  );
};
