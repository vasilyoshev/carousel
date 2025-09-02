import { useEffect, useRef, type RefObject } from 'react';

export const useCarouselInfiniteLoop = ({
  totalLength,
  baseTotal,
  gap,
  scrollPositionRef,
  updateRange,
}: {
  totalLength: number;
  baseTotal: number;
  gap: number;
  scrollPositionRef: RefObject<number>;
  updateRange: () => void;
}) => {
  const prevLoopLengthRef = useRef<number | null>(null);
  const didInitialCenterRef = useRef(false);

  useEffect(() => {
    if (!totalLength || !baseTotal) return;

    const loopLength = baseTotal + gap;
    const repeats = loopLength > 0 ? Math.floor((totalLength + gap) / loopLength) : 0;

    if (repeats < 3) return;

    const midBlock = Math.floor(repeats / 2);
    const centerOfMid = loopLength * midBlock;

    if (!didInitialCenterRef.current) {
      scrollPositionRef.current = centerOfMid;
      didInitialCenterRef.current = true;
      updateRange();
    } else {
      const prevLoopLength = prevLoopLengthRef.current;
      if (prevLoopLength && Math.abs(prevLoopLength - loopLength) > 0.5) {
        const positionInOldLoop =
          ((scrollPositionRef.current % prevLoopLength) + prevLoopLength) % prevLoopLength;
        const target = centerOfMid + (positionInOldLoop / prevLoopLength) * loopLength;
        scrollPositionRef.current = target;
        updateRange();
      }
    }

    prevLoopLengthRef.current = loopLength;
  }, [totalLength, baseTotal, gap]);
};
