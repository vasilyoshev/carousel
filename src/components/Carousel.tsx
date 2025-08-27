import styles from './Carousel.module.scss';

type SnapMode = 'mandatory' | 'none';

type CarouselProps = {
  images: string[];
  snap?: SnapMode;
};

export const Carousel = ({ images, snap = 'none' }: CarouselProps) => {
  return (
    <ul
      className={`${styles.carousel} ${snap === 'mandatory' ? styles.snap_mandatory : styles.snap_none}`}
    >
      {images.map((src, i) => (
        <li className={styles.item} key={`${i}-${src}`}>
          <img className={styles.img} src={src} alt={`Slide ${i + 1}`} />
        </li>
      ))}
    </ul>
  );
};
