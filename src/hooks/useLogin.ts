import { useMutation } from '@tanstack/react-query';
import { login, type LoginPayload, type LoginResponse } from '../lib/authApi';

export const useLogin = () => {
  return useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: login,
  });
};
