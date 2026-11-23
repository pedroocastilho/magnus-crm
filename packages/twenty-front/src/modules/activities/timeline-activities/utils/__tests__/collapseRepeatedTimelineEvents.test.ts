import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
import { collapseRepeatedTimelineEvents } from '@/activities/timeline-activities/utils/collapseRepeatedTimelineEvents';
import { type TimelineEventCategory } from '@/activities/timeline-activities/utils/getTimelineEventCategory';

const event = (
  id: string,
  name: string,
  diffFields: string[] = [],
  workspaceMemberId: string | null = null,
) =>
  ({
    id,
    name,
    workspaceMemberId,
    properties: {
      diff: Object.fromEntries(
        diffFields.map((field) => [field, { before: 1, after: 2 }]),
      ),
    },
  }) as unknown as TimelineActivity;

describe('collapseRepeatedTimelineEvents', () => {
  it('should collapse consecutive updates of the same fields by the same author', () => {
    const events = [
      event('a', 'opportunity.updated', ['resumoIa', 'notaIa', 'updatedBy']),
      event('b', 'opportunity.updated', ['notaIa', 'resumoIa']),
      event('c', 'opportunity.updated', ['resumoIa', 'notaIa']),
      event('d', 'linked-note.created'),
      event('e', 'opportunity.updated', ['resumoIa', 'notaIa']),
      event('f', 'opportunity.updated', ['resumoIa', 'notaIa'], 'membro'),
    ];
    const categories = new Map<string, TimelineEventCategory>([
      ['a', 'other'],
      ['b', 'other'],
      ['c', 'other'],
      ['d', 'whatsapp'],
      ['e', 'other'],
      ['f', 'other'],
    ]);

    expect(
      collapseRepeatedTimelineEvents(events, categories).map((item) => [
        item.event.id,
        item.repeatCount,
      ]),
    ).toEqual([
      ['a', 3],
      ['d', 1],
      ['e', 1],
      ['f', 1],
    ]);
  });

  it('should never collapse stage changes', () => {
    const events = [
      event('a', 'opportunity.updated', ['stage']),
      event('b', 'opportunity.updated', ['stage']),
    ];
    const categories = new Map<string, TimelineEventCategory>([
      ['a', 'stage'],
      ['b', 'stage'],
    ]);

    expect(
      collapseRepeatedTimelineEvents(events, categories).map(
        (item) => item.repeatCount,
      ),
    ).toEqual([1, 1]);
  });
});
