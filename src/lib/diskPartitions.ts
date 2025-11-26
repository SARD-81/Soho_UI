import type { DiskPartitionCountResponse } from '../@types/disk';
import axiosInstance from './axiosInstance';

const DEFAULT_PARTITION_COUNT_ERROR_MESSAGE =
  'امکان دریافت اطلاعات پارتیشن دیسک وجود ندارد.';

export const fetchDiskPartitionCount = async (
  diskName: string
): Promise<number> => {
  const normalizedDiskName = diskName.trim();

  if (!normalizedDiskName) {
    return 0;
  }

  const { data } = await axiosInstance.get<DiskPartitionCountResponse>(
    `/api/disk/${encodeURIComponent(normalizedDiskName)}/partition-count/`
  );

  if (data.ok === false) {
    throw new Error(data.error ?? DEFAULT_PARTITION_COUNT_ERROR_MESSAGE);
  }

  const partitionCount = data.data?.partition_count;
  return typeof partitionCount === 'number' ? partitionCount : 0;
};

export default fetchDiskPartitionCount;