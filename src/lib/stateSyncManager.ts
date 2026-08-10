export type StateSyncDomain =
  | 'zpool'
  | 'filesystem'
  | 'disk'
  | 'nfs'
  | 'samba-users'
  | 'samba-groups'
  | 'samba-shares'
  | 'webshare'
  | 'snmp';

export interface StateSyncDefinition {
  endpoint: string;
  params?: Record<string, unknown>;
}

export const STATE_SYNC_HEADER = 'X-Soho-State-Sync';

const STATE_SYNC_DEFINITIONS: Record<StateSyncDomain, StateSyncDefinition> = {
  zpool: {
    endpoint: '/api/zpool/',
  },
  filesystem: {
    endpoint: '/api/filesystem/',
    params: { detail: true },
  },
  disk: {
    endpoint: '/api/disk',
  },
  nfs: {
    endpoint: '/api/nfs/shares/',
  },
  'samba-users': {
    endpoint: '/api/samba/users/',
    params: { property: 'all' },
  },
  'samba-groups': {
    endpoint: '/api/samba/groups/',
    params: { property: 'all', contain_system_groups: false },
  },
  'samba-shares': {
    endpoint: '/api/samba/sharepoints/',
    params: { property: 'all' },
  },
  webshare: {
    endpoint: '/api/webshare/',
    params: { detail: true },
  },
  snmp: {
    endpoint: '/api/snmp/info/',
  },
};

const ALL_STATE_SYNC_DOMAINS = Object.keys(
  STATE_SYNC_DEFINITIONS
) as StateSyncDomain[];

const MUTATION_SYNC_DELAY_MS = 500;

type StateSyncExecutor = (
  domain: StateSyncDomain,
  definition: StateSyncDefinition
) => Promise<void>;

let executor: StateSyncExecutor | null = null;
let initialSessionSyncPromise: Promise<void> | null = null;

const scheduledTimers = new Map<StateSyncDomain, ReturnType<typeof setTimeout>>();
const inFlightDomains = new Set<StateSyncDomain>();
const rerunAfterFlight = new Set<StateSyncDomain>();

const normalizePath = (url: string) => {
  const withoutQuery = url.split('?')[0]?.trim() ?? '';
  return withoutQuery.toLowerCase();
};

/**
 * Maps a successful mutation to the state domains that can have changed.
 * Cross-domain dependencies are intentionally explicit: zpool operations can
 * change free-disk state, filesystem operations can change pool capacity, and
 * Samba user/group mutations can change membership views on both sides.
 */
export const resolveStateDomainsForMutation = (
  url: string
): StateSyncDomain[] => {
  const path = normalizePath(url);

  if (path.includes('/api/zpool')) {
    return ['zpool', 'disk'];
  }

  if (path.includes('/api/filesystem')) {
    return ['filesystem', 'zpool'];
  }

  if (path.includes('/api/disk')) {
    return ['disk', 'zpool'];
  }

  if (path.includes('/api/nfs')) {
    return ['nfs'];
  }

  if (path.includes('/api/samba/users')) {
    return ['samba-users', 'samba-groups'];
  }

  if (path.includes('/api/samba/groups')) {
    return ['samba-groups', 'samba-users'];
  }

  if (path.includes('/api/samba/sharepoints')) {
    return ['samba-shares'];
  }

  if (path.includes('/api/samba')) {
    return ['samba-users', 'samba-groups', 'samba-shares'];
  }

  if (path.includes('/api/webshare')) {
    return ['webshare'];
  }

  if (path.includes('/api/snmp')) {
    return ['snmp'];
  }

  return [];
};

export const registerStateSyncExecutor = (nextExecutor: StateSyncExecutor) => {
  executor = nextExecutor;
};

const clearScheduledTimer = (domain: StateSyncDomain) => {
  const timer = scheduledTimers.get(domain);
  if (timer) {
    clearTimeout(timer);
    scheduledTimers.delete(domain);
  }
};

const runStateDomainSync = async (domain: StateSyncDomain): Promise<void> => {
  if (!executor) {
    return;
  }

  clearScheduledTimer(domain);

  if (inFlightDomains.has(domain)) {
    rerunAfterFlight.add(domain);
    return;
  }

  inFlightDomains.add(domain);

  try {
    await executor(domain, STATE_SYNC_DEFINITIONS[domain]);
  } finally {
    inFlightDomains.delete(domain);

    if (rerunAfterFlight.delete(domain)) {
      scheduleStateDomainSync(domain, 0);
    }
  }
};

/**
 * Coalesces rapid mutations in the same domain into one canonical snapshot.
 * If another mutation arrives while a sync is already in flight, exactly one
 * follow-up sync is queued so the database ends on the newest state.
 */
export const scheduleStateDomainSync = (
  domain: StateSyncDomain,
  delayMs = MUTATION_SYNC_DELAY_MS
) => {
  clearScheduledTimer(domain);

  const timer = setTimeout(() => {
    scheduledTimers.delete(domain);
    void runStateDomainSync(domain).catch((error) => {
      if (import.meta.env.DEV) {
        console.error(`[state-sync] ${domain} sync failed`, error);
      }
    });
  }, Math.max(0, delayMs));

  scheduledTimers.set(domain, timer);
};

export const scheduleStateSyncForMutation = (url: string) => {
  resolveStateDomainsForMutation(url).forEach((domain) => {
    scheduleStateDomainSync(domain);
  });
};

/** Runs one canonical save_to_db=true snapshot for every persisted domain. */
export const syncAllStateDomains = async () => {
  await Promise.allSettled(
    ALL_STATE_SYNC_DOMAINS.map((domain) => runStateDomainSync(domain))
  );
};

/**
 * Runs the login/session baseline once. React StrictMode, token refreshes and
 * repeated auth renders reuse the same promise and cannot start duplicate full
 * snapshots during the same authenticated session.
 */
export const syncAllStateDomainsOnce = () => {
  if (!initialSessionSyncPromise) {
    initialSessionSyncPromise = syncAllStateDomains();
  }

  return initialSessionSyncPromise;
};

/** Clears pending work when the authenticated session ends or a new login starts. */
export const resetStateSyncManager = () => {
  scheduledTimers.forEach((timer) => clearTimeout(timer));
  scheduledTimers.clear();
  rerunAfterFlight.clear();
  initialSessionSyncPromise = null;
};
