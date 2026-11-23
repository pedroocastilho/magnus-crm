import { parseCrmPageLink } from '@/ui/field/display/utils/parseCrmPageLink';

const ORIGIN = 'https://diamond.magnuscrm.com.br';
const PAGE_ID = 'bf72163e-fc20-49ef-8ca0-ba785efc62aa';

describe('parseCrmPageLink', () => {
  it('should return page and embedded path when link is a page with caminho', () => {
    const url = `${ORIGIN}/page/${PAGE_ID}?caminho=${encodeURIComponent('/abrir/5573999887766?nome=Ana')}`;

    expect(parseCrmPageLink(url, ORIGIN)).toEqual({
      sameOriginPath: `/page/${PAGE_ID}?caminho=%2Fabrir%2F5573999887766%3Fnome%3DAna`,
      pageLayoutId: PAGE_ID,
      embeddedPath: '/abrir/5573999887766?nome=Ana',
    });
  });

  it('should return null when link is on another site', () => {
    expect(parseCrmPageLink('https://wa.me/5573999887766', ORIGIN)).toBeNull();
  });

  it('should return null when url is invalid', () => {
    expect(parseCrmPageLink('nao e url', ORIGIN)).toBeNull();
  });

  it('should keep only same-site navigation when caminho is missing', () => {
    expect(parseCrmPageLink(`${ORIGIN}/object/ligacao/abc`, ORIGIN)).toEqual({
      sameOriginPath: '/object/ligacao/abc',
      pageLayoutId: null,
      embeddedPath: null,
    });
  });

  it('should ignore caminho pointing to another domain', () => {
    const url = `${ORIGIN}/page/${PAGE_ID}?caminho=${encodeURIComponent('//evil.com/x')}`;

    expect(parseCrmPageLink(url, ORIGIN)?.embeddedPath).toBeNull();
  });

  it('should ignore caminho when link is not a page', () => {
    const url = `${ORIGIN}/object/ligacao/abc?caminho=%2Fabrir%2F55`;

    expect(parseCrmPageLink(url, ORIGIN)?.embeddedPath).toBeNull();
  });
});
