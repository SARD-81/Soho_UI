import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../lib/axiosInstance';

const fetchMemory = async () => {
  const { data } = await axiosInstance.get('/memory');
  return data;
};

export const useMemory = () => {
  return useQuery<unknown, Error>({
    queryKey: ['memory'],
    queryFn: fetchMemory,
  });
};
