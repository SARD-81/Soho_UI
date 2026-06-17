import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios, { type AxiosError } from 'axios';
import type {
  WebShareApiResponse,
  WebShareCreatePayload,
  WebShareDeleteParams,
  WebShareEntry,
  WebSharePermissionPayload,
  WebShareRawRecord,
} from '../@types/webshare';
import axiosInstance from '../lib/axiosInstance';

export const webSharesQueryKey = ['webshare', 'shares'] as const;

const WEB_SHARE_ENDPOINT = '/api/webshare/';
const WEB_SHARE_DELETE_ENDPOINT = '/api/webshare/delete/';
const WEB_SHARE_PERMISSION_ENDPOINT = '/api/webshare/set-permission/';

type ApiErrorResponse =
  | string
  | {
      detail?: string;
      error?: string;
      errors?: string | string[];
      message?: string;
      [key: string]: unknown;
    };

const stringifyValue = (value: unknown): string => {
  if (value == null) {
    return '—';
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : '—';
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(stringifyValue).join('، ');
  }

  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return '[object]';
    }
  }

  return String(value);
};

const asRecord = (value: unknown): WebShareRawRecord | null => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as WebShareRawRecord;
  }

  return null;
};

const readStringField = (
  record: WebShareRawRecord,
  keys: string[]
): string | null => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
  }

  return null;
};

const parseTargetName = (targetName: string) => {
  const normalized = targetName.trim();
  const separatorIndex = normalized.indexOf('_');

  if (separatorIndex <= 0 || separatorIndex >= normalized.length - 1) {
    return { poolName: '', fsName: normalized };
  }

  return {
    poolName: normalized.slice(0, separatorIndex),
    fsName: normalized.slice(separatorIndex + 1),
  };
};

const normalizeWebShareItem = (
  item: unknown,
  index: number,
  fallbackKey?: string
): WebShareEntry | null => {
  if (typeof item === 'string') {
    const targetName = item.trim();
    if (!targetName) {
      return null;
    }

    const { poolName, fsName } = parseTargetName(targetName);

    return {
      id: targetName,
      targetName,
      poolName: poolName || '—',
      fsName: fsName || '—',
      path: `/${targetName}`,
      permission: null,
      alias: null,
      root: null,
      attributes: [{ key: 'name', value: targetName }],
      raw: { name: targetName },
    };
  }

  const record = asRecord(item);
  if (!record) {
    return null;
  }

  const targetNameCandidate =
    readStringField(record, [
      'target_name',
      'targetName',
      'name',
      'share_name',
      'location_name',
      'id',
    ]) ?? fallbackKey ?? `webshare-${index + 1}`;

  const poolName =
    readStringField(record, ['pool_name', 'poolName', 'pool']) ??
    parseTargetName(targetNameCandidate).poolName;

  const fsName =
    readStringField(record, ['fs_name', 'fsName', 'filesystem', 'filesystem_name']) ??
    parseTargetName(targetNameCandidate).fsName;

  const targetName =
    targetNameCandidate.includes('_') || !poolName || !fsName
      ? targetNameCandidate
      : `${poolName}_${fsName}`;

  const root = readStringField(record, ['root', 'root_path', 'document_root']);
  const alias = readStringField(record, ['alias', 'location', 'location_path']);
  const path =
    readStringField(record, ['path', 'url', 'share_path', 'location']) ??
    alias ??
    root ??
    `/${targetName}`;

  const permission = readStringField(record, ['permission', 'mode', 'chmod']);
  const attributes = Object.entries(record).map(([key, value]) => ({
    key,
    value: stringifyValue(value),
  }));

  return {
    id: targetName,
    targetName,
    poolName: poolName || '—',
    fsName: fsName || '—',
    path,
    permission,
    alias,
    root,
    attributes,
    raw: record,
  };
};

export const normalizeWebShares = (payload: WebShareApiResponse): WebShareEntry[] => {
  const source = payload.data ?? [];
  const items: WebShareEntry[] = [];

  if (Array.isArray(source)) {
    source.forEach((item, index) => {
      const normalized = normalizeWebShareItem(item, index);
      if (normalized) {
        items.push(normalized);
      }
    });
  } else if (source && typeof source === 'object') {
    Object.entries(source as Record<string, unknown>).forEach(([key, value], index) => {
      const recordValue = asRecord(value);
      const normalized = normalizeWebShareItem(
        recordValue ? { ...recordValue, target_name: recordValue.target_name ?? key } : value,
        index,
        key
      );
      if (normalized) {
        items.push(normalized);
      }
    });
  }

  return items.sort((a, b) => a.targetName.localeCompare(b.targetName, 'fa-IR'));
};

export const extractWebShareErrorMessage = (
  error: AxiosError<ApiErrorResponse> | Error
) => {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.message;
  }

  const payload = error.response?.data;

  if (!payload) {
    return error.message;
  }

  if (typeof payload === 'string') {
    return payload;
  }

  if (payload.detail && typeof payload.detail === 'string') {
    return payload.detail;
  }

  if (payload.message && typeof payload.message === 'string') {
    return payload.message;
  }

  if (payload.error && typeof payload.error === 'string') {
    return payload.error;
  }

  if (payload.errors) {
    if (Array.isArray(payload.errors)) {
      return payload.errors.join('، ');
    }

    if (typeof payload.errors === 'string') {
      return payload.errors;
    }
  }

  return error.message;
};

const fetchWebShares = async (): Promise<WebShareApiResponse> => {
  const { data } = await axiosInstance.get<WebShareApiResponse>(WEB_SHARE_ENDPOINT, {
    params: { detail: true, save_to_db: false },
  });

  return data;
};

export const useWebShares = () =>
  useQuery<WebShareApiResponse, Error, WebShareEntry[]>({
    queryKey: webSharesQueryKey,
    queryFn: fetchWebShares,
    select: normalizeWebShares,
    staleTime: 15_000,
  });

export const useCreateWebShare = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, AxiosError<ApiErrorResponse>, WebShareCreatePayload>({
    mutationFn: async (payload) => {
      await axiosInstance.post(WEB_SHARE_ENDPOINT, {
        ...payload,
        save_to_db: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: webSharesQueryKey });
    },
  });
};

export const useDeleteWebShare = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, AxiosError<ApiErrorResponse>, WebShareDeleteParams>({
    mutationFn: async (params) => {
      await axiosInstance.delete(WEB_SHARE_DELETE_ENDPOINT, {
        params: {
          ...params,
          save_to_db: false,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: webSharesQueryKey });
    },
  });
};

export const useSetWebSharePermission = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, AxiosError<ApiErrorResponse>, WebSharePermissionPayload>({
    mutationFn: async (payload) => {
      await axiosInstance.post(WEB_SHARE_PERMISSION_ENDPOINT, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: webSharesQueryKey });
    },
  });
};
