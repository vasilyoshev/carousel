import { useEffect, useRef } from 'react';

export function useCarouselInfiniteScroll(
  listRef: React.RefObject<HTMLUListElement | null>,
  isHorizontal: boolean,
  repeatCount: number,
  totalLength: number,
) {
  const isTeleportingRef = useRef(false);

  const centerTo = (listEl: HTMLUListElement, target: number) => {
    isTeleportingRef.current = true;
    if (isHorizontal) listEl.scrollLeft = target;
    else listEl.scrollTop = target;
    requestAnimationFrame(() => {
      isTeleportingRef.current = false;
    });
  };

  useEffect(() => {
    const listEl = listRef.current;
    if (!listEl || repeatCount < 3 || !totalLength) return;

    const loopLength = totalLength / repeatCount;
    const getPos = () => (isHorizontal ? listEl.scrollLeft : listEl.scrollTop);
    const midBlock = Math.floor(repeatCount / 2);
    const center = loopLength * midBlock;

    centerTo(listEl, center);

    const threshold = Math.min(300, loopLength * 0.1);
    const EPS = 1;
    const leftEdge = loopLength * (midBlock - 1) + threshold - EPS;
    const rightEdge = loopLength * (midBlock + 1) - threshold + EPS;

    const lastPos = { current: center };
    let raf = 0;

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;

        if (isTeleportingRef.current) {
          lastPos.current = getPos();
          return;
        }

        const pos = getPos();
        const delta = pos - lastPos.current;
        const dir: -1 | 0 | 1 = delta > 0 ? 1 : delta < 0 ? -1 : 0;

        if (dir < 0 && pos <= leftEdge) {
          const target = pos + loopLength;
          centerTo(listEl, target);
          lastPos.current = target;
          return;
        }
        if (dir > 0 && pos >= rightEdge) {
          const target = pos - loopLength;
          centerTo(listEl, target);
          lastPos.current = target;
          return;
        }

        lastPos.current = pos;
      });
    };

    listEl.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      listEl.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [listRef, isHorizontal, repeatCount, totalLength]);
}
