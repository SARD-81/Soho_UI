import axiosInstance from './axiosInstance';
import extractApiErrorMessage from '../utils/apiError';

export const DEFAULT_CLEAR_DISK_ERROR_MESSAGE =
  'امکان پاکسازی ZFS دیسک متصل به فضای یکپارچه وجود ندارد.';
export const DEFAULT_WIPE_DISK_ERROR_MESSAGE =
  'امکان پاکسازی دیسک متصل به فضای یکپارچه وجود ندارد.';

export interface CleanupDiskResult {
  clearZfsSucceeded: boolean;
  clearZfsError?: string;
}

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

export const cleanupDisk = async (
  diskName: string
): Promise<CleanupDiskResult> => {
  let clearZfsError: string | undefined;

  try {
    await clearDiskZfs(diskName);
  } catch (error) {
    clearZfsError = error instanceof Error ? error.message : String(error);
  }

  await wipeDisk(diskName);

  return {
    clearZfsSucceeded: !clearZfsError,
    clearZfsError,
  };
};
