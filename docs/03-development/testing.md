# Testing

This document describes the current quality-assurance state of SOHO UI and the target direction for automated behavioral coverage.

## Current status

`package.json` currently defines:

```text
dev
build
lint
preview
```

There is still no `test` script and no adopted unit, integration, or end-to-end test runner. The project must therefore not claim automated behavioral test coverage that does not exist.

The repository **does now have an executable CI quality gate**:

```text
.github/workflows/frontend-validation.yml
```

The workflow runs on:

- pushes to `agent/project-documentation-audit` while this audit branch is active;
- pull requests targeting `main`.

It uses Node.js 22 and executes:

```text
npm ci
npm run lint
npm run build
```

The workflow also publishes a `frontend-validation` commit status so the lint/build result is visible as release/PR evidence.

CI proves that the repository installs, lints, type-checks, and bundles successfully in its CI environment. It does **not** prove that product workflows or backend integrations behave correctly.

## What the current quality checks provide

### Dependency installation

CI uses:

```bash
npm ci
```

against the committed `package-lock.json`.

This catches lockfile/package metadata inconsistencies and avoids opportunistic dependency resolution during validation.

### TypeScript / production build

```bash
npm run build
```

runs:

```text
tsc -b && vite build
```

This catches:

- many static type errors;
- unused locals/parameters configured by TypeScript;
- invalid imports/module-resolution problems;
- production bundle failures.

It does not prove that feature behavior is correct.

### ESLint

```bash
npm run lint
```

checks configured TypeScript, React, Hook, and general lint rules.

Lint does not validate backend semantics or user workflows.

### Manual verification

Until automated behavioral tests are introduced, behavior-changing work still requires targeted manual verification of the affected flows.

Manual verification should be explicit in PR descriptions rather than described only as “tested”.

## CI workflow contract

Canonical file:

```text
.github/workflows/frontend-validation.yml
```

Current job sequence:

```text
checkout
→ publish pending frontend-validation status
→ setup Node.js 22
→ npm ci
→ npm run lint
→ npm run build
→ publish final frontend-validation status
```

The final status is one of:

```text
success
failure
error
```

A failed CI run is a merge blocker until its lint/build cause is understood and corrected.

Do not weaken or bypass the normal project commands merely to make CI green.

## Minimum manual regression checklist

Choose the relevant items for the change.

### Authentication

- login success/failure;
- refresh/session restore;
- protected-route redirect;
- logout;
- idle-timeout behavior where affected.

### API / StateSync

- normal request carries observational persistence behavior;
- successful mutation refreshes expected UI data;
- persisted domains schedule their canonical snapshot;
- diagnostic/non-mutating POST actions do not create persistence side effects;
- failed mutation does not schedule success-only persistence.

### Storage

- list/load state;
- create/update/delete relevant resource where safe;
- confirmation flows for destructive actions;
- affected cross-domain refreshes;
- modal pending/error state;
- partial-failure messaging for multi-stage workflows.

### Shares / users

- duplicate-name validation;
- membership add/remove;
- dependency errors;
- user/group/share query refresh;
- multi-request partial-failure state when relevant.

### Settings

- dirty form state is not overwritten;
- confirmation dialogs fire before system-impacting changes;
- correct network endpoint is used for DHCP/static;
- Web-user/OS-user partial-failure behavior is understood;
- Persian/RTL copy remains readable after source edits.

## Recommended automated testing layers

When test infrastructure is introduced, use more than one layer.

### 1. Unit tests

Best candidates include pure or mostly pure helpers such as:

- normalization utilities;
- NFS option translation;
- Samba member parsing/merging;
- Web Share normalization;
- hostname/NTP validation;
- notification threshold/fingerprint helpers;
- StateSync URL-to-domain mapping;
- service/SNMP boolean normalization.

These tests should be fast and deterministic.

### 2. Hook/data-layer tests

Test important query/mutation contracts with mocked network boundaries:

