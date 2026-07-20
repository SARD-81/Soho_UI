import type { ServiceDetails, ServiceValue } from '../@types/service';

export type ServiceRuntimeStatus =
  | 'running'
  | 'stopped'
  | 'error'
  | 'masked';

const getNormalizedString = (value: ServiceValue) =>
  typeof value === 'string' ? value.trim().toLowerCase() : '';

const normalizeServiceFlag = (value: ServiceValue): boolean | null => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    if (value === 1) return true;
    if (value === 0) return false;
    return null;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();

    if (['true', '1', 'yes', 'on', 'enabled', 'active'].includes(normalized)) {
      return true;
    }

    if (
      ['false', '0', 'no', 'off', 'disabled', 'inactive'].includes(normalized)
    ) {
      return false;
    }
  }

  return null;
};

const getServiceStateToken = (value: string) =>
  value.split(/\s+/, 1)[0] ?? '';

export const deriveServiceRuntimeStatus = (
  details: ServiceDetails | Record<string, ServiceValue>
): ServiceRuntimeStatus => {
  const activeState =
    getNormalizedString(details.active) ||
    getNormalizedString(details.active_state);
  const subState =
    getNormalizedString(details.sub) || getNormalizedString(details.sub_state);
  const statusValue = getNormalizedString(details.status);
  const subStateToken = getServiceStateToken(subState);
  const statusToken = getServiceStateToken(statusValue);
  const masked = normalizeServiceFlag(details.masked ?? details.mask);

  if (masked === true) {
    return 'masked';
  }

  if (statusToken === 'failed' || activeState === 'failed') {
    return 'error';
  }

  if (
    activeState === 'active' &&
    ['running', 'exited', 'listening'].includes(subStateToken)
  ) {
    return 'running';
  }

  if (['running', 'active'].includes(statusToken)) {
    return 'running';
  }

  return 'stopped';
};

export const isServiceRunning = (
  details: ServiceDetails | Record<string, ServiceValue>
) => deriveServiceRuntimeStatus(details) === 'running';

export const getServiceRuntimeSnapshotStatus = (
  details: ServiceDetails | Record<string, ServiceValue>
) => deriveServiceRuntimeStatus(details).toUpperCase();
