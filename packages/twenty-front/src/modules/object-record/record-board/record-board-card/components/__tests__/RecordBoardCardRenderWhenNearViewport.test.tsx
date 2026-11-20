import { act, render, screen } from '@testing-library/react';
import { mockAllIsIntersecting } from 'react-intersection-observer/test-utils';

import { RecordBoardCardRenderWhenNearViewport } from '@/object-record/record-board/record-board-card/components/RecordBoardCardRenderWhenNearViewport';

const renderCard = ({
  root,
  forceRender = false,
}: {
  root: Element | null;
  forceRender?: boolean;
}) =>
  render(
    <RecordBoardCardRenderWhenNearViewport
      root={root}
      forceRender={forceRender}
      placeholder={<span>placeholder</span>}
    >
      <span>cartao completo</span>
    </RecordBoardCardRenderWhenNearViewport>,
  );

describe('RecordBoardCardRenderWhenNearViewport', () => {
  const scrollWrapper = document.createElement('div');

  it('should show the placeholder when the card is far from the viewport', () => {
    renderCard({ root: scrollWrapper });

    act(() => mockAllIsIntersecting(false));

    expect(screen.getByText('placeholder')).toBeInTheDocument();
    expect(screen.queryByText('cartao completo')).not.toBeInTheDocument();
  });

  it('should render the card when it gets near the viewport', () => {
    renderCard({ root: scrollWrapper });

    act(() => mockAllIsIntersecting(true));

    expect(screen.getByText('cartao completo')).toBeInTheDocument();
    expect(screen.queryByText('placeholder')).not.toBeInTheDocument();
  });

  it('should keep the card rendered after it leaves the viewport', () => {
    renderCard({ root: scrollWrapper });

    act(() => mockAllIsIntersecting(true));
    act(() => mockAllIsIntersecting(false));

    expect(screen.getByText('cartao completo')).toBeInTheDocument();
  });

  it('should render the card right away when forceRender is true', () => {
    renderCard({ root: scrollWrapper, forceRender: true });

    expect(screen.getByText('cartao completo')).toBeInTheDocument();
  });

  it('should keep the card rendered when forceRender goes back to false', () => {
    const { rerender } = renderCard({ root: scrollWrapper, forceRender: true });

    rerender(
      <RecordBoardCardRenderWhenNearViewport
        root={scrollWrapper}
        forceRender={false}
        placeholder={<span>placeholder</span>}
      >
        <span>cartao completo</span>
      </RecordBoardCardRenderWhenNearViewport>,
    );
    act(() => mockAllIsIntersecting(false));

    expect(screen.getByText('cartao completo')).toBeInTheDocument();
  });

  it('should show the placeholder while the scroll area does not exist yet', () => {
    renderCard({ root: null });

    expect(screen.getByText('placeholder')).toBeInTheDocument();
  });
});
