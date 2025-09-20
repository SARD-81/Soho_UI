import type { RgbColor } from '../../@types/components/cpu';

export const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

export const formatRgb = ({ r, g, b }: RgbColor) => `rgb(${r}, ${g}, ${b})`;

export const interpolateColor = (start: RgbColor, end: RgbColor, ratio: number) => ({
  r: Math.round(start.r + (end.r - start.r) * ratio),
  g: Math.round(start.g + (end.g - start.g) * ratio),
  b: Math.round(start.b + (end.b - start.b) * ratio),
});

export const START_COLOR: RgbColor = { r: 0, g: 255, b: 0 };

export const ALERT_COLOR: RgbColor = { r: 255, g: 0, b: 0 };

export const getGaugeColor = (value: number) => {
  const ratio = clampPercent(value) / 100;
  return formatRgb(interpolateColor(START_COLOR, ALERT_COLOR, ratio));
};
