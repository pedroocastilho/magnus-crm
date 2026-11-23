import { type RecordBoardSignalsConfig } from '@/object-record/record-board/record-board-signals/types/RecordBoardSignalsConfig';
import { type RecordBoardColumnSummary } from '@/object-record/record-board/record-board-signals/utils/buildRecordBoardColumnSummaries';
import { createContext } from 'react';

// Magnus (Fase B): configuracao resolvida uma vez por quadro; null = quadro igual ao do Twenty.
// columnSummaries: quantidade, total e parados por valor da coluna (vazio enquanto carrega).
export const RecordBoardSignalsContext = createContext<{
  config: RecordBoardSignalsConfig | null;
  now: Date;
  columnSummaries: Map<string, RecordBoardColumnSummary>;
}>({ config: null, now: new Date(), columnSummaries: new Map() });
