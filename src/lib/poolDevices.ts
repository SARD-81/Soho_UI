import axiosInstance from './axiosInstance';
import extractApiErrorMessage from '../utils/apiError';

export interface PoolDeviceEntry {
  disk_name?: string | null;
  vdev_type?: string | null;
  vdevType?: string | null;
}

interface PoolDevicesResponse {
  ok?: boolean;
  error?: unknown;
  data?: PoolDeviceEntry[] | null;
}

export const DEFAULT_FETCH_POOL_DEVICES_ERROR_MESSAGE =
  'امکان دریافت دیسک‌های متصل به فضای یکپارچه وجود ندارد.';

export const fetchPoolDevices = async (poolName: string) => {
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

    return response.data?.data ?? [];
  } catch (error) {
    throw new Error(
      extractApiErrorMessage(error, DEFAULT_FETCH_POOL_DEVICES_ERROR_MESSAGE)
    );
  }
};

export const fetchPoolDeviceNames = async (poolName: string) => {
  const devices = await fetchPoolDevices(poolName);

  return devices
    .map((device) => device.disk_name?.trim())
    .filter((diskName): diskName is string => Boolean(diskName));
};

export const fetchPoolVdevType = async (poolName: string) => {
  const devices = await fetchPoolDevices(poolName);

  const vdevType = devices
    .map((device) => device.vdev_type ?? device.vdevType ?? '')
    .map((type) => type?.trim())
    .find((type) => Boolean(type));

  return vdevType ?? '';
};

export default fetchPoolDeviceNames;
