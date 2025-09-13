import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../lib/axiosInstance';

interface LoginPayload {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
}

const loginApi = async ({
  username,
  password,
}: LoginPayload): Promise<LoginResponse> => {
  const { data } = await axiosInstance.post('/auth-token/', {
    username,
    password,
  });
  return data;
};

export const useLogin = () => {
  return useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: loginApi,
  });
};
