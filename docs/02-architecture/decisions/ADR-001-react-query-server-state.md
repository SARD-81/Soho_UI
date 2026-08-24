# ADR-001: Use TanStack React Query for Server State

- Status: Accepted
- Scope: Frontend server-state reads, mutation lifecycle, cache invalidation, polling

## Context

SOHO UI is an administrative frontend over a mutable storage/system backend. Many values can change outside the local component that renders them, including system telemetry, storage state, services, shares, users, and settings.

The frontend needs consistent handling for:

- loading/error state;
- caching;
- stale/fresh policy;
- request deduplication by resource identity;
- mutation invalidation;
- controlled polling;
- conditional queries;
- cancellation/abort behavior.

Keeping copies of authoritative backend data in arbitrary component state would duplicate lifecycle logic and make cross-page consistency difficult.

## Decision

Use TanStack React Query as the primary owner of **client-side server state**.

Feature hooks define stable query keys, endpoint calls, normalization, and feature-specific lifecycle configuration.

React Query cache is not durable application persistence and must not be treated as an authoritative database.

## Consequences

### Positive

- consistent query lifecycle across features;
- explicit query identity through keys;
- focused invalidation after mutations;
- polling can be scoped to mounted/enabled consumers;
- server state is separated from transient UI state;
- pages remain orchestration layers instead of request-state machines.

### Tradeoffs

- query-key design becomes an architectural contract;
- different keys hitting the same endpoint create independent cache/request lifecycles;
- developers must understand invalidation ownership;
- React Query does not solve backend persistence, authorization, or transactional consistency.

## Rules

1. Backend-authoritative values belong in React Query unless a stronger reason exists.
2. Query keys must be stable and meaningful.
3. Parameter values that alter a response belong in the key.
4. Do not create page-specific duplicate keys for the same resource/lifecycle without justification.
5. Dedicated monitoring keys must be documented when they intentionally create independent traffic.
6. Successful mutations invalidate affected queries; failed mutations do not pretend state changed.
7. React Query cache must never be used as the mechanism for `save_to_db` persistence.

## Alternatives considered

### Component-local `useEffect` + `useState` requests

Rejected as the default because it duplicates cancellation, stale state, loading/error, invalidation, and polling behavior across features.

### Zustand for server state

Rejected as the primary server-state layer. Zustand remains useful for client-only shared UI state such as detail split-view state, but it would require rebuilding server-state lifecycle machinery already provided by React Query.

### Global Redux-like normalized store

Not needed for current frontend architecture and would add synchronization boilerplate between requests and stored entities.

## When to revisit

Revisit if:

- the application moves to a fundamentally different data platform;
- offline-first synchronized persistence becomes a core requirement;
- React Query no longer fits server-state lifecycle needs.

A replacement should explicitly address caching, invalidation, polling, concurrency, and migration of existing query contracts.

## Related documentation

- [`../data-flow.md`](../data-flow.md)
- [`../../04-core-flows/server-state-and-cache.md`](../../04-core-flows/server-state-and-cache.md)
- [`../../04-core-flows/polling-and-data-refresh.md`](../../04-core-flows/polling-and-data-refresh.md)
