import { useEffect, useState, type RefObject } from 'react';

import { findIndexByOffset } from '../utils/findIndexByOffset';

export const useCarouselVirtualWindow = ({
  listElRef,
  scrollPositionRef,
  repeatedImages,
  offsets,
  sizeAt,
  mainAxisSize,
  overscan,
}: {
  listElRef: RefObject<HTMLUListElement | null>;
  scrollPositionRef: RefObject<number>;
  repeatedImages: string[];
  offsets: number[];
  sizeAt: (i: number) => number;
  mainAxisSize: number;
  overscan: number;
}) => {
  const [range, setRange] = useState({ start: 0, end: 0 });

  const updateRange = () => {
    const listEl = listElRef.current;
    if (!listEl || !repeatedImages.length) {
      setRange({ start: 0, end: 0 });
      return;
    }

    let start = findIndexByOffset(scrollPositionRef.current, offsets);
    if (offsets[start] + sizeAt(start) <= scrollPositionRef.current) start += 1;

    let end = findIndexByOffset(scrollPositionRef.current + mainAxisSize, offsets) + 1;

    start = Math.max(0, Math.min(start, repeatedImages.length));
    end = Math.max(start, Math.min(end, repeatedImages.length));

    const overscanLeft = Math.min(overscan, start);
    const overscanRight = Math.min(overscan, repeatedImages.length - end);

    setRange({ start: start - overscanLeft, end: end + overscanRight });
  };

  useEffect(() => {
    if (listElRef.current) updateRange();
  }, [offsets, mainAxisSize, overscan]);

  return { range, updateRange };
};
