export function findIndexByOffset(scrollOffset: number, offsets: number[]): number {
  let low = 0;
  let high = offsets.length - 1;
  while (low < high) {
    const mid = Math.floor((low + high + 1) / 2);
    if (offsets[mid] <= scrollOffset) low = mid;
    else high = mid - 1;
  }
  return low;
}
