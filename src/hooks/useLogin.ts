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
  if (import.meta.env.VITE_MOCK_LOGIN === 'true') {
    // Temporary offline login; remove or disable when real server access is restored.
    if (username === 'demo' && password === 'demo') {
      return Promise.resolve({ token: 'mock-token' });
    }
    return Promise.reject(new Error('Invalid credentials'));
  }

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
