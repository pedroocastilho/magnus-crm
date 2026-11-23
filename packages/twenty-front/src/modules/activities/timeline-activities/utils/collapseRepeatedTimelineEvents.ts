import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
import { type TimelineEventCategory } from '@/activities/timeline-activities/utils/getTimelineEventCategory';
import { isDefined } from 'twenty-shared/utils';

export type TimelineEventWithRepeat = {
  event: TimelineActivity;
  repeatCount: number;
};

const getRepeatKey = (
  event: TimelineActivity,
  category: TimelineEventCategory | undefined,
): string | null => {
  // So a edicao do proprio cartao (nao nota, tarefa, etapa) e repetida; o resto fica sempre visivel.
  if (
    category !== 'other' ||
    event.name.startsWith('linked-') ||
    !event.name.endsWith('.updated')
  ) {
    return null;
  }

  const diff: unknown = event.properties?.diff;

  if (!isDefined(diff) || typeof diff !== 'object') {
    return null;
  }

  const fieldNames = Object.keys(diff)
    .filter(
      (fieldName) => fieldName !== 'updatedBy' && fieldName !== 'updatedAt',
    )
    .sort();

  return `${event.workspaceMemberId ?? ''}|${fieldNames.join(',')}`;
};

// Magnus (Fase D): o robo da IA reescreve a analise do cartao varias vezes por dia. Edicoes seguidas do mesmo autor
// nos mesmos campos viram uma linha so ("4 vezes"), mostrando a mais recente; a lista chega da mais nova para a mais antiga.
export const collapseRepeatedTimelineEvents = (
  events: TimelineActivity[],
  categoryByEventId: Map<string, TimelineEventCategory>,
): TimelineEventWithRepeat[] => {
  const collapsedEvents: (TimelineEventWithRepeat & { key: string | null })[] =
    [];

  for (const event of events) {
    const key = getRepeatKey(event, categoryByEventId.get(event.id));
    const previous = collapsedEvents.at(-1);

    if (key !== null && previous?.key === key) {
      previous.repeatCount += 1;
      continue;
    }

    collapsedEvents.push({ event, repeatCount: 1, key });
  }

  return collapsedEvents.map(({ event, repeatCount }) => ({
    event,
    repeatCount,
  }));
};
