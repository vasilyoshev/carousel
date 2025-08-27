import { useEffect } from 'react';

import {
  CAROUSEL_GAIN,
  CAROUSEL_MAX_SPEED,
  CAROUSEL_FRICTION,
  CAROUSEL_STOP_THRESHOLD,
} from '../consts/carousel';

export function useHorizontalWheelMomentum(
  ref: React.RefObject<HTMLUListElement | null>,
  enabled: boolean,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    let animationFrame: number | undefined;
    let velocity = 0;

    const step = () => {
      el.scrollLeft += velocity;
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

    el.addEventListener('wheel', onWheel);

    return () => {
      el.removeEventListener('wheel', onWheel);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [ref, enabled]);
}
