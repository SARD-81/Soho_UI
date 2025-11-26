export const VDEV_TYPE_LABELS: Record<string, string> = {
  disk: 'هر دیسک جداگانه',
  mirror: 'RAID1',
  raidz: 'RAID5',
  raidz1: 'RAID5',
  raidz2: 'RAID6',
  raidz3: 'Triple parity',
  spare: 'دیسک رزرو',
};

export const normalizeVdevType = (vdevType: string | null | undefined) => {
  const normalized = vdevType?.trim().toLowerCase() ?? '';

  if (normalized === 'root') {
    return 'disk';
  }

  if (normalized === 'raidz1') {
    return 'raidz';
  }

  return normalized;
};

export const resolveVdevLabel = (vdevType: string | null | undefined) => {
  const normalized = normalizeVdevType(vdevType);

  return VDEV_TYPE_LABELS[normalized] ?? vdevType ?? '';
};

export const validateVdevDeviceSelection = (
  vdevType: string,
  deviceCount: number
): string | null => {
  const normalizedType = normalizeVdevType(vdevType);

  if (deviceCount === 0) {
    return 'حداقل یک دیسک را انتخاب کنید.';
  }

  switch (normalizedType) {
    case 'disk':
      if (deviceCount !== 1) {
        return 'برای هر دیسک جداگانه دقیقاً یک دیسک انتخاب کنید.';
      }
      break;
    case 'mirror':
      if (deviceCount < 2 || deviceCount % 2 !== 0) {
        return 'برای RAID1 تعداد دیسک‌ها باید عددی زوج و حداقل ۲ باشد.';
      }
      break;
    case 'raidz':
      if (deviceCount < 3) {
        return 'برای RAID5 حداقل سه دیسک انتخاب کنید.';
      }
      break;
    case 'raidz2':
      if (deviceCount < 5) {
        return 'برای RAID6 حداقل پنج دیسک انتخاب کنید.';
      }
      break;
    case 'raidz3':
      if (deviceCount < 5) {
        return 'برای Triple parity حداقل پنج دیسک انتخاب کنید.';
      }
      break;
    case 'spare':
      if (deviceCount < 1) {
        return 'برای دیسک رزرو حداقل یک دیسک انتخاب کنید.';
      }
      break;
    default:
      break;
  }

  return null;
};
