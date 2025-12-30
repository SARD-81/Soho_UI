import type { DetailLayoutConfig } from '../config/detailLayouts';

const buildExcludedKeySet = (layout: Pick<DetailLayoutConfig, 'excludedKeys'>) =>
  new Set(layout.excludedKeys ?? []);

export const filterDetailValuesByLayout = (
  values: Record<string, unknown> | null | undefined,
  layout: Pick<DetailLayoutConfig, 'excludedKeys'>
): Record<string, unknown> => {
  if (!values) {
    return {};
  }

  const excludedKeys = buildExcludedKeySet(layout);

  if (excludedKeys.size === 0) {
    return values;
  }

  return Object.fromEntries(
    Object.entries(values).filter(([key]) => !excludedKeys.has(key))
  );
};

export default filterDetailValuesByLayout;
