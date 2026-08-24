# Configuration

This document defines the verified frontend configuration surface of SOHO UI.

Frontend configuration should remain explicit and minimal. Environment variables are compiled into the Vite application and must not contain secrets that must remain confidential from browser users.

## Vite environment variables

The following variables are confirmed by current source code.

### `VITE_API_BASE_URL`

Consumed by `src/lib/axiosInstance.ts` as the shared application Axios `baseURL`.

Example:

```env
VITE_API_BASE_URL=https://storage-api.example.com
```

All relative application API paths used through the shared Axios instance are resolved against this value.

Operational considerations:

- use the backend origin/path appropriate for the deployment environment;
- keep browser CORS/network topology in mind when frontend and backend origins differ;
- do not add trailing/duplicated path segments that make existing `/api/...` requests resolve incorrectly;
- validate authentication token/network behavior through the actual deployed origin.

### `VITE_AUTH_API_BASE_URL`

Optional base URL for the isolated authentication client in `src/lib/authApi.ts`.

When explicitly configured, token issue/refresh/verify requests are resolved directly against this value.

Example:

```env
VITE_AUTH_API_BASE_URL=https://storage-api.example.com/api/auth/
```

When this variable is absent or blank, the auth client falls back to `VITE_API_BASE_URL` and derives an authentication base ending in `/api/auth/`.

For example:

```text
VITE_API_BASE_URL=https://storage-api.example.com
                         ↓
auth base=https://storage-api.example.com/api/auth/
```

The auth base is normalized to a trailing slash so relative requests such as `token/`, `token/refresh/`, and `token/verify/` resolve predictably.

Use `VITE_AUTH_API_BASE_URL` only when authentication is deliberately hosted at a different origin/path from the normal application API. In the ordinary single-backend deployment, prefer the fallback derived from `VITE_API_BASE_URL` so there is only one endpoint setting to maintain.

### `VITE_USE_MOCKS`

Development/testing-oriented flag consumed by `axiosInstance`.

Truthy forms currently accepted:

```text
1
true
yes
on
```

When truthy, `setupAxiosMockAdapter(axiosInstance)` is registered.

Default when missing:

```text
false
```

Do not enable mock mode in a production deployment unless the deployment is intentionally a demonstration environment and that behavior has been reviewed.

### `VITE_AUTH_BYPASS`

Development-only route-authentication bypass.

Truthy forms currently accepted:

```text
1
true
yes
on
```

The runtime guard is:

```text
import.meta.env.DEV && VITE_AUTH_BYPASS is truthy
```

Therefore a production build cannot activate the bypass merely by receiving `VITE_AUTH_BYPASS=true`.

This double guard is a security invariant. Do not weaken it.

## Vite built-in values

The code also relies on Vite-provided values such as:

```text
import.meta.env.DEV
```

These are build/runtime-mode indicators, not custom deployment configuration.

## Client-side environment values are public

Any `VITE_*` variable used by Vite can become part of the browser bundle.

Never place values such as these in frontend Vite configuration:

- private API keys;
- backend database credentials;
- SSH credentials;
- signing secrets;
- long-lived privileged service tokens;
- passwords.

If the browser needs authenticated access, use the application's supported authentication/session mechanism rather than embedding a secret at build time.

## Vite configuration

Current `vite.config.ts` defines:

```text
base: ./
plugins: React + Tailwind CSS
server.host: 0.0.0.0
server.port: 5173
/fonts alias -> public/fonts
```

### `base: './'`

The relative base is relevant to generated static asset URLs.

When changing deployment location or history routing behavior, verify:

- JS/CSS asset resolution;
- fonts;
- direct navigation/refresh behavior;
- Nginx static-file fallback rules.

### `/fonts` alias

Vite resolves `/fonts` to:

```text
public/fonts
```

Do not move the font asset directory without updating the alias and verifying all CSS/font references.

## Runtime versus build-time configuration

Vite environment variables are substituted at build time.

That means changing a deployment environment value normally requires rebuilding the frontend unless the application introduces a separate runtime configuration mechanism.

Do not assume that editing the server environment after `dist/` has already been built changes values embedded in the existing static JavaScript bundle.

## Configuration ownership

Use these ownership rules:

- normal backend base URL → `VITE_API_BASE_URL`;
- optional separate authentication base URL → `VITE_AUTH_API_BASE_URL`;
- dev mock/auth flags → environment configuration;
- feature business rules → source/domain logic, not env variables unless deployment-specific by design;
- query intervals → hook/feature code and polling documentation;
- design tokens/theme → theme/CSS source;
- backend persistence semantics → StateSync/Axios architecture;
- secrets → backend/server-side secret management, never Vite client env.

## Adding a new environment variable

Before adding a new `VITE_*` setting:

1. verify the value is safe to expose to every browser user;
2. confirm it is genuinely deployment-specific rather than a product/business constant;
3. choose an explicit name;
4. define the missing/default behavior;
5. validate and normalize string/boolean values centrally;
6. document the setting here;
7. add it to deployment handoff documentation;
8. test both absent and configured cases.

Avoid scattered ad-hoc `import.meta.env` reads when one configuration module would better express ownership.

## Example development environment

```env
VITE_API_BASE_URL=http://localhost:8000
# Optional only when auth is hosted separately:
# VITE_AUTH_API_BASE_URL=http://localhost:8000/api/auth/
VITE_USE_MOCKS=false
VITE_AUTH_BYPASS=false
```

The exact backend URL is environment-specific; the example is not a production recommendation.

## Related files

- `vite.config.ts`
- `src/lib/axiosInstance.ts`
- `src/lib/authApi.ts`
- `src/routes/ProtectedRoute.tsx`
- `src/mocks/setupMocks.ts`

## Related documentation

- [`getting-started.md`](./getting-started.md)
- [`../04-core-flows/authentication.md`](../04-core-flows/authentication.md)
- [`../04-core-flows/api-request-lifecycle.md`](../04-core-flows/api-request-lifecycle.md)
- [`../07-operations/build.md`](../07-operations/build.md)
