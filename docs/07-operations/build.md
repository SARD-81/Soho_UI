# Build

This document defines the verified build contract for SOHO UI and the artifact/information that should be handed to an operations or DevOps owner.

SOHO UI is a Vite-built React/TypeScript application. The production result is a static `dist/` directory; there is no Node application server required to render the frontend after build.

## Current repository build tooling

`package.json` defines:

```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "preview": "vite preview"
}
```

There is currently no `test` script.

`package-lock.json` is committed and uses lockfile version 3.

The repository currently does **not** contain:

- a Dockerfile;
- GitHub Actions workflow files;
- an Nginx configuration file;
- a pinned Node version through `.nvmrc` or `package.json#engines`.

Those are operational gaps/choices, not hidden build requirements.

## Recommended release build sequence

From a clean checkout of the intended commit:

```bash
npm ci
npm run lint
npm run build
```

Why `npm ci` for release/CI builds:

- installs from the committed lockfile;
- fails when package metadata and lockfile are inconsistent;
- avoids opportunistically rewriting dependency resolution;
- starts from a clean dependency tree.

For ordinary local development, `npm install` remains acceptable when intentionally changing dependencies.

## Build command behavior

The production command is:

```bash
npm run build
```

which expands to:

```text
tsc -b
  ↓
vite build
```

Therefore a successful build verifies two important layers:

1. TypeScript project compilation/type checks;
2. Vite production bundling.

Do not call `vite build` directly in a release process and claim the normal project build passed; doing so skips the explicit `tsc -b` step defined by the project.

## TypeScript quality gates

`tsconfig.app.json` currently enables strict checks including:

```text
strict
noUnusedLocals
noUnusedParameters
noFallthroughCasesInSwitch
noUncheckedSideEffectImports
```

A compile failure should be fixed in source/type definitions rather than bypassed with a weaker release command.

## Lint

Run:

```bash
npm run lint
```

Current lint command:

```text
eslint .
```

`dist` is globally ignored by ESLint.

The build script does not automatically invoke ESLint, so release verification should run both lint and build.

## Automated-test status

There is currently no automated test runner/script in `package.json`.

A release checklist therefore cannot honestly contain `npm test` as a passing gate today.

Until a test suite is added, minimum executable quality gates are:

```text
npm ci
npm run lint
npm run build
manual smoke verification of critical flows
```

See [`../03-development/testing.md`](../03-development/testing.md) for the testing gap and recommended future direction.

## Environment variables are build-time inputs

Vite `VITE_*` values are embedded into the browser bundle during build.

Verified settings include:

```text
VITE_API_BASE_URL
VITE_AUTH_API_BASE_URL   optional
VITE_USE_MOCKS
VITE_AUTH_BYPASS
```

A production build must use production-appropriate values **before** `npm run build`.

Changing server environment variables after `dist/` was generated does not rewrite values already embedded into the JavaScript bundle.

## Production environment safety

Production release expectations:

```text
VITE_USE_MOCKS=false
VITE_AUTH_BYPASS=false
```

`VITE_AUTH_BYPASS` is additionally guarded by `import.meta.env.DEV`, but production configuration should still keep it disabled to avoid ambiguous release configuration.

Never place secrets in Vite environment variables. Browser users can inspect client bundle/configuration.

See [`../03-development/configuration.md`](../03-development/configuration.md).

## API base configuration choices

### Single backend origin/path

Ordinary setup can use only:

```env
VITE_API_BASE_URL=https://api.example.com
```

The auth client then derives:

```text
https://api.example.com/api/auth/
```

### Separate auth origin/path

When authentication is deliberately hosted separately:

```env
VITE_API_BASE_URL=https://api.example.com
VITE_AUTH_API_BASE_URL=https://auth.example.com/api/auth/
```

Do not set a separate auth URL unless deployment topology actually requires it.

## Vite output

Successful Vite production build writes static assets to:

```text
dist/
```

Typical artifact contents include:

```text
index.html
assets/*
public/static assets copied by Vite
```

