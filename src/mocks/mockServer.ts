import type { Method } from 'axios';
import {
  AxiosError,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import type { RawSambaUserDetails } from '../@types/samba';
import type { DirPermissionsEntry, MockOsUser, MockState } from './mockState';
import { mockState } from './mockState';
import {
  updateCpuMetrics,
  updateDiskMetrics,
  updateMemoryMetrics,
  updateNetworkMetrics,
  updateZpoolMetrics,
} from './telemetry';

interface MockRouteContext {
  config: InternalAxiosRequestConfig;
  path: string;
  searchParams: URLSearchParams;
  match: RegExpMatchArray;
  state: MockState;
}

interface MockRouteResult {
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
  data?: unknown;
}

type MockRouteHandler = (
  context: MockRouteContext
) => MockRouteResult | Promise<MockRouteResult>;

interface MockRoute {
  method: Method | string;
  pattern: RegExp;
  handler: MockRouteHandler;
}

const STATUS_TEXT: Record<number, string> = {
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  204: 'No Content',
  400: 'Bad Request',
  401: 'Unauthorized',
  404: 'Not Found',
  409: 'Conflict',
};

const normalizeMethod = (method?: string) => (method ?? 'get').toUpperCase();

const getStatusText = (status: number) => STATUS_TEXT[status] ?? 'OK';

const resolveUrl = (config: InternalAxiosRequestConfig) => {
  const targetUrl = config.url ?? '';
  const base = config.baseURL ?? 'http://localhost';
  try {
    const url = new URL(targetUrl, base);
    return {
      path: url.pathname,
      searchParams: url.searchParams,
    };
  } catch {
    return {
      path: targetUrl,
      searchParams: new URLSearchParams(),
    };
  }
};

const parseRequestBody = (config: InternalAxiosRequestConfig) => {
  const { data } = config;

  if (!data) {
    return undefined;
  }

  if (typeof data === 'string') {
    try {
      return data ? JSON.parse(data) : undefined;
    } catch {
      return undefined;
    }
  }

  return data as Record<string, unknown>;
};

const createAxiosError = (
  message: string,
  config: InternalAxiosRequestConfig,
  status: number,
  data?: unknown
) => {
  return new AxiosError(
    message,
    status >= 500 ? 'ERR_BAD_RESPONSE' : 'ERR_BAD_REQUEST',
    config,
    undefined,
    {
      data,
      status,
      statusText: getStatusText(status),
      headers: {},
      config,
    } as AxiosResponse
  );
};

const toBoolean = (value: unknown) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return ['1', 'true', 'yes', 'y', 'on'].includes(normalized);
  }

  return false;
};

const ensureDirectoryEntry = (
  state: MockState,
  path: string,
  entry: Partial<DirPermissionsEntry>
) => {
  const existing = state.dirPermissions[path] ?? { ok: true };
  state.dirPermissions[path] = {
    ...existing,
    ...entry,
    ok: entry.ok ?? existing.ok ?? true,
  };
};

const deriveShareName = (fullPath: string) => {
  const segments = fullPath.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  return lastSegment && lastSegment.trim().length > 0
    ? lastSegment.trim()
    : fullPath.replace(/\W+/g, '_') || 'share';
};

const upsertOsUser = (state: MockState, payload: MockOsUser) => {
  const existingIndex = state.osUsers.findIndex(
    (user) => user.username === payload.username
  );

  if (existingIndex >= 0) {
    state.osUsers[existingIndex] = {
      ...state.osUsers[existingIndex],
      ...payload,
    };
    return;
  }

  state.osUsers.push(payload);
};

