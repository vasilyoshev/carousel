export const getRatioFromUrl = (url: string) => {
  const matchArr = url.match(/\/(\d+)\/(\d+)(?:$|\?)/);
  return matchArr ? +matchArr[1] / +matchArr[2] : 1;
};
