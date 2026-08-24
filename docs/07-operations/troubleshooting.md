# Troubleshooting

This runbook is for diagnosing SOHO UI build, deployment, authentication, API, caching, polling, and feature-level operational failures.

Start by identifying which layer is actually failing before changing code.

## First classification

Use this order:

```text
1. Build artifact exists?
2. Nginx/static serving works?
3. SPA routing works?
4. Browser assets load?
5. API base points to intended backend?
6. Authentication API works?
7. Normal authenticated API works?
8. React Query/cache behavior correct?
9. Feature/backend domain operation correct?
10. StateSync persistence correct?
```

A frontend symptom can originate several layers away. Avoid fixing the visible symptom before locating the owning layer.

## Build failures

### `npm ci` fails

Check:

```bash
node --version
npm --version
```

Then inspect the actual npm error for:

- unsupported Node/npm combination;
- registry/network failure;
- `package.json` / `package-lock.json` mismatch;
- filesystem permission problems;
- corrupted dependency cache only when evidence points there.

Do not replace `npm ci` with an untracked `npm install` on a release pipeline merely to force installation through a lockfile mismatch.

### TypeScript build fails

Normal build is:

```bash
npm run build
```

which includes:

```text
tsc -b
vite build
```

Fix the TypeScript/source problem. Do not release with a custom command that bypasses `tsc -b`.

### Lint fails but build passes

Run:

```bash
npm run lint
```

Build and lint are separate gates. Review the specific ESLint error instead of treating a successful bundle as equivalent to lint success.

## `dist/` is missing

A successful `npm run build` should produce:

```text
dist/
```

Check:

```bash
ls -la dist
```

If the directory does not exist, inspect the build output before touching Nginx.

## Blank page after deployment

Open browser Developer Tools.

Check:

1. `index.html` status;
2. main JS/CSS bundle status;
3. console errors;
4. asset paths;
5. API requests.

Common causes:

- wrong Nginx root;
- incomplete artifact upload;
- JS asset 404;
- stale cached `index.html` referencing removed assets;
- incorrect hosting-path assumptions with Vite `base: './'`;
- runtime exception visible in browser console.

## Root works but nested-route refresh returns 404

Symptom:

```text
/dashboard works after clicking from /
```

but direct browser navigation to:

```text
/settings
/file-system
/share
```

returns an Nginx 404.

Cause is usually missing SPA fallback.

Reference rule:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

Validate Nginx config before reload:

```bash
sudo nginx -t
```

Then use the organization's normal reload procedure, commonly:

```bash
sudo systemctl reload nginx
```

## Assets load at `/` but fail on some route forms

Current Vite config uses:

```text
base: './'
```

Inspect actual asset URLs in browser Network/HTML when:

- routes gain trailing slashes;
- frontend moves under a subpath;
- Nginx redirects URLs;
- a reverse proxy rewrites paths.

Do not assume the issue is React Router if JS/CSS requests themselves point to the wrong location.

## Fonts or 3D assets 404

Check:

- browser request path;
- `public/` artifact contents;
- Vite `/fonts` alias expectations;
- Nginx root;
- filename case sensitivity on Linux;
- whether public assets were actually included in the deployed build.

Linux production hosting is case-sensitive even when a developer previously tested on a case-insensitive filesystem.

## Old UI remains after deployment

Check:

1. whether Nginx `current`/root points to the intended release;
2. `index.html` cache headers;
3. browser cache;
4. CDN/proxy cache if present;
5. whether the new artifact actually has different hashed assets;
6. source commit recorded for the release.

Aggressively caching `index.html` can keep clients on an old release even when new files exist on disk.

## UI loads but talks to the wrong backend

Inspect browser Network request URLs.

`VITE_API_BASE_URL` and `VITE_AUTH_API_BASE_URL` are build-time values.

If the bundle contains a wrong API origin:

```text
rebuild the frontend with correct VITE_* values
```

Changing a shell environment variable on the Nginx host after build does not rewrite existing static JavaScript.

## CORS failures

Symptoms often include browser console messages while curl/server-to-server access works.

Check:

- frontend origin;
- API origin;
- backend allowed origins;
- Authorization header allowance;
- HTTP methods (`PUT`, `DELETE`, etc.);
- preflight OPTIONS behavior;
- reverse-proxy handling.

If frontend and API share one public origin through Nginx proxy, CORS complexity can often be reduced.

Do not “fix” CORS by disabling browser security or using wildcard credential policy without understanding backend security implications.

## Login endpoint 404 / wrong URL

Verify configured/derived auth base.

Expected token paths are relative to auth base:

```text
token/
token/refresh/
token/verify/
```

If using ordinary base:

```env
VITE_API_BASE_URL=https://api.example.com
```

frontend derives:

```text
https://api.example.com/api/auth/
```

If auth lives elsewhere, configure:

```text
VITE_AUTH_API_BASE_URL
```

Inspect actual browser request URL before changing auth code.

