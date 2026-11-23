import { isDefined } from 'twenty-shared/utils';

export type CrmPageLink = {
  sameOriginPath: string;
  pageLayoutId: string | null;
  embeddedPath: string | null;
};

const PAGE_LAYOUT_PATH_PATTERN = /^\/page\/([0-9a-f-]{36})\/?$/i;

// Magnus: link para o proprio CRM. Quando e uma pagina com ?caminho=/algo (ex.: botao "Chamar no
// WhatsApp" -> /page/<Conversas>?caminho=/abrir/5573...), devolve tambem a pagina e o caminho, para
// o link abrir direto o site embutido nela (o Ticketz) numa aba nova.
export const parseCrmPageLink = (
  url: string,
  origin: string,
): CrmPageLink | null => {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.origin !== origin) {
    return null;
  }

  const sameOriginPath = parsed.pathname + parsed.search + parsed.hash;
  const pageLayoutId =
    parsed.pathname.match(PAGE_LAYOUT_PATH_PATTERN)?.[1] ?? null;
  const path = parsed.searchParams.get('caminho');
  const isValidPath =
    isDefined(path) && path.startsWith('/') && !path.startsWith('//');

  return {
    sameOriginPath,
    pageLayoutId: isValidPath ? pageLayoutId : null,
    embeddedPath: isValidPath && isDefined(pageLayoutId) ? path : null,
  };
};
