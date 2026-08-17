# SOHO UI

SOHO UI is the React/TypeScript administrative frontend for the StoreX storage management system.

It provides authenticated operators with interfaces for monitoring system health and managing storage pools, disks, filesystems, block storage, shares, users, services, settings, SNMP, and related system operations.

## Documentation

The maintained engineering documentation starts at:

- [`docs/index.md`](./docs/index.md) — documentation map and reading order
- [`docs/01-overview/project-overview.md`](./docs/01-overview/project-overview.md) — system purpose, scope, and major runtime contracts
- [`docs/02-architecture/frontend-architecture.md`](./docs/02-architecture/frontend-architecture.md) — frontend architecture and ownership boundaries
- [`docs/03-development/project-structure.md`](./docs/03-development/project-structure.md) — repository navigation and change entry points
- [`docs/03-development/code-commenting-guidelines.md`](./docs/03-development/code-commenting-guidelines.md) — Clean Code rules for useful source comments
- [`docs/04-core-flows/server-state-and-cache.md`](./docs/04-core-flows/server-state-and-cache.md) — React Query server-state ownership, cache, and invalidation
- [`docs/04-core-flows/state-sync-save-to-db.md`](./docs/04-core-flows/state-sync-save-to-db.md) — canonical backend snapshot persistence contract
- [`docs/04-core-flows/polling-and-data-refresh.md`](./docs/04-core-flows/polling-and-data-refresh.md) — maintained polling and refresh inventory
- [`docs/04-core-flows/notifications.md`](./docs/04-core-flows/notifications.md) — notification observation, baselines, and duplicate suppression

See [`docs/index.md`](./docs/index.md) for the complete reading order and documentation map.

## Tech stack

Core technologies include React 19, TypeScript, Vite, React Router, TanStack React Query, Axios, Material UI, Zustand, React Hook Form, Zod, Tailwind CSS, and Three.js/React Three Fiber.

See `package.json` for the exact dependency versions.

## Prerequisites

Use a supported Node.js LTS release with npm.

On Debian/Ubuntu systems, one way to install Node.js through NodeSource is:

```bash
sudo apt install -y curl software-properties-common
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
```

Verify the installation:

```bash
node --version
npm --version
```

## Installation

Install project dependencies from the repository root:

```bash
npm install
```

## Environment configuration

The frontend reads its backend base URL from Vite environment configuration:

```env
VITE_API_BASE_URL=https://your-backend.example.com
```

The codebase also supports development-oriented flags such as mock API mode and an explicit development auth bypass. Do not enable development bypass behavior in production configuration.

## Development

Start the Vite development server:

```bash
npm run dev
```

The Vite configuration currently binds the dev server to `0.0.0.0:5173`.

## Quality checks

Run ESLint:

```bash
npm run lint
```

A dedicated automated test script is not currently defined in `package.json`. Do not treat a successful build as a substitute for future test coverage.

## Production build

Create a production bundle:

```bash
npm run build
```

The build script runs TypeScript project compilation and then Vite build. The generated static output is written to `dist/`.

Preview the production bundle locally with Vite:

```bash
npm run preview
```

## Deployment model

This repository builds to static frontend assets. A production web server such as Nginx should serve the generated `dist/` directory.

Deployment-specific server configuration belongs in operations documentation rather than application source code.

## Important maintenance contracts

Before modifying authentication, Axios interceptors, token storage, React Query global defaults, state persistence, polling, or notification behavior, read the corresponding documents under `docs/04-core-flows/`.

In particular, normal API requests and mutations do not own database snapshot persistence. Canonical persisted snapshots are coordinated by `StateSyncManager`; see [`docs/04-core-flows/state-sync-save-to-db.md`](./docs/04-core-flows/state-sync-save-to-db.md).

UI freshness is a separate concern owned by React Query; see [`docs/04-core-flows/server-state-and-cache.md`](./docs/04-core-flows/server-state-and-cache.md).

## Source comments

Source comments are intentionally selective. They should explain reasons, invariants, security constraints, lifecycle ordering, race protection, or non-obvious compatibility behavior—not restate readable code.

Follow [`docs/03-development/code-commenting-guidelines.md`](./docs/03-development/code-commenting-guidelines.md) when adding or reviewing comments.
