import { isDefined } from 'twenty-shared/utils';

// Magnus: a pagina pode abrir o iframe direto num endereco do mesmo site embutido com ?caminho=/algo
// (ex.: botao "Chamar no WhatsApp" do card -> /page/<Conversas>?caminho=/abrir/5573...). So caminho
// relativo ao site configurado no widget: nunca troca o iframe para outro dominio.
export const getIframeUrlWithPath = (baseUrl: string, path: string | null) => {
  if (!isDefined(path) || !path.startsWith('/') || path.startsWith('//')) {
    return baseUrl;
  }
  try {
    const base = new URL(baseUrl);
    const target = new URL(path, base.origin);
    return target.origin === base.origin ? target.toString() : baseUrl;
  } catch {
    return baseUrl;
  }
};
