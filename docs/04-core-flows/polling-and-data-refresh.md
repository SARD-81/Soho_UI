# Polling and Data Refresh

This document is the canonical inventory of continuous server-state refresh behavior in SOHO UI.

It replaces historical polling audits as the source of truth. When this document and an old audit disagree, verify the current hook implementation and update this document.

## Design goals

Polling exists only where data changes often enough that passive invalidation or mount-time refresh is insufficient.

The application tries to avoid:

- accidental duplicate polling for equivalent resources;
- hidden-tab background traffic;
- global window-focus refetch storms;
- fast polling for slowly changing configuration data;
- persistence side effects from observational reads.

Dedicated query keys are allowed when a subsystem intentionally needs an independent monitoring lifecycle or cadence. When that is done, document it because React Query will treat the dedicated key as a separate cache entry.

## Global defaults

The QueryClient defaults are:

- `refetchOnMount: 'always'`
- `refetchOnWindowFocus: false`
- `refetchOnReconnect: false`
- `staleTime: 10_000`
- `gcTime: 5 minutes`
- query retry disabled globally

Feature hooks may override these defaults.

## Current polling inventory

The following intervals were verified from the current source on the documentation branch.

| Resource / monitor | Query / endpoint | Interval | Scope / behavior |
| --- | --- | ---: | --- |
| CPU | `['system','cpu']` → `/api/system/cpu/` | 2 s | While mounted; background polling disabled. |
| Memory | `['system','memory']` → `/api/system/memory/` | 2 s | While mounted; background polling disabled. |
| Network bandwidth | `['network-bandwidth', interfaces]` → `/api/network/bandwidth/` | 2 s | While the bandwidth hook is active; background polling disabled. |
| Zpool list | `['zpool']` → `/api/zpool/` | 30 s default | Used by ordinary zpool consumers and status monitoring; background polling disabled. |
| Partitioned disks used by storage dialogs | `['disk','partitioned']` | 5 s in Integrated Storage | Enabled only while create/add/replace storage workflows need it. |
| Pool device slots | `['zpool','devices','slots', ...]` | 30 s default | Only while the consuming view is enabled/mounted; background polling disabled. |
| Selected zpool details | `['zpool', poolName, 'details']` | 30 s when enabled | Stops when the detail query is disabled. |
| Services list | `['services']` → `/api/system/service/` | 5 s | While mounted; background polling disabled. |
| Individual service status | `['service-status', name]` | 5 s | One query per displayed service; background polling disabled. |
| Notification capacity: zpool | `['notifications','capacity','zpool']` using `fetchZpools` | 60 s | Dedicated notification query; separate cache entry from `['zpool']`. |
| Notification capacity: filesystems | `['notifications','capacity','filesystems']` using `fetchFileSystems` | 60 s | Dedicated notification query; separate cache entry from ordinary filesystem queries. |
| Notification temperature: disk inventory | `['disk','inventory']` → `/api/disk/?detail=true` | 30 s | Used by disk-temperature monitoring; background polling disabled. |

The exact caller can override some hook defaults. When documenting a page, describe the interval actually supplied by that page, not only the hook default.

## Resources without continuous polling

Not every backend resource should have a timer.

Examples verified from current source:

| Resource | Refresh model |
| --- | --- |
| Filesystem list | Fetch on mount/revalidation/invalidation; `staleTime` 15 s; no continuous interval in `useFileSystems`. |
| Volume type list | Fetch on mount and mutation invalidation; no continuous interval. |
| Network interfaces | Cached query with `staleTime` 30 s; no continuous interval. |
| Network interface detail | Enabled per selected interface, `staleTime` 10 s; no continuous interval. |
| Disk status query used by status notifications | `useDisk()` has no interval when called without an override. |
| Samba/NFS/Web-share configuration | Primarily mount/invalidation driven unless a specific hook explicitly adds an interval. |
| System/configuration information | Treat as non-polling unless the current hook explicitly declares otherwise. |

