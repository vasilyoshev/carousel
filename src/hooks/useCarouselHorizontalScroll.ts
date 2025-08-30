import { useEffect } from 'react';

import {
  CAROUSEL_GAIN,
  CAROUSEL_MAX_SPEED,
  CAROUSEL_FRICTION,
  CAROUSEL_STOP_THRESHOLD,
} from '../consts/carouselScroll';

export function useCarouselHorizontalScroll(
  listRef: React.RefObject<HTMLUListElement | null>,
  isEnabled: boolean,
) {
  useEffect(() => {
    const listEl = listRef.current;
    if (!listEl || !isEnabled) return;

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
  }, [listRef, isEnabled]);
}
