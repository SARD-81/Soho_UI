const BY_ID_PREFIX = '/dev/disk/by-id/';
const LINUX_BY_ID_PREFIXES = [
  'wwn-',
  'ata-',
  'scsi-',
  'nvme-',
  'usb-',
  'virtio-',
  'dm-uuid-',
  'md-uuid-',
] as const;

const BARE_WWN_PATTERN = /^(?:0x)?[0-9a-f]{16,}$/i;
const PARTITION_SUFFIX_PATTERN = /(?:-part\d+|p\d+)$/;

export const normalizeByIdDiskBase = (value: unknown): string => {
  const trimmed = String(value ?? '').trim();

  if (!trimmed) {
    return '';
  }

  if (trimmed.startsWith(BY_ID_PREFIX)) {
    return trimmed;
  }

  const byIdName = trimmed.replace(/^\/dev\/disk\/by-id\//, '');
  const hasKnownPrefix = LINUX_BY_ID_PREFIXES.some((prefix) =>
    byIdName.startsWith(prefix)
  );

  if (hasKnownPrefix) {
    return `${BY_ID_PREFIX}${byIdName}`;
  }

  if (BARE_WWN_PATTERN.test(byIdName)) {
    return `${BY_ID_PREFIX}wwn-${byIdName}`;
  }

  return trimmed.startsWith('/dev/') ? trimmed : `/dev/${trimmed.replace(/^\/dev\//, '')}`;
};

export const normalizeReplacementOldDevice = (
  value: unknown,
  partitionSuffix = '-part1'
): string => {
  const base = normalizeByIdDiskBase(value);

  if (!base || PARTITION_SUFFIX_PATTERN.test(base)) {
    return base;
  }

  return `${base}${partitionSuffix}`;
};
