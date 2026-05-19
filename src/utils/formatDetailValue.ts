const LTR_ISOLATE_START = '\u2066';
const DIRECTIONAL_ISOLATE_END = '\u2069';

const BYTE_SIZE_PATTERN = /^-?\d[\d,.]*\s+(B|KB|MB|GB|TB|PB)$/i;

const isolateLtrText = (value: string) =>
  `${LTR_ISOLATE_START}${value}${DIRECTIONAL_ISOLATE_END}`;

const shouldRenderAsLtrValue = (value: string) =>
  BYTE_SIZE_PATTERN.test(value.trim());

const formatStringDetailValue = (value: string) => {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return '-';
  }

  if (shouldRenderAsLtrValue(normalizedValue)) {
    return isolateLtrText(normalizedValue);
  }

  return value;
};

const formatDetailValue = (value: unknown): string => {
  if (value == null) {
    return '-';
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return new Intl.NumberFormat('en-US').format(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => formatDetailValue(item)).join(', ');
  }

  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }

  return formatStringDetailValue(String(value));
};

export default formatDetailValue;