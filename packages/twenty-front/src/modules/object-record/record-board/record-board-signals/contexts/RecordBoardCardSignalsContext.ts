import { type RecordBoardCardSignals } from '@/object-record/record-board/record-board-signals/types/RecordBoardCardSignals';
import { createContext } from 'react';

// Magnus (Fase B): sinais do cartao atual; null quando o quadro nao tem configuracao.
export const RecordBoardCardSignalsContext =
  createContext<RecordBoardCardSignals | null>(null);
