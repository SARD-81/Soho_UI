import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../lib/axiosInstance';

const SYSTEM_UPTIME_ENDPOINT = '/api/system/uptime/';

interface SystemUptimeApiResponse {
  ok?: boolean;
  message?: unknown;
  data?: {
    numeric?: unknown;
    human_readable?: unknown;
  };
}

export interface SystemUptimeInfo {
  numeric: string;
  humanReadable: string | null;
}

const readResponseMessage = (
  payload: SystemUptimeApiResponse,
  fallback: string
): string =>
  typeof payload.message === 'string' && payload.message.trim().length > 0
    ? payload.message.trim()
    : fallback;

const fetchSystemUptime = async (
  signal?: AbortSignal
): Promise<SystemUptimeInfo> => {
  const response = await axiosInstance.get<SystemUptimeApiResponse>(
    SYSTEM_UPTIME_ENDPOINT,
    { signal }
  );

  const payload = response.data;

  if (payload.ok === false) {
    throw new Error(
      readResponseMessage(payload, 'دریافت آپ‌تایم سامانه با خطا مواجه شد.')
    );
  }

  const numeric = payload.data?.numeric;
  if (typeof numeric !== 'string' || numeric.trim().length === 0) {
    throw new Error('مقدار numeric در پاسخ آپ‌تایم سامانه موجود نیست.');
  }

  const humanReadable = payload.data?.human_readable;

  return {
    numeric: numeric.trim(),
    humanReadable:
      typeof humanReadable === 'string' && humanReadable.trim().length > 0
        ? humanReadable.trim()
        : null,
  };
};

export const systemUptimeQueryKey = ['system', 'uptime'] as const;

/**
 * Reads `data.numeric` for the compact dashboard value and
 * `data.human_readable` for the explanatory tooltip.
 * Other uptime response fields intentionally stay outside the presentation API.
 */
export const useSystemUptime = () =>
  useQuery<SystemUptimeInfo, Error>({
    queryKey: systemUptimeQueryKey,
    queryFn: ({ signal }) => fetchSystemUptime(signal),
    staleTime: 0,
    refetchInterval: 1_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
  });

export default useSystemUptime;
