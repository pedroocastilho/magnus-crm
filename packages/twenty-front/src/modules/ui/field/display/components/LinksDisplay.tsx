import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { getFieldLinkDefinedLinks } from '@/object-record/record-field/ui/meta-types/input/utils/getFieldLinkDefinedLinks';
import { type FieldLinksValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';
import {
  getAbsoluteUrlOrThrow,
  getUrlHostnameOrThrow,
  isDefined,
} from 'twenty-shared/utils';
import { RoundedLink, SocialLink } from 'twenty-ui/navigation';
import { checkUrlType } from '~/utils/checkUrlType';
import { isSocialLinkType } from '~/utils/isSocialLinkType';

type LinksDisplayProps = {
  value?: FieldLinksValue;
  onLinkClick?: (url: string, event: React.MouseEvent<HTMLElement>) => void;
};

// Magnus: link para o proprio CRM (ex.: botao "Chamar no WhatsApp" -> pagina Conversas com o Ticketz
// embutido) navega na mesma aba, sem abrir outra janela do CRM.
const getSameOriginPath = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.origin === window.location.origin
      ? parsed.pathname + parsed.search + parsed.hash
      : null;
  } catch {
    return null;
  }
};

export const LinksDisplay = ({ value, onLinkClick }: LinksDisplayProps) => {
  const navigate = useNavigate();

  const handleLinkClick = (url: string, event: React.MouseEvent<HTMLElement>) => {
    onLinkClick?.(url, event);
    const sameOriginPath = getSameOriginPath(url);
    const opensNewTab = event.ctrlKey || event.metaKey || event.shiftKey;
    if (isDefined(sameOriginPath) && !opensNewTab && !event.defaultPrevented) {
      event.preventDefault();
      navigate(sameOriginPath);
    }
  };

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
