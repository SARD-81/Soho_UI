import type { DetailLayoutConfig } from '../config/detailLayouts';

const buildExcludedKeySet = (layout: Pick<DetailLayoutConfig, 'excludedKeys' | 'includedKeys'>) =>
  new Set(layout.excludedKeys ?? []);

const buildIncludedKeySet = (layout: Pick<DetailLayoutConfig, 'includedKeys'>) =>
  new Set(layout.includedKeys ?? []);

export const filterDetailValuesByLayout = (
  values: Record<string, unknown> | null | undefined,
  layout: Pick<DetailLayoutConfig, 'excludedKeys' | 'includedKeys'>
): Record<string, unknown> => {
  if (!values) {
    return {};
  }

  const includedKeys = buildIncludedKeySet(layout);
  const excludedKeys = buildExcludedKeySet(layout);

  if (includedKeys.size > 0) {
    return Object.fromEntries(
      Object.entries(values).filter(([key]) => includedKeys.has(key))
    );
  }

  if (excludedKeys.size === 0) {
    return values;
  }

  return Object.fromEntries(
    Object.entries(values).filter(([key]) => !excludedKeys.has(key))
  );
};

export default filterDetailValuesByLayout;