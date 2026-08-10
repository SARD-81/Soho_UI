# State synchronization and `save_to_db`

The frontend treats `save_to_db` as a state-snapshot control, not as a normal request option.

## Runtime contract

- Every normal request sent through `axiosInstance` to a non-auth `/api/` endpoint receives `save_to_db=false` in its query parameters.
- If a legacy caller still sends a top-level `save_to_db=true` in a JSON/FormData/URLSearchParams body, the transport layer normalizes that flag to `false` before the request is sent.
- The only requests allowed to send `save_to_db=true` are canonical snapshot GET requests created by `StateSyncManager`.
- Authentication endpoints are excluded because `save_to_db` is not part of the authentication contract.

This makes polling, refetching, page navigation, detail queries and UI refreshes read-only from the persistence point of view.

## Canonical snapshot domains

`src/lib/stateSyncManager.ts` owns the canonical endpoint for every persisted domain:

| Domain | Canonical snapshot request |
| --- | --- |
| zpool | `GET /api/zpool/` |
| filesystem | `GET /api/filesystem/?detail=true` |
| disk | `GET /api/disk` |
| nfs | `GET /api/nfs/shares/` |
| samba-users | `GET /api/samba/users/?property=all` |
| samba-groups | `GET /api/samba/groups/?property=all&contain_system_groups=false` |
| samba-shares | `GET /api/samba/sharepoints/?property=all` |
| webshare | `GET /api/webshare/?detail=true` |
| snmp | `GET /api/snmp/info/` |

The Axios state-sync executor marks only these requests as internal snapshot requests. The request interceptor converts the marker into `save_to_db=true` and removes the internal marker before the request leaves the browser.

## Login/session baseline

After a successful login, or after an existing authenticated session is restored on application startup, the frontend runs one baseline snapshot for every registered domain.

The baseline is session-scoped. Re-renders, React StrictMode and token refreshes reuse the same baseline promise and do not intentionally start another full snapshot during the same authenticated session.

Logout/new login resets this session state.

## Mutation flow

Normal POST/PUT/PATCH/DELETE requests are always sent with `save_to_db=false`.

Only after a mutation succeeds does the Axios response interceptor map its URL to one or more affected domains and schedule a canonical snapshot.

Examples:

- `/api/zpool/...` -> zpool + disk
- `/api/filesystem/...` -> filesystem + zpool
- `/api/disk/...` -> disk + zpool
- `/api/nfs/...` -> nfs
- `/api/samba/users/...` -> samba-users + samba-groups
- `/api/samba/groups/...` -> samba-groups + samba-users
- `/api/samba/sharepoints/...` -> samba-shares
- `/api/webshare/...` -> webshare
- `/api/snmp/...` -> snmp

This means the database is updated from the authoritative post-operation system state, not from the mutation payload.

## Coalescing/race protection

Mutation-triggered snapshots are delayed by 500 ms per domain. Multiple successful mutations in that window collapse into one snapshot.

If a new mutation arrives while a snapshot for that domain is already running, one follow-up snapshot is queued. This prevents concurrent overwrite storms while still ensuring the final database state is the latest observed state.

## React Query behavior

Global mutation invalidation now runs only after successful mutations. Failed mutations no longer invalidate every active query.

React Query refetches are UI refreshes only. They carry `save_to_db=false`; persistence is owned exclusively by `StateSyncManager`.

## Adding a new persisted domain

1. Add the domain name and its canonical GET endpoint to `STATE_SYNC_DEFINITIONS`.
2. Map mutation URL prefixes to that domain in `resolveStateDomainsForMutation`.
3. Do not add ad-hoc `save_to_db=true` flags in hooks/components.
4. Let normal reads and mutations remain `save_to_db=false`; the manager performs the canonical snapshot after successful mutations.
