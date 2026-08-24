# SOHO UI Documentation

This directory is the source of truth for understanding, maintaining, and extending the SOHO frontend.

The goal is not to document every line of code. The goal is to preserve the knowledge that is expensive to rediscover: system boundaries, architectural decisions, runtime flows, business rules, operational constraints, API contracts, and non-obvious implementation details.

## How to use these docs

If you return to the project after a long break, read the documents in this order:

1. [`01-overview/project-overview.md`](./01-overview/project-overview.md) — what the application is and what it is responsible for.
2. [`02-architecture/frontend-architecture.md`](./02-architecture/frontend-architecture.md) — frontend module ownership and runtime structure.
3. [`02-architecture/runtime-flow.md`](./02-architecture/runtime-flow.md) — application bootstrap, request, auth, and mutation flow.
4. [`02-architecture/data-flow.md`](./02-architecture/data-flow.md) — backend state, React Query, UI state, and StateSync boundaries.
5. [`02-architecture/decisions/`](./02-architecture/decisions/) — why the major architectural choices exist.
6. [`03-development/getting-started.md`](./03-development/getting-started.md) — local setup and first verification steps.
7. [`03-development/project-structure.md`](./03-development/project-structure.md) — where code belongs and where to start when changing a feature.
8. [`03-development/configuration.md`](./03-development/configuration.md) — verified Vite/environment configuration.
9. [`03-development/coding-conventions.md`](./03-development/coding-conventions.md) — project coding conventions and ownership rules.
10. [`03-development/code-commenting-guidelines.md`](./03-development/code-commenting-guidelines.md) — rules for useful in-code comments.
11. [`03-development/testing.md`](./03-development/testing.md) — current quality gates and the explicit automated-test gap.
12. [`04-core-flows/authentication.md`](./04-core-flows/authentication.md) — login, token storage, session restore, refresh, idle timeout, and logout.
13. [`04-core-flows/routing-and-access-control.md`](./04-core-flows/routing-and-access-control.md) — protected routing and frontend access-control boundaries.
14. [`04-core-flows/api-request-lifecycle.md`](./04-core-flows/api-request-lifecycle.md) — Axios, React Query, 401 recovery, persistence policy, and mutation StateSync.
15. [`04-core-flows/server-state-and-cache.md`](./04-core-flows/server-state-and-cache.md) — ownership of server state, cache, invalidation, and UI freshness.
16. [`04-core-flows/state-sync-save-to-db.md`](./04-core-flows/state-sync-save-to-db.md) — canonical backend snapshot persistence and `save_to_db` invariants.
17. [`04-core-flows/polling-and-data-refresh.md`](./04-core-flows/polling-and-data-refresh.md) — maintained polling inventory and refresh policy.
18. [`04-core-flows/notifications.md`](./04-core-flows/notifications.md) — notification baselines, monitoring lifecycles, and duplicate suppression.
19. The relevant document under [`05-features/`](./05-features/) before modifying feature-specific behavior.
20. [`06-api/api-conventions.md`](./06-api/api-conventions.md) and [`06-api/endpoint-map.md`](./06-api/endpoint-map.md) before introducing or changing backend integration.
21. The relevant operations document under [`07-operations/`](./07-operations/) before build/deployment/troubleshooting work.

## Documentation map

### Overview

- [`01-overview/project-overview.md`](./01-overview/project-overview.md)

Planned completion items:

- `01-overview/scope.md`
- `01-overview/glossary.md`

### Architecture

- [`02-architecture/frontend-architecture.md`](./02-architecture/frontend-architecture.md)
- [`02-architecture/runtime-flow.md`](./02-architecture/runtime-flow.md)
- [`02-architecture/data-flow.md`](./02-architecture/data-flow.md)

Architecture decisions:

- [`02-architecture/decisions/ADR-001-react-query-server-state.md`](./02-architecture/decisions/ADR-001-react-query-server-state.md)
- [`02-architecture/decisions/ADR-002-centralized-axios.md`](./02-architecture/decisions/ADR-002-centralized-axios.md)
- [`02-architecture/decisions/ADR-003-state-sync-persistence.md`](./02-architecture/decisions/ADR-003-state-sync-persistence.md)
- [`02-architecture/decisions/ADR-004-client-side-routing.md`](./02-architecture/decisions/ADR-004-client-side-routing.md)
- [`02-architecture/decisions/ADR-005-rtl-emotion-cache.md`](./02-architecture/decisions/ADR-005-rtl-emotion-cache.md)

### Development

- [`03-development/getting-started.md`](./03-development/getting-started.md)
- [`03-development/project-structure.md`](./03-development/project-structure.md)
- [`03-development/configuration.md`](./03-development/configuration.md)
- [`03-development/coding-conventions.md`](./03-development/coding-conventions.md)
- [`03-development/code-commenting-guidelines.md`](./03-development/code-commenting-guidelines.md)
- [`03-development/testing.md`](./03-development/testing.md)

