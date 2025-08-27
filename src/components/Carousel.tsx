import { useRef } from 'react';

import { useHorizontalWheelMomentum } from '../hooks/useHorizontalWheelMomentum';

import styles from './Carousel.module.scss';

export type Orientation = 'horizontal' | 'vertical';

type CarouselProps = {
  images: string[];
  orientation?: Orientation;
};

export const Carousel = ({ images, orientation = 'horizontal' }: CarouselProps) => {
  const listRef = useRef<HTMLUListElement>(null);

  useHorizontalWheelMomentum(listRef, orientation === 'horizontal');

  return (
    <ul ref={listRef} className={`${styles.carousel} ${styles[orientation]}`}>
      {images.map((src, i) => (
        <li className={styles.item} key={`${i}-${src}`}>
          <img className={styles.img} src={src} alt={`Slide ${i + 1}`} />
        </li>
      ))}
    </ul>
  );
};
