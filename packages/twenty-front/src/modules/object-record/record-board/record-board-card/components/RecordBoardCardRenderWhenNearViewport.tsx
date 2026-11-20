import { type ReactNode, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { isDefined } from 'twenty-shared/utils';

// Magnus (19/11/2026): o quadro montava todos os cartoes de todas as colunas de uma vez,
// inclusive os que estao fora da tela. Cada campo do cartao ja nasce pronto para editar,
// entao um quadro com ~160 cartoes travava a tela por varios segundos (pior no celular).
// Aqui o cartao fora da tela fica reservado (placeholder com cara de cartao carregando)
// e so e montado de verdade quando chega perto da area visivel. Depois de montado, nao
// desmonta mais: rolar de volta nao custa nada e arrastar/editar continua igual.
export const RECORD_BOARD_CARD_RENDER_MARGIN_IN_PX = 600;

type RecordBoardCardRenderWhenNearViewportProps = {
  // area que rola (o quadro); enquanto nao existe, mostra o placeholder
  root: Element | null | undefined;
  // monta na hora, sem esperar a rolagem (ex.: cartao com foco do teclado)
  forceRender: boolean;
  placeholder: ReactNode;
  children: ReactNode;
};

export const RecordBoardCardRenderWhenNearViewport = ({
  root,
  forceRender,
  placeholder,
  children,
}: RecordBoardCardRenderWhenNearViewportProps) => {
  const [hasBeenRendered, setHasBeenRendered] = useState(false);

  const { ref, inView } = useInView({
    root,
    rootMargin: `${RECORD_BOARD_CARD_RENDER_MARGIN_IN_PX}px`,
    triggerOnce: true,
    skip: hasBeenRendered || forceRender || !isDefined(root),
    // navegador sem IntersectionObserver: monta tudo, como era antes
    fallbackInView: true,
  });

  const shouldRender = hasBeenRendered || forceRender || inView;

  // guarda que ja montou (padrao do React de ajustar estado durante a renderizacao):
  // se o foco do teclado sair antes do cartao entrar na tela, ele nao volta a ser placeholder
  if (shouldRender && !hasBeenRendered) {
    setHasBeenRendered(true);
  }

  return <div ref={ref}>{shouldRender ? children : placeholder}</div>;
};
