import { useEffect, useRef, type RefObject } from 'react';

import { CAROUSEL_MAX_SPEED, CAROUSEL_STOP_THRESHOLD } from '../consts/carouselScroll';

export const useCarouselKinetics = ({
  listElRef,
  scrollPositionRef,
  isHorizontal,
  overscan,
  gain,
  friction,
  mainAxisSize,
  repeatCount,
  totalLength,
  updateRange,
}: {
  listElRef: RefObject<HTMLUListElement | null>;
  scrollPositionRef: RefObject<number>;
  isHorizontal: boolean;
  overscan: number;
  gain: number;
  friction: number;
  mainAxisSize: number;
  repeatCount: number;
  totalLength: number;
  updateRange: () => void;
}) => {
  const scrollVelocityRef = useRef(0);
  const isDraggingRef = useRef(false);
  const lastPointerPosRef = useRef(0);
  const velSamplesRef = useRef<Array<{ t: number; d: number }>>([]);

  useEffect(() => {
    const listEl = listElRef.current;
    if (!listEl) return;

    let animationFrame: number | undefined;

    const step = () => {
      scrollPositionRef.current += scrollVelocityRef.current;

      if (repeatCount >= 3 && totalLength > 0) {
        const loopLength = totalLength / repeatCount;
        const midBlock = Math.floor(repeatCount / 2);
        const pad = Math.min(300, loopLength * 0.1) - 1;
        const leftEdge = loopLength * (midBlock - 1) + pad;
        const rightEdge = loopLength * (midBlock + 1) - pad;

        const current = scrollPositionRef.current;
        const dir = Math.sign(scrollVelocityRef.current) as -1 | 0 | 1;

        if (dir < 0 && current <= leftEdge) scrollPositionRef.current = current + loopLength;
        else if (dir > 0 && current >= rightEdge) scrollPositionRef.current = current - loopLength;
      }

      scrollVelocityRef.current *= friction;
      if (Math.abs(scrollVelocityRef.current) <= CAROUSEL_STOP_THRESHOLD)
        scrollVelocityRef.current = 0;

      updateRange();

      if (scrollVelocityRef.current !== 0) animationFrame = requestAnimationFrame(step);
      else animationFrame = undefined;
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();

      const scrollStepPx = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? mainAxisSize : 1;
      const scrollOffsetPx = event.deltaY * scrollStepPx * gain;

      // Cancel momentum if direction changes
      if (
        scrollVelocityRef.current !== 0 &&
        Math.sign(scrollOffsetPx) !== Math.sign(scrollVelocityRef.current)
      ) {
        scrollVelocityRef.current = 0;
      }

      scrollVelocityRef.current = Math.max(
        -CAROUSEL_MAX_SPEED,
        Math.min(CAROUSEL_MAX_SPEED, scrollVelocityRef.current + scrollOffsetPx),
      );

      if (!animationFrame) animationFrame = requestAnimationFrame(step);
    };

    const onPointerDown = (ev: PointerEvent) => {
      if (!ev.isPrimary) return;
      listEl.setPointerCapture?.(ev.pointerId);

      isDraggingRef.current = true;
      scrollVelocityRef.current = 0;

      lastPointerPosRef.current = isHorizontal ? ev.clientX : ev.clientY;
      velSamplesRef.current = [{ t: performance.now(), d: 0 }];

      ev.preventDefault();
    };

    const onPointerMove = (ev: PointerEvent) => {
      if (!isDraggingRef.current) return;

      const now = performance.now();
      const curr = isHorizontal ? ev.clientX : ev.clientY;
      const delta = lastPointerPosRef.current - curr;

      lastPointerPosRef.current = curr;
      scrollPositionRef.current += delta;
      updateRange();

      velSamplesRef.current.push({ t: now, d: delta });
      velSamplesRef.current = velSamplesRef.current.filter((s) => now - s.t <= 100);

      if (!animationFrame) animationFrame = requestAnimationFrame(step);
      ev.preventDefault();
    };

    const onPointerUpOrCancel = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;

      const samples = velSamplesRef.current;
      const dt = samples.at(-1)!.t - samples[0]!.t || 1;
      const dist = samples.reduce((sum, s) => sum + s.d, 0);
      const vPxPerMs = dist / dt;
      const vPxPerFrame = vPxPerMs * (1000 / 60);

      scrollVelocityRef.current = Math.max(
        -CAROUSEL_MAX_SPEED,
        Math.min(CAROUSEL_MAX_SPEED, vPxPerFrame),
      );

      if (!animationFrame && scrollVelocityRef.current !== 0)
        animationFrame = requestAnimationFrame(step);
    };

    listEl.addEventListener('wheel', onWheel, { passive: false });
    listEl.addEventListener('pointerdown', onPointerDown, { passive: false });
    listEl.addEventListener('pointermove', onPointerMove, { passive: false });
    listEl.addEventListener('pointerup', onPointerUpOrCancel, { passive: false });
    listEl.addEventListener('pointercancel', onPointerUpOrCancel, { passive: false });

    return () => {
      listEl.removeEventListener('wheel', onWheel);
      listEl.removeEventListener('pointerdown', onPointerDown);
      listEl.removeEventListener('pointermove', onPointerMove);
      listEl.removeEventListener('pointerup', onPointerUpOrCancel);
      listEl.removeEventListener('pointercancel', onPointerUpOrCancel);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [gain, friction, mainAxisSize, repeatCount, totalLength, overscan]);
};