## Login succeeds but subsequent API calls return 401

Check:

1. access token was returned by login;
2. `AuthContext` stored authenticated state;
3. shared Axios request has `Authorization: Bearer ...`;
4. token is valid for the backend environment;
5. backend clock/token expiry;
6. frontend and auth endpoints are pointing to the same intended environment.

Do not persist the access token to localStorage as a debugging shortcut.

## Repeated 401 / refresh loop

Expected architecture uses:

- one isolated refresh request;
- `_retry` guard per failed request;
- one `isRefreshing` single-flight state;
- queued concurrent failures.

Check whether:

- refresh endpoint itself was accidentally moved onto shared `axiosInstance`;
- `_retry` was removed;
- refresh token is missing/expired;
- backend returns 401 for replayed request even with new access token;
- token scopes/authorization reject the operation for reasons beyond expiry.

A refresh failure should clear the session rather than recurse indefinitely.

## Session disappears after browser reload

Current design keeps access token memory-only.

Session restoration depends on:

- refresh token in `sessionStorage`;
- username/session metadata;
- idle timestamp;
- successful refresh/verification.

Check sessionStorage and auth network calls. Do not treat memory-only access-token loss on reload as a bug by itself.

## User is logged out after inactivity

Frontend idle timeout is currently 30 minutes.

The activity timestamp survives reload in session storage.

Check whether the elapsed time genuinely exceeded the timeout before changing token behavior.

## `save_to_db=true` appears on normal requests

This violates the current persistence contract unless the request is an internal StateSync canonical snapshot.

Expected:

```text
normal /api traffic -> save_to_db=false
StateSync canonical GET -> save_to_db=true
```

Inspect:

- request URL/params;
- whether `X-Soho-State-Sync` internal marking was involved before interceptor removal;
- caller code for legacy `save_to_db` fields;
- `applySaveToDbTransportPolicy()`.

Do not add more caller flags to compensate.

## Mutation succeeds but persisted snapshot does not run

Check:

1. request went through shared `axiosInstance`;
2. method is POST/PUT/PATCH/DELETE;
3. endpoint is not classified as auth;
4. `resolveStateDomainsForMutation(url)` maps the URL;
5. the domain has a canonical `STATE_SYNC_DEFINITIONS` entry;
6. StateSync executor request succeeds.

Remember some domains intentionally have no current StateSync mapping, including Volumes, OS users, Web users, services, general settings, and network configuration.

## Unexpected persistence after a diagnostic POST

HTTP POST does not automatically mean “persist this domain.”

Known explicit example:

```text
POST /api/snmp/test-connection/
```

must be excluded from SNMP StateSync because it is diagnostic.

When adding similar actions, put diagnostic exclusions before broad domain URL matches.

## UI does not refresh after a successful mutation

Persistence and UI freshness are separate.

Check React Query invalidation first:

```text
mutation success
  ↓
correct query key invalidated?
  ↓
refetch returns changed backend state?
```

Do not use `save_to_db` as a cache-refresh mechanism.

## Duplicate/frequent requests

Before removing polling, identify whether requests have different semantic purposes.

Examples:

- Services intentionally perform one list request plus one status request per unit every 5 seconds.
- Samba account flags intentionally fan out one query per displayed username.
- Dashboard Network has base interface data plus separate bandwidth snapshots every 2 seconds.
- Notification capacity checks currently have dedicated queries separate from some page caches.

Use [`../04-core-flows/polling-and-data-refresh.md`](../04-core-flows/polling-and-data-refresh.md) as the polling inventory.

## CPU / Memory / Network keeps polling in hidden tab

Expected high-frequency telemetry uses:

```text
refetchIntervalInBackground=false
```

If hidden-tab traffic appears excessive, inspect the actual query/hook and browser visibility state before changing cadence.

## Integrated Storage request volume is high

Check whether lifecycle-gated resources became permanently enabled:

- available/unpartitioned disk query should be active only for Create/Add/Replace flows;
- importable pool query should be modal-scoped;
- pool slot mapping should be on-demand;
- detail queries should be bounded to selected/pinned pools.

## Wipe button is disabled unexpectedly

Disk wipe eligibility combines:

- pool membership;
- partition-count readiness;
- partition count;
- current wipe state.

Inspect the dedicated partition-count endpoint and pool-device membership before changing button logic.

## Disk cleanup reports failure but disk changed

`cleanupDisk()` is multi-step:

```text
clear-zfs (best effort)
  ↓
wipe (required)
```

Inspect both requests. A clear-ZFS failure can still be followed by a wipe attempt.

## Pool delete reports error but pool disappeared

Pool delete sequence destroys the pool **before** cleaning former disks.

A later disk cleanup failure can make the overall UI report an error after the pool is already gone.

Check backend zpool state before retrying destroy blindly.

## File System delete is blocked

Known backend dependency errors can indicate active share configuration.

Inspect related Samba/NFS/Web Share resources before attempting repeated deletion.

