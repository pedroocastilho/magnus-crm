import { GRAY_SCALE_LIGHT_ALPHA } from '@ui/theme/constants/GrayScaleLightAlpha';

export const BOX_SHADOW_LIGHT = {
  color: GRAY_SCALE_LIGHT_ALPHA.gray2,
  light: `0px 2px 4px 0px ${GRAY_SCALE_LIGHT_ALPHA.gray2}, 0px 0px 4px 0px ${GRAY_SCALE_LIGHT_ALPHA.gray5}`,
  strong: `2px 4px 16px 0px ${GRAY_SCALE_LIGHT_ALPHA.gray7}, 0px 2px 4px 0px ${GRAY_SCALE_LIGHT_ALPHA.gray5}`,
  underline: `0px 1px 0px 0px ${GRAY_SCALE_LIGHT_ALPHA.gray9}`,
  // Magnus (Fase A): sombras do cartao do quadro (no escuro a profundidade vem da borda).
  card: '0px 1px 2px 0px rgba(28, 21, 21, 0.06)',
  cardHover: '0px 2px 8px 0px rgba(28, 21, 21, 0.1)',
  cardDragging: '0px 12px 24px -6px rgba(28, 21, 21, 0.22)',
  superHeavy: `0px 0px 8px 0px ${GRAY_SCALE_LIGHT_ALPHA.gray7}, 0px 8px 64px -16px ${GRAY_SCALE_LIGHT_ALPHA.gray10}, 0px 24px 56px -16px ${GRAY_SCALE_LIGHT_ALPHA.gray5}`,
};
