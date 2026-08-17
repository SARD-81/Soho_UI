# Project Structure

## Purpose

This document explains where responsibilities live in the repository and where to start when changing behavior. It is intended as a navigation guide, not a generated directory listing.

## Top-level structure

```text
Soho_UI/
├── docs/                  Engineering and runtime documentation
├── public/                Static assets served directly by Vite
├── src/                   Application source code
├── index.html             Vite HTML entry
├── package.json           Scripts and dependency declarations
├── vite.config.ts         Vite configuration
├── tsconfig*.json         TypeScript configuration
├── eslint.config.js       ESLint configuration
└── .prettierrc            Formatting configuration
```

`repomix-output.xml` is a generated repository snapshot and should not be treated as a source-of-truth implementation file.

## `src/` responsibility map

The source tree currently contains these major areas:

```text
src/
├── @types/        Shared TypeScript declarations
├── assets/        Source-managed visual/static assets
├── components/    Reusable UI and application-shell components
├── config/        Declarative UI/configuration structures
├── constants/     Shared labels, options, limits, and static mappings
├── contexts/      React context providers for cross-cutting state/actions
├── hooks/         Feature/data/action hooks and reusable React behavior
├── lib/           Integration and infrastructure modules
├── mock/          Legacy/feature mock material where present
├── mocks/         Mock API setup and fixtures
├── pages/         Route-level page components
├── routes/        Router definition and access-control wrappers
├── schemas/       Validation/data schemas
├── stores/        Shared client/UI stores
├── utils/         General-purpose utilities
├── App.tsx        Application composition below global providers
├── main.tsx       Browser bootstrap and global provider setup
├── index.css      Global CSS
└── rtl-cache.ts   Emotion cache used for RTL styling
```

## Entry points

### `src/main.tsx`

Start here when changing application-wide provider behavior, React Query defaults, or bootstrap ordering.

Current provider chain:

```text
StrictMode
└── AuthProvider
    └── QueryClientProvider
        └── CacheProvider (RTL)
            └── ThemeProvider
                └── App
```

Changes here can affect the entire application and should be reviewed as cross-cutting changes.

### `src/App.tsx`

Start here when changing application-global rendering infrastructure such as the MUI theme integration, global toaster, global loader, or router mounting.

This file should remain composition-oriented rather than accumulating feature logic.

## Routing

### `src/routes/Routes.tsx`

This is the route map and the fastest source of truth for route-level feature entry points.

Use it when:

- adding/removing a page route;
- locating the page component responsible for a URL;
- checking whether a route is protected;
- reviewing naming/case of existing paths.

### `src/routes/ProtectedRoute.tsx`

Owns authenticated access gating for the protected application tree.

Do not duplicate route-auth checks in every page. If access policy becomes more complex (roles/permissions), evolve the routing/access-control layer deliberately.

## Pages

`src/pages/` contains route-level composition components.

A page should primarily:

- compose feature components;
- connect route-level state;
- invoke feature hooks;
- coordinate page-specific presentation behavior.

A page should not become the default location for reusable API logic, token handling, or cross-feature infrastructure.

Current route-level pages include:

- Dashboard
- Disks
- IntegratedStorage
- BlockStorage
- FileSystem
- Services
- Users
- Settings
- Share (SMB/Samba)
- ShareNfs
- WebShare
- History
- SnmpService
- LoginPage
- NotFoundPage

Some files in `pages/` may be historical or no longer routed. Confirm usage through `Routes.tsx` before assuming a page is active.

## Components

`src/components/` contains reusable UI components and several application-shell concerns.

`MainLayout.tsx` is a special case: it is the protected application shell and currently coordinates navigation, notifications, idle-session handling, theme controls, and system power-action UI.

When changing a component, determine whether it is:

1. purely presentational;
2. feature-specific but reusable within one domain;
3. application-shell/global infrastructure.

The wider the category, the more important it is to inspect downstream callers before changing behavior.

## Hooks

`src/hooks/` is a major behavior layer in the application.

Hooks currently cover categories such as:

- server-state queries;
- create/update/delete mutations;
- storage/pool/filesystem operations;
- sharing and user-management operations;
- system/network/SNMP configuration;
- session/activity behavior;
- reusable feature UI state.

### Hook design expectations

A feature hook may own:

- query/mutation configuration;
- feature-level form/action state;
- validation needed to prepare a request;
- query-key invalidation specific to the feature;
- transformation of API errors into feature-meaningful errors.

