import { isNonEmptyString } from '@sniptt/guards';

const MAX_PREVIEW_LENGTH = 400;

// Magnus (Fase D): texto da nota para a citacao na linha do tempo, sem a marcacao do markdown.
// Links viram so o texto ("Abrir a conversa"); o corte respeita palavra inteira.
export const getNotePreviewText = (
  markdown: string | null | undefined,
): string | null => {
  if (!isNonEmptyString(markdown)) {
    return null;
  }

  const plainText = markdown
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (plainText.length === 0) {
    return null;
  }

  if (plainText.length <= MAX_PREVIEW_LENGTH) {
    return plainText;
  }

  const cut = plainText.slice(0, MAX_PREVIEW_LENGTH);
  const lastSpace = cut.lastIndexOf(' ');

  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
};
