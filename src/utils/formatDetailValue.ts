const formatDetailValue = (value: unknown): string => {
  if (value == null) {
    return '-';
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return new Intl.NumberFormat('fa-IR').format(value);
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

  return String(value);
};

export default formatDetailValue;
