import { getIframeUrlWithPath } from '@/page-layout/widgets/iframe/utils/getIframeUrlWithPath';

const BASE = 'https://atendimento.exemplo.com/tickets';

describe('getIframeUrlWithPath', () => {
  it('should join path to the embedded site origin', () => {
    expect(getIframeUrlWithPath(BASE, '/abrir/5573999887766?nome=Ana')).toBe(
      'https://atendimento.exemplo.com/abrir/5573999887766?nome=Ana',
    );
  });

  it('should keep base url when path is missing or points elsewhere', () => {
    expect(getIframeUrlWithPath(BASE, null)).toBe(BASE);
    expect(getIframeUrlWithPath(BASE, '//evil.com/x')).toBe(BASE);
    expect(getIframeUrlWithPath(BASE, 'https://evil.com/x')).toBe(BASE);
  });
});
