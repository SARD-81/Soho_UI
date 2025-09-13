import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../lib/axiosInstance';

const fetchCpu = async () => {
  const { data } = await axiosInstance.get('/cpu');
  return data;
};

export const useCpu = () => {
  return useQuery<unknown, Error>({
    queryKey: ['cpu'],
    queryFn: fetchCpu,
  });
};
