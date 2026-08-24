# ADR-004: Use React Router for Client-Side Application Routing

- Status: Accepted
- Scope: Browser routes, protected application shell, feature entry points

## Context

SOHO UI is a single-page administrative application with multiple independently navigable feature areas.

Operators need stable browser routes for features such as Dashboard, Disks, storage, shares, users, settings, SNMP, and History.

Authentication restoration must complete before protected feature access is decided.

## Decision

Use React Router with a browser router and a protected application layout.

Current structure is conceptually:

```text
/login
/
  dashboard
  disks
  Integrated-space
  block-space
  file-system
  services
  users
  settings
  share
  share-nfs
  web-share
  history
  snmp-service
```

The protected root renders `MainLayout`, and feature pages render as its child routes.

Unknown paths render the Not Found page.

## Authentication boundary

`ProtectedRoute` guards the authenticated layout.

It does not decide backend authorization for individual operations. Backend authorization remains authoritative.

The route guard waits while auth restoration is loading so a restorable session is not redirected prematurely.

A development auth bypass exists only when both conditions hold:

```text
Vite DEV mode
VITE_AUTH_BYPASS truthy
```

## Consequences

### Positive

- feature URLs are explicit and bookmarkable;
- shared authenticated layout concerns remain centralized;
- navigation and deep linking are straightforward;
- route structure provides a natural feature-documentation map.

### Tradeoffs

- production static hosting must support SPA route fallback;
- route names become external navigation contracts and should not change casually;
- frontend route protection is not a substitute for backend authorization.

## Hosting requirement

Because `createBrowserRouter` uses browser history, direct navigation/refresh of a client route can reach the web server before React handles it.

Production web-server configuration must serve `index.html` for application routes that do not correspond to real static files.

This requirement belongs in deployment operations documentation.

## Route naming

Some current routes use historical casing/naming such as:

```text
/Integrated-space
/block-space
```

Do not rename routes as a cosmetic cleanup without considering:

- existing bookmarks/links;
- navigation code;
- documentation;
- deployment/server rewrites.

A route naming migration should be explicit and may require redirects.

## Alternatives considered

### Server-rendered multi-page navigation

Rejected for the current application architecture because the product is already a client-side React admin UI with shared runtime state/providers.

### Manual pathname switching

Rejected because it would recreate routing, nested layout, not-found, and navigation behavior without a routing library.

## When to revisit

Revisit if the product moves to a framework with server routing/SSR or if deployment constraints require a different history strategy.

Any migration must preserve authentication restoration and direct-navigation behavior.

## Related documentation

- [`../../04-core-flows/routing-and-access-control.md`](../../04-core-flows/routing-and-access-control.md)
- [`../runtime-flow.md`](../runtime-flow.md)
- [`../../07-operations/deployment.md`](../../07-operations/deployment.md)
