import { isDefined } from 'twenty-shared/utils';

// Resposta da consulta agrupada: uma linha por valor da coluna, com os totais pedidos.
export type RecordBoardGroupByQueryResult = Record<
  string,
  ({ groupByDimensionValues: (string | null)[] } & Record<string, unknown>)[]
>;

export type RecordBoardColumnSummary = {
  count: number;
  amount: number | null;
  staleCount: number | null;
};

// Coluna "sem valor" chega do servidor como null; no quadro ela usa ''.
const toGroupKey = (value: string | null | undefined) => value ?? '';

const toNumber = (value: unknown): number | null => {
  const parsed = typeof value === 'string' ? Number(value) : value;

  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : null;
};

// Junta a consulta principal (quantidade e soma) com a de parados, por valor da coluna.
// O valor de moeda vem em micros e volta em unidades.
export const buildRecordBoardColumnSummaries = ({
  queryResultGqlFieldName,
  summaryData,
  staleData,
  amountGqlField,
  finalStageValues = [],
}: {
  queryResultGqlFieldName: string;
  summaryData: RecordBoardGroupByQueryResult | undefined;
  staleData: RecordBoardGroupByQueryResult | undefined;
  amountGqlField: string | null;
  finalStageValues?: string[];
}): Map<string, RecordBoardColumnSummary> => {
  const summaries = new Map<string, RecordBoardColumnSummary>();

  for (const item of summaryData?.[queryResultGqlFieldName] ?? []) {
    if (item.groupByDimensionValues.length !== 1) {
      continue;
    }

    const amountMicros = isDefined(amountGqlField)
      ? toNumber(item[amountGqlField])
      : null;

    const key = toGroupKey(item.groupByDimensionValues[0]);

    summaries.set(key, {
      count: toNumber(item.totalCount) ?? 0,
      amount: isDefined(amountGqlField)
        ? (amountMicros ?? 0) / 1_000_000
        : null,
      // Etapa de fechamento nao tem contagem de parados.
      staleCount:
        isDefined(staleData) && !finalStageValues.includes(key) ? 0 : null,
    });
  }

  for (const item of staleData?.[queryResultGqlFieldName] ?? []) {
    if (item.groupByDimensionValues.length !== 1) {
      continue;
    }

    const key = toGroupKey(item.groupByDimensionValues[0]);
    const summary = summaries.get(key);

    if (isDefined(summary) && isDefined(summary.staleCount)) {
      summary.staleCount = toNumber(item.totalCount) ?? 0;
    }
  }

  return summaries;
};
