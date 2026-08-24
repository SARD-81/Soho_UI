# Getting Started

This guide describes the verified local-development workflow for SOHO UI.

It intentionally documents only tooling and commands that exist in the repository today.

## Prerequisites

Use a maintained Node.js LTS release with npm.

The repository does not currently pin Node.js through `.nvmrc`, `.node-version`, or the `engines` field in `package.json`, so developers must keep their local Node version reasonably current and compatible with Vite 7 and the installed dependency set.

Verify the runtime before installing dependencies:

```bash
node --version
npm --version
```

## Install dependencies

From the repository root:

```bash
npm install
```

`package-lock.json` is committed and should remain synchronized with `package.json`.

For reproducible CI/deployment installs, `npm ci` is preferable when the lockfile is trusted and unchanged.

## Environment

At minimum, normal backend-connected development needs:

```env
VITE_API_BASE_URL=https://backend.example.com
```

Development-only flags currently recognized by source code include:

```env
VITE_USE_MOCKS=true
VITE_AUTH_BYPASS=true
```

`VITE_AUTH_BYPASS` is additionally guarded by `import.meta.env.DEV`, so production builds cannot activate the bypass solely because the environment variable is present.

See [`configuration.md`](./configuration.md) before adding new frontend environment variables.

## Start development server

```bash
npm run dev
```

Current Vite server configuration:

```text
host: 0.0.0.0
port: 5173
```

Binding to `0.0.0.0` allows access from other hosts on the reachable network. Treat development machines accordingly and do not expose the dev server to untrusted networks unnecessarily.

## Vite base path

The project uses:

```ts
base: './'
```

This produces relative asset paths in the generated bundle and is relevant when serving the build below a non-root filesystem/web-server location.

Do not change `base` casually; verify production routing and static asset resolution when doing so.

## Run lint

```bash
npm run lint
```

Current lint scope is the repository through ESLint flat config, with `dist/` ignored.

The TypeScript/React config includes:

- ESLint recommended JavaScript rules;
- TypeScript ESLint recommended rules;
- React Hooks recommended-latest rules;
- React Refresh Vite rules.

`react-refresh/only-export-components` is explicitly disabled.

## Run production build

```bash
npm run build
```

The script is:

```text
tsc -b && vite build
```

This means build success requires both:

1. TypeScript project compilation/type checking;
2. Vite production bundling.

Generated output is placed in:

```text
dist/
```

## Preview build

```bash
npm run preview
```

Use preview only as a local check of the generated Vite build. Production deployment should use the intended static web server/reverse-proxy configuration.

## Automated tests

There is currently no `test` script in `package.json` and no verified application test runner in the documented toolchain.

A successful `npm run build` or `npm run lint` is not equivalent to automated behavioral test coverage.

See [`testing.md`](./testing.md).

## Formatting

The repository has Prettier configuration with:

```text
singleQuote: true
trailingComma: es5
tabWidth: 2
semi: true
```

It also loads:

- `prettier-plugin-organize-imports`;
- `prettier-plugin-tailwindcss`.

There is currently no dedicated npm `format` script. If formatting is run manually, avoid generating unrelated repository-wide formatting churn inside a focused feature change.

## TypeScript strictness

The application TypeScript configuration enables strict mode and several maintenance-oriented checks, including:

```text
strict
noUnusedLocals
noUnusedParameters
noFallthroughCasesInSwitch
noUncheckedSideEffectImports
```

The application uses bundler module resolution, `react-jsx`, and `noEmit`.

Treat new TypeScript warnings/errors as change blockers rather than suppressing them with broad casts or ignore directives.

## Recommended change workflow

For a normal change:

1. read the relevant feature/core-flow document;
2. identify query/API/state ownership before editing;
3. make the smallest coherent code change;
4. update documentation when a documented contract changes;
5. run lint;
6. run build;
7. manually verify affected UI flows until automated coverage exists;
8. inspect the final Git diff for unrelated formatting/dead code;
9. commit with a focused message.

## Before changing infrastructure code

Read the corresponding documents before modifying:

- auth/session → [`../04-core-flows/authentication.md`](../04-core-flows/authentication.md)
- Axios/interceptors → [`../04-core-flows/api-request-lifecycle.md`](../04-core-flows/api-request-lifecycle.md)
- React Query → [`../04-core-flows/server-state-and-cache.md`](../04-core-flows/server-state-and-cache.md)
- `save_to_db` / StateSync → [`../04-core-flows/state-sync-save-to-db.md`](../04-core-flows/state-sync-save-to-db.md)
- polling → [`../04-core-flows/polling-and-data-refresh.md`](../04-core-flows/polling-and-data-refresh.md)
- notifications → [`../04-core-flows/notifications.md`](../04-core-flows/notifications.md)

## Related files

- `package.json`
- `package-lock.json`
- `vite.config.ts`
- `tsconfig.json`
- `tsconfig.app.json`
- `tsconfig.node.json`
- `eslint.config.js`
- `.prettierrc`
- `README.md`
