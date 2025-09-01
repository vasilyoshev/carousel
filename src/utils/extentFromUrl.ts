export const extentFromUrl = (url: string, crossAxisSize: number, isHorizontal: boolean) =>
  extentFromRatio(getRatioFromUrl(url) || 1, crossAxisSize, isHorizontal);

const extentFromRatio = (ratio: number, crossAxisSize: number, isHorizontal: boolean) =>
  Math.max(1, Math.round(isHorizontal ? crossAxisSize * ratio : crossAxisSize / ratio));

const getRatioFromUrl = (url: string) => {
  const matchArr = url.match(/\/(\d+)\/(\d+)(?:$|\?)/);
  return matchArr ? +matchArr[1] / +matchArr[2] : 1;
};
