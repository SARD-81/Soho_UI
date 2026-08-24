# Authentication API

This document describes the frontend authentication transport contract used by SOHO UI.

For the complete session lifecycle, also read:

[`../04-core-flows/authentication.md`](../04-core-flows/authentication.md)

## Transport separation

SOHO uses two Axios clients for authentication-related traffic.

### Isolated auth client

Defined in:

```text
src/lib/authApi.ts
```

Used for:

- access/refresh token issue;
- access-token refresh;
- token verification.

These operations deliberately bypass the shared Axios response interceptor.

Reason: if refresh itself used the normal client and returned 401, it could recursively enter the same 401 recovery flow it is supposed to resolve.

### Shared application client

Logout uses:

```text
src/lib/axiosInstance.ts
```

because logout is an authenticated application mutation and should carry the current Bearer access token.

## Authentication base URL resolution

The isolated auth client resolves its base URL in this order.

### 1. Explicit auth base

If configured and non-empty:

```text
VITE_AUTH_API_BASE_URL
```

that value is used directly after trailing-slash normalization.

Example:

```env
VITE_AUTH_API_BASE_URL=https://api.example.com/api/auth/
```

### 2. Derived from application base

If the auth-specific value is missing, the client falls back to:

```text
VITE_API_BASE_URL
```

and ensures the path ends in:

```text
/api/auth/
```

Example:

```text
VITE_API_BASE_URL=https://api.example.com
                      ↓
https://api.example.com/api/auth/
```

If the supplied application URL already ends in `/auth`, the helper does not append another auth segment.

### 3. Empty base

If neither variable is configured, the auth client uses an empty base URL and relative requests resolve against the browser origin.

That behavior can be useful behind a same-origin reverse proxy, but it must be intentional in deployment configuration.

## Login / token issue

Frontend helper:

```text
login()
```

Request:

```http
POST <auth-base>/token/
Content-Type: application/json
```

Payload:

```json
{
  "username": "operator",
  "password": "..."
}
```

Expected response shape:

```json
{
  "access": "<access-token>",
  "refresh": "<refresh-token>"
}
```

Frontend ownership after success:

- access token -> memory-only token storage;
- refresh token -> session storage with in-memory fallback;
- username -> session storage with in-memory fallback;
- authenticated React state -> `AuthContext`;
- initial canonical StateSync baseline -> triggered by authenticated-session flow.

The login helper itself does not own UI navigation, toast messages, or StateSync.

## Access-token verification

Frontend helper:

```text
verifyAccessToken(token)
```

Request:

```http
POST <auth-base>/token/verify/
```

Payload:

```json
{
  "token": "<access-token>"
}
```

A successful response is treated as verification success; no response body is required by the frontend helper.

During application initialization, a stored/session access state is restored only after verification succeeds.

## Access-token refresh

Frontend helper:

```text
refreshAccessToken(refresh)
```

Request:

```http
POST <auth-base>/token/refresh/
```

Payload:

```json
{
  "refresh": "<refresh-token>"
}
```

Expected response:

```json
{
  "access": "<new-access-token>"
}
```

The frontend currently expects the existing refresh token to remain usable; the helper does not consume a rotated refresh token from the response.

If the backend introduces refresh-token rotation, the frontend contract must be updated deliberately.

## Automatic 401 recovery

Normal application requests use the shared Axios instance.

When a response returns 401 and the original request has not already been retried:

1. retrieve the refresh token;
2. if missing, clear local session state;
3. start one refresh request if none is active;
4. concurrent 401 failures wait in `failedQueue`;
5. save the newly issued access token;
6. update the Axios default Authorization header;
7. emit the token-refreshed auth event;
8. replay queued requests with the same new access token;
9. replay the original failed request.

This is a **single-flight refresh** design.

It prevents a burst of expired-token requests from generating a burst of independent refresh requests.

## Refresh failure

If refresh fails:

1. every queued request is rejected;
2. frontend token/session storage is cleared;
3. a session-cleared event is emitted;
4. the original request rejects with the refresh failure;
5. React authentication state reacts to the session-cleared event and protected routing closes.

Do not suppress this failure by infinitely retrying token refresh.

## `_retry` guard

The original Axios config receives:

```text
_retry = true
```

before the refresh/replay attempt.

