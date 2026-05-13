import type { AxiosAdapter, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface MockRouteContext { config: AxiosRequestConfig; path: string; method: string; query: URLSearchParams; body: unknown; params: Record<string, string>; state: unknown }
export interface MockRouteResult { status?: number; data?: unknown; headers?: Record<string, string>; }
export type MockRouteHandler = (ctx: MockRouteContext) => MockRouteResult | Promise<MockRouteResult>;
export interface MockRoute { method: string; pattern: RegExp; handler: MockRouteHandler; }

const statusTextMap: Record<number, string> = { 200: 'OK', 201: 'Created', 204: 'No Content', 400: 'Bad Request', 401: 'Unauthorized', 404: 'Not Found', 409: 'Conflict', 500: 'Internal Server Error' };
const parseBody = (data: unknown) => { if (typeof data === 'string') { try { return JSON.parse(data); } catch { return data; } } return data ?? {}; };

export const createMockAdapter = (routes: MockRoute[], state: unknown, delay = 120): AxiosAdapter => async (config) => {
  const fullUrl = new URL(config.url ?? '', config.baseURL ?? 'http://localhost');
  const path = fullUrl.pathname;
  const method = (config.method ?? 'GET').toUpperCase();
  const query = fullUrl.searchParams;
  const body = parseBody(config.data);

  const route = routes.find((r) => r.method === method && r.pattern.test(path));
  await new Promise((r) => setTimeout(r, delay));

  const makeResponse = (status: number, data: unknown): AxiosResponse => ({ data, status, statusText: statusTextMap[status] ?? 'Unknown', headers: {}, config, request: null });
  const makeError = (status: number, data: unknown): AxiosError => {
    const error = new Error(`Request failed with status code ${status}`) as AxiosError;
    error.config = config;
    error.response = makeResponse(status, data);
    error.isAxiosError = true;
    return error;
  };

  if (!route) {
    throw makeError(404, { ok: false, error: 'Mock route not found', path, method });
  }

  const match = path.match(route.pattern);
  const params = (match?.groups ?? {}) as Record<string, string>;
  const result = await route.handler({ config, path, method, query, body, params, state });
  const status = result.status ?? 200;

  if ([400, 401, 404, 409, 500].includes(status)) throw makeError(status, result.data ?? { ok: false });
  return makeResponse(status, result.data ?? null);
};
