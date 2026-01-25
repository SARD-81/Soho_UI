export const PERSIAN_CHAR_PATTERN = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;

const ENGLISH_ALPHANUMERIC_PATTERN = /[^A-Za-z0-9]/g;

export const removePersianCharacters = (value: string) =>
  value.replace(PERSIAN_CHAR_PATTERN, '');

export const containsPersianCharacters = (value: string) =>
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(value);

export const sanitizeLowercaseEnglishUsername = (value: string) => {
  const withoutPersian = removePersianCharacters(value);
  const englishLettersAndDigits = withoutPersian.replace(
    ENGLISH_ALPHANUMERIC_PATTERN,
    ''
  );
  const lowercaseValue = englishLettersAndDigits.toLowerCase();

  const hasLeadingNumber = /^[0-9]/.test(lowercaseValue);
  const hadInvalidCharacters = englishLettersAndDigits !== withoutPersian;

  return {
    sanitizedValue: lowercaseValue,
    hadPersianCharacters: withoutPersian !== value,
    hadUppercaseCharacters: englishLettersAndDigits !== lowercaseValue,
    hadInvalidCharacters,
    hadLeadingNumber: hasLeadingNumber,
  };
};

export const isLowercaseEnglishAlphabet = (value: string) =>
  /^[a-z][a-z0-9]*$/.test(value);

export const lowercaseEnglishWarningMessage =
  'نام کاربری فقط می‌تواند شامل حروف انگلیسی کوچک و اعداد باشد و نباید با عدد شروع شود.';

  export const validateEnglishAlphanumericName = (
  trimmedName: string,
  label: string
): string | null => {
  if (!trimmedName) {
    return `لطفاً ${label} را وارد کنید.`;
  }

  if (!/^[A-Za-z0-9]+$/.test(trimmedName)) {
    return `${label} باید فقط شامل حروف انگلیسی و اعداد باشد.`;
  }

  if (/^[0-9]/.test(trimmedName)) {
    return `${label} نمی‌تواند با عدد شروع شود.`;
  }

  return null;
};

export const truncateMiddle = (value: string, maxLength = 24): string => {
  if (!value) {
    return '';
  }

  if (value.length <= maxLength) {
    return value;
  }

  const ellipsis = '...';
  const charsToShow = Math.max(maxLength - ellipsis.length, 1);
  const frontChars = Math.ceil(charsToShow / 2);
  const backChars = Math.floor(charsToShow / 2);

  const start = value.slice(0, frontChars);
  const end = value.slice(value.length - backChars);

  return `${start}${ellipsis}${end}`;
};