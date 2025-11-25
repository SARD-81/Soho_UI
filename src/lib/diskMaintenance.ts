import axiosInstance from './axiosInstance';
import extractApiErrorMessage from '../utils/apiError';

export const DEFAULT_CLEAR_DISK_ERROR_MESSAGE =
  'امکان پاکسازی ZFS دیسک متصل به فضای یکپارچه وجود ندارد.';
export const DEFAULT_WIPE_DISK_ERROR_MESSAGE =
  'امکان پاکسازی دیسک متصل به فضای یکپارچه وجود ندارد.';

export const clearDiskZfs = async (diskName: string) => {
  const encodedDiskName = encodeURIComponent(diskName);

  try {
    await axiosInstance.post(`/api/disk/${encodedDiskName}/clear-zfs/`);
  } catch (error) {
    throw new Error(
      extractApiErrorMessage(error, `${DEFAULT_CLEAR_DISK_ERROR_MESSAGE} (${diskName})`)
    );
  }
};

export const wipeDisk = async (diskName: string) => {
  const encodedDiskName = encodeURIComponent(diskName);

  try {
    await axiosInstance.post(`/api/disk/${encodedDiskName}/wipe/`);
  } catch (error) {
    throw new Error(
      extractApiErrorMessage(error, `${DEFAULT_WIPE_DISK_ERROR_MESSAGE} (${diskName})`)
    );
  }
};

export const cleanupDisk = async (diskName: string) => {
  await clearDiskZfs(diskName);
  await wipeDisk(diskName);
};