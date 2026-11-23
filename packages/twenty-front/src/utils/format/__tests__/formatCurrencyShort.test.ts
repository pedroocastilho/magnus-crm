import {
  formatCurrencyShort,
  normalizeCurrencyCode,
} from '~/utils/format/formatCurrencyShort';

// O Intl usa espaco sem quebra entre o simbolo e o numero; o teste compara com espaco comum.
const semNbsp = (texto: string) => texto.replace(/ | /g, ' ');

describe('formatCurrencyShort', () => {
  it('mostra o valor inteiro abaixo de 10 mil', () => {
    expect(semNbsp(formatCurrencyShort(297, { currencyCode: 'BRL' }))).toBe(
      'R$ 297',
    );
    expect(semNbsp(formatCurrencyShort(1997, { currencyCode: 'BRL' }))).toBe(
      'R$ 1.997',
    );
    expect(semNbsp(formatCurrencyShort(297.5, { currencyCode: 'BRL' }))).toBe(
      'R$ 297,50',
    );
  });

  it('usa mil, mi e bi a partir de 10 mil', () => {
    expect(semNbsp(formatCurrencyShort(75600, { currencyCode: 'BRL' }))).toBe(
      'R$ 75,6 mil',
    );
    expect(semNbsp(formatCurrencyShort(1234567, { currencyCode: 'BRL' }))).toBe(
      'R$ 1,2 mi',
    );
    expect(semNbsp(formatCurrencyShort(20000, { currencyCode: 'BRL' }))).toBe(
      'R$ 20 mil',
    );
  });

  it('sem simbolo quando pedido ou sem moeda', () => {
    expect(
      semNbsp(
        formatCurrencyShort(75600, { currencyCode: 'BRL', withSymbol: false }),
      ),
    ).toBe('75,6 mil');
    expect(semNbsp(formatCurrencyShort(75600))).toBe('75,6 mil');
  });

  it('aceita o codigo com aspas do metadado', () => {
    expect(normalizeCurrencyCode("'BRL'")).toBe('BRL');
    expect(normalizeCurrencyCode('')).toBeNull();
    expect(normalizeCurrencyCode(undefined)).toBeNull();
  });

  it('valor zero e negativo', () => {
    expect(semNbsp(formatCurrencyShort(0, { currencyCode: 'BRL' }))).toBe(
      'R$ 0',
    );
    expect(
      semNbsp(formatCurrencyShort(-43000, { currencyCode: 'BRL' })),
    ).toContain('43 mil');
  });
});
