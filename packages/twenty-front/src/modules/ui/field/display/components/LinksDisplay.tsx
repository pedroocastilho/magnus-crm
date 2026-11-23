import { useQuery } from '@apollo/client/react';
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { getFieldLinkDefinedLinks } from '@/object-record/record-field/ui/meta-types/input/utils/getFieldLinkDefinedLinks';
import { type FieldLinksValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { getIframeUrlWithPath } from '@/page-layout/widgets/iframe/utils/getIframeUrlWithPath';
import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';
import { findIframeWidgetUrl } from '@/ui/field/display/utils/findIframeWidgetUrl';
import { parseCrmPageLink } from '@/ui/field/display/utils/parseCrmPageLink';
import {
  getAbsoluteUrlOrThrow,
  getUrlHostnameOrThrow,
  isDefined,
} from 'twenty-shared/utils';
import { RoundedLink, SocialLink } from 'twenty-ui/navigation';
import { FindOnePageLayoutDocument } from '~/generated-metadata/graphql';
import { checkUrlType } from '~/utils/checkUrlType';
import { isSocialLinkType } from '~/utils/isSocialLinkType';

type LinksDisplayProps = {
  value?: FieldLinksValue;
  onLinkClick?: (url: string, event: React.MouseEvent<HTMLElement>) => void;
};

// Magnus: link para o proprio CRM navega na mesma aba, sem abrir outra janela do CRM.
// Excecao (pedido dos vendedores, 23/11): link de pagina com site embutido e ?caminho= (botao
// "Chamar no WhatsApp" -> pagina Conversas com o Ticketz) abre o proprio site embutido numa aba nova,
// para abordar o lead sem sair do quadro. O endereco vem do widget IFRAME da pagina, carregado antes do
// clique para a aba nova abrir no mesmo gesto (o navegador bloqueia aba aberta depois de esperar a rede).
export const LinksDisplay = ({ value, onLinkClick }: LinksDisplayProps) => {
  const navigate = useNavigate();

  const links = useMemo(() => {
    if (!isDefined(value)) {
      return [];
    }

    return getFieldLinkDefinedLinks(value).map(({ url, label }) => {
      let absoluteUrl = '';
      let hostname = '';
      try {
        absoluteUrl = getAbsoluteUrlOrThrow(url);
        hostname = getUrlHostnameOrThrow(absoluteUrl);
      } catch {
        absoluteUrl = '';
        hostname = '';
      }
      return {
        url: absoluteUrl,
        label,
        displayLabel: label || hostname,
        type: checkUrlType(absoluteUrl),
      };
    });
  }, [value]);

  const embeddedPageLayoutId = useMemo(
    () =>
      links
        .map(({ url }) => parseCrmPageLink(url, window.location.origin))
        .find((crmPageLink) => isDefined(crmPageLink?.embeddedPath))
        ?.pageLayoutId ?? null,
    [links],
  );

  const { data: embeddedPageLayoutData } = useQuery(FindOnePageLayoutDocument, {
    variables: { id: embeddedPageLayoutId ?? '' },
    skip: !isDefined(embeddedPageLayoutId),
  });

  const handleLinkClick = (
    url: string,
    event: React.MouseEvent<HTMLElement>,
  ) => {
    onLinkClick?.(url, event);
    if (event.defaultPrevented) {
      return;
    }
    const crmPageLink = parseCrmPageLink(url, window.location.origin);
    if (!isDefined(crmPageLink)) {
      return;
    }

    const embeddedSiteUrl =
      isDefined(crmPageLink.embeddedPath) &&
      crmPageLink.pageLayoutId === embeddedPageLayoutId
        ? findIframeWidgetUrl(embeddedPageLayoutData?.getPageLayout)
        : null;
    if (isDefined(embeddedSiteUrl)) {
      event.preventDefault();
      window.open(
        getIframeUrlWithPath(embeddedSiteUrl, crmPageLink.embeddedPath),
        '_blank',
        'noopener,noreferrer',
      );
      return;
    }

    const opensNewTab = event.ctrlKey || event.metaKey || event.shiftKey;
    if (!opensNewTab) {
      event.preventDefault();
      navigate(crmPageLink.sameOriginPath);
    }
  };

  return (
    <ExpandableList>
      {links.map(({ url, label, displayLabel, type }, index) =>
        isSocialLinkType(type) ? (
          <SocialLink
            key={index}
            href={url}
            type={type}
            label={label}
            onClick={(event) => handleLinkClick(url, event)}
          />
        ) : (
          <RoundedLink
            key={index}
            href={url}
            label={displayLabel}
            onClick={(event) => handleLinkClick(url, event)}
          />
        ),
      )}
    </ExpandableList>
  );
};
