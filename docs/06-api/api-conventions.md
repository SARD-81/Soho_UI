# API Conventions

This document defines the frontend-side API conventions currently enforced by SOHO UI.

The goal is to make new API integrations behave consistently with authentication, React Query, persistence, error handling, and operational workflows already present in the application.

## Transport ownership

Normal application traffic must use:

```text
src/lib/axiosInstance.ts
```

The shared Axios client owns cross-cutting behavior including:

- `VITE_API_BASE_URL` resolution;
- JSON request headers;
- Bearer access-token attachment;
- centralized `save_to_db` transport policy;
- 401 recovery and token refresh;
- failed-request queueing during refresh;
- successful-mutation StateSync scheduling;
- optional mock adapter registration;
- common API-error logging.

Feature hooks/components should not recreate these responsibilities.

## Authentication transport exception

Token issue, refresh, and verify deliberately use the isolated auth client in:

```text
src/lib/authApi.ts
```

This prevents token refresh from recursively entering the normal Axios 401 interceptor.

Authentication base URL resolution is documented in:

- [`../03-development/configuration.md`](../03-development/configuration.md)
- [`authentication-api.md`](./authentication-api.md)

Logout is different: it is an authenticated application mutation and therefore uses the normal shared Axios instance.

## Base URLs

Normal application API:

```text
VITE_API_BASE_URL
```

Optional separate authentication API:

```text
VITE_AUTH_API_BASE_URL
```

If the authentication-specific value is absent, the auth client derives an `/api/auth/` base from `VITE_API_BASE_URL`.

Do not hard-code production origins inside hooks or components.

## URL conventions

Backend paths are not perfectly uniform. Current APIs include all of these forms:

```text
/api/zpool/
/api/volume/create
/api/system/network
/api/system/service/{unit}/control/?action=...
/api/filesystem/delete/?name=...
```

Do not normalize endpoint spelling, trailing slashes, or path families based on preference alone. Preserve the verified backend contract.

Dynamic identifiers must be URL encoded:

```ts
encodeURIComponent(resourceName)
```

This is especially important for:

- service unit names;
- disk names;
- pool names;
- filesystem full names;
- usernames;
- group names;
- share names;
- network-interface names.

## Query parameters

Use Axios `params` for query parameters when practical rather than manually concatenating arbitrary user values into a URL.

Examples include:

```text
property=all
contain_system_groups=false
name=<filesystem>
action=<service-action>
include_system=false
```

When an endpoint already has a verified inline query pattern, preserve it unless deliberately refactoring the complete request contract.

## Domain payloads must not contain persistence ownership

A central architectural invariant is:

```text
normal /api/ request      -> save_to_db=false
StateSync canonical GET   -> save_to_db=true
```

Feature-domain payloads should contain only the operation's business data.

Do not add fields such as:

```text
save_to_db
saveToDb
persist
snapshot
```

unless the centralized persistence architecture itself is being intentionally changed.

The request interceptor strips/normalizes stale caller-level `save_to_db` values so legacy code cannot accidentally persist a non-canonical response.

Detailed contract:

- [`../04-core-flows/state-sync-save-to-db.md`](../04-core-flows/state-sync-save-to-db.md)
- [`../02-architecture/decisions/ADR-003-state-sync-persistence.md`](../02-architecture/decisions/ADR-003-state-sync-persistence.md)

## Observational requests versus mutations

HTTP method alone does not define persistence semantics.

Examples:

- `GET /api/system/cpu/` is observational.
- `POST /api/snmp/config/` mutates persisted SNMP configuration.
- `POST /api/snmp/test-connection/` is diagnostic despite using POST.
- `POST /api/system/time/hwclock/` can be observational when `action=show`, but mutating for other actions.

When adding an endpoint, classify the operation by domain effect rather than by method name alone.

If a successful request is a POST/PUT/PATCH/DELETE but does not change a StateSync-owned domain, make sure the StateSync URL resolver does not treat it as a persisted mutation.

## React Query ownership

Authoritative backend state belongs in React Query.

A stable query key must represent the backend resource/lifecycle, for example:

```text
['zpool']
['filesystems']
['volumes']
['disk','inventory']
['services']
['services','status',unit]
['nfs','shares']
['samba-users']
['webshare','shares']
['snmp','info']
```

Do not create a new query key merely because the same resource is displayed on another page. Shared resources should normally share cache identity.

Use a different key when the data source, parameters, lifecycle, or semantic resource is genuinely different.

## Mutation success behavior

A typical mutation has two independent post-success concerns:

1. **UI freshness** — invalidate/refetch the relevant React Query resource.
2. **Persistence** — the shared Axios response interceptor asks `StateSyncManager` to schedule canonical snapshots for mapped persisted domains.

Feature hooks should own the first concern.

They should not manually implement the second.

## StateSync URL mapping

