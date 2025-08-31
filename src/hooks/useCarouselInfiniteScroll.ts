import { useEffect, useRef } from 'react';

export function useCarouselInfiniteScroll(
  listRef: React.RefObject<HTMLUListElement | null>,
  isHorizontal: boolean,
  repeatCount: number,
  totalLength: number,
) {
  const isTeleportingRef = useRef(false);
  const lastPosRef = useRef(0);
  const prevLoopLenRef = useRef<number | null>(null);
  const didInitialCenterRef = useRef(false);

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

    const getPos = () => (isHorizontal ? listEl.scrollLeft : listEl.scrollTop);

    const loopLength = totalLength / repeatCount;
    const midBlock = Math.floor(repeatCount / 2);
    const centerOfMid = loopLength * midBlock;

    const posNow = getPos();
    if (!didInitialCenterRef.current) {
      if (posNow === 0) {
        centerTo(listEl, centerOfMid);
        lastPosRef.current = centerOfMid;
      } else {
        lastPosRef.current = posNow;
      }
      didInitialCenterRef.current = true;
    }

    const prevLoop = prevLoopLenRef.current;
    if (prevLoop && Math.abs(prevLoop - loopLength) > 0.5) {
      const pos = getPos();
      const frac = ((pos % prevLoop) + prevLoop) % prevLoop; // [0, prevLoop)
      const fracRatio = frac / prevLoop; // [0, 1)
      const target = centerOfMid + fracRatio * loopLength;
      centerTo(listEl, target);
      lastPosRef.current = target;
    }
    prevLoopLenRef.current = loopLength;

    const threshold = Math.min(300, loopLength * 0.1);
    const EPS = 1;
    const leftEdge = loopLength * (midBlock - 1) + threshold - EPS;
    const rightEdge = loopLength * (midBlock + 1) - threshold + EPS;

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;

        if (isTeleportingRef.current) {
          lastPosRef.current = getPos();
          return;
        }

        const pos = getPos();
        const delta = pos - lastPosRef.current;
        const dir: -1 | 0 | 1 = delta > 0 ? 1 : delta < 0 ? -1 : 0;

        if (dir < 0 && pos <= leftEdge) {
          const target = pos + loopLength;
          centerTo(listEl, target);
          lastPosRef.current = target;
          return;
        }
        if (dir > 0 && pos >= rightEdge) {
          const target = pos - loopLength;
          centerTo(listEl, target);
          lastPosRef.current = target;
          return;
        }

        lastPosRef.current = pos;
      });
    };

    listEl.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      listEl.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [listRef, isHorizontal, repeatCount, totalLength]);
}
