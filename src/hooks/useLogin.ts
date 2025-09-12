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
  const isMockLogin =
    import.meta.env.VITE_MOCK_LOGIN?.trim().toLowerCase() === 'true';

  if (isMockLogin) {
    // Temporary offline login; remove or disable when real server access is restored.
    if (username === 'demo' && password === 'demo') {
      return { token: 'mock-token' };
    }
    throw new Error('Invalid credentials');

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
