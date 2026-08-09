import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../lib/axiosInstance';

const SYSTEM_UPTIME_ENDPOINT = '/api/system/uptime/';

interface SystemUptimeApiResponse {
  ok?: boolean;
  message?: unknown;
  data?: {
    numeric?: unknown;
  };
}

const readResponseMessage = (
  payload: SystemUptimeApiResponse,
  fallback: string
): string =>
  typeof payload.message === 'string' && payload.message.trim().length > 0
    ? payload.message.trim()
    : fallback;

const fetchSystemUptimeNumeric = async (signal?: AbortSignal): Promise<string> => {
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

  return numeric.trim();
};

export const systemUptimeQueryKey = ['system', 'uptime'] as const;

/**
 * Reads only `data.numeric` from GET /api/system/uptime/.
 *
 * The dashboard intentionally does not depend on uptime_seconds,
 * human_readable, boot_time, or idle_seconds. The backend numeric format is
 * rendered as-is and refreshed once per second while the dashboard is visible.
 */
export const useSystemUptime = () =>
  useQuery<string, Error>({
    queryKey: systemUptimeQueryKey,
    queryFn: ({ signal }) => fetchSystemUptimeNumeric(signal),
    staleTime: 0,
    refetchInterval: 1_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
  });

export default useSystemUptime;