Do not add a timer merely because a page needs fresh data after a mutation. Mutation invalidation is the preferred mechanism for configuration-style state.

## Telemetry versus configuration

A useful distinction is:

### Telemetry

Values such as CPU, memory, bandwidth, temperatures, and actively observed service status can change without a user mutation. These are reasonable polling candidates.

### Configuration and inventory

Values such as users, shares, settings, filesystems, or one-time detail data generally change through explicit operations. Prefer query invalidation, mount-time fetches, and targeted refetches.

Storage health can sit between these categories; slower polling is used where backend/system state may change independently.

## Background behavior

Continuous polling hooks should normally set:

```ts
refetchIntervalInBackground: false
```

This avoids continuing administrative monitoring traffic when the tab is hidden.

A future exception must document why hidden-tab updates are required and what backend load is acceptable.

## Window focus and reconnect

Global focus/reconnect refetch is disabled.

This prevents returning to a tab from triggering a large fan-out of requests across many mounted administrative widgets.

A hook may override this only when the resource semantics justify it.

## Mutation refresh

Successful mutations refresh UI state in two layers:

1. feature-specific `onSuccess` handlers may invalidate the exact keys they know are affected;
2. the global `MutationCache` invalidates active queries after success.

Failed mutations do not trigger the global success invalidation.

This mechanism is separate from polling. A 30-second polling interval does not mean the UI must wait 30 seconds after a successful user action if the affected query is invalidated immediately.

## Polling does not persist snapshots

All polling requests are observational.

They pass through `axiosInstance`, whose transport policy ensures normal requests use `save_to_db=false`.

Database snapshot persistence is scheduled separately by `StateSyncManager` after successful mutations and during the authenticated-session baseline.

Never add `save_to_db=true` to a polling hook.

## Shared versus dedicated query consumers

React Query shares requests and cache only when consumers use the same query key and compatible query lifecycle.

The current notification subsystem demonstrates both models.

### Shared/ordinary resource keys

Status-change monitoring uses ordinary resource hooks:

- pools through `useZpool()` / `['zpool']` at the default 30-second cadence;
- disks through `useDisk()` / `['disk']` with no interval supplied by that caller;
- services through `useServices()` / `['services']` at 5 seconds.

Where page-level consumers use the same key, React Query can share the cache/query lifecycle.

### Dedicated notification keys

Capacity monitoring intentionally has independent query entries:

- `['notifications','capacity','zpool']` every 60 seconds;
- `['notifications','capacity','filesystems']` every 60 seconds.

These use the same fetch functions as ordinary resource queries but not the same query keys. They can therefore generate independent network requests.

Disk-temperature monitoring also uses the dedicated inventory key `['disk','inventory']` every 30 seconds.

Do not describe two different query keys as deduplicated merely because they hit the same endpoint or reuse the same fetch function.

## Conditional polling

Polling should stop when the user cannot benefit from it.

Examples:

- partitioned-disk polling is enabled only while storage mutation dialogs need that state;
- zpool detail polling runs only for selected/enabled details;
- pool-slot mapping only runs while a storage visualization consuming it is mounted;
- bandwidth polling depends on the interfaces being actively observed;
- notification monitors exist while `NotificationBootstrapper` is mounted in the authenticated layout.

Prefer `enabled` or `refetchInterval: false/undefined` over leaving a hidden feature timer alive.

## Choosing an interval

When adding or changing polling, consider:

1. How quickly can the backend value change without a frontend mutation?
2. How quickly does the operator need to see the change?
3. How expensive is the endpoint?
4. How many instances of the query can be mounted simultaneously?
5. Does the endpoint fan out to hardware/system commands?
6. Can an existing query key satisfy the same semantics and cadence?
7. Is a dedicated query key intentionally required?
8. Should the timer stop when a modal/page/detail view closes?
9. Is invalidation sufficient instead of polling?

