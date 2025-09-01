import { useEffect, useRef, type RefObject } from 'react';

export const useCarouselInfiniteLoop = ({
  repeatCount,
  totalLength,
  scrollPositionRef,
  updateRange,
}: {
  repeatCount: number;
  totalLength: number;
  scrollPositionRef: RefObject<number>;
  updateRange: () => void;
}) => {
  const prevLoopLengthRef = useRef<number>(null);
  const didInitialCenterRef = useRef(false);

  useEffect(() => {
    if (repeatCount < 3 || !totalLength) return;

    const loopLength = totalLength / repeatCount;
    const midBlock = Math.floor(repeatCount / 2);
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
  }, [repeatCount, totalLength]);
};