A hook should not bypass shared infrastructure such as `axiosInstance` or independently implement token refresh.

### Before changing a mutation hook

Check all of the following:

1. Which endpoint does it call?
2. Does `axiosInstance` already apply a global policy to that request?
3. Which React Query keys are invalidated locally?
4. Which persisted state domains will `StateSyncManager` schedule after success?
5. Does the payload contain a legacy field that the transport layer now overrides?
6. Does the hook contain business validation that should be preserved or moved to a shared utility/schema?

This check is especially important because the repository has evolved over time and some hooks may still contain fields retained from older API/persistence behavior.

## Contexts

`src/contexts/` currently includes cross-cutting React contexts such as:

- `AuthContext` — authenticated session state/actions;
- `ThemeContext` — theme state;
- `SystemPowerActionsContext` — shared access to guarded reboot/shutdown actions.

Use a context only when React-tree-wide access is part of the responsibility. Do not create a context solely to avoid passing a prop through one or two nearby components.

## Infrastructure and API integration (`src/lib/`)

This directory contains some of the highest-impact code in the frontend.

### Authentication / transport

- `authApi.ts`
- `authEvents.ts`
- `axiosInstance.ts`
- `tokenStorage.ts`

### Storage/integration services

Examples include:

- `diskApi.ts`
- `diskMaintenance.ts`
- `diskPartitions.ts`
- `poolDevices.ts`
- `shareService.ts`
- `sambaUserService.ts`
- `sambaGroupService.ts`

### State persistence coordination

- `stateSyncManager.ts`

Treat `axiosInstance.ts`, `tokenStorage.ts`, and `stateSyncManager.ts` as infrastructure contracts. A seemingly small change may affect all features.

## Stores

`src/stores/` is currently used selectively for shared client/UI state. It is not the owner of remote backend state.

Before creating a new Zustand store, ask:

- Is this actually server state? If yes, React Query is usually the correct owner.
- Is this transient local state? If yes, component/hook state may be enough.
- Must multiple distant components share this client-only state? If yes, a store may be justified.

## Constants, config, schemas, and utilities

### `src/constants/`

Use for stable shared mappings/options/labels that are not runtime state. Current examples include CPU/memory metadata, disk-related constants, navigation definitions, service labels, settings constants, and VDEV-related values.

Do not hide mutable business behavior in a file merely because it is named `constants`.

### `src/config/`

Use for declarative configuration that drives behavior/layout. `detailLayouts.ts` is the current example.

### `src/schemas/`

Use for reusable structured validation and schema definitions.

### `src/utils/`

Use for context-free or low-context utility functions. If a utility needs extensive knowledge of one feature's lifecycle, it probably belongs closer to that feature instead.

## Mocks

The application can enable an Axios mock adapter through environment configuration. Mock behavior should remain clearly separated from production transport behavior.

When debugging an unexpected API response, first verify whether mock mode is enabled before assuming the backend returned the data.

## Documentation

`docs/` is part of the maintained codebase.

When changing a documented contract, update the relevant document in the same pull request.

Important current documents:

- project overview;
- frontend architecture;
- code commenting guidelines;
- state synchronization contract;
- polling audit;
- notifications/data refresh notes;
- general settings notes.

## Where to start for common changes

| Change | Start here | Then inspect |
| --- | --- | --- |
| Add a route/page | `src/routes/Routes.tsx` | target page, `MainLayout` if shell behavior is involved |
| Change login/session behavior | `src/contexts/AuthContext.tsx` | `authApi`, `axiosInstance`, `tokenStorage`, `ProtectedRoute`, idle-timeout hook |
| Change API base/transport behavior | `src/lib/axiosInstance.ts` | all shared interceptors and state-sync contract |
| Change persistence snapshots | `src/lib/stateSyncManager.ts` | `axiosInstance`, `docs/state-sync-save-to-db.md` |
| Change polling | relevant query hook | `docs/api-polling-audit.md`, page/component observers |
| Add a mutation | relevant feature hook | endpoint ownership, query invalidation, state-sync domain mapping |
| Add global client state | existing owner first | context/store justification |
| Change theme/RTL | `ThemeContext`, `theme`, `rtl-cache.ts` | global CSS and MUI directional assumptions |
| Change system power actions | `MainLayout` / `usePowerAction` | `SystemPowerActionsContext`, confirmation/countdown components |

## Keep the map current

This document should evolve when responsibility moves between directories or when a new architectural layer is introduced. It should not be edited for every new component or filename.
