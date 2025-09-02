import { useRef } from 'react';

import { ImgWithPlaceholder } from '../ImgWithPlaceholder/ImgWithPlaceholder';
import type { CarouselProps } from '../../interfaces/CarouselProps';
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
  gain = 0.12,
  friction = 0.9,
}: CarouselProps) => {
  const listElRef = useRef<HTMLUListElement>(null);
  const scrollPositionRef = useRef(0);

  const isHorizontal = orientation === 'horizontal';

  const { mainAxisSize, repeatedImages, offsets, totalLength, sizeAt, baseTotal } =
    useCarouselLayout({
      listElRef,
      images,
      isHorizontal,
      gap,
      overscan,
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
    totalLength,
    baseTotal,
    scrollPositionRef,
    gap,
    updateRange,
  });

  useCarouselKinetics({
    listElRef,
    isHorizontal,
    gain,
    friction,
    mainAxisSize,
    totalLength,
    baseTotal,
    overscan,
    scrollPositionRef,
    gap,
    updateRange,
  });

  const imagesSlice = repeatedImages.slice(range.start, range.end);

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
