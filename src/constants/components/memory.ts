export const BYTE_UNITS = ['B', 'KB', 'MB', 'GB'] as const;

export const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

export const parseNumeric = (value: unknown): number | null => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};
