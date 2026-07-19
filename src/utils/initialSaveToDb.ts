import type { AxiosRequestConfig } from 'axios';

const AUTH_ENDPOINT_PARTS = [
  '/auth/',
  '/login',
  '/logout',
  '/token/',
  '/token/refresh',
  '/token/verify',
];

let activePageScope = '';
const processedRequestKeys = new Set<string>();

const getPageScope = () => {
  if (typeof window === 'undefined') {
    return 'server';
  }

  return `${window.location.pathname}${window.location.search}`;
};

const isAuthEndpoint = (url: string) => {
  const normalizedUrl = url.toLowerCase();
  return AUTH_ENDPOINT_PARTS.some((endpointPart) =>
    normalizedUrl.includes(endpointPart)
  );
};

const normalizeParamValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(normalizeParamValue);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([key]) => key !== 'save_to_db')
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nestedValue]) => [key, normalizeParamValue(nestedValue)])
    );
  }

  return value;
};

const createRequestKey = (config: AxiosRequestConfig, pageScope: string) => {
  const url = String(config.url ?? '').split('?')[0];
  const params =
    config.params instanceof URLSearchParams
      ? Array.from(config.params.entries())
          .filter(([key]) => key !== 'save_to_db')
          .sort(([left], [right]) => left.localeCompare(right))
      : normalizeParamValue(config.params ?? {});

  return `${pageScope}:${url}:${JSON.stringify(params)}`;
};

const setSaveToDbParam = (
  params: AxiosRequestConfig['params'],
  shouldSave: boolean
) => {
  if (params instanceof URLSearchParams) {
    const nextParams = new URLSearchParams(params);
    if (shouldSave) {
      nextParams.set('save_to_db', 'true');
    } else {
      nextParams.delete('save_to_db');
    }
    return nextParams;
  }

  const nextParams = {
    ...(params && typeof params === 'object' ? params : {}),
  } as Record<string, unknown>;

  if (shouldSave) {
    nextParams.save_to_db = true;
  } else {
    delete nextParams.save_to_db;
  }

  return nextParams;
};

/**
 * Read-only API calls persist their result only on the first request made for
 * the current page and exact endpoint/parameter combination. Polling and later
 * refetches omit save_to_db entirely.
 *
 * Mutation requests are intentionally left untouched because their explicit
 * save_to_db contract controls whether the requested change is persisted.
 */
export const applyInitialSaveToDbPolicy = <T extends AxiosRequestConfig>(
  config: T
): T => {
  const method = String(config.method ?? 'get').toLowerCase();
  const url = String(config.url ?? '');

  if (method !== 'get' || !url.includes('/api/') || isAuthEndpoint(url)) {
    return config;
  }

  const pageScope = getPageScope();
  if (activePageScope !== pageScope) {
    activePageScope = pageScope;
    processedRequestKeys.clear();
  }

  const requestKey = createRequestKey(config, pageScope);
  const isFirstRequest = !processedRequestKeys.has(requestKey);

  if (isFirstRequest) {
    processedRequestKeys.add(requestKey);
  }

  config.params = setSaveToDbParam(config.params, isFirstRequest);
  return config;
};

export const resetInitialSaveToDbPolicy = () => {
  activePageScope = '';
  processedRequestKeys.clear();
};