Avoid arbitrary intervals. If a value only needs to update every 30 seconds, do not poll it every 2 seconds.

## Polling tiers used by the current UI

A practical mental model for the existing application is:

- **2 seconds:** high-frequency dashboard telemetry such as CPU, memory, and bandwidth;
- **5 seconds:** operational status or short-lived workflow state such as services and modal-scoped partition availability;
- **30 seconds:** slower storage-state monitoring, pool details, device-slot mapping, and disk-temperature inventory;
- **60 seconds:** notification-specific capacity monitoring;
- **no interval:** configuration/inventory data refreshed by lifecycle and invalidation.

These are conventions observed in the current code, not immutable constants. Any change should be justified by product and backend behavior.

## Manual refresh

A manual refresh, where present, should call React Query refetch/invalidation and remain an observational read.

It must not:

- trigger a database snapshot directly;
- set `save_to_db=true`;
- duplicate a mutation;
- reset unrelated caches.

## Notifications and polling

Notifications use a mix of ordinary shared resource keys and dedicated monitoring queries.

Current examples:

- capacity monitoring uses dedicated zpool/filesystem keys at 60 seconds;
- pool status monitoring uses the ordinary zpool key at its 30-second default;
- service status-change monitoring observes the ordinary 5-second services query;
- disk status-change monitoring calls the ordinary disk hook without adding an interval;
- temperature monitoring uses the disk-inventory key at 30 seconds.

See [`notifications.md`](./notifications.md) for thresholds, baselines, fingerprints, and duplicate suppression.

## Debugging duplicate requests

If an endpoint appears more often than expected in DevTools:

1. identify the React Query key for each request;
2. check whether two consumers intentionally use different keys for equivalent backend data;
3. inspect notification-specific capacity keys before assuming React Query deduplication failed;
4. check whether mutation invalidation occurred near a scheduled interval;
5. check whether a mount/unmount cycle is causing revalidation;
6. verify the query is not accidentally enabled in a hidden modal/detail component;
7. inspect React StrictMode only after query ownership and keys are understood.

A request visible twice with different keys is two independent query entries, not a cache-deduplication bug.

## Debugging missing refreshes

If a view does not update:

1. determine whether the resource is supposed to poll;
2. if not, identify the expected invalidation source;
3. check `enabled` conditions;
4. verify the mutation succeeded;
5. verify query-key alignment between the consumer and invalidation;
6. inspect hook-level `staleTime` and mount behavior;
7. verify the backend response actually changed.

## Updating this document

Whenever a hook adds/removes/changes a `refetchInterval`, update this inventory in the same change.

When a page or notification monitor overrides a hook's default interval or creates a dedicated query key in a meaningful way, document that behavior here.

Historical audit files are compatibility redirects and are not live configuration.

## Related files

- `src/main.tsx`
- `src/hooks/useCpu.ts`
- `src/hooks/useMemory.ts`
- `src/hooks/useNetwork.ts`
- `src/hooks/useZpool.ts`
- `src/hooks/useFileSystems.ts`
- `src/hooks/usePoolDeviceSlots.ts`
- `src/hooks/useZpoolDetails.ts`
- `src/hooks/useServices.ts`
- `src/hooks/useServiceStatuses.ts`
- `src/hooks/useDiskInventory.ts`
- `src/hooks/useStartupNotificationChecks.ts`
- `src/hooks/useResourceStatusChangeNotifications.ts`
- `src/hooks/useDiskTemperatureNotifications.ts`
- `src/pages/IntegratedStorage.tsx`

## Related documentation

- [`server-state-and-cache.md`](./server-state-and-cache.md)
- [`state-sync-save-to-db.md`](./state-sync-save-to-db.md)
- [`notifications.md`](./notifications.md)
- [`api-request-lifecycle.md`](./api-request-lifecycle.md)
