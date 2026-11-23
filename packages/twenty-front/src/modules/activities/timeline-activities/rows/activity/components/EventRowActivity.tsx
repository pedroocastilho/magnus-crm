import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';

import { type EventRowDynamicComponentProps } from '@/activities/timeline-activities/rows/components/EventRowDynamicComponent.types';
import { EventRowItem } from '@/activities/timeline-activities/rows/components/EventRowItem';
import {
  StyledEventRowContainer,
  StyledEventRowContent,
  StyledEventRowDate,
  StyledEventRowLinkedRecord,
} from '@/activities/timeline-activities/rows/components/EventRowStyles';
import { TimelineNotePreviewContext } from '@/activities/timeline-activities/contexts/TimelineNotePreviewContext';
import { isTimelineActivityWithLinkedRecord } from '@/activities/timeline-activities/types/TimelineActivity';
import { getNotePreviewText } from '@/activities/timeline-activities/utils/getNotePreviewText';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { useContext } from 'react';
import { parseTimelineActivityAction } from 'twenty-shared/timeline';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { isNonEmptyString } from '@sniptt/guards';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type EventRowActivityProps = EventRowDynamicComponentProps;

const StyledEventRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  width: 100%;
`;

// Citacao da nota: quebra linha normalmente (a linha do tempo usa nowrap) e corta em 6 linhas.
const StyledNoteQuote = styled.blockquote`
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 6;
  border-left: 3px solid ${themeCssVariables.color.amber7};
  color: ${themeCssVariables.font.color.secondary};
  display: -webkit-box;
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.45;
  margin: ${themeCssVariables.spacing[1]} 0 0;
  overflow: hidden;
  padding: ${themeCssVariables.spacing[1]} 0 ${themeCssVariables.spacing[1]}
    ${themeCssVariables.spacing[3]};
  white-space: pre-line;
`;

export const StyledEventRowItemText = styled.span`
  color: ${themeCssVariables.font.color.primary};
`;

export const EventRowActivity = ({
  event,
  authorFullName,
  objectNameSingular,
  createdAt,
}: EventRowActivityProps & { objectNameSingular: CoreObjectNameSingular }) => {
  const eventAction = parseTimelineActivityAction(event.name);

  const eventObject = objectNameSingular;

  if (!isTimelineActivityWithLinkedRecord(event)) {
    throw new Error('Could not find linked record id for event');
  }

  const getActivityFromCache = useGetRecordFromCache({
    objectNameSingular,
    recordGqlFields: {
      id: true,
      title: true,
    },
  });

  const activityInStore = getActivityFromCache(event.linkedRecordId);

  // Magnus (Fase D): texto da nota em citacao, so no evento mais recente de cada nota.
  const { notePreviewEventIds } = useContext(TimelineNotePreviewContext);
  const getNoteBodyFromCache = useGetRecordFromCache({
    objectNameSingular,
    recordGqlFields: {
      id: true,
      bodyV2: true,
    },
  });
  const notePreviewText =
    objectNameSingular === CoreObjectNameSingular.Note &&
    notePreviewEventIds.has(event.id)
      ? getNotePreviewText(
          getNoteBodyFromCache(event.linkedRecordId)?.bodyV2?.markdown,
        )
      : null;

  const computeActivityTitle = () => {
    if (isNonEmptyString(activityInStore?.title)) {
      return activityInStore?.title;
    }

    if (isNonEmptyString(event.linkedRecordCachedName)) {
      return event.linkedRecordCachedName;
    }

    return t`Untitled`;
  };
  const activityTitle = computeActivityTitle();

  const { openRecordInSidePanel } = useOpenRecordInSidePanel();

  return (
    <StyledEventRow>
      <StyledEventRowContainer>
        <StyledEventRowContent>
          <EventRowItem>{authorFullName}</EventRowItem>
          <EventRowItem variant="action">
            {t`${eventAction} a related ${eventObject}`}
          </EventRowItem>
          <StyledEventRowLinkedRecord
            onClick={() =>
              openRecordInSidePanel({
                recordId: event.linkedRecordId,
                objectNameSingular,
              })
            }
          >
            <OverflowingTextWithTooltip text={activityTitle} />
          </StyledEventRowLinkedRecord>
        </StyledEventRowContent>
        <StyledEventRowDate>{createdAt}</StyledEventRowDate>
      </StyledEventRowContainer>
      {isNonEmptyString(notePreviewText) && (
        <StyledNoteQuote>{notePreviewText}</StyledNoteQuote>
      )}
    </StyledEventRow>
  );
};
