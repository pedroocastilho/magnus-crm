import { styled } from '@linaria/react';

import { EventRow } from '@/activities/timeline-activities/components/EventRow';
import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
import { collapseRepeatedTimelineEvents } from '@/activities/timeline-activities/utils/collapseRepeatedTimelineEvents';
import { type TimelineEventCategory } from '@/activities/timeline-activities/utils/getTimelineEventCategory';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { themeCssVariables } from 'twenty-ui/theme-constants';

// Magnus (Fase D): um grupo por dia ("Hoje", "Ontem", "18 de nov") no lugar do grupo por mes.
type EventsGroupProps = {
  label: string;
  items: TimelineActivity[];
  categoryByEventId: Map<string, TimelineEventCategory>;
  mainObjectMetadataItem: EnrichedObjectMetadataItem | null;
};

const StyledActivityGroup = styled.div`
  display: flex;
  flex-flow: column;
  gap: ${themeCssVariables.spacing[4]};
  margin-bottom: ${themeCssVariables.spacing[4]};
  width: 100%;
`;

const StyledActivityGroupContainer = styled.div`
  margin-bottom: ${themeCssVariables.spacing[3]};
  margin-top: ${themeCssVariables.spacing[3]};
  position: relative;
`;

const StyledActivityGroupBar = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  position: absolute;
  top: 0;
  width: 24px;
`;

const StyledMonthSeperator = styled.div`
  align-items: center;
  align-self: stretch;
  color: ${themeCssVariables.font.color.light};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: ${themeCssVariables.spacing[4]};
`;
const StyledMonthSeperatorLine = styled.div`
  background: ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.pill};
  corner-shape: round;
  flex: 1 0 0;
  height: 1px;
`;

export const EventsGroup = ({
  label,
  items,
  categoryByEventId,
  mainObjectMetadataItem,
}: EventsGroupProps) => {
  const collapsedItems = collapseRepeatedTimelineEvents(
    items,
    categoryByEventId,
  );

  return (
    <StyledActivityGroup>
      <StyledMonthSeperator>
        {label}
        <StyledMonthSeperatorLine />
      </StyledMonthSeperator>
      <StyledActivityGroupContainer>
        <StyledActivityGroupBar />
        {collapsedItems.map(({ event, repeatCount }, index) => (
          <EventRow
            mainObjectMetadataItem={mainObjectMetadataItem}
            key={event.id}
            event={event}
            category={categoryByEventId.get(event.id) ?? 'other'}
            repeatCount={repeatCount}
            isLastEvent={index === collapsedItems.length - 1}
          />
        ))}
      </StyledActivityGroupContainer>
    </StyledActivityGroup>
  );
};
