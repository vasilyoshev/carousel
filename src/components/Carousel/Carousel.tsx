import { useEffect, useRef, useState } from 'react';

import { ImgWithPlaceholder } from '../ImgWithPlaceholder/ImgWithPlaceholder';
import type { CarouselProps } from '../../interfaces/CarouselProps';
import { CAROUSEL_FRICTION, CAROUSEL_GAIN } from '../../consts/carouselScroll';
import { useCarouselKinetics } from '../../hooks/useCarouselKinetics';
import { useCarouselVirtualWindow } from '../../hooks/useCarouselVirtualWindow';
import { useCarouselInfiniteLoop } from '../../hooks/useCarouselInfiniteLoop';
import { useCarouselLayout } from '../../hooks/useCarouselLayout';

import styles from './Carousel.module.scss';

export const Carousel = ({
  images,
  orientation = 'horizontal',
  overscan = 2,
  gap = 12,
  gain = CAROUSEL_GAIN,
  friction = CAROUSEL_FRICTION,
}: CarouselProps) => {
  const listElRef = useRef<HTMLUListElement>(null);
  const scrollPositionRef = useRef(0);

  const [repeatCount, setRepeatCount] = useState(3);

  const isHorizontal = orientation === 'horizontal';

  const { mainAxisSize, repeatedImages, offsets, totalLength, sizeAt, baseTotal } =
    useCarouselLayout({
      listElRef,
      images,
      repeatCount,
      isHorizontal,
      gap,
    });

  const { range, updateRange } = useCarouselVirtualWindow({
    listElRef,
    repeatedImages,
    offsets,
    sizeAt,
    mainAxisSize,
    overscan,
    scrollPositionRef,
  });

  useCarouselInfiniteLoop({
    repeatCount,
    totalLength,
    scrollPositionRef,
    updateRange,
  });

  useCarouselKinetics({
    listElRef,
    isHorizontal,
    gain,
    friction,
    mainAxisSize,
    repeatCount,
    totalLength,
    overscan,
    scrollPositionRef,
    updateRange,
  });

  const imagesSlice = repeatedImages.slice(range.start, range.end);

  useEffect(() => {
    const perLoopLength = totalLength > 0 ? totalLength / repeatCount : baseTotal || 0;
    if (!images?.length || mainAxisSize <= 0 || perLoopLength <= 0) return;

    const avgItemExtent = perLoopLength / images.length;
    const overscanPx = Math.max(0, overscan * 2) * avgItemExtent;
    const contentTarget = mainAxisSize * 2 + overscanPx;

    let next = Math.ceil(contentTarget / perLoopLength);
    next = Math.max(3, Math.min(next, 50));

    if (next !== repeatCount) setRepeatCount(next);
  }, [images.length, baseTotal, totalLength, repeatCount, overscan, mainAxisSize]);

  return (
    <ul ref={listElRef} className={`${styles.carousel} ${styles[orientation]}`} style={{ gap }}>
      {imagesSlice.map((src, i) => {
        const idx = range.start + i;
        const extent = sizeAt(idx) || 1;
        const baseLen = images.length || 1;
        const realIdx = idx % baseLen;
        const translate = (offsets[range.start] ?? 0) - scrollPositionRef.current;

        const style = isHorizontal
          ? { width: extent as number, ...(i === 0 ? { marginInlineStart: translate } : {}) }
          : { height: extent as number, ...(i === 0 ? { marginBlockStart: translate } : {}) };

        return (
          <li className={styles.item} key={`${realIdx}-${src}-${idx}`} style={style}>
            <ImgWithPlaceholder src={src} alt={`Slide ${realIdx + 1}`} />
          </li>
        );
      })}
    </ul>
  );
};