- query key shape;
- endpoint/method/payload mapping;
- success invalidation;
- compatibility response normalization;
- abort/enable behavior where meaningful.

Avoid tests that simply reproduce implementation details.

### 3. Component integration tests

Useful flows include:

- create/edit modals;
- destructive confirmation;
- form validation;
- pending/error states;
- membership editors;
- settings dirty-state behavior.

Prefer user-visible behavior over checking internal React state.

### 4. End-to-end tests

High-value E2E scenarios include:

- authentication/session lifecycle;
- representative storage-resource create/delete against a controlled environment;
- Samba/NFS/Web Share workflows;
- network/system settings in a safe test appliance;
- StateSync persistence after a mutation.

System-administration E2E tests require an isolated backend/environment because many operations are destructive or host-level.

## Suggested tooling direction

No behavioral test tool is mandated yet because the repository has not adopted a test stack.

A reasonable future React/Vite setup could include:

- Vitest for unit/hook tests;
- React Testing Library for component behavior;
- MSW or controlled Axios mocks for API boundaries;
- Playwright for end-to-end browser flows.

Treat this as a recommendation, not current installed infrastructure.

Before adding a test stack, record the decision with:

- selected tools;
- why they fit this project;
- test directory conventions;
- API mocking strategy;
- CI commands;
- destructive test isolation requirements.

## Highest-priority future tests

### StateSync URL mapping

Test that:

- zpool mutations map to zpool + disk;
- filesystem maps to filesystem + zpool;
- disk maps to disk + zpool;
- Samba user/group relationships map cross-domain;
- Web Share and NFS map correctly;
- SNMP config maps to SNMP;
- SNMP diagnostic test connection does **not** map to persistence.

### Axios persistence policy

Test that:

- normal `/api/` traffic gets `save_to_db=false`;
- caller-level stale body flags are neutralized;
- StateSync internal requests get true;
- auth endpoints are excluded;
- the internal StateSync header is not leaked to the backend.

### Authentication refresh queue

Test:

- multiple simultaneous 401 responses cause one refresh;
- queued requests replay after success;
- refresh failure clears session and rejects queued calls.

### StateSync coalescing

Test:

- rapid mutations coalesce;
- mutation during an in-flight sync schedules exactly one follow-up;
- session reset clears pending timers/baseline state.

### Multi-stage workflows

Test partial failures for:

- OS user → Samba user;
- Web user → OS user;
- Web Share → permission update;
- Samba group → initial member adds.

## Tests, comments, and documentation

Do not use comments as a substitute for tests when an invariant is executable and stable.

The intended relationship is:

- tests prove behavior;
- CI proves the executable validation commands passed;
- comments explain why non-obvious behavior exists;
- documentation explains ownership, workflow, and maintenance consequences.

## CI expectation after test adoption

Once automated tests exist, extend the merge gate to include the adopted test command, for example:

```text
npm ci
npm run lint
npm run test
npm run build
```

Today CI intentionally runs only the repository-defined lint/build quality gates because no `test` script exists.

## Definition of Done

A behavior change is complete only when:

1. relevant docs are updated;
2. `frontend-validation` passes;
3. the affected flow is manually verified when behavioral validation is required;
4. partial-failure/error paths are considered;
5. the final diff is reviewed for accidental changes.

## Related files

- `.github/workflows/frontend-validation.yml`
- `package.json`
- `package-lock.json`
- `tsconfig.app.json`
- `eslint.config.js`

## Related documentation

- [`getting-started.md`](./getting-started.md)
- [`coding-conventions.md`](./coding-conventions.md)
- [`../07-operations/build.md`](../07-operations/build.md)
- [`../04-core-flows/api-request-lifecycle.md`](../04-core-flows/api-request-lifecycle.md)
- [`../04-core-flows/state-sync-save-to-db.md`](../04-core-flows/state-sync-save-to-db.md)
