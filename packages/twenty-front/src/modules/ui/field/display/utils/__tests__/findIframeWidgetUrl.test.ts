import { findIframeWidgetUrl } from '@/ui/field/display/utils/findIframeWidgetUrl';

describe('findIframeWidgetUrl', () => {
  it('should return url of the first iframe widget', () => {
    expect(
      findIframeWidgetUrl({
        tabs: [
          {
            widgets: [
              {
                type: 'GRAPH',
                configuration: { configurationType: 'BAR_CHART' },
              },
              {
                type: 'IFRAME',
                configuration: {
                  configurationType: 'IFRAME',
                  url: 'https://atendimento.exemplo.com/tickets',
                },
              },
            ],
          },
        ],
      }),
    ).toBe('https://atendimento.exemplo.com/tickets');
  });

  it('should return null when page has no iframe widget', () => {
    expect(findIframeWidgetUrl({ tabs: [{ widgets: [] }] })).toBeNull();
    expect(findIframeWidgetUrl(undefined)).toBeNull();
  });

  it('should ignore iframe widget without http url', () => {
    expect(
      findIframeWidgetUrl({
        tabs: [
          {
            widgets: [
              {
                type: 'IFRAME',
                configuration: { url: 'ftp://atendimento.exemplo.com' },
              },
            ],
          },
        ],
      }),
    ).toBeNull();
  });
});
