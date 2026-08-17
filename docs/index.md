# SOHO UI Documentation

This directory is the source of truth for understanding, maintaining, and extending the SOHO frontend.

The goal is not to document every line of code. The goal is to preserve the knowledge that is expensive to rediscover: system boundaries, architectural decisions, runtime flows, business rules, operational constraints, and non-obvious implementation details.

## How to use these docs

If you return to the project after a long break, read the documents in this order:

1. [`01-overview/project-overview.md`](./01-overview/project-overview.md) — what the application is and what it is responsible for.
2. [`02-architecture/frontend-architecture.md`](./02-architecture/frontend-architecture.md) — how the frontend is structured at runtime.
3. [`03-development/project-structure.md`](./03-development/project-structure.md) — where code belongs and where to start when changing a feature.
4. [`03-development/code-commenting-guidelines.md`](./03-development/code-commenting-guidelines.md) — the project rules for useful in-code comments.
5. [`04-core-flows/authentication.md`](./04-core-flows/authentication.md) — login, token storage, session restore, refresh, idle timeout, and logout.
6. [`04-core-flows/routing-and-access-control.md`](./04-core-flows/routing-and-access-control.md) — protected routing and frontend access-control boundaries.
7. [`04-core-flows/api-request-lifecycle.md`](./04-core-flows/api-request-lifecycle.md) — Axios, React Query, 401 recovery, persistence policy, and mutation state sync.
8. [`04-core-flows/server-state-and-cache.md`](./04-core-flows/server-state-and-cache.md) — ownership of server state, cache, invalidation, and UI freshness.
9. [`04-core-flows/state-sync-save-to-db.md`](./04-core-flows/state-sync-save-to-db.md) — canonical backend snapshot persistence and `save_to_db` invariants.
10. [`04-core-flows/polling-and-data-refresh.md`](./04-core-flows/polling-and-data-refresh.md) — the maintained polling inventory and refresh policy.
11. [`04-core-flows/notifications.md`](./04-core-flows/notifications.md) — notification baselines, shared-query observation, and duplicate suppression.
12. The relevant feature document before modifying feature-specific behavior.

## Documentation map

### Overview

- [`01-overview/project-overview.md`](./01-overview/project-overview.md)

### Architecture

- [`02-architecture/frontend-architecture.md`](./02-architecture/frontend-architecture.md)

### Development

- [`03-development/project-structure.md`](./03-development/project-structure.md)
- [`03-development/code-commenting-guidelines.md`](./03-development/code-commenting-guidelines.md)

### Core flows

- [`04-core-flows/authentication.md`](./04-core-flows/authentication.md)
- [`04-core-flows/routing-and-access-control.md`](./04-core-flows/routing-and-access-control.md)
- [`04-core-flows/api-request-lifecycle.md`](./04-core-flows/api-request-lifecycle.md)
- [`04-core-flows/server-state-and-cache.md`](./04-core-flows/server-state-and-cache.md)
- [`04-core-flows/state-sync-save-to-db.md`](./04-core-flows/state-sync-save-to-db.md)
- [`04-core-flows/polling-and-data-refresh.md`](./04-core-flows/polling-and-data-refresh.md)
- [`04-core-flows/notifications.md`](./04-core-flows/notifications.md)

### Other maintained notes

- [`general-settings.md`](./general-settings.md)

### Legacy compatibility redirects

These files remain only so older links do not break. Do not add live behavior documentation to them:

- [`api-polling-audit.md`](./api-polling-audit.md) → canonical polling documentation
- [`notifications-and-data-refresh.md`](./notifications-and-data-refresh.md) → canonical notification/refresh documentation
- [`state-sync-save-to-db.md`](./state-sync-save-to-db.md) → canonical StateSync documentation

## Documentation principles

### Document decisions, not syntax

The code already shows how a local variable is assigned or how a component renders. Documentation should instead answer questions such as:

- Why is this flow designed this way?
- Which module owns this responsibility?
- What invariants must remain true when the implementation changes?
- Which other domains are affected by this mutation?
- What is the expected lifecycle of this data?
- Which behavior is intentional even if it looks unusual?

### Keep one source of truth

Do not duplicate detailed behavior in multiple places. A high-level document should link to a detailed flow document instead of restating its full contract.

### Update docs with behavior changes

A change is not complete when it modifies a documented architectural contract, business rule, runtime flow, API convention, or operational procedure without updating the corresponding documentation.

### Prefer diagrams for flows

Use Mermaid diagrams when ordering, ownership, or dependencies are easier to understand visually than as prose.

## Planned structure

The documentation will progressively evolve toward this layout:

```text
docs/
├── index.md
├── 01-overview/
│   ├── project-overview.md
│   ├── scope.md
│   └── glossary.md
├── 02-architecture/
│   ├── frontend-architecture.md
│   ├── runtime-flow.md
│   ├── data-flow.md
│   └── decisions/
├── 03-development/
│   ├── getting-started.md
│   ├── project-structure.md
│   ├── configuration.md
│   ├── coding-conventions.md
│   ├── code-commenting-guidelines.md
│   └── testing.md
├── 04-core-flows/
│   ├── authentication.md
│   ├── routing-and-access-control.md
│   ├── api-request-lifecycle.md
│   ├── server-state-and-cache.md
│   ├── state-sync-save-to-db.md
│   ├── polling-and-data-refresh.md
│   └── notifications.md
├── 05-features/
├── 06-api/
└── 07-operations/
```

This structure is intentionally introduced incrementally. Existing useful documentation should be preserved and migrated only when its new location and ownership are clear.
