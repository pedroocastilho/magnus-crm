// Magnus (Fase A, 2026-11-20): forma curta do dinheiro em pt-BR, no lugar do
// formatToShortNumber ("75.6k", a inglesa). Exemplos: "R$ 297", "R$ 1.997",
// "R$ 75,6 mil", "R$ 1,2 mi". Abaixo de 10 mil mostra o valor inteiro, porque
// "2 mil" no lugar de "1.997" esconde o preco do produto.
const LIMITE_FORMA_CURTA = 10_000;

const ehMoedaValida = (currencyCode: string) => /^[A-Z]{3}$/.test(currencyCode);

// O defaultValue do campo de moeda vem do metadado com aspas ("'BRL'").
export const normalizeCurrencyCode = (
  currencyCode: string | null | undefined,
): string | null => {
  if (typeof currencyCode !== 'string') {
    return null;
  }

  const limpo = currencyCode.replace(/['"]/g, '').trim().toUpperCase();

  return ehMoedaValida(limpo) ? limpo : null;
};

export const formatCurrencyShort = (
  amount: number,
  options?: { currencyCode?: string | null; withSymbol?: boolean },
): string => {
  if (!Number.isFinite(amount)) {
    return String(amount);
  }

  const currencyCode = normalizeCurrencyCode(options?.currencyCode);
  const withSymbol = (options?.withSymbol ?? true) && currencyCode !== null;
  const curto = Math.abs(amount) >= LIMITE_FORMA_CURTA;
  const casas = curto ? 1 : Number.isInteger(amount) ? 0 : 2;

  const formato: Intl.NumberFormatOptions = {
    ...(curto ? { notation: 'compact' } : {}),
    minimumFractionDigits: curto ? 0 : casas,
    maximumFractionDigits: casas,
    ...(withSymbol ? { style: 'currency', currency: currencyCode } : {}),
  };

  try {
    return new Intl.NumberFormat('pt-BR', formato).format(amount);
  } catch {
    // Moeda que o navegador nao conhece: mostra so o numero.
    return new Intl.NumberFormat('pt-BR', {
      ...(curto ? { notation: 'compact' } : {}),
      maximumFractionDigits: casas,
    }).format(amount);
  }
};
