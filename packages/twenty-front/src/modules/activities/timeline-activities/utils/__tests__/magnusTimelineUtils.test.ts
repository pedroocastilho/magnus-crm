import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
import { findTimelineStageField } from '@/activities/timeline-activities/utils/findTimelineStageField';
import { getNotePreviewText } from '@/activities/timeline-activities/utils/getNotePreviewText';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMetadataType } from 'twenty-shared/types';
import {
  buildStageTrajectory,
  formatStageDuration,
} from '@/activities/timeline-activities/utils/buildStageTrajectory';
import {
  getTimelineEventCategory,
  isTimelineEventInFilter,
} from '@/activities/timeline-activities/utils/getTimelineEventCategory';
import {
  getTimelineDayLabel,
  groupTimelineEventsByDay,
} from '@/activities/timeline-activities/utils/groupTimelineEventsByDay';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

// 20/11/2026 15:00 no fuso do navegador
const NOW = new Date(2026, 10, 20, 15, 0, 0);

const at = (msBeforeNow: number) =>
  new Date(NOW.getTime() - msBeforeNow).toISOString();

const event = (overrides: Partial<TimelineActivity>): TimelineActivity =>
  ({
    id: Math.random().toString(),
    createdAt: at(0),
    name: 'opportunity.updated',
    properties: {},
    linkedRecordCachedName: '',
    linkedRecordId: null,
    linkedObjectMetadataId: null,
    ...overrides,
  }) as TimelineActivity;

const stageEvent = (msBeforeNow: number, before: string, after: string) =>
  event({
    createdAt: at(msBeforeNow),
    properties: { diff: { stage: { before, after } } },
  });

describe('groupTimelineEventsByDay', () => {
  it('should label today, yesterday and older days in portuguese', () => {
    expect(getTimelineDayLabel(new Date(2026, 10, 20, 8), NOW)).toBe('Hoje');
    expect(getTimelineDayLabel(new Date(2026, 10, 19, 23), NOW)).toBe('Ontem');
    expect(getTimelineDayLabel(new Date(2026, 10, 18, 9), NOW)).toBe(
      '18 de nov',
    );
    expect(getTimelineDayLabel(new Date(2025, 11, 3, 9), NOW)).toBe(
      '3 de dez de 2025',
    );
  });

  it('should group by calendar day, newest day first, keeping order inside the day', () => {
    const groups = groupTimelineEventsByDay(
      [
        event({ id: 'a', createdAt: at(1 * HOUR) }),
        event({ id: 'b', createdAt: at(2 * HOUR) }),
        event({ id: 'c', createdAt: at(DAY) }),
        event({ id: 'd', createdAt: at(2 * DAY) }),
        event({ id: 'x', createdAt: 'data ruim' }),
      ],
      NOW,
    );

    expect(groups.map((group) => group.label)).toEqual([
      'Hoje',
      'Ontem',
      '18 de nov',
    ]);
    expect(groups[0].items.map((item) => item.id)).toEqual(['a', 'b']);
  });
});

describe('getTimelineEventCategory', () => {
  it('should tell notes, whatsapp notes, tasks, emails and stage changes apart', () => {
    const category = (
      overrides: Partial<TimelineActivity>,
      linkedObjectNameSingular: string | null = null,
    ) =>
      getTimelineEventCategory({
        event: event(overrides),
        linkedObjectNameSingular,
        stageFieldName: 'stage',
      });

    expect(
      category({ linkedRecordCachedName: 'Ligou e nao atendeu' }, 'note'),
    ).toBe('note');
    expect(
      category(
        { linkedRecordCachedName: 'IA - WhatsApp 20/11 - nota 64' },
        'note',
      ),
    ).toBe('whatsapp');
    expect(
      category({
        name: 'linked-note.created',
        linkedRecordCachedName: 'Chegou pelo WhatsApp',
      }),
    ).toBe('whatsapp');
    expect(category({ name: 'linked-task.created' })).toBe('task');
    expect(category({}, 'message')).toBe('email');
    expect(category({}, 'calendarEvent')).toBe('other');
    expect(
      category({
        properties: { diff: { stage: { before: 'A', after: 'B' } } },
      }),
    ).toBe('stage');
    expect(
      category({ properties: { diff: { amount: { before: 1, after: 2 } } } }),
    ).toBe('other');
    expect(category({ name: 'opportunity.created' })).toBe('other');
  });

  it('should put whatsapp notes under the notes filter', () => {
    expect(isTimelineEventInFilter('whatsapp', 'notes')).toBe(true);
    expect(isTimelineEventInFilter('note', 'notes')).toBe(true);
    expect(isTimelineEventInFilter('task', 'notes')).toBe(false);
    expect(isTimelineEventInFilter('stage', 'stages')).toBe(true);
    expect(isTimelineEventInFilter('other', 'all')).toBe(true);
    expect(isTimelineEventInFilter('other', 'tasks')).toBe(false);
  });
});

