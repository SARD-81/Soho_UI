# Glossary

This glossary defines project-specific terms used across SOHO UI source code and engineering documentation.

Use these meanings consistently. When a backend/product term changes, update this glossary and the affected feature/API documents together.

## Application and product terms

### SOHO UI

The React/TypeScript browser frontend in this repository.

It is the administrative UI for the StoreX storage-management system and communicates with backend APIs for authoritative system state and mutations.

### StoreX

The broader storage-management product/system that SOHO UI is part of.

This repository contains only the frontend application, not the complete StoreX backend/infrastructure implementation.

### Operator

An authenticated person using SOHO UI to inspect or administer the managed system.

Frontend references to an operator do not imply a specific backend role/permission model; backend authorization remains authoritative.

## Storage terms

### Disk

A physical/block device reported by the backend disk APIs.

The frontend can display inventory/detail/slot/partition information and can initiate approved cleanup operations.

### Disk inventory

Canonical frontend collection of physical disks, normally represented by React Query key:

```text
['disk','inventory']
```

### Partition count

The dedicated backend-derived number of partitions for one disk.

The Disks page uses this as part of wipe-safety UX instead of relying only on a possibly less precise inventory flag.

### Integrated Storage

The user-facing feature name for pool-based/ZFS-like storage management.

Route:

```text
/Integrated-space
```

In source code and APIs, this domain is primarily represented as `zpool`.

### Zpool / pool

The backend storage-pool resource managed through `/api/zpool/...` endpoints.

Frontend canonical collection key:

```text
['zpool']
```

### Vdev

A ZFS/pool virtual-device grouping/type used to validate how disks are arranged when creating or extending a pool.

### Pool device

A disk/device currently associated with a pool.

Pool-device APIs are also used for vdev type, slot mapping, wipe safety, and replacement/addition workflows.

### Volume / Block Storage

A block-storage resource managed under `/api/volume/...` and shown on route:

```text
/block-space
```

The frontend treats Volumes as a separate resource from Filesystems and Zpools.

### Filesystem

A filesystem resource under `/api/filesystem/...`, normally identified by a full logical name:

```text
pool/filesystem
```

Frontend collection key:

```text
['filesystems']
```

### Mountpoint

The filesystem path at which a filesystem is mounted/exposed.

Mountpoints are used by File System, NFS, Samba/Web Share eligibility, and related UI.

### `canmount`

A filesystem property controlling automatic/allowed mount behavior.

The UI exposes it as an on/off style control but backend values may use strings such as `on`/`off`.

### Encryption key state

Frontend interpretation of whether an encrypted filesystem's key is loaded/available.

This state determines whether load/unload/change-passphrase actions are enabled.

### Base64 passphrase encoding

The frontend encodes some filesystem passphrases as UTF-8 bytes followed by Base64 before sending them.

Base64 is **not encryption**. HTTPS/TLS is required for transport confidentiality.

## Sharing terms

### Samba / SMB

The file-sharing domain represented by Samba share, Samba user, and Samba group APIs.

SOHO UI exposes this under route:

```text
/share
```

### Samba Share

A Samba sharepoint resource under:

```text
/api/samba/sharepoints/
```

Frontend canonical share key:

```text
['samba','shares']
```

### Samba User

A Samba-specific identity used for SMB authentication/access.

It is distinct from an OS user and a Web/UI user even when usernames are correlated.

Frontend collection key:

```text
['samba-users']
```

### Samba Group

A Samba group used for access membership.

Frontend collection key:

```text
['samba-groups']
```

### Account Flags

A Samba-user property queried per username to derive enabled/disabled state.

Current frontend interpretation includes:

```text
D -> disabled
U -> enabled
```

### NFS

Network File System sharing domain managed through:

```text
/api/nfs/shares/
```

Frontend collection key:

```text
['nfs','shares']
```

### `no_subtree_check`

Frontend NFS option whose backend counterpart is `subtree_check`.

Current request translation intentionally uses:

```text
subtree_check = !no_subtree_check
```

### Web Share

A web-serving exposure for an eligible filesystem-backed share.

A filesystem is currently considered eligible only when it is already represented through SMB or NFS sharing and does not already have a Web Share.

Frontend collection key:

```text
['webshare','shares']
```

## User and authentication terms

### OS User

An operating-system user resource under `/api/os/user...`.

It is distinct from Samba and Web/UI users.

### Web User / UI User

An application/backend UI account under:

```text
/api/system/ui-user/
```

The Settings Users tab manages these accounts.

Creating a Web User currently triggers a separate OS-user create afterwards; that workflow is not atomic.

### Access token

Short-lived Bearer token attached to normal authenticated API requests.

Current frontend policy stores it in memory only.

### Refresh token

Token used to obtain a new access token.

Current frontend policy stores it in `sessionStorage` with an in-memory fallback.

### Single-flight refresh

Concurrency pattern in `axiosInstance` where only one token-refresh request runs while multiple simultaneous 401 failures wait in a queue.

This prevents refresh storms.

### Protected route

A route that renders application content only after frontend authentication initialization confirms an authenticated session.

Frontend protection is UX/session control, not backend authorization.

### Idle timeout

Frontend inactivity limit that clears/ends the authenticated UI session after the configured inactivity period (currently 30 minutes).

## API and data-flow terms

### `axiosInstance`

The shared application Axios client.

It owns cross-cutting behavior such as:

