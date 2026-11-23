import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';

export type TimelineDayGroup = {
  key: string;
  label: string;
  items: TimelineActivity[];
};

const MONTH_LABELS = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
];

const pad = (value: number) => String(value).padStart(2, '0');

const toDayKey = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// Magnus (Fase D): rotulo do dia no fuso do navegador ("Hoje", "Ontem", "18 de nov";
// ano so quando nao e o ano corrente).
export const getTimelineDayLabel = (date: Date, now: Date): string => {
  const yesterday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 1,
  );

  if (toDayKey(date) === toDayKey(now)) {
    return 'Hoje';
  }

  if (toDayKey(date) === toDayKey(yesterday)) {
    return 'Ontem';
  }

  const dayAndMonth = `${date.getDate()} de ${MONTH_LABELS[date.getMonth()]}`;

  return date.getFullYear() === now.getFullYear()
    ? dayAndMonth
    : `${dayAndMonth} de ${date.getFullYear()}`;
};

// Magnus (Fase D): a linha do tempo agrupa por dia (o Twenty agrupava por mes).
// Mantem a ordem dos eventos dentro do dia; os dias saem do mais recente para o mais antigo.
export const groupTimelineEventsByDay = (
  events: TimelineActivity[],
  now: Date,
): TimelineDayGroup[] => {
  const groupsByKey = new Map<string, TimelineDayGroup>();

  for (const event of events) {
    const date = new Date(event.createdAt);

    if (Number.isNaN(date.getTime())) {
      continue;
    }

    const key = toDayKey(date);
    const group = groupsByKey.get(key);

    if (group === undefined) {
      groupsByKey.set(key, {
        key,
        label: getTimelineDayLabel(date, now),
        items: [event],
      });
    } else {
      group.items.push(event);
    }
  }

  return [...groupsByKey.values()].sort((groupA, groupB) =>
    groupB.key.localeCompare(groupA.key),
  );
};
