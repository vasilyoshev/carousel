import { useEffect, useMemo, useRef, useLayoutEffect, useState } from 'react';

import { useCarouselHorizontalScroll } from '../../hooks/useCarouselHorizontalScroll';
import { useCarouselVirtualization } from '../../hooks/useCarouselVirtualization';
import { useCarouselInfiniteScroll } from '../../hooks/useCarouselInfiniteScroll';
import { ImgWithPlaceholder } from '../ImgWithPlaceholder/ImgWithPlaceholder';
import type { CarouselProps } from '../../interfaces/CarouselProps';

import styles from './Carousel.module.scss';

export const Carousel = ({
  images,
  orientation = 'horizontal',
  overscan = 10,
  gap = 12,
}: CarouselProps) => {
  const listRef = useRef<HTMLUListElement>(null);
  const isHorizontal = orientation === 'horizontal';

  const [{ mainSize, crossSize }, setSizes] = useState({ mainSize: 0, crossSize: 0 });
  const [repeatCount, setRepeatCount] = useState(3);

  const baseTotal = useMemo(() => {
    if (!images?.length) return 0;
    const ratioFromUrl = (url: string) => {
      const m = url.match(/\/(\d+)\/(\d+)(?:$|\?)/);
      return m ? +m[1] / +m[2] : 1;
    };
    const cross = crossSize || 300;
    const est = images
      .map((url) => {
        const r = ratioFromUrl(url) || 1;
        return Math.max(1, Math.round(isHorizontal ? cross * r : cross / r));
      })
      .reduce((a, b) => a + b, 0);
    return est + Math.max(0, images.length - 1) * gap;
  }, [images, isHorizontal, crossSize, gap]);

  const loopImages = useMemo(() => {
    if (!images?.length) return images;
    const out: string[] = [];
    for (let i = 0; i < repeatCount; i++) out.push(...images);
    return out;
  }, [images, repeatCount]);

  useCarouselHorizontalScroll(listRef, isHorizontal);

  const { range, paddingStart, paddingEnd, imagesSlice, sizesRef, totalLength } =
    useCarouselVirtualization({
      images: loopImages,
      overscan,
      listRef,
      isHorizontal,
      gap,
    });

  useCarouselInfiniteScroll(listRef, isHorizontal, repeatCount, totalLength);

  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const read = () => {
      const main = isHorizontal ? el.clientWidth : el.clientHeight;
      const cross = isHorizontal ? el.clientHeight : el.clientWidth;
      setSizes({ mainSize: main, crossSize: cross });
    };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isHorizontal]);

  useEffect(() => {
    if (!images?.length) return;
    const mainTarget = mainSize > 0 ? mainSize * 2 : baseTotal * 3;
    const est = Math.max(3, Math.ceil(mainTarget / Math.max(1, baseTotal)));
    setRepeatCount(est);
  }, [images, baseTotal, mainSize]);

  useEffect(() => {
    if (!images?.length || !listRef.current || totalLength <= 0) return;
    const needed = (isHorizontal ? listRef.current.clientWidth : listRef.current.clientHeight) * 2;
    if (totalLength < needed) {
      setRepeatCount((r) => Math.min(r + 1, 50));
    }
  }, [images, isHorizontal, totalLength]);

  const PaddingListItem = ({ padding }: { padding: number }) => (
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
      {<PaddingListItem padding={paddingStart} />}
      {imagesSlice.map((src, i) => {
        const idx = range.start + i;
        const extent = sizesRef.current[idx] || 1;
        const baseLen = images.length || 1;
        const realIdx = idx % baseLen;
        return (
          <li
            className={styles.item}
            key={`${realIdx}-${src}-${idx}`}
            style={isHorizontal ? { width: extent } : { height: extent }}
          >
            <ImgWithPlaceholder src={src} alt={`Slide ${realIdx + 1}`} />
          </li>
        );
      })}
      {<PaddingListItem padding={paddingEnd} />}
    </ul>
  );
};