- application API base URL;
- Bearer token attachment;
- `save_to_db` policy;
- 401 refresh/replay;
- StateSync scheduling;
- common API-error logging.

### `authClient`

The isolated Axios client in `authApi.ts` used for token issue, refresh, and verification.

It deliberately bypasses the shared 401 interceptor.

### React Query / TanStack Query

The library and architectural owner for authoritative backend state cached in the frontend.

### Query key

Stable array identity used by React Query to represent a backend resource/lifecycle.

Examples:

```text
['zpool']
['filesystems']
['services','status',unit]
```

### Invalidation

Marking a React Query resource stale/eligible for authoritative refetch after a mutation.

Invalidation controls **UI freshness**, not database snapshot persistence.

### `staleTime`

Duration React Query considers cached data fresh before normal lifecycle rules may cause it to refetch.

It is not the same as a polling interval.

### `gcTime`

How long unused React Query cache data can remain before garbage collection.

### Polling / `refetchInterval`

Periodic re-execution of a query while it is enabled/mounted according to hook policy.

Polling is observational unless the endpoint itself has side effects (which should generally be avoided).

### Mutation

An API operation intended to change backend/system state, normally represented by React Query `useMutation`.

Some backend actions are operationally mutating despite unusual HTTP methods, so semantics must be checked rather than inferred only from method.

### Diagnostic action

An operation that may use POST/PUT but does not change persisted configuration.

Example:

```text
POST /api/snmp/test-connection/
```

Diagnostic actions should not trigger persisted StateSync snapshots.

### Logical failure

A backend response where HTTP transport may succeed but payload reports failure, for example:

```json
{
  "ok": false,
  "error": "..."
}
```

Frontend API helpers must reject/throw where that is part of the endpoint contract.

### Partial failure

A multi-request workflow where earlier steps can succeed even though a later request fails.

Examples include pool delete cleanup, Web Share permission setup, Samba membership batches, and cross-domain user creation.

## Persistence terms

### `save_to_db`

Backend request parameter used by the SOHO API contract to indicate whether a request should persist a canonical snapshot.

Frontend architecture enforces:

```text
normal API traffic    -> save_to_db=false
StateSync snapshot    -> save_to_db=true
```

Feature code should not own this flag.

### StateSyncManager

Frontend coordinator responsible for requesting canonical persisted snapshots after successful mutations in mapped domains.

File:

```text
src/lib/stateSyncManager.ts
```

### StateSync domain

A logical persisted resource family known to `StateSyncManager`.

Current domains include:

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

### Canonical snapshot

A backend GET representing authoritative post-mutation domain state, requested by StateSync with `save_to_db=true`.

The frontend requests the snapshot; the backend owns actual database persistence.

### Cross-domain StateSync

A mutation can affect more than one persisted domain.

Examples:

```text
zpool mutation      -> zpool + disk
filesystem mutation -> filesystem + zpool
Samba user mutation -> samba-users + samba-groups
```

## UI/state terms

### Detail split view

Shared UI pattern/store for an active resource plus pinned comparison/detail resources.

Examples include Disks, Integrated Storage, File System, and Samba share views.

### Active item

Current primary resource selected in a detail split view.

### Pinned item

Resource kept visible for comparison/detail even when another resource becomes active.

### Dashboard layout

Per-user browser-local arrangement of Dashboard widgets, including order, hidden widgets, and size overrides.

It is a UI preference, not backend managed-system state.

### Draft layout

Temporary Dashboard customization state before the operator chooses Save.

### RTL

Right-to-left layout direction used by the Persian UI.

The project uses Emotion/Stylis RTL support plus semantic `dir="rtl"` where required.

### LTR technical value

Technical strings such as IP addresses, hostnames, service names, or paths may remain left-to-right inside an RTL page for readability.

## Build and operations terms

### Vite

Frontend build/dev tooling.

Production command ultimately creates static assets in:

```text
dist/
```

### `VITE_*`

Vite build-time environment variables exposed to client code/bundle.

They must not contain secrets.

### `dist/`

Static production build artifact generated by Vite.

This is what a production static web server such as Nginx serves.

### SPA fallback

Web-server behavior that returns `index.html` for unknown client-side routes so browser-history routing works on direct navigation/refresh.

Typical Nginx pattern:

```nginx
try_files $uri $uri/ /index.html;
```

### Release artifact

Immutable build output associated with an exact source revision and build configuration.

### Atomic release

Deployment strategy where a new immutable release is prepared first and one pointer/symlink is switched to activate it, enabling rapid rollback.

## Documentation terms

### Core flow

Cross-feature runtime mechanism such as authentication, API lifecycle, cache, StateSync, polling, or notifications.

### Feature document

Page/domain-specific documentation describing user flow, APIs, state, business rules, failures, and extension guidance.

### ADR

Architecture Decision Record.

A short durable record explaining a significant architecture choice, its rationale, consequences, and alternatives/context.

### Source of truth

The single maintained document/module responsible for a particular contract.

Documentation should link to the source of truth rather than copying detailed rules into multiple competing documents.

## Related documentation

- [`project-overview.md`](./project-overview.md)
- [`scope.md`](./scope.md)
- [`../02-architecture/`](../02-architecture/)
- [`../04-core-flows/`](../04-core-flows/)
- [`../05-features/`](../05-features/)
- [`../06-api/endpoint-map.md`](../06-api/endpoint-map.md)
