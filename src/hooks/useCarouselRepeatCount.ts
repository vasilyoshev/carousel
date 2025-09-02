import { useEffect } from 'react';

export const useCarouselRepeatCount = ({
  imagesLength,
  baseTotal,
  mainAxisSize,
  overscan,
  setRepeatCount,
}: {
  imagesLength: number;
  baseTotal: number;
  mainAxisSize: number;
  overscan: number;
  setRepeatCount: (repeatCount: number) => void;
}) => {
  useEffect(() => {
    if (!imagesLength || !mainAxisSize || !baseTotal) return;

    const min = 3;
    const max = 50;
    const avgItemExtent = baseTotal / imagesLength;
    const overscanPx = Math.max(0, overscan * 2) * avgItemExtent;
    const contentTarget = mainAxisSize * 2 + overscanPx;

    let next = Math.ceil(contentTarget / baseTotal);
    next = Math.max(min, Math.min(next, max));

    setRepeatCount(next);
  }, [imagesLength, baseTotal, overscan, mainAxisSize, setRepeatCount]);
};