Backend dependency enforcement is authoritative.

## Encryption passphrase problem

Frontend sends filesystem passphrases encoded as UTF-8 → Base64.

Check:

- correct field name (`passphrase` or `new_passphrase` depending on endpoint);
- Base64 generation;
- TLS transport;
- backend decode expectations;
- current key/encryption status.

Do not interpret Base64 as encryption.

## Volume changes are not in StateSync snapshot

This is current architecture, not necessarily a failure.

`/api/volume/*` is not currently mapped to a StateSync domain.

If backend product requirements say Volumes must have snapshot persistence, confirm the backend contract and extend StateSync centrally instead of adding `save_to_db=true` to Volume hooks.

## Samba user delete returns HTTP 400

Current UI interprets this as a likely active-share dependency.

Check where the Samba user is referenced before deleting.

Do not bypass the backend dependency check from the frontend.

## Samba group membership partially changes

One username is updated per PUT.

If request N fails, requests 1..N-1 may already be applied.

Reread the group membership from backend and repair the final desired state; do not assume rollback occurred.

## Web Share exists but permission is not 777

Create is two-stage:

```text
POST /api/webshare/
  ↓
POST /api/webshare/set-permission/
```

The first can succeed while the second fails.

Check both requests independently. The frontend does not automatically delete the share on permission failure.

## NFS config and service state disagree

Current create flow requests restart of:

```text
nfs-server.service
```

before submitting the create mutation, while edit does not use the same restart path.

This is a documented current limitation. Treat NFS API state and service restart as separate operations during diagnosis.

Do not reorder production behavior casually without confirming backend/service semantics.

## Services page generates many requests

Current model is approximately:

```text
1 list request + N per-unit status requests every 5 seconds
```

If scale becomes problematic, preferred architectural fix is a backend batch/list contract containing required status—not random frontend suppression that leaves data stale.

## Service Start is disabled

A masked service cannot be started by current table UI.

The hook supports `unmask`, but the table does not expose an Unmask action.

Resolve mask state through an approved management path before treating the disabled Start button as a UI bug.

## Network configuration endpoint mismatch

Current backend contract is asymmetric:

```text
DHCP   -> POST /api/network/{interface}/configure/
Static -> POST /api/system/network/{interface}/configure/
```

Verify mode before changing URL code.

## Web user exists but OS user does not

Settings creates Web user first, then starts a separate OS-user mutation.

This flow is non-atomic. A Web user can legitimately remain after OS-user creation fails.

Do not automatically delete the Web user during incident response unless that recovery action is explicitly intended.

## OS user exists but Samba user does not

The Users OS-first Samba workflow is also sequential/non-atomic.

Check each mutation independently.

## Power action surprises

Current backend contract executes reboot/poweroff using:

```text
GET /api/system/power/execute/?action=reboot|poweroff
```

Although GET is normally expected to be safe/observational, these calls are operationally mutating.

Do not prefetch, health-check, crawl, or automatically replay these URLs.

## Nginx diagnostics

Common Debian/Nginx checks:

```bash
sudo nginx -t
sudo systemctl status nginx
```

Logs are commonly available through:

```bash
sudo journalctl -u nginx
```

and/or configured Nginx access/error log files.

Exact log paths and logging policy are server-specific.

When debugging proxy failures, compare:

```text
browser -> Nginx public URL
Nginx -> backend internal URL
```

separately.

## Browser diagnostics checklist

Capture:

- failing request URL;
- method;
- status code;
- response body;
- request headers excluding secrets from shared reports;
- browser console error;
- route URL;
- deployed release SHA;
- API origin;
- whether failure occurs after hard refresh or only SPA navigation.

Do not paste access/refresh tokens into issue trackers or logs.

## Release-level incident checklist

When a new release causes failure:

1. identify deployed SHA/artifact;
2. compare with previous known-good release;
3. check static asset errors;
4. verify built API endpoints/environment;
5. inspect authentication;
6. inspect backend compatibility;
7. rollback static artifact if appropriate;
8. remember backend changes may make frontend-only rollback incompatible.

## Escalation information

A useful frontend/backend incident report should include:

```text
feature/route
frontend release SHA
backend environment/version if known
exact endpoint + method
HTTP status
sanitized response payload
steps to reproduce
expected behavior
actual behavior
whether operation may have partially succeeded
relevant React Query key / StateSync domain
```

## Related documentation

- [`build.md`](./build.md)
- [`deployment.md`](./deployment.md)
- [`../06-api/endpoint-map.md`](../06-api/endpoint-map.md)
- [`../06-api/error-handling.md`](../06-api/error-handling.md)
- [`../04-core-flows/authentication.md`](../04-core-flows/authentication.md)
- [`../04-core-flows/state-sync-save-to-db.md`](../04-core-flows/state-sync-save-to-db.md)
- [`../04-core-flows/polling-and-data-refresh.md`](../04-core-flows/polling-and-data-refresh.md)
