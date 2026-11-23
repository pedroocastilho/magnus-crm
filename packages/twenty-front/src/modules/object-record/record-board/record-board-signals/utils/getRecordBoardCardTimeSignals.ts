import { isNonEmptyString } from '@sniptt/guards';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export type StaleLevel = 'none' | 'attention' | 'stale';

export type NextContactState = 'future' | 'today' | 'overdue' | 'empty';

export type NextContactSignal = {
  state: NextContactState;
  label: string;
};

const parseDate = (value: string | null | undefined): Date | null => {
  if (!isNonEmptyString(value)) {
    return null;
  }

  // Campo DATE vem como "2026-11-20": vale como meia-noite local, nao UTC.
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00`)
    : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

const startOfLocalDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

// Dias de calendario entre duas datas, no fuso do navegador.
const calendarDaysBetween = (from: Date, to: Date) =>
  Math.round(
    (startOfLocalDay(to).getTime() - startOfLocalDay(from).getTime()) /
      MILLISECONDS_PER_DAY,
  );

const pad = (value: number) => String(value).padStart(2, '0');

const formatTime = (date: Date) =>
  `${pad(date.getHours())}:${pad(date.getMinutes())}`;

// Dias completos desde a entrada na etapa (24h = 1 dia), para o selo "Xd".
export const getDaysInStage = (
  stageSince: string | null | undefined,
  now: Date,
): number | null => {
  const since = parseDate(stageSince);

  if (since === null) {
    return null;
  }

  return Math.max(
    0,
    Math.floor((now.getTime() - since.getTime()) / MILLISECONDS_PER_DAY),
  );
};

export const getStaleLevel = (
  daysInStage: number | null,
  attentionDays: number,
  staleDays: number,
): StaleLevel => {
  if (daysInStage === null || daysInStage < attentionDays) {
    return 'none';
  }

  return daysInStage >= staleDays ? 'stale' : 'attention';
};

// Texto sempre visivel do proximo contato (no celular nao ha hover).
// Campo so com data (sem hora) nao mostra horario.
export const getNextContactSignal = (
  nextContact: string | null | undefined,
  now: Date,
): NextContactSignal => {
  const date = parseDate(nextContact);

  if (date === null) {
    return { state: 'empty', label: 'Sem próximo contato' };
  }

  const hasTime =
    isNonEmptyString(nextContact) && !/^\d{4}-\d{2}-\d{2}$/.test(nextContact);
  const daysFromToday = calendarDaysBetween(now, date);

  if (daysFromToday === 0) {
    return {
      state: 'today',
      label: hasTime ? `Hoje, ${formatTime(date)}` : 'Hoje',
    };
  }

  if (daysFromToday < 0) {
    const daysLate = -daysFromToday;

    return {
      state: 'overdue',
      label: `Atrasado há ${daysLate} ${daysLate === 1 ? 'dia' : 'dias'}`,
    };
  }

  if (daysFromToday === 1) {
    return {
      state: 'future',
      label: hasTime ? `Amanhã, ${formatTime(date)}` : 'Amanhã',
    };
  }

  const dayLabel = `${WEEKDAY_LABELS[date.getDay()]}, ${pad(date.getDate())}/${pad(date.getMonth() + 1)}`;

  return {
    state: 'future',
    label: hasTime ? `${dayLabel} ${formatTime(date)}` : dayLabel,
  };
};