describe('getNotePreviewText', () => {
  it('should strip markdown marks and keep link text', () => {
    expect(
      getNotePreviewText(
        '**Resumo:** quer a Black.\n\n\n\n[Abrir a conversa](https://exemplo.com/t/1)',
      ),
    ).toBe('Resumo: quer a Black.\n\nAbrir a conversa');
  });

  it('should return null for empty notes and cut long ones on a word', () => {
    expect(getNotePreviewText('')).toBeNull();
    expect(getNotePreviewText(null)).toBeNull();

    const preview = getNotePreviewText('palavra '.repeat(100)) ?? '';

    expect(preview.length).toBeLessThanOrEqual(401);
    expect(preview.endsWith('palavra…')).toBe(true);
  });
});

describe('findTimelineStageField', () => {
  const field = (name: string, type: FieldMetadataType) =>
    ({ id: name, name, type, isActive: true }) as FieldMetadataItem;

  it('should use the configured field, then a select named stage or etapa', () => {
    const etapa = field('etapa', FieldMetadataType.SELECT);
    const fase = field('fase', FieldMetadataType.SELECT);

    expect(findTimelineStageField([etapa, fase], fase)?.name).toBe('fase');
    expect(findTimelineStageField([fase, etapa], null)?.name).toBe('etapa');
    expect(
      findTimelineStageField([field('stage', FieldMetadataType.TEXT)], null),
    ).toBeNull();
  });
});

describe('buildStageTrajectory', () => {
  const recordCreatedAt = at(10 * DAY);

  it('should list each stage with when it started and how long it lasted', () => {
    const steps = buildStageTrajectory({
      events: [
        stageEvent(1 * DAY, 'NEGOCIACAO', 'FECHADO_GANHOU'),
        stageEvent(6 * DAY, 'NOVO_LEAD', 'NEGOCIACAO'),
      ],
      stageFieldName: 'stage',
      currentStage: 'FECHADO_GANHOU',
      recordCreatedAt,
      isTimelineComplete: true,
      now: NOW,
    });

    expect(
      steps.map((step) => [step.stage, step.durationMs, step.isCurrent]),
    ).toEqual([
      ['NOVO_LEAD', 4 * DAY, false],
      ['NEGOCIACAO', 5 * DAY, false],
      ['FECHADO_GANHOU', DAY, true],
    ]);
    expect(steps[0].since?.toISOString()).toBe(recordCreatedAt);
  });

  it('should leave the first start unknown while older events are not loaded', () => {
    const steps = buildStageTrajectory({
      events: [stageEvent(1 * DAY, 'NEGOCIACAO', 'FECHADO_GANHOU')],
      stageFieldName: 'stage',
      currentStage: 'FECHADO_GANHOU',
      recordCreatedAt,
      isTimelineComplete: false,
      now: NOW,
    });

    expect(steps[0]).toMatchObject({
      stage: 'NEGOCIACAO',
      since: null,
      durationMs: null,
    });
  });

  it('should show only the current stage since creation when it never moved', () => {
    const steps = buildStageTrajectory({
      events: [event({ name: 'opportunity.created' })],
      stageFieldName: 'stage',
      currentStage: 'NOVO_LEAD',
      recordCreatedAt,
      isTimelineComplete: true,
      now: NOW,
    });

    expect(steps).toHaveLength(1);
    expect(steps[0]).toMatchObject({
      stage: 'NOVO_LEAD',
      durationMs: 10 * DAY,
      isCurrent: true,
    });
  });

  it('should ignore repeated events for the same stage', () => {
    const steps = buildStageTrajectory({
      events: [
        stageEvent(2 * HOUR, 'NEGOCIACAO', 'FECHADO_GANHOU'),
        stageEvent(3 * HOUR, 'NEGOCIACAO', 'FECHADO_GANHOU'),
        stageEvent(4 * HOUR, 'NOVO_LEAD', 'NOVO_LEAD'),
      ],
      stageFieldName: 'stage',
      currentStage: 'FECHADO_GANHOU',
      recordCreatedAt,
      isTimelineComplete: true,
      now: NOW,
    });

    expect(steps.map((step) => step.stage)).toEqual([
      'NEGOCIACAO',
      'FECHADO_GANHOU',
    ]);
    expect(steps[1].durationMs).toBe(3 * HOUR);
  });

  it('should format durations in hours and days', () => {
    expect(formatStageDuration(null)).toBe('');
    expect(formatStageDuration(10 * 60 * 1000)).toBe('menos de 1h');
    expect(formatStageDuration(5 * HOUR)).toBe('5h');
    expect(formatStageDuration(DAY + HOUR)).toBe('1 dia');
    expect(formatStageDuration(12 * DAY)).toBe('12 dias');
  });
});
