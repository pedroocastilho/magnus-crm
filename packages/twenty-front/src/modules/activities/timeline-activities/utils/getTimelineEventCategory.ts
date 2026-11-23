import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
import { isNonEmptyString } from '@sniptt/guards';
import { parseTimelineActivityAction } from 'twenty-shared/timeline';
import { isDefined } from 'twenty-shared/utils';

export type TimelineEventCategory =
  | 'stage'
  | 'note'
  | 'whatsapp'
  | 'task'
  | 'email'
  | 'other';

export type TimelineEventFilter = 'all' | 'notes' | 'tasks' | 'stages';

// Notas que contam a conversa do WhatsApp (resumo do robo, "Chegou pelo WhatsApp").
const WHATSAPP_NOTE_PATTERN = /whats\s?app/i;

// Eventos antigos guardam o objeto ligado no nome ("linked-note.created").
const getLegacyLinkedObjectNameSingular = (eventName: string) =>
  eventName.startsWith('linked-')
    ? eventName.split('.')[0].replace('linked-', '')
    : null;

// Magnus (Fase D): tipo do evento para o icone colorido e os filtros da linha do tempo.
export const getTimelineEventCategory = ({
  event,
  linkedObjectNameSingular,
  stageFieldName,
}: {
  event: TimelineActivity;
  linkedObjectNameSingular: string | null | undefined;
  stageFieldName: string | null | undefined;
}): TimelineEventCategory => {
  const linkedObject =
    linkedObjectNameSingular ?? getLegacyLinkedObjectNameSingular(event.name);

  switch (linkedObject) {
    case 'note':
      return WHATSAPP_NOTE_PATTERN.test(event.linkedRecordCachedName ?? '')
        ? 'whatsapp'
        : 'note';
    case 'task':
      return 'task';
    case 'message':
      return 'email';
  }

  if (isDefined(linkedObject)) {
    return 'other';
  }

  const isStageChange =
    parseTimelineActivityAction(event.name) === 'updated' &&
    isNonEmptyString(stageFieldName) &&
    isDefined(event.properties?.diff?.[stageFieldName]);

  return isStageChange ? 'stage' : 'other';
};

export const isTimelineEventInFilter = (
  category: TimelineEventCategory,
  filter: TimelineEventFilter,
): boolean => {
  switch (filter) {
    case 'notes':
      return category === 'note' || category === 'whatsapp';
    case 'tasks':
      return category === 'task';
    case 'stages':
      return category === 'stage';
    default:
      return true;
  }
};
