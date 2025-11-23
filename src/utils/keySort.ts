const stringifyValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return value.toString();
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => stringifyValue(item))
      .filter((text) => text.length > 0)
      .join(', ');
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  try {
    return JSON.stringify(value) ?? '';
  } catch {
    return String(value);
  }
};

export const buildKeyLengthMap = (records: Array<Record<string, unknown>>) => {
  const lengthMap: Record<string, number> = {};

  records.forEach((record) => {
    Object.entries(record ?? {}).forEach(([key, value]) => {
      const textLength = stringifyValue(value).length;
      const currentLength = lengthMap[key] ?? 0;

      if (textLength > currentLength) {
        lengthMap[key] = textLength;
      }
    });
  });

  return lengthMap;
};

export const createLengthAwareComparator = (
  lengthMap: Record<string, number>,
  locale: string
) =>
  function sortKeys(a: string, b: string): number {
    const lengthDiff = (lengthMap[a] ?? 0) - (lengthMap[b] ?? 0);

    if (lengthDiff !== 0) {
      return lengthDiff;
    }

    return a.localeCompare(b, locale);
  };

export const createLengthAwareComparatorFromRecords = (
  records: Array<Record<string, unknown>>,
  locale: string
) => createLengthAwareComparator(buildKeyLengthMap(records), locale);

export const sortKeysByLengthThenLocale = (
  keys: string[],
  lengthMap: Record<string, number>,
  locale: string
) => [...keys].sort(createLengthAwareComparator(lengthMap, locale));