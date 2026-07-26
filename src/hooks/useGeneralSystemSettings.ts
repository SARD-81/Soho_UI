import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  HostnameInfo,
  HwclockRequest,
  HwclockResult,
  ManageNtpPayload,
  SetHostnamePayload,
  SetManualTimePayload,
  SetTimezonePayload,
  SystemTimeInfo,
  SystemVersionInfo,
} from '../@types/generalSettings';
import axiosInstance from '../lib/axiosInstance';
import {
  normalizeHostnameInfo,
  normalizeHwclockResult,
  normalizeSystemTimeInfo,
  normalizeSystemVersion,
  normalizeTimezoneList,
} from '../utils/generalSettings';

const SYSTEM_TIME_ENDPOINT = '/api/system/time/';
const TIMEZONE_LIST_ENDPOINT = '/api/system/time/zones/';
const SET_TIMEZONE_ENDPOINT = '/api/system/time/set-timezone/';
const MANAGE_NTP_ENDPOINT = '/api/system/time/ntp/';
const SET_MANUAL_TIME_ENDPOINT = '/api/system/time/set-time/';
const MANAGE_HWCLOCK_ENDPOINT = '/api/system/time/hwclock/';
const HOSTNAME_ENDPOINT = '/api/system/hostname/';
const SET_HOSTNAME_ENDPOINT = '/api/system/hostname/set/';
const SYSTEM_VERSION_ENDPOINT = '/api/system/version/';

