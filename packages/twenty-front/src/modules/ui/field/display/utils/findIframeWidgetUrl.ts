import { isDefined } from 'twenty-shared/utils';

type PageLayoutWithWidgets = {
  tabs?:
    | ({
        widgets?: ({ type: string; configuration?: unknown } | null)[] | null;
      } | null)[]
    | null;
};

const getConfigurationUrl = (configuration: unknown) =>
  typeof configuration === 'object' &&
  configuration !== null &&
  'url' in configuration &&
  typeof configuration.url === 'string'
    ? configuration.url
    : null;

// Magnus: endereco do primeiro widget IFRAME da pagina (ex.: o Ticketz da pagina Conversas)
export const findIframeWidgetUrl = (
  pageLayout: PageLayoutWithWidgets | null | undefined,
): string | null => {
  for (const tab of pageLayout?.tabs ?? []) {
    for (const widget of tab?.widgets ?? []) {
      if (!isDefined(widget) || widget.type !== 'IFRAME') {
        continue;
      }
      const url = getConfigurationUrl(widget.configuration);
      if (isDefined(url) && /^https?:\/\//i.test(url)) {
        return url;
      }
    }
  }
  return null;
};
