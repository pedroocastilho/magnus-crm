// Magnus: escala bordo para o modo escuro (Fase A, 2026-11-20). Passo 9 = botao, 11 = texto em bordo sobre o carvao.
// Doze passos tipados como string (sem 'as const'), para o tema escuro continuar com o mesmo tipo do claro.
type EscalaDeDozePassos = readonly [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
];

const ESCALA: EscalaDeDozePassos = [
  '#1b1215',
  '#22151a',
  '#34181b',
  '#3e1b21',
  '#4a2028',
  '#5a2731',
  '#763341',
  '#c24d60',
  '#9c3f4e',
  '#a94755',
  '#ee939c',
  '#fbd3d7',
];

export const ACCENT_DARK = {
  primary: ESCALA[4],
  secondary: ESCALA[4],
  tertiary: ESCALA[2],
  quaternary: ESCALA[1],
  accent3570: ESCALA[7],
  accent4060: ESCALA[7],
  accent1: ESCALA[0],
  accent2: ESCALA[1],
  accent3: ESCALA[2],
  accent4: ESCALA[3],
  accent5: ESCALA[4],
  accent6: ESCALA[5],
  accent7: ESCALA[6],
  accent8: ESCALA[7],
  accent9: ESCALA[8],
  accent10: ESCALA[9],
  accent11: ESCALA[10],
  accent12: ESCALA[11],
};
