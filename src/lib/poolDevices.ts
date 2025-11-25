import axiosInstance from './axiosInstance';
import extractApiErrorMessage from '../utils/apiError';

interface PoolDeviceEntry {
  disk_name?: string | null;
}

interface PoolDevicesResponse {
  ok?: boolean;
  error?: unknown;
  data?: PoolDeviceEntry[] | null;
}

export const DEFAULT_FETCH_POOL_DEVICES_ERROR_MESSAGE =
  'امکان دریافت دیسک‌های متصل به فضای یکپارچه وجود ندارد.';

export const fetchPoolDeviceNames = async (poolName: string) => {
  const encodedPoolName = encodeURIComponent(poolName);

  try {
    const response = await axiosInstance.get<PoolDevicesResponse>(
      `/api/zpool/${encodedPoolName}/devices/`
    );

    if (response.data?.ok === false) {
      const errorDetail = response.data?.error;
      const errorMessage =
        typeof errorDetail === 'string' && errorDetail.trim().length > 0
          ? errorDetail
          : DEFAULT_FETCH_POOL_DEVICES_ERROR_MESSAGE;
      throw new Error(errorMessage);
    }

    const devices = response.data?.data ?? [];

    return devices
      .map((device) => device.disk_name?.trim())
      .filter((diskName): diskName is string => Boolean(diskName));
  } catch (error) {
    throw new Error(
      extractApiErrorMessage(error, DEFAULT_FETCH_POOL_DEVICES_ERROR_MESSAGE)
    );
  }
};

export default fetchPoolDeviceNames;
