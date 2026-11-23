import { buildRecordBoardColumnSummaries } from '@/object-record/record-board/record-board-signals/utils/buildRecordBoardColumnSummaries';

const FIELD = 'opportunitiesGroupBy';

describe('buildRecordBoardColumnSummaries', () => {
  it('should merge count, amount and stale count by column value', () => {
    const summaries = buildRecordBoardColumnSummaries({
      queryResultGqlFieldName: FIELD,
      amountGqlField: 'sumAmountAmountMicros',
      summaryData: {
        [FIELD]: [
          {
            groupByDimensionValues: ['NOVO'],
            totalCount: 12,
            sumAmountAmountMicros: 75_600_000_000,
          },
          {
            groupByDimensionValues: ['FOLLOW_UP_1'],
            totalCount: '3',
            sumAmountAmountMicros: '0',
          },
        ],
      },
      staleData: {
        [FIELD]: [{ groupByDimensionValues: ['NOVO'], totalCount: 4 }],
      },
    });

    expect(summaries.get('NOVO')).toEqual({
      count: 12,
      amount: 75_600,
      staleCount: 4,
    });
    expect(summaries.get('FOLLOW_UP_1')).toEqual({
      count: 3,
      amount: 0,
      staleCount: 0,
    });
  });

  it('should not count stale cards in a final stage', () => {
    const summaries = buildRecordBoardColumnSummaries({
      queryResultGqlFieldName: FIELD,
      amountGqlField: null,
      finalStageValues: ['FECHADO_GANHOU'],
      summaryData: {
        [FIELD]: [
          { groupByDimensionValues: ['FECHADO_GANHOU'], totalCount: 235 },
          { groupByDimensionValues: ['NOVO'], totalCount: 10 },
        ],
      },
      staleData: {
        [FIELD]: [
          { groupByDimensionValues: ['FECHADO_GANHOU'], totalCount: 230 },
          { groupByDimensionValues: ['NOVO'], totalCount: 6 },
        ],
      },
    });

    expect(summaries.get('FECHADO_GANHOU')?.staleCount).toBeNull();
    expect(summaries.get('NOVO')?.staleCount).toBe(6);
  });

  it('should leave amount and stale count empty when not configured', () => {
    const summaries = buildRecordBoardColumnSummaries({
      queryResultGqlFieldName: FIELD,
      amountGqlField: null,
      summaryData: {
        [FIELD]: [{ groupByDimensionValues: ['NOVO'], totalCount: 2 }],
      },
      staleData: undefined,
    });

    expect(summaries.get('NOVO')).toEqual({
      count: 2,
      amount: null,
      staleCount: null,
    });
  });

  it('should return an empty map while data is loading', () => {
    expect(
      buildRecordBoardColumnSummaries({
        queryResultGqlFieldName: FIELD,
        amountGqlField: null,
        summaryData: undefined,
        staleData: undefined,
      }).size,
    ).toBe(0);
  });
});
