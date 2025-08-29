import { useRef } from 'react';

import { useCarouselHorizontalScroll } from '../hooks/useCarouselHorizontalScroll';
import { useCarouselVirtualization } from '../hooks/useCarouselVirtualization';
import type { Orientation } from '../types/Orientation';

import styles from './Carousel.module.scss';

type CarouselProps = {
  images: string[];
  orientation?: Orientation;
  overscan?: number;
  gap?: number;
};

export const Carousel = ({
  images,
  orientation = 'horizontal',
  overscan = 2,
  gap = 12,
}: CarouselProps) => {
  const listRef = useRef<HTMLUListElement>(null);
  const isHorizontal = orientation === 'horizontal';

  useCarouselHorizontalScroll(listRef, isHorizontal);

  const { range, paddingStart, paddingEnd, imagesSlice, sizesRef } = useCarouselVirtualization({
    images,
    overscan,
    listRef,
    isHorizontal,
    gap,
  });

  return (
    <ul ref={listRef} className={`${styles.carousel} ${styles[orientation]}`} style={{ gap }}>
      {paddingStart > 0 && (
        <li
          className={styles.item}
          aria-hidden
          style={
            isHorizontal
              ? { width: paddingStart, flex: '0 0 auto', visibility: 'hidden' }
              : { height: paddingStart, flex: '0 0 auto', visibility: 'hidden' }
          }
        />
      )}

      {imagesSlice.map((src, i) => {
        const idx = range.start + i;
        const extent = sizesRef.current[idx] || 1;
        return (
          <li
            className={styles.item}
            key={`${idx}-${src}`}
            style={
              isHorizontal
                ? { width: extent, height: '100%', flex: '0 0 auto' }
                : { height: extent, width: '100%', flex: '0 0 auto' }
            }
          >
            <img
              className={styles.img}
              loading="lazy"
              src={src}
              alt={`Slide ${idx + 1}`}
              style={
                isHorizontal
                  ? { height: '100%', width: 'auto', objectFit: 'contain' }
                  : { width: '100%', height: 'auto', objectFit: 'contain' }
              }
            />
          </li>
        );
      })}

      {paddingEnd > 0 && (
        <li
          className={styles.item}
          aria-hidden
          style={
            isHorizontal
              ? { width: paddingEnd, flex: '0 0 auto', visibility: 'hidden' }
              : { height: paddingEnd, flex: '0 0 auto', visibility: 'hidden' }
          }
        />
      )}
    </ul>
  );
};
