# Code Commenting Guidelines

## Purpose

Comments in SOHO UI exist to preserve reasoning that the code alone cannot communicate safely.

The project does **not** aim for a high comment count. Clean code should remain readable through naming, structure, types, and small focused functions. A comment is justified when it preserves intent, constraints, risk, or historical context that a future maintainer could otherwise misinterpret.

The core rule is:

> Code should explain **what** and **how**. Comments should explain **why**, **constraints**, and **surprises**.

## Language

Engineering comments in source files should be written in English.

Reasons:

- source identifiers and library APIs are English;
- existing high-value comments are already English;
- one language reduces maintenance friction across the codebase;
- technical terms do not need repeated translation.

User-facing UI text may remain Persian.

## The decision process before adding a comment

Before writing a comment, use this sequence:

```text
Can the code be understood without a comment?
│
├── Yes → Do not add one.
│
└── No
    │
    ├── Is the code unnecessarily complicated?
    │   ├── Yes → Refactor first.
    │   └── No
    │
    └── Would the reason/constraint/side effect be easy to forget?
        ├── No → Prefer clearer code.
        └── Yes → Add a concise comment.
```

A comment must not become a substitute for refactoring.

## Good comment categories

### 1. Architectural contracts

Use comments to protect global invariants that are not obvious from an individual statement.

Good example from the transport/state-sync design:

```ts
/**
 * Persistence contract:
 * - normal API requests never persist snapshots;
 * - only StateSyncManager may request save_to_db=true;
 * - stale caller-level flags must not bypass the transport policy.
 */
```

This comment is useful because removing or bypassing the behavior would change a system-wide persistence contract.

### 2. Security-sensitive decisions

Security behavior often looks simpler if a future developer removes it. Preserve the reason.

Example:

```ts
// Access tokens remain memory-only. Persist only the refresh token for the
// current browser session so a reload can restore authentication without
// leaving the bearer token in persistent browser storage.
```

Do not write a security comment unless the code actually enforces the statement.

### 3. Ordering and lifecycle constraints

Use a comment when order is part of correctness.

Example:

```ts
// Clear local auth state before notifying the backend so protected routes are
// inaccessible even when the logout endpoint is slow or unavailable.
clearAuthState();
```

Without the comment, a maintainer might move `clearAuthState()` after the request and unintentionally change failure behavior.

### 4. Race-condition and concurrency protection

If code exists to prevent duplicate work, stale overwrites, request storms, or re-entrancy, document the invariant rather than every branch.

Example:

```ts
/**
 * Coalesces rapid mutations into one canonical snapshot. If another mutation
 * arrives while the snapshot is running, queue exactly one follow-up run so
 * persisted state converges to the newest observed system state.
 */
```

### 5. Business rules whose reason is not obvious

Prefer expressive code first. Add a comment only when the rule's origin or reason is not evident.

Weak:

```ts
// Mirror requires an even number of disks.
if (count % 2 !== 0) { ... }
```

Better when domain context matters:

```ts
// The backend models MIRROR vdevs as disk pairs; reject an unmatched device
// here so the user receives validation before the create request is sent.
```

If the rule is already self-explanatory and stable, no comment is needed.

### 6. Compatibility and migration behavior

Temporary compatibility logic must explain when it can be removed.

Example:

```ts
// Compatibility: older callers may still include save_to_db in mutation
// payloads. Force it to false here until those legacy payload fields have been
// removed from all hooks.
```

When the compatibility code is removed, the comment must be removed with it.

### 7. Non-obvious browser/framework behavior

Document behavior that exists because of React StrictMode, browser lifecycle, storage availability, visibility changes, or library-specific semantics.

Example:

```ts
// Reuse the same baseline promise so React StrictMode and repeated auth renders
// cannot start multiple full state snapshots in one authenticated session.
```

## Comments that should usually be rejected

### Restating the code

Bad:

```ts
// Set authenticated to true.
setIsAuthenticated(true);
```

Bad:

```ts
// Loop through domains.
domains.forEach(...);
```

Bad:

```ts
// Return if there is an error.
if (hasError) return;
```

These comments increase noise and become stale easily.

### Decorative section comments

Avoid large files split by comments such as:

```ts
// =============================
// FUNCTIONS
// =============================
```

If a file needs many visual sections, it may be carrying too many responsibilities. Prefer extraction and better naming.

### Explaining bad names

Bad:

```ts
// x is the number of selected disks.
const x = selectedDevices.length;
```

Fix the code:

```ts
const selectedDeviceCount = selectedDevices.length;
```

### Explaining dead or commented-out code

Do not keep old implementations commented out. Git already stores history.

Bad:

```ts
// const oldRequest = ...
// We used this before the backend change.
```

Delete it. If the decision matters long term, record it in an ADR or migration note.

### Comments that contradict code

A comment is not allowed to make incorrect code appear intentional.

For example, if a feature hook still sends a legacy field that the transport layer overrides, do not add:

```ts
// This is true here, but axios changes it to false later.
save_to_db: true,
```

Prefer removing the obsolete field so code and architecture agree.

## JSDoc policy

JSDoc is useful for exported behavior with a non-trivial contract. It is not required for every function.

### Good JSDoc targets

Use JSDoc for:

