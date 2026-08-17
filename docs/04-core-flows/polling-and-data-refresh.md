# Polling and Data Refresh

This document is the canonical inventory of continuous server-state refresh behavior in SOHO UI.

It replaces historical polling audits as the source of truth. When this document and an old audit disagree, verify the current hook implementation and update this document.

## Design goals

Polling exists only where data changes often enough that passive invalidation or mount-time refresh is insufficient.

The application tries to avoid:

- duplicate polling loops for the same resource;
- hidden-tab background traffic;
- global window-focus refetch storms;
- fast polling for slowly changing configuration data;
- persistence side effects from observational reads.

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

| Resource | Query / endpoint | Interval | Scope / behavior |
| --- | --- | ---: | --- |
| CPU | `['system','cpu']` → `/api/system/cpu/` | 2 s | While mounted; background polling disabled. |
| Memory | `['system','memory']` → `/api/system/memory/` | 2 s | While mounted; background polling disabled. |
| Network bandwidth | `['network-bandwidth', interfaces]` → `/api/network/bandwidth/` | 2 s | Only while the bandwidth hook is active; background polling disabled. |
| Zpool list | `['zpool']` → `/api/zpool/` | 30 s default | Shared by storage UI and notification startup checks; background polling disabled. |
| Partitioned disks used by storage dialogs | `['disk','partitioned']` | typically 5 s from the caller | Enabled only while create/add/replace workflows need it. |
| Pool device slots | `['zpool','devices','slots', ...]` | 30 s default | Only while the consuming view is enabled/mounted; background polling disabled. |
| Selected zpool details | `['zpool', poolName, 'details']` | 30 s when enabled | Stops when the detail query is disabled. |
| Services list | `['services']` → `/api/system/service/` | 5 s | Current source polls while mounted; background polling disabled. |
| Individual service status | `['service-status', name]` | 5 s | One query per displayed service; background polling disabled. |

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

This avoids continuing expensive administrative monitoring traffic when the tab is hidden.

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

## Shared query consumers

Multiple components may subscribe to the same query key. React Query can share/cache that resource instead of each component running an unrelated request loop.

This is especially important for notifications.

For example, the startup notification checker observes the zpool query with the same zpool key. It should not create a second independent timer for an equivalent resource.

Status-change notification observers may explicitly disable their own interval and react to cache updates supplied by other mounted consumers.

## Conditional polling

Polling should stop when the user cannot benefit from it.

Examples:

- partitioned-disk polling is enabled only while storage mutation dialogs need that state;
- zpool detail polling runs only for selected/enabled details;
- pool-slot mapping only runs while a storage visualization consuming it is mounted;
- bandwidth polling depends on the interfaces being actively observed.

Prefer `enabled` or `refetchInterval: false/undefined` over leaving a hidden timer alive.

## Choosing an interval

When adding or changing polling, consider:

1. How quickly can the backend value change without a frontend mutation?
2. How quickly does the operator need to see the change?
3. How expensive is the endpoint?
4. How many instances of the query can be mounted simultaneously?
5. Does the endpoint fan out to hardware/system commands?
6. Can React Query share the same key across consumers?
7. Should the timer stop when a modal/page/detail view closes?
8. Is event-driven invalidation available instead?

Avoid arbitrary intervals. If a value only needs to update every 30 seconds, do not poll it every 2 seconds.

## Polling tiers used by the current UI

A practical mental model for the existing application is:

- **2 seconds:** high-frequency dashboard telemetry such as CPU, memory, and bandwidth;
- **5 seconds:** operational status or short-lived workflow state such as services and modal-scoped partition availability;
- **30 seconds:** slower storage-state monitoring such as zpools, pool details, and device-slot mapping;
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

Notifications are documented separately because they often consume polling results without owning the timer.

See [`notifications.md`](./notifications.md).

Important examples:

- startup capacity checks reuse resource queries;
- status-change notifications compare cached observations with a local baseline;
- disk-temperature notifications suppress duplicate warnings while a disk remains above the threshold.

## Debugging duplicate requests

If an endpoint appears more often than expected in DevTools:

1. identify the React Query key for each request;
2. check whether two hooks use different keys for equivalent data;
3. inspect whether both a page and a notification observer configured independent intervals;
4. inspect React StrictMode only after checking query-key sharing and actual network behavior;
5. check whether mutation invalidation occurred near a scheduled interval;
6. check whether a mount/unmount cycle is causing revalidation;
7. verify the query is not accidentally enabled in a hidden modal/detail component.

Do not solve duplicates by disabling necessary refresh blindly; first identify ownership.

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

When a page overrides a hook's default interval in a meaningful way, document the page-specific behavior.

Historical audit files should not be edited as if they are live configuration; they are retained only as migration pointers once this document becomes canonical.

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
- `src/hooks/useVolumes.ts`
- `src/pages/IntegratedStorage.tsx`

## Related documentation

- [`server-state-and-cache.md`](./server-state-and-cache.md)
- [`state-sync-save-to-db.md`](./state-sync-save-to-db.md)
- [`notifications.md`](./notifications.md)
- [`api-request-lifecycle.md`](./api-request-lifecycle.md)