The exact hashed asset filenames are build outputs and should not be hard-coded into server configuration.

## Vite base path

Current `vite.config.ts` contains:

```text
base: './'
```

This makes generated asset URLs relative.

Any change to hosting path/base must be tested against:

- root navigation;
- nested client routes;
- direct page refresh;
- JS/CSS loading;
- fonts;
- 3D/static assets;
- browser history routing.

## Build artifact verification

After build, verify at minimum:

```bash
ls -la dist
```

Then use:

```bash
npm run preview
```

for a local production-bundle smoke check.

`vite preview` is a verification server, not the documented production web server.

## Manual smoke checklist

Because automated tests are not yet present, verify representative high-risk paths before release:

- login;
- refresh/reload an authenticated session;
- logout;
- direct navigation to a protected nested route;
- Dashboard loads CPU/memory/network/zpool data;
- Integrated Storage list loads;
- File System list loads;
- one non-destructive Settings read flow;
- API 401 recovery when reasonably testable;
- static fonts/icons/3D assets load without 404;
- browser refresh on nested route returns the SPA rather than an Nginx 404.

Destructive storage/system mutations should only be smoke-tested in an environment where they are safe.

## What to hand to DevOps / operations

For a deployment handoff, provide either:

### Option A — prebuilt artifact

- the verified `dist/` directory/archive;
- source commit SHA used for the build;
- build date/release identifier;
- production API/auth base values used during build;
- output of lint/build checks;
- deployment/rollback notes.

### Option B — source-based build

Provide:

- repository and exact commit/tag;
- `package.json` + `package-lock.json` from that revision;
- required `VITE_*` values;
- commands:
  ```bash
  npm ci
  npm run lint
  npm run build
  ```
- expected output directory: `dist/`;
- Node/npm version that was validated for the release.

Option B is preferable when the deployment pipeline is designed to create reproducible artifacts itself.

## Node version gap

The project currently says to use a supported Node.js LTS release, but does not pin one in repository metadata.

For reproducible production builds, a future maintenance change should add one explicit policy such as:

- `.nvmrc`;
- `.node-version`;
- `package.json#engines`;
- CI/container image pinning.

Until then, record the exact Node/npm versions used for every production release.

Useful command:

```bash
node --version
npm --version
```

## Build failure triage

### `npm ci` fails

Check:

- Node/npm compatibility;
- package-lock consistency;
- registry/network access;
- corrupted npm cache only after checking the actual error;
- whether someone changed `package.json` without updating `package-lock.json`.

### TypeScript fails

Run the normal build and fix the reported source/type issue. Do not skip `tsc -b` in release builds.

### ESLint fails

Treat lint failures separately from type errors. Review the exact rule/file; do not globally disable rules solely to unblock a release.

### Build succeeds but API points to wrong backend

The wrong `VITE_API_BASE_URL` or `VITE_AUTH_API_BASE_URL` was likely used at build time. Rebuild with correct values; changing Nginx environment variables alone will not modify the existing bundle.

### Build succeeds but nested route refresh fails

This is usually a web-server SPA fallback problem, not a Vite compile problem. See [`deployment.md`](./deployment.md).

## Release evidence

For each release, preserve at least:

```text
commit SHA
Node version
npm version
environment-name / non-secret VITE endpoints
npm ci result
npm run lint result
npm run build result
artifact checksum or release package identity
```

This turns “the frontend we deployed” into a reproducible artifact rather than an untraceable directory copy.

## Related files

- `package.json`
- `package-lock.json`
- `vite.config.ts`
- `tsconfig.app.json`
- `eslint.config.js`
- `.prettierrc`

## Related documentation

- [`deployment.md`](./deployment.md)
- [`troubleshooting.md`](./troubleshooting.md)
- [`../03-development/getting-started.md`](../03-development/getting-started.md)
- [`../03-development/configuration.md`](../03-development/configuration.md)
- [`../03-development/testing.md`](../03-development/testing.md)