- exported infrastructure functions with lifecycle guarantees;
- utilities with non-obvious input/output semantics;
- functions where callers must respect important constraints;
- public reusable hooks whose behavior is not clear from the type signature;
- concurrency/state synchronization functions;
- functions with meaningful side effects that are easy to miss.

Example:

```ts
/**
 * Runs the canonical baseline snapshot once per authenticated session.
 * Repeated callers reuse the same promise until the session is reset.
 */
export const syncAllStateDomainsOnce = () => { ... };
```

### Poor JSDoc targets

Do not add this:

```ts
/** Returns the normalized path. */
const normalizePath = (url: string) => ...;
```

The name and type already explain it.

Do not generate boilerplate such as `@param` and `@returns` when TypeScript already carries the same information and there is no extra semantic contract.

## TODO and FIXME policy

Unqualified TODOs are not acceptable.

Bad:

```ts
// TODO: fix this
```

Bad:

```ts
// TODO later
```

A TODO/FIXME must explain:

1. what remains to be changed;
2. why it cannot be done now;
3. what condition or tracked work allows its removal.

Preferred form:

```ts
// TODO(#142): Remove this compatibility branch after legacy API responses are
// no longer supported by the backend.
```

If no issue exists, use enough searchable context to make the TODO actionable:

```ts
// TODO: Remove this legacy payload field after all create-pool requests have
// migrated to the transport-owned state-sync contract.
```

Use `FIXME` only when the current implementation is known to be incorrect or unsafe, not as a stronger synonym for TODO.

## File-level comments

Do not add a file header that merely repeats the filename.

Bad:

```ts
// This file handles authentication.
```

A file-level comment is justified only when the module has a non-obvious contract that applies to most of its contents.

For example, `axiosInstance.ts` may justify a short policy comment around the persistence transport boundary because many helper functions exist solely to enforce that policy.

## React-specific guidance

### Components

Do not comment JSX layout that is visually obvious.

Bad:

```tsx
{/* Header */}
<AppBar>...</AppBar>
```

A comment can be useful when conditional rendering is based on a non-obvious lifecycle or browser constraint.

### Effects

A `useEffect` should ideally be understandable from extracted function names and dependencies. Comment the effect when the synchronization reason is not obvious.

Good example concept:

```ts
// Re-check the persisted idle timestamp when the tab becomes visible because
// background timer throttling must not let an expired session become active.
```

### Refs

Comment a ref when it is being used to enforce lifecycle correctness rather than simply store a DOM node.

Examples include preventing duplicate timeout execution, storing the latest callback without re-registering listeners, or guarding concurrent work.

### React Query

Document unusual query options only when they differ intentionally from project defaults for a domain reason.

Weak:

```ts
// Poll every 2 seconds.
refetchInterval: 2000,
```

Better:

```ts
// CPU is a live dashboard metric; keep the 2s cadence only while the widget is
// observed. Background-tab polling remains disabled by the global policy.
refetchInterval: 2000,
```

For widespread polling rules, prefer the polling documentation over repeating the same comment in every hook.

## API and mutation hooks

Mutation hooks deserve comments when they contain ordering, dependency, or compatibility behavior.

Before adding comments, verify that the hook is not duplicating global responsibilities already owned by:

- `axiosInstance`;
- the global `MutationCache`;
- `StateSyncManager`;
- shared error utilities.

If the hook contains a legacy field that the transport discards or overrides, prefer removing the field over explaining the mismatch.

## Comment placement

Place the comment as close as possible to the code whose intent it protects.

Prefer:

```ts
// Clear local state first so route access is revoked even if server logout fails.
clearAuthState();
await logoutRequest(refreshToken);
```

Over a distant paragraph at the top of a long file.

For a multi-function module-wide invariant, use one focused block comment near the policy boundary instead of duplicating it at every call site.

## Comment maintenance rule

Comments are part of the code.

When changing the associated behavior:

- update the comment in the same commit;
- delete comments that are no longer true;
- do not leave historical descriptions attached to new logic;
- verify links/issue references still make sense.

An outdated comment is usually more dangerous than no comment.

## Comment review checklist

During review, ask:

- Does this comment explain something the code cannot express clearly?
- Does it capture a reason, invariant, constraint, side effect, or risk?
- Can clearer naming/refactoring remove the need for it?
- Is it accurate for the current code, not a previous version?
- Is it located next to the behavior it protects?
- Will it still be useful to a developer returning in six months?
- Is a repository document or ADR a better home because the information spans multiple files?

If the answer to the usefulness question is no, remove the comment.

## When to use docs or ADRs instead

Use an in-code comment when the information protects a local implementation decision.

Use a documentation page when the information explains a flow across multiple modules.

Use an ADR when the information explains why the system chose one long-lived architecture option over alternatives.

Example:

```text
Why clear auth state before server logout?
→ In-code comment + authentication flow doc.

How does authentication work across AuthContext, Axios, tokenStorage and routes?
→ Core-flow documentation.

Why are access tokens memory-only instead of localStorage?
→ Security comment + authentication ADR if the decision needs formal history.
```

## Definition of done for comments

A source-code change is not complete if it introduces non-obvious policy, security behavior, race protection, compatibility logic, or lifecycle ordering without either:

- making the intent obvious through code structure; or
- adding the minimum useful comment that preserves the reason.

The reverse is also true: a change is not complete if it leaves obsolete comments behind.
