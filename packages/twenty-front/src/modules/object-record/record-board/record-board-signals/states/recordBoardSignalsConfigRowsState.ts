import { type RecordBoardSignalsConfigRow } from '@/object-record/record-board/record-board-signals/types/RecordBoardSignalsConfig';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// Magnus (Fase B): linhas da "Configuracao do quadro" do workspace (poucas, carregadas uma vez).
export const recordBoardSignalsConfigRowsState = createAtomState<
  RecordBoardSignalsConfigRow[]
>({
  key: 'recordBoardSignalsConfigRowsState',
  defaultValue: [],
});
