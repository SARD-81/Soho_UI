import { useQuery } from '@tanstack/react-query';
import type {
  SambaShareEntry,
  SambaSharepointsResponse,
  SambaShareDetails,
} from '../@types/samba';
import axiosInstance from '../lib/axiosInstance';

export const sambaSharesQueryKey = ['samba', 'shares'] as const;

const fetchSambaShares = async () => {
  const { data } = await axiosInstance.get<SambaSharepointsResponse>(
    '/api/samba/sharepoints/',
    { params: { property: 'all' } }
  );
  return data;
};

const BOOLEAN_KEYS = new Set([
  'read only',
  'available',
  'guest ok',
  'browseable',
  'inherit permissions',
  'is_custom',
]);

const toBooleanIfApplicable = (key: string, value: unknown) => {
  if (!BOOLEAN_KEYS.has(key)) {
    return value;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true' || normalized === 'yes') {
      return true;
    }

    if (normalized === 'false' || normalized === 'no') {
      return false;
    }
  }

  return value;
};

const normalizeShareDetails = (details: SambaShareDetails): SambaShareDetails => {
  const entries = Object.entries(details ?? {}).map(([key, value]) => [
    key,
    toBooleanIfApplicable(key, value),
  ]);

  return Object.fromEntries(entries);
};

const mapShares = (
  response: SambaSharepointsResponse | undefined
): SambaShareEntry[] => {
  const sharepoints = response?.data ?? [];

  return sharepoints
    .map((details, index) => {
      const normalizedDetails = normalizeShareDetails(details);
      const { name, ...restDetails } = normalizedDetails;
      const shareName = typeof name === 'string' ? name : `share-${index + 1}`;

      return {
        name: shareName,
        details: restDetails,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'fa-IR'));
};

export const useSambaShares = () =>
  useQuery<SambaSharepointsResponse, Error, SambaShareEntry[]>({
    queryKey: sambaSharesQueryKey,
    queryFn: fetchSambaShares,
    // refetchInterval: 10000,
    select: mapShares,
  });

export type UseSambaSharesReturn = ReturnType<typeof useSambaShares>;
