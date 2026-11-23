import { styled } from '@linaria/react';
import { type ReactElement, useMemo, useState } from 'react';

import { EventsGroup } from '@/activities/timeline-activities/components/EventsGroup';
import { TimelineEventFilterBar } from '@/activities/timeline-activities/components/TimelineEventFilterBar';
import { TimelineStageTrajectory } from '@/activities/timeline-activities/components/TimelineStageTrajectory';
import { TimelineNotePreviewContext } from '@/activities/timeline-activities/contexts/TimelineNotePreviewContext';
import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
import { buildStageTrajectory } from '@/activities/timeline-activities/utils/buildStageTrajectory';
import { filterOutInvalidTimelineActivities } from '@/activities/timeline-activities/utils/filterOutInvalidTimelineActivities';
import { findTimelineStageField } from '@/activities/timeline-activities/utils/findTimelineStageField';
import {
  getTimelineEventCategory,
  isTimelineEventInFilter,
  type TimelineEventCategory,
  type TimelineEventFilter,
} from '@/activities/timeline-activities/utils/getTimelineEventCategory';
import { groupTimelineEventsByDay } from '@/activities/timeline-activities/utils/groupTimelineEventsByDay';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useRecordShowSummaryConfig } from '@/object-record/record-show/record-show-magnus/hooks/useRecordShowSummaryConfig';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type EventListProps = {
  targetableObject: ActivityTargetableObject;
  title: string;
  events: TimelineActivity[];
  button?: ReactElement | false;
  // Magnus (Fase D): sem mais paginas para carregar, a trajetoria sabe quando o cartao entrou na 1a etapa.
  isTimelineComplete?: boolean;
};

const StyledTimelineContainer = styled.div`
  align-items: center;
  align-self: stretch;

  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: flex-start;
`;

const StyledEmptyFilter = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  margin: ${themeCssVariables.spacing[4]} 0;
`;

export const EventList = ({
  events,
  targetableObject,
  isTimelineComplete = false,
}: EventListProps) => {
  const [activeFilter, setActiveFilter] = useState<TimelineEventFilter>('all');

  const mainObjectMetadataItem = useObjectMetadataItem({
    objectNameSingular: targetableObject.targetObjectNameSingular,
  }).objectMetadataItem;

  const { objectMetadataItems } = useObjectMetadataItems();

  const summaryConfig = useRecordShowSummaryConfig(
    targetableObject.targetObjectNameSingular,
  );

  const recordStore = useAtomFamilyStateValue(
    recordStoreFamilyState,
    targetableObject.id,
  );

  const stageFieldMetadataItem = findTimelineStageField(
    mainObjectMetadataItem.fields,
    summaryConfig?.stageFieldMetadataItem,
  );

  const filteredEvents = useMemo(
    () =>
      filterOutInvalidTimelineActivities(
        events,
        targetableObject.targetObjectNameSingular,
        objectMetadataItems,
      ),
    [events, targetableObject.targetObjectNameSingular, objectMetadataItems],
  );

  const categoryByEventId = useMemo(() => {
    const categories = new Map<string, TimelineEventCategory>();

    for (const event of filteredEvents) {
      const linkedObjectNameSingular = isDefined(event.linkedObjectMetadataId)
        ? objectMetadataItems.find(
            (objectMetadataItem) =>
              objectMetadataItem.id === event.linkedObjectMetadataId,
          )?.nameSingular
        : null;

      categories.set(
        event.id,
        getTimelineEventCategory({
          event,
          linkedObjectNameSingular,
          stageFieldName: stageFieldMetadataItem?.name,
        }),
      );
    }

    return categories;
  }, [filteredEvents, objectMetadataItems, stageFieldMetadataItem?.name]);

  // A lista vem do mais recente para o mais antigo: o primeiro evento de cada nota e o mais novo.
  const notePreviewContextValue = useMemo(() => {
    const notePreviewEventIds = new Set<string>();
    const seenNoteIds = new Set<string>();

    for (const event of filteredEvents) {
      const category = categoryByEventId.get(event.id);
      const noteId = event.linkedRecordId;

      if (
        (category === 'note' || category === 'whatsapp') &&
        isDefined(noteId) &&
        !seenNoteIds.has(noteId)
      ) {
        seenNoteIds.add(noteId);
        notePreviewEventIds.add(event.id);
      }
    }

    return { notePreviewEventIds };
  }, [filteredEvents, categoryByEventId]);

  const counts: Record<TimelineEventFilter, number> = {
    all: filteredEvents.length,
    notes: 0,
    tasks: 0,
    stages: 0,
  };

  for (const category of categoryByEventId.values()) {
    for (const filter of ['notes', 'tasks', 'stages'] as const) {
      if (isTimelineEventInFilter(category, filter)) {
        counts[filter]++;
      }
    }
  }

  const visibleEvents = filteredEvents.filter((event) =>
    isTimelineEventInFilter(
      categoryByEventId.get(event.id) ?? 'other',
      activeFilter,
    ),
  );

  const now = new Date();
  const groupedEvents = groupTimelineEventsByDay(visibleEvents, now);

  const trajectory = isDefined(stageFieldMetadataItem)
    ? buildStageTrajectory({
        events,
        stageFieldName: stageFieldMetadataItem.name,
        currentStage: recordStore?.[stageFieldMetadataItem.name],
        recordCreatedAt: recordStore?.createdAt,
        isTimelineComplete,
        now,
      })
    : [];

  const shouldShowTrajectory =
    isDefined(stageFieldMetadataItem) &&
    (activeFilter === 'all' || activeFilter === 'stages');

  return (
    <ScrollWrapper
      componentInstanceId={`scroll-wrapper-event-list-${targetableObject.id}`}
    >
      <TimelineNotePreviewContext.Provider value={notePreviewContextValue}>
        <StyledTimelineContainer>
          <TimelineEventFilterBar
            activeFilter={activeFilter}
            counts={counts}
            onFilterChange={setActiveFilter}
          />
          {shouldShowTrajectory && (
            <TimelineStageTrajectory
              steps={trajectory}
              stageFieldMetadataItem={stageFieldMetadataItem}
            />
          )}
          {groupedEvents.length === 0 && (
            <StyledEmptyFilter>Nada deste tipo por enquanto.</StyledEmptyFilter>
          )}
          {groupedEvents.map((group) => (
            <EventsGroup
              mainObjectMetadataItem={mainObjectMetadataItem}
              key={group.key}
              label={group.label}
              items={group.items}
              categoryByEventId={categoryByEventId}
            />
          ))}
        </StyledTimelineContainer>
      </TimelineNotePreviewContext.Provider>
    </ScrollWrapper>
  );
};
