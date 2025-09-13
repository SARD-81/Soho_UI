import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../lib/axiosInstance';

const fetchNetwork = async () => {
  const { data } = await axiosInstance.get('/network');
  return data;
};

export const useNetwork = () => {
  return useQuery<unknown, Error>({
    queryKey: ['network'],
    queryFn: fetchNetwork,
  });
};
