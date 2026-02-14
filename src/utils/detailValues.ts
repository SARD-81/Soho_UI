export const omitNullishEntries = (
  values: Record<string, unknown> | null | undefined
): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(values ?? {}).filter(
      ([, value]) =>
        value !== null &&
        value !== undefined &&
        value !== '—' &&
        value !== '-' &&
        value !== 'none'
    )
  );

export const ensureLeadingSlash = (value : string) => {
  if (!value) return ''; // یا '/' اگر می‌خواهید مقدار خالی هم به اسلش تبدیل شود
  return value.startsWith('/') ? value : `/${value}`;
};
