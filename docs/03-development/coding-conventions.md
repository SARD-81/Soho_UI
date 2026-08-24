# Coding Conventions

This document records conventions observed and intentionally adopted for SOHO UI maintenance.

The goal is consistency and low rediscovery cost, not stylistic bureaucracy.

## General principles

Prefer code that makes ownership and behavior obvious without relying on comments.

In particular:

- keep server-state logic in hooks/data layers rather than page JSX;
- centralize transport behavior in `axiosInstance`;
- centralize persisted snapshot behavior in `StateSyncManager`;
- use React Query for authoritative backend state;
- use local React state for temporary UI interaction state;
- document non-obvious reasons and invariants, not readable syntax;
- do not preserve old implementations as commented code.

## Language and formatting

Source code and source comments should use English identifiers/comments for consistency with the existing codebase.

User-facing strings may remain Persian where required by the product UI.

Prettier configuration currently expects:

```text
single quotes
2-space indentation
semicolons
ES5-style trailing commas
```

Import organization and Tailwind formatting plugins are configured.

Avoid large unrelated formatting changes in feature commits.

## TypeScript

The application runs with strict TypeScript settings.

Prefer:

- explicit domain interfaces for API models;
- `unknown` for untrusted API shapes until narrowed;
- type guards/normalizers at API boundaries;
- discriminated unions for mode/action state;
- `as const` for stable query keys/constants;
- `satisfies` where it validates object shape without losing inference.

Avoid:

- broad `any`;
- `@ts-ignore` as a normal fix;
- casts that merely silence an incorrect model;
- making every property optional to avoid understanding the backend contract.

When backend data is inconsistent, normalize it once in the hook/service layer.

## React components

Pages should primarily orchestrate:

- feature hooks;
- page-level modal/open state;
- user feedback;
- derived data needed to compose child components.

Move reusable or complex responsibilities out of a page when they become independently meaningful.

Avoid putting transport policy, token handling, persistence logic, or global cache rules inside presentation components.

## Hooks

Feature hooks should own:

- stable React Query keys;
- endpoint calls;
- request/response normalization;
- feature-specific mutation invalidation;
- feature-specific query lifecycle options.

A hook should not own global transport concerns already handled by Axios.

Examples of forbidden caller ownership:

```text
save_to_db=true
manual Bearer header duplication
ad-hoc token refresh
feature-local copies of global 401 handling
```

## React Query keys

Treat a query key as an API between consumers and invalidators.

Prefer exported stable keys when multiple modules use them:

```ts
export const sambaUsersQueryKey = ['samba-users'] as const;
```

For parameterized resources, include parameters that materially change the response:

```ts
['os-users', { includeSystem }]
```

Do not create a new key for the same resource merely because it is consumed by another page unless it genuinely requires an independent lifecycle/cadence.

When a dedicated monitoring key is intentional, document why.

## API normalization

Normalize backend compatibility variants near the data boundary.

Examples in the codebase include:

- boolean-like service/SNMP values;
- multiple Web Share response shapes;
- filesystem/volume attribute maps;
- Samba field names;
- NFS option inversion;
- network configuration derivation.

Components should consume predictable domain models rather than repeat defensive parsing.

## Mutations

A mutation should:

1. send one clearly defined backend operation;
2. expose useful pending/error state;
3. invalidate affected query keys on success;
4. let centralized Axios/StateSync handle persistence when applicable.

If a UI workflow requires multiple mutations, explicitly document partial-failure behavior.

Do not present a multi-request workflow as atomic unless the backend provides a transaction or explicit rollback.

## Destructive operations

Deletion/destructive changes should normally use explicit confirmation when accidental activation could cause meaningful loss or service impact.

Examples include:

- disk cleanup;
- pool/filesystem/share deletion;
- stopping services;
- deleting administrative users/groups.

The backend remains responsible for authorization and integrity rules.

## Error handling

Use backend error messages where they add actionable detail, but normalize common response shapes in a shared utility/hook rather than repeating parsing in every component.

For multi-stage operations, distinguish which stage failed.

Good:

```text
Web Share created, permission update failed
```

Less useful:

```text
Operation failed
```

Do not hide an error solely because a later React Query invalidation may repair the UI.

## Security-sensitive code

Security invariants should be explicit and conservative.

Current examples:

- access tokens remain memory-only;
- refresh tokens are session-scoped;
- auth bypass requires Vite development mode;
- protected routes wait for auth restoration before redirecting;
- local logout occurs before backend logout completes.

Avoid weakening these behaviors as part of unrelated refactors.

## Browser storage

Do not use local/session storage as an unstructured substitute for application state.

Current browser persistence has specific owners, such as:

- refresh token/session username;
- idle activity timestamp;
- dashboard layout/preferences;
- notification bookkeeping.

If adding storage, define:

- owner;
- key;
- lifetime;
- cleanup behavior;
- whether the value is authoritative or merely client bookkeeping.

Never persist secrets that the architecture intentionally keeps in memory.

## Comments

Follow [`code-commenting-guidelines.md`](./code-commenting-guidelines.md).

The short rule:

> If the code already explains WHAT/HOW, a comment should only remain when it preserves WHY, a constraint, an invariant, lifecycle ordering, security reasoning, concurrency behavior, or compatibility context.

Delete dead commented implementations. Git history is the archive.

## TODO / FIXME

A TODO should include enough context to be actionable and removable.

Prefer:

```ts
// TODO(#142): Remove this compatibility branch after the legacy response
// format is no longer supported by the backend.
```

Avoid:

```ts
// TODO fix this
```

## Imports

Keep import paths consistent with existing relative-module conventions.

Fix path oddities rather than preserving them (for example, duplicate slashes).

Use type-only imports where appropriate:

```ts
import type { SomeType } from './types';
```

## CSS / UI styling

Prefer existing design tokens/CSS variables and shared component styles over one-off hardcoded design systems.

Technical LTR values can be embedded inside the Persian RTL product UI when needed for readability.

Keep semantic direction (`dir`) separate from CSS mirroring when the DOM needs an actual direction attribute.

## Adding a new feature

A new feature should normally include:

- route/entry point when applicable;
- feature document;
- stable query keys;
- normalized API model;
- mutation/invalidation rules;
- explicit StateSync ownership decision;
- polling decision;
- error handling;
- tests when infrastructure exists;
- extension/failure notes when non-obvious.

## Review checklist

Before considering a change complete:

- Is the data owner obvious?
- Are query keys reused correctly?
- Did any caller reintroduce `save_to_db` ownership?
- Are multi-step partial failures understood?
- Are dead comments/code removed?
- Are security/lifecycle invariants preserved?
- Did a documented contract change?
- Does lint pass?
- Does build pass?
- Was the affected flow manually verified if no automated test exists?

## Related documentation

- [`project-structure.md`](./project-structure.md)
- [`code-commenting-guidelines.md`](./code-commenting-guidelines.md)
- [`testing.md`](./testing.md)
- [`../04-core-flows/server-state-and-cache.md`](../04-core-flows/server-state-and-cache.md)
- [`../04-core-flows/state-sync-save-to-db.md`](../04-core-flows/state-sync-save-to-db.md)
