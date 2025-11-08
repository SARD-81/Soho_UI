export const PERSIAN_CHAR_PATTERN = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;

const ENGLISH_ALPHABET_PATTERN = /[^A-Za-z]/g;

export const removePersianCharacters = (value: string) =>
  value.replace(PERSIAN_CHAR_PATTERN, '');

export const containsPersianCharacters = (value: string) =>
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(value);

export const sanitizeLowercaseEnglishUsername = (value: string) => {
  const withoutPersian = removePersianCharacters(value);
  const englishLettersOnly = withoutPersian.replace(ENGLISH_ALPHABET_PATTERN, '');
  const lowercaseValue = englishLettersOnly.toLowerCase();

  return {
    sanitizedValue: lowercaseValue,
    hadPersianCharacters: withoutPersian !== value,
    hadUppercaseCharacters: englishLettersOnly !== lowercaseValue,
    hadNonAlphabeticCharacters: englishLettersOnly !== withoutPersian,
  };
};

export const isLowercaseEnglishAlphabet = (value: string) => /^[a-z]+$/.test(value);

export const lowercaseEnglishWarningMessage =
  'نام کاربری فقط می‌تواند شامل حروف انگلیسی کوچک باشد.';