This prevents the same request from recursively entering 401 recovery more than once.

## Logout

Frontend helper:

```text
logout(refresh)
```

Request:

```http
POST /api/system/ui-user/logout/
Authorization: Bearer <access-token>
```

Payload:

```json
{
  "refresh": "<refresh-token>"
}
```

Unlike token issue/refresh/verify, this request uses the shared application Axios client.

### Local-first logout invariant

The React authentication flow clears local authenticated state **before** waiting for the backend logout request to complete.

This means:

- protected routes become inaccessible immediately;
- a slow/unreachable logout endpoint does not keep the user authenticated in the UI;
- backend token invalidation is still attempted.

Do not reverse this ordering without reviewing the security/user-experience consequences.

## Authorization header

For normal application traffic, the shared request interceptor reads the current in-memory access token and adds:

```http
Authorization: Bearer <access-token>
```

If no access token exists, the header is not added by this logic.

Authentication endpoints on the isolated client do not rely on the shared interceptor.

## Token storage model

Current frontend design intentionally avoids persistent access-token storage.

### Access token

Stored:

```text
memory only
```

### Refresh token

Stored:

```text
sessionStorage
```

with an in-memory fallback when storage is unavailable.

### Username

Session identity username follows the same session-storage/fallback model.

The separate “remember username” login convenience stores only the username preference and must not be expanded into password/token persistence.

## Session restore

At application initialization the authentication provider considers:

- stored refresh token;
- stored username;
- last-activity timestamp;
- in-memory access token when available.

High-level recovery order:

```text
session starts
   ↓
idle timeout check
   ↓
access token available?
   ├─ yes -> verify
   └─ no  -> refresh token available?
                ├─ yes -> refresh
                └─ no  -> unauthenticated
```

A successful restoration then runs the session's canonical StateSync baseline once.

## Idle timeout

The frontend enforces a 30-minute inactivity timeout.

The activity timestamp is persisted in session storage so a page reload does not reset inactivity history.

This is a frontend session-control layer. Backend token expiry and authorization must remain independently enforced.

## Authentication endpoints and StateSync

Auth endpoints are excluded from the normal `save_to_db` transport policy and StateSync mutation scheduling.

Token/session operations are not managed-system persistence domains.

Do not map authentication URLs to `StateSyncManager`.

## Error handling

Login/verify/refresh errors propagate to their caller.

401 errors from ordinary application requests are handled centrally as described above.

Non-401 application errors are not converted into authentication failures merely because they occur while the user is authenticated.

## Security invariants

- Never persist the access token to `localStorage`.
- Do not store the login password.
- Keep auth token refresh on the isolated client.
- Keep the 401 retry guard.
- Keep refresh single-flight unless replacing it with an equivalent concurrency-safe design.
- Backend authorization remains authoritative; frontend protected routes are not sufficient access control.
- `VITE_AUTH_BYPASS` must remain gated by `import.meta.env.DEV`.
- `VITE_*` environment values are browser-visible and must not contain secrets.

## Endpoint summary

| Operation | Client | Method | Endpoint |
| --- | --- | --- | --- |
| Login/token issue | isolated auth client | POST | `<auth-base>/token/` |
| Refresh access token | isolated auth client | POST | `<auth-base>/token/refresh/` |
| Verify access token | isolated auth client | POST | `<auth-base>/token/verify/` |
| Logout | shared app client | POST | `/api/system/ui-user/logout/` |

## Related files

- `src/lib/authApi.ts`
- `src/lib/axiosInstance.ts`
- `src/lib/tokenStorage.ts`
- `src/lib/authEvents.ts`
- `src/contexts/AuthContext.tsx`
- `src/routes/ProtectedRoute.tsx`
- `src/hooks/useSessionActivityTimeout.ts`
- `src/hooks/useRememberUsername.ts`

## Related documentation

- [`api-conventions.md`](./api-conventions.md)
- [`error-handling.md`](./error-handling.md)
- [`endpoint-map.md`](./endpoint-map.md)
- [`../04-core-flows/authentication.md`](../04-core-flows/authentication.md)
- [`../04-core-flows/routing-and-access-control.md`](../04-core-flows/routing-and-access-control.md)
- [`../03-development/configuration.md`](../03-development/configuration.md)
