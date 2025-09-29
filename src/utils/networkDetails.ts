import type { IPv4Info } from '../@types/network';
import type {
  InterfaceAddress,
  NetworkInterface,
} from '../hooks/useNetwork';

const trimIfStringHasValue = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const toCleanString = (value: unknown): string | null => {
  if (typeof value === 'string') {
    return trimIfStringHasValue(value);
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return null;
};

const flattenAddressEntries = (value: unknown): InterfaceAddress[] => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((entry) => flattenAddressEntries(entry));
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;

    if ('address' in record || 'netmask' in record || 'family' in record) {
      const candidate = record as InterfaceAddress;

      return [
        {
          ...candidate,
          address: toCleanString(candidate.address),
          netmask: toCleanString(candidate.netmask),
          family: toCleanString(candidate.family),
        },
      ];
    }

    return Object.values(record).flatMap((entry) => flattenAddressEntries(entry));
  }

  if (typeof value === 'string') {
    const trimmed = trimIfStringHasValue(value);
    return trimmed ? [{ address: trimmed }] : [];
  }

  return [];
};

const extractIPv4Info = (
  networkInterface: NetworkInterface | undefined
): IPv4Info[] => {
  if (!networkInterface) {
    return [];
  }

  const flattened = flattenAddressEntries(networkInterface.addresses);

  const ipv4Entries = flattened
    .map((entry) => {
      const address = toCleanString(entry.address);
      const family = toCleanString(entry.family)?.toLowerCase() ?? '';

      if (!address) {
        return null;
      }

      const isIPv4ByAddress = address.includes('.') && !address.includes(':');
      const isIPv4ByFamily =
        family === 'ipv4' ||
        family === 'inet' ||
        family.includes('af_inet') ||
        (family.includes('inet') && !family.includes('6'));

      if (!isIPv4ByAddress && !isIPv4ByFamily) {
        return null;
      }

      if (!isIPv4ByAddress) {
        return null;
      }

      const netmask = toCleanString(entry.netmask);

      return {
        address,
        netmask: netmask ?? null,
      };
    })
    .filter((value): value is IPv4Info => Boolean(value));

  return ipv4Entries.reduce<IPv4Info[]>((acc, current) => {
    const existingIndex = acc.findIndex(
      (item) => item.address === current.address
    );

    if (existingIndex === -1) {
      acc.push(current);
    } else if (!acc[existingIndex].netmask && current.netmask) {
      acc[existingIndex] = { ...acc[existingIndex], netmask: current.netmask };
    }

    return acc;
  }, []);
};

const formatInterfaceSpeed = (
  status: NetworkInterface['status'] | undefined,
  formatter: Intl.NumberFormat
) => {
  const rawSpeed = status?.speed;
  const numericSpeed = Number(rawSpeed);

  if (!Number.isFinite(numericSpeed) || numericSpeed <= 0) {
    return 'نامشخص';
  }

  return `${formatter.format(numericSpeed)} Mbps`;
};

export { extractIPv4Info, formatInterfaceSpeed };
