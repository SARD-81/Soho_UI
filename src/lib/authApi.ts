import axios, { type AxiosInstance } from 'axios';
import axiosInstance from './axiosInstance';

const resolveBaseUrl = () => {
  const explicit = import.meta.env.VITE_AUTH_API_BASE_URL;
  if (explicit != null && String(explicit).trim() !== '') {
    return ensureTrailingSlash(String(explicit));
  }

  const fallback = import.meta.env.VITE_API_BASE_URL;
  if (fallback != null && String(fallback).trim() !== '') {
    return ensureTrailingSlash(ensureAuthSuffix(String(fallback)));
  }

  return '';
};

const ensureTrailingSlash = (url: string) =>
  url.endsWith('/') ? url : `${url}/`;

const ensureAuthSuffix = (url: string) => {
  const normalized = url.replace(/\/+$/, '');
  if (normalized.endsWith('/auth') || normalized.endsWith('/auth/')) {
    return normalized;
  }
  return `${normalized}/api/auth`;
};

const authClient: AxiosInstance = axios.create({
  baseURL: resolveBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export const login = async ({
  username,
  password,
}: LoginPayload): Promise<LoginResponse> => {
  const { data } = await authClient.post<LoginResponse>('token/', {
    username,
    password,
  });
  return data;
};

export interface RefreshResponse {
  access: string;
}

export const refreshAccessToken = async (
  refresh: string
): Promise<RefreshResponse> => {
  const { data } = await authClient.post<RefreshResponse>('token/refresh/', {
    refresh,
  });
  return data;
};

export const verifyAccessToken = async (token: string): Promise<void> => {
  await authClient.post('token/verify/', { token });
};

export const logout = async (refresh: string): Promise<void> => {
  await axiosInstance.post('/api/system/ui-user/logout/', { refresh });
};
