export const omitNullishEntries = (
  values: Record<string, unknown> | null | undefined
): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(values ?? {}).filter(([, value]) => value !== null && value !== undefined)
  );