export const generalSettingsQueryKeys = {
  time: ['general-settings', 'time'] as const,
  timezones: ['general-settings', 'timezones'] as const,
  hostname: ['general-settings', 'hostname'] as const,
  version: ['general-settings', 'version'] as const,
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const readResponseMessage = (payload: unknown, fallback: string) => {
  if (!isRecord(payload)) {
    return fallback;
  }

  const message = payload.message;
  return typeof message === 'string' && message.trim().length > 0
    ? message.trim()
    : fallback;
};

const assertSuccessfulResponse = (payload: unknown, fallback: string) => {
  if (isRecord(payload) && payload.ok === false) {
    throw new Error(readResponseMessage(payload, fallback));
  }

  return payload;
};

const fetchSystemTimeInfo = async (
  signal?: AbortSignal
): Promise<SystemTimeInfo> => {
  const response = await axiosInstance.get<unknown>(SYSTEM_TIME_ENDPOINT, {
    signal,
  });
  return normalizeSystemTimeInfo(
    assertSuccessfulResponse(
      response.data,
      'دریافت اطلاعات زمان سیستم با خطا مواجه شد.'
    )
  );
};

const fetchTimezoneList = async (signal?: AbortSignal): Promise<string[]> => {
  const response = await axiosInstance.get<unknown>(TIMEZONE_LIST_ENDPOINT, {
    signal,
  });
  return normalizeTimezoneList(
    assertSuccessfulResponse(
      response.data,
      'دریافت فهرست منطقه‌های زمانی با خطا مواجه شد.'
    )
  );
};

const fetchHostnameInfo = async (
  signal?: AbortSignal
): Promise<HostnameInfo> => {
  const response = await axiosInstance.get<unknown>(HOSTNAME_ENDPOINT, {
    signal,
  });
  return normalizeHostnameInfo(
    assertSuccessfulResponse(
      response.data,
      'دریافت نام میزبان با خطا مواجه شد.'
    )
  );
};

const fetchSystemVersion = async (
  signal?: AbortSignal
): Promise<SystemVersionInfo> => {
  const response = await axiosInstance.get<unknown>(SYSTEM_VERSION_ENDPOINT, {
    signal,
  });
  return normalizeSystemVersion(
    assertSuccessfulResponse(
      response.data,
      'دریافت نسخه سامانه با خطا مواجه شد.'
    )
  );
};

const setHostnameRequest = async (payload: SetHostnamePayload) => {
  const response = await axiosInstance.post<unknown>(SET_HOSTNAME_ENDPOINT, payload);
  assertSuccessfulResponse(response.data, 'تغییر نام میزبان با خطا مواجه شد.');
  return readResponseMessage(response.data, 'نام میزبان با موفقیت تغییر کرد.');
};

const setTimezoneRequest = async (payload: SetTimezonePayload) => {
  const response = await axiosInstance.post<unknown>(SET_TIMEZONE_ENDPOINT, payload);
  assertSuccessfulResponse(response.data, 'تغییر منطقه زمانی با خطا مواجه شد.');
  return readResponseMessage(response.data, 'منطقه زمانی با موفقیت تغییر کرد.');
};

const manageNtpRequest = async (payload: ManageNtpPayload) => {
  const response = await axiosInstance.post<unknown>(MANAGE_NTP_ENDPOINT, payload);
  assertSuccessfulResponse(response.data, 'ثبت تنظیمات NTP با خطا مواجه شد.');
  return readResponseMessage(response.data, 'تنظیمات NTP با موفقیت ثبت شد.');
};

const setManualTimeRequest = async (payload: SetManualTimePayload) => {
  const response = await axiosInstance.post<unknown>(
    SET_MANUAL_TIME_ENDPOINT,
    payload
  );
  assertSuccessfulResponse(response.data, 'تنظیم دستی زمان با خطا مواجه شد.');
  return readResponseMessage(response.data, 'زمان سیستم با موفقیت تنظیم شد.');
};

const manageHwclockRequest = async (
  payload: HwclockRequest
): Promise<HwclockResult> => {
  const response = await axiosInstance.post<unknown>(MANAGE_HWCLOCK_ENDPOINT, payload);
  const responsePayload = assertSuccessfulResponse(
    response.data,
    'عملیات ساعت سخت‌افزاری با خطا مواجه شد.'
  );
  return normalizeHwclockResult(responsePayload);
};

export const useSystemTimeInfo = () =>
  useQuery<SystemTimeInfo, Error>({
    queryKey: generalSettingsQueryKeys.time,
    queryFn: ({ signal }) => fetchSystemTimeInfo(signal),
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });

export const useTimezoneList = () =>
  useQuery<string[], Error>({
    queryKey: generalSettingsQueryKeys.timezones,
    queryFn: ({ signal }) => fetchTimezoneList(signal),
    staleTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

export const useHostnameInfo = () =>
  useQuery<HostnameInfo, Error>({
    queryKey: generalSettingsQueryKeys.hostname,
    queryFn: ({ signal }) => fetchHostnameInfo(signal),
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });

export const useSystemVersion = () =>
  useQuery<SystemVersionInfo, Error>({
    queryKey: generalSettingsQueryKeys.version,
    queryFn: ({ signal }) => fetchSystemVersion(signal),
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

export const useSetHostname = () => {
  const queryClient = useQueryClient();

  return useMutation<string, Error, SetHostnamePayload>({
    mutationFn: setHostnameRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: generalSettingsQueryKeys.hostname,
      });
    },
  });
};

export const useSetTimezone = () => {
  const queryClient = useQueryClient();

  return useMutation<string, Error, SetTimezonePayload>({
    mutationFn: setTimezoneRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: generalSettingsQueryKeys.time,
      });
    },
  });
};

export const useManageNtp = () => {
  const queryClient = useQueryClient();

  return useMutation<string, Error, ManageNtpPayload>({
    mutationFn: manageNtpRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: generalSettingsQueryKeys.time,
      });
    },
  });
};

export const useSetManualTime = () => {
  const queryClient = useQueryClient();

  return useMutation<string, Error, SetManualTimePayload>({
    mutationFn: setManualTimeRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: generalSettingsQueryKeys.time,
      });
    },
  });
};

export const useManageHwclock = () => {
  const queryClient = useQueryClient();

  return useMutation<HwclockResult, Error, HwclockRequest>({
    mutationFn: manageHwclockRequest,
    onSuccess: async (_result, variables) => {
      if (variables.action !== 'show') {
        await queryClient.invalidateQueries({
          queryKey: generalSettingsQueryKeys.time,
        });
      }
    },
  });
};