### Core flows

- [`04-core-flows/authentication.md`](./04-core-flows/authentication.md)
- [`04-core-flows/routing-and-access-control.md`](./04-core-flows/routing-and-access-control.md)
- [`04-core-flows/api-request-lifecycle.md`](./04-core-flows/api-request-lifecycle.md)
- [`04-core-flows/server-state-and-cache.md`](./04-core-flows/server-state-and-cache.md)
- [`04-core-flows/state-sync-save-to-db.md`](./04-core-flows/state-sync-save-to-db.md)
- [`04-core-flows/polling-and-data-refresh.md`](./04-core-flows/polling-and-data-refresh.md)
- [`04-core-flows/notifications.md`](./04-core-flows/notifications.md)

### Features

Feature documents describe actual page-level user flow, query/mutation ownership, backend dependencies, business rules, failure modes, and extension points.

- [`05-features/dashboard.md`](./05-features/dashboard.md) — live monitoring widgets, per-user layout customization, polling, uptime, and 3D server slots.
- [`05-features/disks.md`](./05-features/disks.md) — disk inventory/details, pool ownership, partition safety checks, and destructive cleanup flow.
- [`05-features/integrated-storage.md`](./05-features/integrated-storage.md) — zpool lifecycle, create/add/replace/delete/import/export, slot mapping, properties, and conditional storage polling.
- [`05-features/block-storage.md`](./05-features/block-storage.md) — Volume list/create/delete, manual refresh, dynamic attributes, and the current Volume StateSync boundary.
- [`05-features/file-system.md`](./05-features/file-system.md) — filesystem CRUD, mount/canmount, encryption key lifecycle, passphrase handling, detail state, and cross-domain StateSync.
- [`05-features/services.md`](./05-features/services.md) — service list/status polling, Start/Stop, boot enablement, status normalization, and per-unit query fan-out.
- [`05-features/users.md`](./05-features/users.md) — OS-user management, Samba identity linkage, duplicate checks, and non-atomic OS-to-Samba creation.
- [`05-features/samba-shares.md`](./05-features/samba-shares.md) — Samba shares/users/groups, member management, account-flag fan-out, partial-failure workflows, and StateSync ownership.
- [`05-features/nfs-shares.md`](./05-features/nfs-shares.md) — NFS CRUD, filesystem mountpoint dependency, option translation, service restart behavior, and NFS StateSync.
- [`05-features/web-share.md`](./05-features/web-share.md) — filesystem/share eligibility, two-stage Web Share creation, permission handling, and Web Share StateSync.
- [`05-features/snmp.md`](./05-features/snmp.md) — SNMP configuration, connection diagnostics, response normalization, and persisted-versus-diagnostic boundaries.
- [`05-features/settings.md`](./05-features/settings.md) — general system settings, network configuration, Web users, and cross-domain user creation.
- [`05-features/history.md`](./05-features/history.md) — current History placeholder status and implementation checklist.

Every currently routed product feature has either a full feature document or, for History, an explicit placeholder-state document.

### API

- [`06-api/api-conventions.md`](./06-api/api-conventions.md) — shared transport, query/mutation, persistence, normalization, and integration rules.
- [`06-api/authentication-api.md`](./06-api/authentication-api.md) — auth base resolution, token endpoints, 401 recovery, and logout contract.
- [`06-api/error-handling.md`](./06-api/error-handling.md) — error normalization, logical failure, partial failure, retry, and presentation rules.
- [`06-api/endpoint-map.md`](./06-api/endpoint-map.md) — centralized Feature → Method → Endpoint → Query/owner → StateSync map.

### Operations

The operations section is the next active documentation phase:

- `07-operations/build.md`
- `07-operations/deployment.md`
- `07-operations/troubleshooting.md`

### Other maintained notes

- [`general-settings.md`](./general-settings.md) — detailed General Settings API/normalization/UI notes; the higher-level Settings feature document links to this maintained subdocument.

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

## Target structure

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
│   ├── dashboard.md
│   ├── disks.md
│   ├── integrated-storage.md
│   ├── block-storage.md
│   ├── file-system.md
│   ├── services.md
│   ├── users.md
│   ├── samba-shares.md
│   ├── nfs-shares.md
│   ├── web-share.md
│   ├── snmp.md
│   ├── settings.md
│   └── history.md
├── 06-api/
│   ├── api-conventions.md
│   ├── authentication-api.md
│   ├── error-handling.md
│   └── endpoint-map.md
└── 07-operations/
    ├── build.md
    ├── deployment.md
    └── troubleshooting.md
```

The remaining overview/operations documents and final audit should complete this target structure.
