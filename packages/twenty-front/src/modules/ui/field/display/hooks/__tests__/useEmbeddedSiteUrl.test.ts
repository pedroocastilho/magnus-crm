import { useQuery } from '@apollo/client/react';
import { renderHook } from '@testing-library/react';

import { useEmbeddedSiteUrl } from '@/ui/field/display/hooks/useEmbeddedSiteUrl';

jest.mock('@apollo/client/react', () => ({
  useQuery: jest.fn(),
}));

const mockedUseQuery = jest.mocked(useQuery) as unknown as jest.Mock;

const PAGE_ID = 'bf72163e-fc20-49ef-8ca0-ba785efc62aa';
const ORIGIN = window.location.origin;
const CONVERSAS_LINK = `${ORIGIN}/page/${PAGE_ID}?caminho=%2Fabrir%2F5511999887766%3Fnome%3DCarlos`;

const pageLayoutWithIframe = {
  getPageLayout: {
    tabs: [
      {
        widgets: [
          {
            type: 'IFRAME',
            configuration: { url: 'https://atendimento.exemplo.com/tickets' },
          },
        ],
      },
    ],
  },
};

describe('useEmbeddedSiteUrl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return the embedded site address with the path when the page has an iframe', () => {
    mockedUseQuery.mockReturnValue({ data: pageLayoutWithIframe });

    const { result } = renderHook(() => useEmbeddedSiteUrl(CONVERSAS_LINK));

    expect(result.current).toBe(
      'https://atendimento.exemplo.com/abrir/5511999887766?nome=Carlos',
    );
    expect(mockedUseQuery.mock.calls[0][1]).toEqual({
      variables: { id: PAGE_ID },
      skip: false,
    });
  });

  it('should return null while the page is not loaded', () => {
    mockedUseQuery.mockReturnValue({ data: undefined });

    const { result } = renderHook(() => useEmbeddedSiteUrl(CONVERSAS_LINK));

    expect(result.current).toBeNull();
  });

  it('should skip the query for links outside the CRM', () => {
    mockedUseQuery.mockReturnValue({ data: undefined });

    const { result } = renderHook(() =>
      useEmbeddedSiteUrl('https://wa.me/5511999887766'),
    );

    expect(result.current).toBeNull();
    expect(mockedUseQuery.mock.calls[0][1].skip).toBe(true);
  });

  it('should skip the query when there is no link', () => {
    mockedUseQuery.mockReturnValue({ data: undefined });

    const { result } = renderHook(() => useEmbeddedSiteUrl(null));

    expect(result.current).toBeNull();
    expect(mockedUseQuery.mock.calls[0][1].skip).toBe(true);
  });
});
