const OCTET_COUNT = 4;

export const sanitizeOctetValue = (value: string): string => {
  const numeric = value.replace(/\D/g, '').slice(0, 3);

  if (numeric === '') {
    return '';
  }

  const asNumber = Number(numeric);

  if (Number.isNaN(asNumber)) {
    return '';
  }

  return Math.min(asNumber, 255).toString();
};

export const parseIPv4ToOctets = (value: string): string[] => {
  const parts = value.split('.').slice(0, OCTET_COUNT);

  return Array.from({ length: OCTET_COUNT }, (_, index) => parts[index] ?? '');
};

export const buildIPv4FromOctets = (octets: string[]): string => {
  if (octets.length === 0) {
    return '';
  }

  const trimmedOctets = octets.slice(0, OCTET_COUNT);
  const lastFilledIndex = trimmedOctets.reduce(
    (lastIndex, value, currentIndex) => (value !== '' ? currentIndex : lastIndex),
    -1
  );

  if (lastFilledIndex === -1) {
    return '';
  }

  return trimmedOctets.slice(0, lastFilledIndex + 1).join('.');
};

export const isCompleteIPv4Address = (value: string): boolean => {
  const octets = parseIPv4ToOctets(value);

  if (octets.length !== OCTET_COUNT) {
    return false;
  }

  return octets.every((octet) => {
    if (octet === '') {
      return false;
    }

    const numericValue = Number(octet);
    return !Number.isNaN(numericValue) && numericValue >= 0 && numericValue <= 255;
  });
};
