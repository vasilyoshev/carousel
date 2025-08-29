import { useRef } from 'react';

import { useCarouselHorizontalScroll } from '../../hooks/useCarouselHorizontalScroll';
import { useCarouselVirtualization } from '../../hooks/useCarouselVirtualization';
import { ImgWithPlaceholder } from '../ImgWithPlaceholder/ImgWithPlaceholder';
import type { CarouselProps } from '../../interfaces/CarouselProps';

import styles from './Carousel.module.scss';

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

  const paddingListItem = (padding: number) => (
    <li
      className={styles.item}
      aria-hidden
      style={
        isHorizontal
          ? { width: padding, flex: '0 0 auto', visibility: 'hidden' }
          : { height: padding, flex: '0 0 auto', visibility: 'hidden' }
      }
    />
  );

  return (
    <ul ref={listRef} className={`${styles.carousel} ${styles[orientation]}`} style={{ gap }}>
      {paddingStart > 0 && paddingListItem(paddingStart)}

      {imagesSlice.map((src, i) => {
        const idx = range.start + i;
        const extent = sizesRef.current[idx] || 1;
        return (
          <li
            className={styles.item}
            key={`${idx}-${src}`}
            style={isHorizontal ? { width: extent } : { height: extent }}
          >
            <ImgWithPlaceholder src={src} alt={`Slide ${idx + 1}`} />
          </li>
        );
      })}

      {paddingEnd > 0 && paddingListItem(paddingEnd)}
    </ul>
  );
};
