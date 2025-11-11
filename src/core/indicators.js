export const pctChange = (prev, curr) =>
  prev ? ((curr - prev) / prev) * 100 : 0;
