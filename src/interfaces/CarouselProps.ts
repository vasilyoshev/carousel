import type { Orientation } from '../types/Orientation';

export interface CarouselProps {
  images: string[];
  orientation?: Orientation;
  overscan?: number;
  gap?: number;
}
