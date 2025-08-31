import { useEffect, useMemo, useRef, useLayoutEffect, useState } from 'react';

import { ImgWithPlaceholder } from '../ImgWithPlaceholder/ImgWithPlaceholder';
import type { CarouselProps } from '../../interfaces/CarouselProps';
import {
  CAROUSEL_FRICTION,
  CAROUSEL_GAIN,
  CAROUSEL_MAX_SPEED,
  CAROUSEL_STOP_THRESHOLD,
} from '../../consts/carouselScroll';
import { findIndexByOffset } from '../../utils/findIndexByOffset';

import styles from './Carousel.module.scss';

export const Carousel = ({
  images,
  orientation = 'horizontal',
  overscan = 2,
  gap = 12,
}: CarouselProps) => {
  const listRef = useRef<HTMLUListElement>(null);
  const isTeleportingRef = useRef(false);
  const lastPosRef = useRef(0);
  const prevLoopLenRef = useRef<number | null>(null);
  const didInitialCenterRef = useRef(false);
  const ratiosRef = useRef<number[]>([]);
  const sizesRef = useRef<number[]>([]);
  const offsetsRef = useRef<number[]>([]);
  const totalLengthRef = useRef<number>(0);

  const [repeatCount, setRepeatCount] = useState(3);
  const [crossAxisSize, setCrossAxisSize] = useState(0);
  const [{ mainSize, crossSize }, setSizes] = useState({ mainSize: 0, crossSize: 0 });

  const loopImages = useMemo(() => {
    if (!images?.length) return images;
    const out: string[] = [];
    for (let i = 0; i < repeatCount; i++) out.push(...images);
    return out;
  }, [images, repeatCount]);

  const [range, setRange] = useState({ start: 0, end: Math.min(10, loopImages.length) });

  const rawAfter = totalLengthRef.current - offsetsRef.current[range.end];
  const paddingStart =
    range.start === 0 ? 0 : Math.max(0, offsetsRef.current[range.start] - gap) || 0;
  const paddingEnd = Math.max(0, range.end < loopImages.length ? rawAfter - gap : rawAfter) || 0;
  const imagesSlice = loopImages.slice(range.start, range.end);
  const isHorizontal = orientation === 'horizontal';

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

  const centerTo = (listEl: HTMLUListElement, target: number) => {
    isTeleportingRef.current = true;
    if (isHorizontal) listEl.scrollLeft = target;
    else listEl.scrollTop = target;
    requestAnimationFrame(() => {
      isTeleportingRef.current = false;
    });
  };

  const updateRange = (listEl: HTMLUListElement) => {
    if (!loopImages.length) {
      setRange({ start: 0, end: 0 });
      return;
    }

    const offsets = offsetsRef.current;
    const sizes = sizesRef.current;
    const scroll = isHorizontal ? listEl.scrollLeft : listEl.scrollTop;
    const viewport = isHorizontal ? listEl.clientWidth : listEl.clientHeight;
    const viewEnd = scroll + viewport;

    let start = findIndexByOffset(scroll, offsets);
    if (offsets[start] + (sizes[start] ?? 0) <= scroll) start += 1;

    let end = findIndexByOffset(viewEnd, offsets) + 1;

    start = Math.max(0, start - overscan);
    end = Math.min(loopImages.length, end + overscan);
    if (end < start) end = start;

    setRange({ start, end });
  };

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
    const listEl = listRef.current;
    if (!listEl || repeatCount < 3 || !totalLengthRef.current) return;

    const getPos = () => (isHorizontal ? listEl.scrollLeft : listEl.scrollTop);

    const loopLength = totalLengthRef.current / repeatCount;
    const midBlock = Math.floor(repeatCount / 2);
    const centerOfMid = loopLength * midBlock;

    const posNow = getPos();
    if (!didInitialCenterRef.current) {
      if (posNow === 0) {
        centerTo(listEl, centerOfMid);
        lastPosRef.current = centerOfMid;
      } else {
        lastPosRef.current = posNow;
      }
      didInitialCenterRef.current = true;
    }

    const prevLoop = prevLoopLenRef.current;
    if (prevLoop && Math.abs(prevLoop - loopLength) > 0.5) {
      const pos = getPos();
      const frac = ((pos % prevLoop) + prevLoop) % prevLoop;
      const fracRatio = frac / prevLoop;
      const target = centerOfMid + fracRatio * loopLength;
      centerTo(listEl, target);
      lastPosRef.current = target;
    }
    prevLoopLenRef.current = loopLength;

    const threshold = Math.min(300, loopLength * 0.1);
    const EPS = 1;
    const leftEdge = loopLength * (midBlock - 1) + threshold - EPS;
    const rightEdge = loopLength * (midBlock + 1) - threshold + EPS;

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;

        if (isTeleportingRef.current) {
          lastPosRef.current = getPos();
          return;
        }

        const pos = getPos();
        const delta = pos - lastPosRef.current;
        const dir: -1 | 0 | 1 = delta > 0 ? 1 : delta < 0 ? -1 : 0;

        if (dir < 0 && pos <= leftEdge) {
          const target = pos + loopLength;
          centerTo(listEl, target);
          lastPosRef.current = target;
          return;
        }
        if (dir > 0 && pos >= rightEdge) {
          const target = pos - loopLength;
          centerTo(listEl, target);
          lastPosRef.current = target;
          return;
        }

        lastPosRef.current = pos;
      });
    };

    listEl.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      listEl.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [listRef, isHorizontal, repeatCount, totalLengthRef.current]);

  useEffect(() => {
    const listEl = listRef.current;
    if (!listEl) return;

    const resizeObserver = new ResizeObserver(() =>
      setCrossAxisSize(isHorizontal ? listEl.clientHeight : listEl.clientWidth),
    );
    resizeObserver.observe(listEl);

    return () => resizeObserver.disconnect();
  }, [isHorizontal, listRef]);

  useEffect(() => {
    ratiosRef.current = loopImages.map((url: string) => {
      const matchArray = url.match(/\/(\d+)\/(\d+)(?:$|\?)/);
      return matchArray ? +matchArray[1] / +matchArray[2] : 1;
    });
  }, [loopImages]);

  useEffect(() => {
    const sizes = ratiosRef.current.map((ratio) =>
      Math.max(1, Math.round(isHorizontal ? crossAxisSize * ratio : crossAxisSize / ratio)),
    );
    sizesRef.current = sizes;

    const offsets = new Array(loopImages.length + 1);
    offsets[0] = 0;
    for (let i = 1; i <= loopImages.length; i++) {
      offsets[i] = offsets[i - 1] + sizes[i - 1] + gap;
    }
    offsetsRef.current = offsets;
    totalLengthRef.current = Math.max(0, offsets[loopImages.length] - gap);

    if (listRef.current) updateRange(listRef.current);
  }, [loopImages, crossAxisSize, isHorizontal, listRef, gap, overscan]);

  useEffect(() => {
    const listEl = listRef.current;
    if (!listEl) return;

    const onScroll = () => updateRange(listEl);
    listEl.addEventListener('scroll', onScroll);

    return () => listEl.removeEventListener('scroll', onScroll);
  }, [loopImages, isHorizontal, listRef, gap, overscan]);

  useEffect(() => {
    const listEl = listRef.current;
    if (!listEl || !isHorizontal) return;

    let animationFrame: number | undefined;
    let velocity = 0;

    const step = () => {
      listEl.scrollLeft += velocity;
      velocity *= CAROUSEL_FRICTION;

      if (Math.abs(velocity) > CAROUSEL_STOP_THRESHOLD) {
        animationFrame = requestAnimationFrame(step);
      } else {
        animationFrame = undefined;
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();

      const next = velocity + e.deltaY * CAROUSEL_GAIN;
      velocity = Math.max(-CAROUSEL_MAX_SPEED, Math.min(CAROUSEL_MAX_SPEED, next));

      if (!animationFrame) animationFrame = requestAnimationFrame(step);
    };

    listEl.addEventListener('wheel', onWheel);

    return () => {
      listEl.removeEventListener('wheel', onWheel);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [listRef, isHorizontal]);

  useEffect(() => {
    if (!images?.length) return;
    const mainTarget = mainSize > 0 ? mainSize * 2 : baseTotal * 3;
    const next = Math.max(3, Math.ceil(mainTarget / Math.max(1, baseTotal)));
    setRepeatCount((prev) => (prev === next ? prev : next));
  }, [images, baseTotal, mainSize]);

  useEffect(() => {
    if (!images?.length || !listRef.current || totalLengthRef.current <= 0) return;
    const viewportMain =
      (isHorizontal ? listRef.current.clientWidth : listRef.current.clientHeight) || 0;
    const needed = viewportMain * 2;
    if (needed > 0 && totalLengthRef.current < needed && repeatCount < 50) {
      setRepeatCount((prev) => prev + 1);
    }
  }, [images, isHorizontal, totalLengthRef.current, repeatCount]);

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
