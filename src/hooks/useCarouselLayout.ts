import { useEffect, useMemo, useState, type RefObject } from 'react';
import { extentFromUrl } from '../utils/extentFromUrl';

export const useCarouselLayout = ({
  listElRef,
  images,
  isHorizontal,
  gap,
  overscan,
}: {
  listElRef: RefObject<HTMLUListElement | null>;
  images: string[];
  isHorizontal: boolean;
  gap: number;
  overscan: number;
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

  const { baseTotal, localRepeat } = useMemo(() => {
    if (crossAxisSize <= 0 || !images.length) return { baseTotal: 0, localRepeat: 3 };

    let acc = 0;
    for (let i = 0; i < images.length; i++) {
      const extent = extentFromUrl(images[i], crossAxisSize, isHorizontal);
      acc += extent + (i === images.length - 1 ? 0 : gap);
    }
    const singleLoop = Math.max(0, acc);

    const avgItemExtent = images.length > 0 ? singleLoop / images.length : 0;
    const overscanPx = Math.max(0, overscan * 2) * avgItemExtent;

    const target = mainAxisSize * 2 + overscanPx;
    const needed = singleLoop > 0 ? Math.ceil(target / singleLoop) : 3;

    const localRepeat = Math.max(3, Math.min(50, needed));
    return { baseTotal: singleLoop, localRepeat };
  }, [images, crossAxisSize, isHorizontal, gap, mainAxisSize, overscan]); // <-- overscan in deps

  const repeatedImages = useMemo(
    () => (images.length ? Array(localRepeat).fill(images).flat() : []),
    [images, localRepeat],
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
