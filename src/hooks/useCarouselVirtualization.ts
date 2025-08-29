import { useEffect, useRef, useState, useMemo, useCallback } from 'react';

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

  const { paddingStart, paddingEnd } = useMemo(() => {
    const rawAfter = totalLengthRef.current - offsetsRef.current[range.end];
    const paddingStart = range.start === 0 ? 0 : Math.max(0, offsetsRef.current[range.start] - gap);
    const paddingEnd = Math.max(0, range.end < images.length ? rawAfter - gap : rawAfter);
    return { paddingStart, paddingEnd };
  }, [range.start, range.end, images.length, gap]);

  const imagesSlice = useMemo(
    () => images.slice(range.start, range.end),
    [images, range.start, range.end],
  );

  const updateRange = useCallback(
    (listEl: HTMLUListElement) => {
      const scrollOffset = isHorizontal ? listEl.scrollLeft : listEl.scrollTop;
      const viewport = isHorizontal ? listEl.clientWidth : listEl.clientHeight;
      const start = Math.max(0, findIndexByOffset(scrollOffset, offsetsRef.current) - overscan);
      const end = Math.min(
        images.length,
        findIndexByOffset(scrollOffset + viewport, offsetsRef.current) + overscan,
      );
      setRange({ start, end });
    },
    [images.length, isHorizontal, overscan],
  );

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
  }, [images, crossAxisSize, isHorizontal, listRef, gap, updateRange]);

  useEffect(() => {
    const listEl = listRef.current;
    if (!listEl) return;

    const onScroll = () => updateRange(listEl);
    listEl.addEventListener('scroll', onScroll);

    return () => listEl.removeEventListener('scroll', onScroll);
  }, [images, isHorizontal, listRef, gap, updateRange]);

  return {
    range,
    paddingStart,
    paddingEnd,
    imagesSlice,
    sizesRef,
  };
}
