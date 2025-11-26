import type {
  DiskDetailResponse,
  DiskInventoryItem,
  DiskInventoryResponse,
  DiskPartitionStatusResponse,
} from '../@types/disk';
import axiosInstance from './axiosInstance';

const DEFAULT_INVENTORY_ERROR_MESSAGE = 'امکان دریافت اطلاعات دیسک‌ها وجود ندارد.';
const DEFAULT_DETAIL_ERROR_MESSAGE = 'امکان دریافت جزئیات دیسک وجود ندارد.';
const DEFAULT_PARTITION_STATUS_ERROR_MESSAGE =
  'امکان بررسی وضعیت پارتیشن‌های دیسک وجود ندارد.';

export const normalizeErrorMessage = (
  message: string | null | undefined,
  fallback: string
) => {
  const normalized = String(message ?? '').trim();
  return normalized.length > 0 ? normalized : fallback;
};

export const fetchDiskInventory = async (): Promise<DiskInventoryItem[]> => {
  const { data } = await axiosInstance.get<DiskInventoryResponse>('/api/disk/');

  if (data.ok === false) {
    throw new Error(normalizeErrorMessage(data.error, DEFAULT_INVENTORY_ERROR_MESSAGE));
  }

  return Array.isArray(data.data) ? data.data : [];
};

export const fetchDiskDetail = async (
  diskName: string
): Promise<DiskInventoryItem | null> => {
  const normalizedDiskName = diskName.trim();

  if (!normalizedDiskName) {
    return null;
  }

  const { data } = await axiosInstance.get<DiskDetailResponse>(
    `/api/disk/${encodeURIComponent(normalizedDiskName)}/`
  );

  if (data.ok === false) {
    throw new Error(normalizeErrorMessage(data.error, DEFAULT_DETAIL_ERROR_MESSAGE));
  }

  return data.data ?? null;
};

export const fetchDiskPartitionStatus = async (diskName: string): Promise<boolean> => {
  const normalizedDiskName = diskName.trim();

  if (!normalizedDiskName) {
    return false;
  }

  const { data } = await axiosInstance.get<DiskPartitionStatusResponse>(
    `/api/disk/${encodeURIComponent(normalizedDiskName)}/has-partitions/`
  );

  if (data.ok === false) {
    throw new Error(
      normalizeErrorMessage(data.error, `${DEFAULT_PARTITION_STATUS_ERROR_MESSAGE} (${diskName})`)
    );
  }

  return Boolean(data.data?.has_partitions);
};