const mockRoutes: MockRoute[] = [
  {
    method: 'GET',
    pattern: /^\/auth-token\/?$/,
    handler: () => ({
      status: 405,
      data: { detail: 'Method not allowed' },
    }),
  },
  {
    method: 'POST',
    pattern: /^\/auth-token\/?$/,
    handler: ({ config, state }) => {
      const body = parseRequestBody(config) ?? {};
      const username = String(body.username ?? '').trim();
      const password = String(body.password ?? '').trim();

      if (!username || !password) {
        throw createAxiosError(
          'نام کاربری یا کلمه عبور ارسال نشده است.',
          config,
          400,
          { detail: 'نام کاربری یا کلمه عبور معتبر نیست.' }
        );
      }

      const credential = state.credentials[username];

      if (!credential || credential.password !== password) {
        throw createAxiosError(
          'نام کاربری یا کلمه عبور اشتباه است.',
          config,
          401,
          { detail: 'اطلاعات احراز هویت نامعتبر است.' }
        );
      }

      return {
        status: 200,
        data: { token: credential.token },
      };
    },
  },
  {
    method: 'GET',
    pattern: /^\/api\/zpool\/?$/,
    handler: ({ state }) => {
      const zpool = updateZpoolMetrics(state);
      return {
        status: 200,
        data: { data: zpool.capacities },
      };
    },
  },
  {
    method: 'GET',
    pattern: /^\/api\/zpool\/([^/]+)\/?$/,
    handler: ({ match, state }) => {
      const poolName = decodeURIComponent(match[1]);
      const zpool = updateZpoolMetrics(state);
      const details = zpool.details[poolName];

      return {
        status: 200,
        data: { data: details ?? [] },
      };
    },
  },
  {
    method: 'POST',
    pattern: /^\/api\/zpool\/create\/?$/,
    handler: ({ config, state }) => {
      const body = parseRequestBody(config) ?? {};
      const poolName = String(body.pool_name ?? '').trim();
      const vdevType = String(body.vdev_type ?? '').trim() || 'disk';
      const devices = Array.isArray(body.devices)
        ? (body.devices as string[])
        : [];

      if (!poolName) {
        throw createAxiosError('نام Pool ارسال نشده است.', config, 400, {
          detail: 'نام Pool الزامی است.',
        });
      }

      if (state.zpool.capacities.some((pool) => pool.name === poolName)) {
        throw createAxiosError(
          'Pool دیگری با این نام وجود دارد.',
          config,
          409,
          { detail: 'Pool با این نام از قبل وجود دارد.' }
        );
      }

      state.zpool.capacities.push({
        name: poolName,
        size: `${Math.max(devices.length, 1) * 500} GiB`,
        alloc: '0 B',
        free: `${Math.max(devices.length, 1) * 500} GiB`,
        capacity: '0%',
        dedup: '1.00x',
        fragmentation: '0%',
        health: 'ONLINE',
        vdev_type: vdevType,
        devices,
      });

      state.zpool.details[poolName] = [
        {
          name: poolName,
          state: 'ONLINE',
          status: 'Healthy',
          size: `${Math.max(devices.length, 1) * 500} GiB`,
          alloc: '0 B',
          free: `${Math.max(devices.length, 1) * 500} GiB`,
          fragmentation: '0%',
          dedup: '1.00x',
          vdev_type: vdevType,
          devices,
        },
      ];

      return {
        status: 201,
        data: { detail: 'Pool جدید با موفقیت ساخته شد.' },
      };
    },
  },
  {
    method: 'DELETE',
    pattern: /^\/api\/zpool\/delete\/?$/,
    handler: ({ config, state }) => {
      const body = parseRequestBody(config) ?? {};
      const poolName = String(body.pool_name ?? '').trim();

      if (!poolName) {
        throw createAxiosError('Pool مورد نظر مشخص نشده است.', config, 400, {
          detail: 'نام Pool الزامی است.',
        });
      }

      state.zpool.capacities = state.zpool.capacities.filter(
        (pool) => pool.name !== poolName
      );
      delete state.zpool.details[poolName];

      Object.keys(state.volumes).forEach((volumeName) => {
        if (volumeName.startsWith(`${poolName}/`)) {
          delete state.volumes[volumeName];
        }
      });

      return {
        status: 200,
        data: { detail: 'Pool حذف شد.' },
      };
    },
  },
  {
    method: 'GET',
    pattern: /^\/api\/volume\/\/?$/,
    handler: ({ state }) => ({
      status: 200,
      data: { data: state.volumes },
    }),
  },
  {
    method: 'POST',
    pattern: /^\/api\/volume\/create\/?$/,
    handler: ({ config, state }) => {
      const body = parseRequestBody(config) ?? {};
      const volumeName = String(body.volume_name ?? '').trim();
      const volsize = String(body.volsize ?? '').trim();

      if (!volumeName) {
        throw createAxiosError('نام Volume ارسال نشده است.', config, 400, {
          detail: 'نام Volume الزامی است.',
        });
      }

      state.volumes[volumeName] = {
        name: volumeName,
        mountpoint: `/${volumeName}`,
        type: 'filesystem',
        compression: 'lz4',
        volsize,
        creation: new Date().toISOString(),
      };

      ensureDirectoryEntry(state, `/${volumeName}`, {
        ok: true,
      });

      return {
        status: 201,
        data: { detail: 'Volume جدید ایجاد شد.' },
      };
    },
  },
  {
    method: 'DELETE',
    pattern: /^\/api\/volume\/delete\/?$/,
    handler: ({ config, state }) => {
      const body = parseRequestBody(config) ?? {};
      const volumeName = String(body.volume_name ?? '').trim();

      if (!volumeName) {
        throw createAxiosError('Volume مورد نظر مشخص نشده است.', config, 400, {
          detail: 'نام Volume الزامی است.',
        });
      }

      delete state.volumes[volumeName];

      return {
        status: 200,
        data: { detail: 'Volume حذف شد.' },
      };
    },
  },
  {
    method: 'GET',
    pattern: /^\/api\/disk\/?$/,
    handler: ({ state }) => ({
      status: 200,
      data: updateDiskMetrics(state),
    }),
  },
  {
    method: 'GET',
    pattern: /^\/api\/disk\/wwn\/map\/?$/,
    handler: ({ state }) => ({
      status: 200,
      data: { data: state.diskWwnMap },
    }),
  },
  {
    method: 'GET',
    pattern: /^\/api\/net\/?$/,
    handler: ({ state }) => ({
      status: 200,
      data: updateNetworkMetrics(state),
    }),
  },
  {
    method: 'POST',
    pattern: /^\/api\/net\/nicfile\/([^/]+)\/ip\/edit\/?$/,
    handler: ({ match, config, state }) => {
      const interfaceName = decodeURIComponent(match[1]);
      const body = parseRequestBody(config) ?? {};
      const ip = String(body.ip ?? '').trim();
      const netmask = String(body.netmask ?? '').trim();

      if (!ip || !netmask) {
        throw createAxiosError('آی‌پی یا نت‌ماسک معتبر نیست.', config, 400, {
          detail: 'ip و netmask الزامی هستند.',
        });
      }

      const networkInterface = state.network.interfaces[interfaceName];

      if (!networkInterface) {
        throw createAxiosError('اینترفیس مورد نظر یافت نشد.', config, 404, {
          detail: 'رابط شبکه وجود ندارد.',
        });
      }

      const addresses = Array.isArray(networkInterface.addresses)
        ? [...networkInterface.addresses]
        : [];

      const ipv4Index = addresses.findIndex(
        (item) => item && typeof item === 'object' && item.family === 'IPv4'
      );

      const updatedEntry = {
        address: ip,
        netmask,
        family: 'IPv4',
      };

      if (ipv4Index >= 0) {
        addresses[ipv4Index] = {
          ...addresses[ipv4Index],
          ...updatedEntry,
        };
      } else {
        addresses.unshift(updatedEntry);
      }

      networkInterface.addresses = addresses;

      return {
        status: 200,
        data: { detail: 'آدرس IP با موفقیت به‌روزرسانی شد.' },
      };
    },
  },
  {
    method: 'GET',
    pattern: /^\/api\/cpu\/?$/,
    handler: ({ state }) => ({
      status: 200,
      data: updateCpuMetrics(state),
    }),
  },
  {
    method: 'GET',
    pattern: /^\/api\/memory\/?$/,
    handler: ({ state }) => ({
      status: 200,
      data: updateMemoryMetrics(state),
    }),
  },
  {
    method: 'GET',
    pattern: /^\/api\/service\/?$/,
    handler: ({ state }) => ({
      status: 200,
      data: { data: state.services },
    }),
  },
  {
    method: 'POST',
    pattern: /^\/api\/service\/?$/,
    handler: ({ config, state }) => {
      const body = parseRequestBody(config) ?? {};
      const action = String(body.action ?? '').trim();
      const serviceName = String(body.service ?? '').trim();

      if (!serviceName) {
        throw createAxiosError('نام سرویس ارسال نشده است.', config, 400, {
          detail: 'نام سرویس الزامی است.',
        });
      }

      const service = state.services[serviceName];

      if (!service) {
        throw createAxiosError('سرویس یافت نشد.', config, 404, {
          detail: 'سرویس مورد نظر وجود ندارد.',
        });
      }

      if (action === 'stop') {
        service.active_state = 'inactive';
        service.sub_state = 'dead';
        service.status = 'stopped';
        service.last_action = 'stopped via mock service';
      } else if (action === 'start') {
        service.active_state = 'active';
        service.sub_state = 'running';
        service.status = 'running';
        service.last_action = 'started via mock service';
      } else if (action === 'restart') {
        service.active_state = 'active';
        service.sub_state = 'running';
        service.status = 'running';
        service.last_action = 'restarted via mock service';
        service.last_restart = new Date().toISOString();
      } else {
        throw createAxiosError('عملیات نامعتبر است.', config, 400, {
          detail: 'نوع عملیات پشتیبانی نمی‌شود.',
        });
      }

      return {
        status: 200,
        data: { data: state.services },
      };
    },
  },
  {
    method: 'GET',
    pattern: /^\/api\/os\/user\/?$/,
    handler: ({ config, searchParams, state }) => {
      const includeSystemParam =
        (config.params?.include_system as unknown) ??
        searchParams.get('include_system');
      const includeSystem = toBoolean(includeSystemParam);

      const users = includeSystem
        ? state.osUsers
        : state.osUsers.filter((user) => !user.isSystem);

      const data = users.reduce<Record<string, Record<string, unknown>>>(
        (accumulator, user) => {
          accumulator[user.username] = {
            username: user.username,
            full_name: user.fullName,
            uid: user.uid,
            gid: user.gid,
            home_directory: user.home,
            login_shell: user.shell,
            has_samba_user: user.hasSambaUser ?? false,
          };

          return accumulator;
        },
        {}
      );

      return {
        status: 200,
        data: { data },
      };
    },
  },
  {
    method: 'POST',
    pattern: /^\/api\/os\/user\/create\/?$/,
    handler: ({ config, state }) => {
      const body = parseRequestBody(config) ?? {};
      const username = String(body.username ?? '').trim();
      const loginShell = String(body.login_shell ?? body.shell ?? '').trim();

      if (!username) {
        throw createAxiosError('نام کاربری ارسال نشده است.', config, 400, {
          detail: 'نام کاربری الزامی است.',
        });
      }

      upsertOsUser(state, {
        username,
        fullName: `${username} user`,
        uid: String(1500 + state.osUsers.length),
        gid: String(1500 + state.osUsers.length),
        home: `/home/${username}`,
        shell: loginShell || '/bin/bash',
        hasSambaUser: false,
      });

      ensureDirectoryEntry(state, `/home/${username}`, {
        ok: true,
        owner: username,
        group: username,
        mode: '0750',
      });

      return {
        status: 201,
        data: { detail: 'کاربر سیستم با موفقیت ایجاد شد.' },
      };
    },
  },
  {
    method: 'GET',
    pattern: /^\/api\/samba\/user\/list\/?$/,
    handler: ({ state }) => {
      const data = Object.entries(state.sambaUsers).reduce<
        Record<string, RawSambaUserDetails>
      >((accumulator, [username, entry]) => {
        accumulator[username] = {
          ...entry.details,
          username,
          disabled: entry.disabled ? 'yes' : 'no',
        };
        return accumulator;
      }, {});

      return {
        status: 200,
        data: { data },
      };
    },
  },
  {
    method: 'POST',
    pattern: /^\/api\/samba\/user\/add\/?$/,
    handler: ({ config, state }) => {
      const body = parseRequestBody(config) ?? {};
      const username = String(body.username ?? '').trim();

      if (!username) {
        throw createAxiosError('نام کاربری ارسال نشده است.', config, 400, {
          detail: 'نام کاربری الزامی است.',
        });
      }

      state.sambaUsers[username] = {
        username,
        disabled: false,
        details: {
          username,
          domain: 'WORKGROUP',
          description: `${username} Samba account`,
          password_last_set: new Date().toISOString(),
          password_must_change: 'no',
        },
      };

      upsertOsUser(state, {
        username,
        fullName: `${username} user`,
        uid: String(1600 + state.osUsers.length),
        gid: String(1600 + state.osUsers.length),
        home: `/srv/${username}`,
        shell: '/bin/bash',
        hasSambaUser: true,
      });

      return {
        status: 201,
        data: { detail: 'کاربر سامبا ایجاد شد.' },
      };
    },
  },
  {
    method: 'POST',
    pattern: /^\/api\/samba\/user\/enable\/?$/,
    handler: ({ config, state }) => {
      const body = parseRequestBody(config) ?? {};
      const username = String(body.username ?? '').trim();

      const entry = username ? state.sambaUsers[username] : undefined;

      if (!entry) {
        throw createAxiosError('کاربر سامبا یافت نشد.', config, 404, {
          detail: 'کاربر مورد نظر وجود ندارد.',
        });
      }

      entry.disabled = false;
      entry.details = {
        ...entry.details,
        disabled: 'no',
      };

      return {
        status: 200,
        data: { detail: 'کاربر سامبا فعال شد.' },
      };
    },
  },
  {
    method: 'POST',
    pattern: /^\/api\/samba\/user\/passwd\/?$/,
    handler: ({ config, state }) => {
      const body = parseRequestBody(config) ?? {};
      const username = String(body.username ?? '').trim();

      const entry = username ? state.sambaUsers[username] : undefined;

      if (!entry) {
        throw createAxiosError('کاربر سامبا یافت نشد.', config, 404, {
          detail: 'کاربر مورد نظر وجود ندارد.',
        });
      }

      entry.details = {
        ...entry.details,
        password_last_set: new Date().toISOString(),
      };

      return {
        status: 200,
        data: { detail: 'کلمه عبور بروزرسانی شد.' },
      };
    },
  },
  {
    method: 'GET',
    pattern: /^\/api\/samba\/?$/,
    handler: ({ state }) => ({
      status: 200,
      data: { data: state.sambaShares },
    }),
  },
  {
    method: 'POST',
    pattern: /^\/api\/samba\/config\/append\/?$/,
    handler: ({ config, state }) => {
      const body = parseRequestBody(config) ?? {};
      const fullPath = String(body.full_path ?? '').trim();
      const validUsers = String(body.valid_users ?? '').trim();

      if (!fullPath || !validUsers) {
        throw createAxiosError(
          'مسیر یا کاربر مجاز ارسال نشده است.',
          config,
          400,
          { detail: 'full_path و valid_users الزامی هستند.' }
        );
      }

      const shareName = deriveShareName(fullPath);

      state.sambaShares[shareName] = {
        ...(state.sambaShares[shareName] ?? {}),
        full_path: fullPath,
        valid_users: validUsers,
        comment: `Mock share for ${shareName}`,
        browseable: 'yes',
      };

      ensureDirectoryEntry(state, fullPath, {
        ok: true,
        owner: validUsers.split(',')[0]?.trim() || validUsers,
        group: validUsers.split(',')[0]?.trim() || validUsers,
        mode: body.mode ? String(body.mode) : undefined,
      });

      return {
        status: 201,
        data: { detail: 'اشتراک سامبا ثبت شد.' },
      };
    },
  },
  {
    method: 'DELETE',
    pattern: /^\/api\/samba\/config\/remove\/?$/,
    handler: ({ config, state }) => {
      const body = parseRequestBody(config) ?? {};
      const shareName = String(body.share_name ?? '').trim();

      if (!shareName) {
        throw createAxiosError('نام اشتراک ارسال نشده است.', config, 400, {
          detail: 'نام اشتراک الزامی است.',
        });
      }

      delete state.sambaShares[shareName];

      return {
        status: 200,
        data: { detail: 'اشتراک حذف شد.' },
      };
    },
  },
  {
    method: 'POST',
    pattern: /^\/api\/dir\/create\/permissions\/?$/,
    handler: ({ config, state }) => {
      const body = parseRequestBody(config) ?? {};
      const path = String(body.path ?? '').trim();

      if (!path) {
        throw createAxiosError('مسیر ارسال نشده است.', config, 400, {
          detail: 'path الزامی است.',
        });
      }

      ensureDirectoryEntry(state, path, {
        ok: true,
        owner: body.owner ? String(body.owner) : undefined,
        group: body.group ? String(body.group) : undefined,
        mode: body.mode ? String(body.mode) : undefined,
      });

      return {
        status: 201,
        data: { ok: true },
      };
    },
  },
  {
    method: 'GET',
    pattern: /^\/api\/dir\/info\/permissions\/?$/,
    handler: ({ config, state }) => {
      const body = parseRequestBody(config) ?? {};
      const requestedPath =
        String(body?.path ?? config.params?.path ?? '').trim() || '';

      if (!requestedPath) {
        return {
          status: 200,
          data: { ok: false, error: { message: 'مسیر ارسال نشده است.' } },
        };
      }

      const entry = state.dirPermissions[requestedPath];

      if (!entry || entry.ok === false) {
        return {
          status: 200,
          data: {
            ok: false,
            error: {
              message:
                entry?.error?.message ?? 'اجازه دسترسی به این مسیر وجود ندارد.',
            },
          },
        };
      }

      return {
        status: 200,
        data: { ok: true, error: null },
      };
    },
  },
  {
    method: 'GET',
    pattern: /^\/api\/os\/power\/(restart|shutdown)\/?$/,
    handler: ({ match, state }) => {
      const action = match[1] as keyof MockState['powerActions'];
      const response = state.powerActions[action];

      return {
        status: 200,
        data: response ?? {
          status: 'scheduled',
          message: 'عملیات مورد نظر در صف قرار گرفت.',
        },
      };
    },
  },
];

export const mockAxiosAdapter: AxiosAdapter = async (config) => {
  const { path, searchParams } = resolveUrl(config);
  const method = normalizeMethod(config.method);

  for (const route of mockRoutes) {
    if (normalizeMethod(route.method) === method && route.pattern.test(path)) {
      const match = path.match(route.pattern);

      if (!match) {
        continue;
      }

      const result = await route.handler({
        config,
        path,
        searchParams,
        match,
        state: mockState,
      });

      const status = result.status ?? 200;

      return {
        data: result.data,
        status,
        statusText: result.statusText ?? getStatusText(status),
        headers: result.headers ?? {},
        config,
      } as AxiosResponse;
    }
  }

  throw createAxiosError(`No mock handler for ${method} ${path}`, config, 404, {
    detail: 'مسیر در حالت آفلاین پشتیبانی نمی‌شود.',
  });
};
