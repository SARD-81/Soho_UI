import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../lib/axiosInstance';

const fetchDisk = async () => {
  const { data } = await axiosInstance.get('/disk');
  return data;
};

export const useDisk = () => {
  return useQuery<unknown, Error>({
    queryKey: ['disk'],
    queryFn: fetchDisk,
  });
};
