// Magnus: escala bordo da marca no lugar da ruby (Fase A, 2026-11-20). Passo 9 = bordo do logo (#6b1f2d), os papeis seguem os mesmos passos da ruby.
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
  '#fefbfb',
  '#fdf4f5',
  '#fceaeb',
  '#fcdfe1',
  '#fad2d6',
  '#f6c2c6',
  '#e6a3aa',
  '#bc5f6d',
  '#6b1f2d',
  '#5c1324',
  '#902c41',
  '#3c1019',
];

export const ACCENT_LIGHT = {
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
