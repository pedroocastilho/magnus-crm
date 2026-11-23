import {
  type NextContactSignal,
  type StaleLevel,
} from '@/object-record/record-board/record-board-signals/utils/getRecordBoardCardTimeSignals';

export type RecordBoardCardOwner = {
  name: string;
  avatarUrl: string | null;
  colorSeed: string;
};

// Sinais de um cartao, ja calculados; null = sinal desligado na configuracao.
export type RecordBoardCardSignals = {
  stripe: { label: string; color: string } | null;
  daysInStage: number | null;
  staleLevel: StaleLevel;
  nextContact: NextContactSignal | null;
  owner: RecordBoardCardOwner | null;
  amount: { amount: number; currencyCode: string | null } | null;
  whatsappUrl: string | null;
};
