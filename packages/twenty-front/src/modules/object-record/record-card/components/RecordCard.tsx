import { DRAG_SOURCE_OPACITY } from '@/ui/utilities/drag-and-drop/constants/DragSourceOpacity';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

// Magnus (Fase A): cartao branco com raio de 8px e sombra leve sobre a coluna rosada;
// hover so muda borda e sombra; ativo e selecionado em bordo no lugar do azul.
const StyledBoardCard = styled.div<{
  isDragging?: boolean;
}>`
  --record-card-background-color: ${themeCssVariables.background.boardCard};

  background-color: var(--record-card-background-color);
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.card};
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  opacity: ${({ isDragging }) => (isDragging ? DRAG_SOURCE_OPACITY : 1)};
  transition:
    border-color 120ms ease-out,
    box-shadow 120ms ease-out;

  width: 100%;

  // Magnus (Fase B): cartao parado alem do limite ganha uma tinta leve de alerta.
  &[data-stale='true'] {
    --record-card-background-color: ${themeCssVariables.color.tomato2};
  }

  &[data-selected='true'] {
    --record-card-background-color: ${themeCssVariables.accent.accent3};

    border-color: ${themeCssVariables.accent.accent8};
    box-shadow: 0 0 0 1px ${themeCssVariables.accent.accent8};
  }

  &[data-focused='true'] {
    --record-card-background-color: ${themeCssVariables.background.tertiary};

    box-shadow: 0 0 0 2px ${themeCssVariables.accent.accent7};
  }

  &[data-active='true'] {
    --record-card-background-color: ${themeCssVariables.accent.quaternary};

    border: 1px solid ${themeCssVariables.accent.accent8};
  }

  &:hover {
    border: 1px solid ${themeCssVariables.border.color.strong};
    box-shadow: ${themeCssVariables.boxShadow.cardHover};

    &[data-active='true'] {
      border: 1px solid ${themeCssVariables.accent.accent8};
    }
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }

  .checkbox-container {
    flex-shrink: 0;
    max-width: 0;
    opacity: 0;
    overflow: hidden;
    pointer-events: none;
    transition: all ease-in-out 160ms;
  }

  &[data-selected='true'] .checkbox-container,
  &:hover .checkbox-container {
    max-width: ${themeCssVariables.spacing[6]};
    opacity: 1;
    pointer-events: auto;
  }

  .compact-icon-container {
    opacity: 0;
    transition: all ease-in-out 160ms;
  }
  &:hover .compact-icon-container {
    opacity: 1;
  }
`;

export { StyledBoardCard as RecordCard };
