export interface UseCarouselVirtualizationOptions {
  images: string[];
  overscan: number;
  listRef: React.RefObject<HTMLUListElement | null>;
  isHorizontal: boolean;
  gap: number;
}
