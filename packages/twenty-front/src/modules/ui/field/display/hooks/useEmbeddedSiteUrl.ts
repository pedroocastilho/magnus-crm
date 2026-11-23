import { useQuery } from '@apollo/client/react';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { getIframeUrlWithPath } from '@/page-layout/widgets/iframe/utils/getIframeUrlWithPath';
import { findIframeWidgetUrl } from '@/ui/field/display/utils/findIframeWidgetUrl';
import { parseCrmPageLink } from '@/ui/field/display/utils/parseCrmPageLink';
import { FindOnePageLayoutDocument } from '~/generated-metadata/graphql';

// Magnus (pedido dos vendedores, 23/11): para um link do CRM que aponta para uma pagina com site
// embutido e ?caminho= (ex.: "Chamar no WhatsApp" -> pagina Conversas com o Ticketz), devolve o
// endereco direto do site, para abrir numa aba propria sem outra copia do CRM. A pagina e lida ao
// montar o botao (antes do clique), porque o navegador bloqueia aba aberta depois de esperar a rede.
// Devolve null quando o link nao e desse tipo ou a pagina ainda nao carregou.
export const useEmbeddedSiteUrl = (
  url: string | null | undefined,
): string | null => {
  const crmPageLink = isNonEmptyString(url)
    ? parseCrmPageLink(url, window.location.origin)
    : null;
  const embeddedPath = crmPageLink?.embeddedPath ?? null;
  const pageLayoutId = isDefined(embeddedPath)
    ? (crmPageLink?.pageLayoutId ?? null)
    : null;

  const { data } = useQuery(FindOnePageLayoutDocument, {
    variables: { id: pageLayoutId ?? '' },
    skip: !isDefined(pageLayoutId),
  });

  if (!isDefined(pageLayoutId) || !isDefined(embeddedPath)) {
    return null;
  }

  const siteUrl = findIframeWidgetUrl(data?.getPageLayout);

  return isDefined(siteUrl)
    ? getIframeUrlWithPath(siteUrl, embeddedPath)
    : null;
};
