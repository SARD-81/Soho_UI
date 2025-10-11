export const PERSIAN_CHAR_PATTERN = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;

export const removePersianCharacters = (value: string) =>
  value.replace(PERSIAN_CHAR_PATTERN, '');

export const containsPersianCharacters = (value: string) =>
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(value);