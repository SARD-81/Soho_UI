# ADR-002: Centralize API Transport in `axiosInstance`

- Status: Accepted
- Scope: Authenticated API transport, request/response interceptors, persistence transport policy

## Context

SOHO UI sends many backend requests across storage, system, sharing, users, settings, and monitoring features.

Several behaviors must be identical regardless of which feature makes the request:

- backend base URL;
- JSON headers;
- Bearer access token injection;
- 401 refresh/replay behavior;
- optional mock adapter registration;
- `save_to_db` transport policy;
- successful-mutation StateSync scheduling;
- common API error diagnostics.

Implementing these independently in feature hooks would create security and consistency drift.

## Decision

Use a shared Axios instance in `src/lib/axiosInstance.ts` for normal application API traffic.

Feature code supplies endpoint-specific method, parameters, and payload. Cross-cutting transport behavior remains centralized.

Authentication token endpoints that must not participate in the normal 401-refresh interceptor loop use the dedicated auth API client instead.

## Consequences

### Positive

- one place controls Authorization header behavior;
- one refresh queue prevents concurrent refresh storms;
- persistence policy cannot be bypassed accidentally by ordinary feature hooks;
- mock API behavior is applied consistently;
- successful mutation observation can schedule StateSync centrally.

### Tradeoffs

- interceptors are high-impact infrastructure and require careful review;
- URL classification logic must distinguish auth, diagnostics, and persisted mutation domains correctly;
- specialized calls that bypass the shared instance must document why.

## Transport invariants

1. Normal `/api/` traffic uses `save_to_db=false`.
2. Only internal StateSync requests may request `save_to_db=true`.
3. Stale caller-level `save_to_db` flags are normalized rather than trusted.
4. Access tokens are read from memory-only token storage and added centrally.
5. Authentication refresh uses a single-flight queue.
6. Internal StateSync marker headers are removed before transport.
7. Feature code must not implement its own token refresh loop.

## Auth-client exception

Login/verify/refresh are handled outside the normal Axios instance because sending refresh through an interceptor that itself reacts to 401 responses can create recursion and refresh loops.

This is an intentional dependency boundary, not duplicated transport by accident.

## Alternatives considered

### Raw `fetch`/Axios calls inside each hook

Rejected because token, persistence, error, and refresh behavior would diverge.

### One Axios instance including token refresh endpoints

Rejected because refresh endpoints require different failure semantics and must not re-enter the normal refresh interceptor path.

### Middleware at every feature service

Rejected as unnecessary duplication of cross-cutting transport concerns.

## When to revisit

Revisit if the frontend changes HTTP library, introduces generated API clients, or moves authentication/persistence transport policy to another architectural layer.

Any replacement must preserve the current security and persistence invariants before feature migration.

## Related documentation

- [`../../04-core-flows/api-request-lifecycle.md`](../../04-core-flows/api-request-lifecycle.md)
- [`../../04-core-flows/authentication.md`](../../04-core-flows/authentication.md)
- [`../../04-core-flows/state-sync-save-to-db.md`](../../04-core-flows/state-sync-save-to-db.md)
