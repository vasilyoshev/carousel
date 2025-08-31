import { useEffect, useRef, useState } from 'react';

import { findIndexByOffset } from '../utils/findIndexByOffset';
import type { UseCarouselVirtualizationOptions } from '../interfaces/UseCarouselVirtualizationOptions';

export function useCarouselVirtualization({
  images,
  overscan,
  listRef,
  isHorizontal,
  gap,
}: UseCarouselVirtualizationOptions) {
  const [range, setRange] = useState({ start: 0, end: Math.min(10, images.length) });
  const [crossAxisSize, setCrossAxisSize] = useState(0);

  const ratiosRef = useRef<number[]>([]);
  const sizesRef = useRef<number[]>([]);
  const offsetsRef = useRef<number[]>([]);
  const totalLengthRef = useRef<number>(0);

  const rawAfter = totalLengthRef.current - offsetsRef.current[range.end];
  const paddingStart =
    range.start === 0 ? 0 : Math.max(0, offsetsRef.current[range.start] - gap) || 0;
  const paddingEnd = Math.max(0, range.end < images.length ? rawAfter - gap : rawAfter) || 0;

  const imagesSlice = images.slice(range.start, range.end);

  const updateRange = (listEl: HTMLUListElement) => {
    if (!images.length) {
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
    end = Math.min(images.length, end + overscan);
    if (end < start) end = start;

    setRange({ start, end });
  };

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
    ratiosRef.current = images.map((url: string) => {
      const matchArray = url.match(/\/(\d+)\/(\d+)(?:$|\?)/);
      return matchArray ? +matchArray[1] / +matchArray[2] : 1;
    });
  }, [images]);

  useEffect(() => {
    const sizes = ratiosRef.current.map((ratio) =>
      Math.max(1, Math.round(isHorizontal ? crossAxisSize * ratio : crossAxisSize / ratio)),
    );
    sizesRef.current = sizes;

    const offsets = new Array(images.length + 1);
    offsets[0] = 0;
    for (let i = 1; i <= images.length; i++) {
      offsets[i] = offsets[i - 1] + sizes[i - 1] + gap;
    }
    offsetsRef.current = offsets;
    totalLengthRef.current = Math.max(0, offsets[images.length] - gap);

    if (listRef.current) updateRange(listRef.current);
  }, [images, crossAxisSize, isHorizontal, listRef, gap, overscan]);

  useEffect(() => {
    const listEl = listRef.current;
    if (!listEl) return;

    const onScroll = () => updateRange(listEl);
    listEl.addEventListener('scroll', onScroll);

    return () => listEl.removeEventListener('scroll', onScroll);
  }, [images, isHorizontal, listRef, gap, overscan]);

  return {
    range,
    paddingStart,
    paddingEnd,
    imagesSlice,
    sizesRef,
    totalLength: totalLengthRef.current,
  };
}
