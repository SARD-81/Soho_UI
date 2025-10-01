const DEFAULT_BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'] as const;
const DEFAULT_DURATION_UNITS = ['ms', 's', 'min', 'h', 'd'] as const;
const DEFAULT_DURATION_STEPS = [1000, 60, 60, 24] as const;

type NullableNumber = number | null | undefined;

export type FormatBytesOptions = {
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  units?: readonly string[];
  fallback?: string;
};

export const formatBytes = (
  value: NullableNumber,
  {
    locale = 'en-US',
    minimumFractionDigits,
    maximumFractionDigits,
    units = DEFAULT_BYTE_UNITS,
    fallback = '-',
  }: FormatBytesOptions = {}
): string => {
  const numericValue =
    typeof value === 'number' ? value : value != null ? Number(value) : NaN;

  if (!Number.isFinite(numericValue)) {
    return fallback;
  }

  const sign = numericValue < 0 ? '-' : '';
  let currentValue = Math.abs(numericValue);
  let unitIndex = 0;

  const resolvedUnits = units.length > 0 ? units : DEFAULT_BYTE_UNITS;

  while (unitIndex < resolvedUnits.length - 1 && currentValue >= 1024) {
    currentValue /= 1024;
    unitIndex += 1;
  }

  const effectiveMaximumFractionDigits =
    maximumFractionDigits ?? (currentValue >= 100 ? 0 : 1);

  const formatter = new Intl.NumberFormat(locale, {
    maximumFractionDigits: effectiveMaximumFractionDigits,
    minimumFractionDigits,
  });

  const unitLabel =
    resolvedUnits[unitIndex] ?? resolvedUnits[resolvedUnits.length - 1] ?? '';

  const formattedValue = formatter.format(currentValue);

  return unitLabel
    ? `${sign} ${unitLabel}${formattedValue}`
    : `${sign}${formattedValue}`;
};

export type FormatDurationOptions = {
  locale?: string;
  units?: readonly string[];
  steps?: readonly number[];
  maximumFractionDigits?: number;
  minimumFractionDigits?: number;
  fallback?: string;
};

export const formatDuration = (
  valueMs: NullableNumber,
  {
    locale = 'en-US',
    units = DEFAULT_DURATION_UNITS,
    steps = DEFAULT_DURATION_STEPS,
    maximumFractionDigits,
    minimumFractionDigits,
    fallback = '-',
  }: FormatDurationOptions = {}
): string => {
  const numericValue =
    typeof valueMs === 'number'
      ? valueMs
      : valueMs != null
        ? Number(valueMs)
        : NaN;

  if (!Number.isFinite(numericValue)) {
    return fallback;
  }

  const sign = numericValue < 0 ? '-' : '';
  let currentValue = Math.abs(numericValue);
  let unitIndex = 0;

  const resolvedUnits = units.length > 0 ? units : DEFAULT_DURATION_UNITS;
  const resolvedSteps = steps.length > 0 ? steps : DEFAULT_DURATION_STEPS;

  while (
    unitIndex < resolvedSteps.length &&
    currentValue >= resolvedSteps[unitIndex]
  ) {
    currentValue /= resolvedSteps[unitIndex];
    unitIndex += 1;
  }

  const effectiveUnitIndex =
    unitIndex < resolvedUnits.length
      ? unitIndex
      : Math.max(resolvedUnits.length - 1, 0);

  const effectiveMaximumFractionDigits =
    maximumFractionDigits ?? (currentValue >= 100 ? 0 : 1);

  const formatter = new Intl.NumberFormat(locale, {
    maximumFractionDigits: effectiveMaximumFractionDigits,
    minimumFractionDigits,
  });

  const unitLabel =
    resolvedUnits[effectiveUnitIndex] ??
    resolvedUnits[resolvedUnits.length - 1] ??
    '';

  const formattedValue = formatter.format(currentValue);

  return unitLabel
    ? `${sign}${formattedValue} ${unitLabel}`
    : `${sign}${formattedValue}`;
};

export type FormatLargeNumberOptions = {
  fallback?: string;
};

export const formatLargeNumber = (
  value: NullableNumber,
  { fallback = '-' }: FormatLargeNumberOptions = {}
): string => {
  const numericValue =
    typeof value === 'number' ? value : value != null ? Number(value) : NaN;

  if (!Number.isFinite(numericValue)) {
    return fallback;
  }

  const absoluteValue = Math.abs(numericValue);
  const sign = numericValue < 0 ? '-' : '';

  if (absoluteValue >= 1_000_000_000) {
    return `${sign}${(absoluteValue / 1_000_000_000).toFixed(1)}B`;
  }

  if (absoluteValue >= 1_000_000) {
    return `${sign}${(absoluteValue / 1_000_000).toFixed(1)}M`;
  }

  if (absoluteValue >= 1_000) {
    return `${sign}${(absoluteValue / 1_000).toFixed(1)}K`;
  }

  return numericValue.toFixed(0);
};
