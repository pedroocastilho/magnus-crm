import { styled } from '@linaria/react';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useContext } from 'react';

import { TimelineActivityContext } from '@/activities/timeline-activities/contexts/TimelineActivityContext';

import { useLinkedObjectObjectMetadataItem } from '@/activities/timeline-activities/hooks/useLinkedObjectObjectMetadataItem';
import { EventIconDynamicComponent } from '@/activities/timeline-activities/rows/components/EventIconDynamicComponent';
import { EventRowDynamicComponent } from '@/activities/timeline-activities/rows/components/EventRowDynamicComponent';
import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
import { getTimelineActivityAuthorFullName } from '@/activities/timeline-activities/utils/getTimelineActivityAuthorFullName';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getObjectRecordIdentifier } from '@/object-metadata/utils/getObjectRecordIdentifier';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { type TimelineEventCategory } from '@/activities/timeline-activities/utils/getTimelineEventCategory';
import { isDefined } from 'twenty-shared/utils';
import {
  IconBrandWhatsapp,
  IconCheckbox,
  type IconComponent,
  IconMail,
  IconNotes,
  IconProgressCheck,
} from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';
import { allowRequestsToTwentyIconsState } from '@/client-config/states/allowRequestsToTwentyIcons';

const StyledTimelineItemContainer = styled.div`
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  gap: ${themeCssVariables.spacing[4]};
  height: 'auto';
  justify-content: space-between;
  overflow: hidden;
  white-space: nowrap;
`;

const StyledLeftContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

// Magnus (Fase D): icone com cor por tipo (etapa, nota, WhatsApp, tarefa, e-mail); o resto fica cinza.
const StyledIconContainer = styled.div`
  align-items: center;
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  height: 20px;
  justify-content: center;
  margin: 3px;
  text-decoration-line: underline;
  user-select: none;
  width: 20px;
  z-index: 2;

  &[data-category='stage'] {
    background: ${themeCssVariables.accent.accent3};
    color: ${themeCssVariables.accent.accent11};
  }

  &[data-category='note'] {
    background: ${themeCssVariables.color.amber3};
    color: ${themeCssVariables.color.amber11};
  }

  &[data-category='whatsapp'] {
    background: ${themeCssVariables.color.green3};
    color: ${themeCssVariables.color.green11};
  }

  &[data-category='task'] {
    background: ${themeCssVariables.color.blue3};
    color: ${themeCssVariables.color.blue11};
  }

  &[data-category='email'] {
    background: ${themeCssVariables.color.purple3};
    color: ${themeCssVariables.color.purple11};
  }
`;

const CATEGORY_ICONS: Partial<Record<TimelineEventCategory, IconComponent>> = {
  stage: IconProgressCheck,
  note: IconNotes,
  whatsapp: IconBrandWhatsapp,
  task: IconCheckbox,
  email: IconMail,
};

const StyledVerticalLineContainer = styled.div`
  display: flex;
  flex-shrink: 0;
  height: 100%;
  justify-content: center;
  z-index: 2;
`;

const StyledVerticalLine = styled.div`
  background: ${themeCssVariables.border.color.light};
  height: 100%;
  width: 2px;
`;

const StyledSummary = styled.summary`
  width: 100%;
`;

const StyledRepeatCount = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledItemContainer = styled.div<{ isMarginBottom?: boolean }>`
  align-items: flex-start;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  margin-bottom: ${({ isMarginBottom }) =>
    isMarginBottom ? themeCssVariables.spacing[3] : '0'};
  min-height: 26px;
  overflow: hidden;
`;

type EventRowProps = {
  mainObjectMetadataItem: EnrichedObjectMetadataItem | null;
  isLastEvent?: boolean;
  event: TimelineActivity;
  category?: TimelineEventCategory;
  // Magnus (Fase D): edicoes iguais seguidas que viraram esta linha (collapseRepeatedTimelineEvents)
  repeatCount?: number;
};

export const EventRow = ({
  isLastEvent,
  event,
  mainObjectMetadataItem,
  category = 'other',
  repeatCount = 1,
}: EventRowProps) => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  const allowRequestsToTwentyIcons = useAtomStateValue(
    allowRequestsToTwentyIconsState,
  );

  const { localeCatalog } = useAtomStateValue(dateLocaleState);

  const { recordId } = useContext(TimelineActivityContext);

  const recordStore = useAtomFamilyStateValue(recordStoreFamilyState, recordId);

  const beautifiedCreatedAt = beautifyPastDateRelativeToNow(
    event.createdAt,
    localeCatalog,
  );
  const linkedObjectMetadataItem = useLinkedObjectObjectMetadataItem(
    event.linkedObjectMetadataId,
  );

  if (isUndefinedOrNull(currentWorkspaceMember)) {
    return null;
  }

  if (isUndefinedOrNull(recordStore)) {
    return null;
  }
  if (isUndefinedOrNull(mainObjectMetadataItem)) {
    return null;
  }

  const labelIdentifier = getObjectRecordIdentifier({
    objectMetadataItem: mainObjectMetadataItem,
    record: recordStore,
    allowRequestsToTwentyIcons,
  });

  const authorFullName = getTimelineActivityAuthorFullName(
    event,
    currentWorkspaceMember,
  );

  if (isUndefinedOrNull(mainObjectMetadataItem)) {
    throw new Error('mainObjectMetadataItem is required');
  }

  const CategoryIcon = CATEGORY_ICONS[category];

  return (
    <>
      <StyledTimelineItemContainer>
        <StyledLeftContainer>
          <StyledIconContainer data-category={category}>
            {isDefined(CategoryIcon) ? (
              <CategoryIcon size={14} stroke={1.8} />
            ) : (
              <EventIconDynamicComponent
                event={event}
                linkedObjectMetadataItem={linkedObjectMetadataItem}
              />
            )}
          </StyledIconContainer>
          {!isLastEvent && (
            <StyledVerticalLineContainer>
              <StyledVerticalLine />
            </StyledVerticalLineContainer>
          )}
        </StyledLeftContainer>
        <StyledItemContainer isMarginBottom={!isLastEvent}>
          <StyledSummary>
            <EventRowDynamicComponent
              authorFullName={authorFullName}
              labelIdentifierValue={labelIdentifier.name}
              event={event}
              mainObjectMetadataItem={mainObjectMetadataItem}
              linkedObjectMetadataItem={linkedObjectMetadataItem}
              createdAt={beautifiedCreatedAt}
            />
          </StyledSummary>
          {repeatCount > 1 && (
            <StyledRepeatCount>{repeatCount} vezes neste dia</StyledRepeatCount>
          )}
        </StyledItemContainer>
      </StyledTimelineItemContainer>
    </>
  );
};
