import { useRef, useState } from 'react';

import { ImgWithPlaceholder } from '../ImgWithPlaceholder/ImgWithPlaceholder';
import type { CarouselProps } from '../../interfaces/CarouselProps';
import { CAROUSEL_FRICTION, CAROUSEL_GAIN } from '../../consts/carouselScroll';
import { useCarouselKinetics } from '../../hooks/useCarouselKinetics';
import { useCarouselVirtualWindow } from '../../hooks/useCarouselVirtualWindow';
import { useCarouselInfiniteLoop } from '../../hooks/useCarouselInfiniteLoop';
import { useCarouselLayout } from '../../hooks/useCarouselLayout';
import { useCarouselRepeatCount } from '../../hooks/useCarouselRepeatCount';

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

  useCarouselRepeatCount({
    imagesLength: images.length,
    baseTotal,
    mainAxisSize,
    overscan,
    setRepeatCount,
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
