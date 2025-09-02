import { useEffect, useMemo, useState, type RefObject } from 'react';
import { extentFromUrl } from '../utils/extentFromUrl';

export const useCarouselLayout = ({
  listElRef,
  images,
  repeatCount,
  isHorizontal,
  gap,
}: {
  listElRef: RefObject<HTMLUListElement | null>;
  images: string[];
  repeatCount: number;
  isHorizontal: boolean;
  gap: number;
}) => {
  const [mainAxisSize, setMainAxisSize] = useState(0);
  const [crossAxisSize, setCrossAxisSize] = useState(0);

  useEffect(() => {
    const listEl = listElRef.current;
    if (!listEl) return;

    const resizeObserver = new ResizeObserver(() => {
      setMainAxisSize(isHorizontal ? listEl.clientWidth : listEl.clientHeight);
      setCrossAxisSize(isHorizontal ? listEl.clientHeight : listEl.clientWidth);
    });

    resizeObserver.observe(listEl);
    return () => resizeObserver.disconnect();
  }, [isHorizontal]);

  const repeatedImages = useMemo(
    () => Array(repeatCount).fill(images).flat(),
    [images, repeatCount],
  );

  const { offsets, totalLength, sizeAt } = useMemo(() => {
    if (crossAxisSize <= 0 || !repeatedImages.length) {
      const offsets = [0];
      return {
        offsets,
        totalLength: 0,
        sizeAt: () => 0,
      };
    }

    const offsets = new Array<number>(repeatedImages.length + 1);
    offsets[0] = 0;
    for (let i = 1; i <= repeatedImages.length; i++) {
      const extent = extentFromUrl(repeatedImages[i - 1], crossAxisSize, isHorizontal);
      offsets[i] = offsets[i - 1] + extent + gap;
    }

    const totalLength = Math.max(0, offsets[repeatedImages.length] - gap);

    const sizeAt = (i: number) =>
      Math.max(0, (offsets[i + 1] ?? offsets[i] ?? 0) - (offsets[i] ?? 0) - gap);

    return { offsets, totalLength, sizeAt };
  }, [repeatedImages, crossAxisSize, isHorizontal, gap]);

  const baseTotal = useMemo(() => offsets[images.length] - gap, [images.length, offsets, gap]);

  return {
    mainAxisSize,
    crossAxisSize,
    repeatedImages,
    offsets,
    totalLength,
    sizeAt,
    baseTotal,
  };
};