Current persisted domains are:

```text
zpool
filesystem
disk
nfs
samba-users
samba-groups
samba-shares
webshare
snmp
```

Examples of cross-domain mapping:

```text
/api/zpool...       -> zpool + disk
/api/filesystem...  -> filesystem + zpool
/api/disk...        -> disk + zpool
/api/samba/users... -> samba-users + samba-groups
/api/samba/groups...-> samba-groups + samba-users
```

Not every backend domain is currently StateSync-owned. Examples currently outside the persisted frontend snapshot map include:

- Volumes;
- OS users;
- Web/UI users;
- system service control;
- general system settings;
- network configuration.

Do not compensate for an unmapped domain by adding local persistence flags. Confirm the backend persistence contract first.

## Polling conventions

Polling cadence belongs to the resource hook, not to generic API helpers.

A component can supply a deliberate override when the same resource requires a different cadence in a specific operational context, such as the 3D slot view.

Polling rules must also be reflected in:

[`../04-core-flows/polling-and-data-refresh.md`](../04-core-flows/polling-and-data-refresh.md)

High-frequency polling should normally set:

```text
refetchIntervalInBackground = false
```

unless background refresh is a deliberate product requirement.

## Cancellation

Read helpers should pass React Query's `AbortSignal` to Axios when their hook/query lifecycle supports cancellation.

This is useful for:

- page navigation;
- query disablement;
- changing resource identity;
- avoiding obsolete detail requests.

Do not add custom cancellation mechanisms when React Query + Axios signal support is sufficient.

## Response normalization

Backend compatibility normalization belongs close to the data layer.

Examples already present include:

- disk `ok === false` handling;
- Web Share multi-shape normalization;
- Samba boolean/account-flag normalization;
- SNMP boolean-like test-result normalization;
- network response alias discovery;
- filesystem legacy list/detail compatibility.

Components should receive stable frontend models whenever practical.

Do not scatter backend-version field aliases across JSX tables and modals.

## `ok: false` with HTTP success

Several backend endpoints can report logical failure inside a successful HTTP response, for example:

```json
{
  "ok": false,
  "error": "..."
}
```

Where the current endpoint contract requires it, API helpers must convert this shape into a rejected/failed frontend operation.

Do not assume `2xx` automatically means domain success.

## Error messages

Prefer the shared helper:

```text
extractApiErrorMessage(error, fallback)
```

It currently recognizes common forms including:

```text
detail
message
error.message
error.detail
Error.message
```

Some feature-specific APIs accept additional legacy shapes such as `errors`; those compatibility extractors should remain close to the relevant API layer until response contracts are unified.

See [`error-handling.md`](./error-handling.md).

## Multi-request workflows

Some apparent single user actions actually make multiple backend requests.

Examples:

- pool delete: destroy pool, then clean former disks;
- Web Share create: create share, then set permission;
- Samba group create: create group, then add users one-by-one;
- Samba group member update: one PUT per username;
- Settings Web-user create: create Web user, then OS user;
- Users OS-first Samba creation: create OS user, then Samba user.

These flows are generally **not frontend transactions** and have no automatic rollback.

When implementing another multi-request workflow:

1. document request order;
2. define what happens when request N fails;
3. do not claim atomicity the backend does not provide;
4. keep recovery/troubleshooting guidance in the owning feature document.

## Destructive operations

Delete/wipe/stop operations with meaningful availability or data-loss risk should remain confirmation-driven.

Frontend confirmation is UX protection only. Backend authorization and resource-integrity validation remain authoritative.

## API changes checklist

When adding or modifying an endpoint integration:

1. verify exact method/path/trailing-slash behavior;
2. identify the owning feature/domain;
3. URL-encode dynamic path identifiers;
4. define a stable React Query key for reads;
5. define success invalidation for mutations;
6. classify whether the operation really changes persisted state;
7. update StateSync mapping only when required;
8. never introduce caller-level `save_to_db` ownership;
9. normalize backend response aliases at the data boundary;
10. define logical `ok:false` behavior if applicable;
11. normalize errors with a stable fallback message;
12. document partial failures for multi-request flows;
13. update [`endpoint-map.md`](./endpoint-map.md);
14. update the relevant feature/core-flow document.

## Related files

- `src/lib/axiosInstance.ts`
- `src/lib/authApi.ts`
- `src/lib/stateSyncManager.ts`
- `src/utils/apiError.ts`

## Related documentation

- [`authentication-api.md`](./authentication-api.md)
- [`error-handling.md`](./error-handling.md)
- [`endpoint-map.md`](./endpoint-map.md)
- [`../04-core-flows/api-request-lifecycle.md`](../04-core-flows/api-request-lifecycle.md)
- [`../04-core-flows/server-state-and-cache.md`](../04-core-flows/server-state-and-cache.md)
