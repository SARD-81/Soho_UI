# ADR-004: استفاده از React Router برای Client-Side Routing

- وضعیت: Accepted
- Scope: Browser routeها، protected application shell و feature entry pointها

## Context

SOHO UI یک single-page administrative application با چند feature area مستقل و قابل navigation است.

Operatorها به browser routeهای پایدار برای featureهایی مانند Dashboard، Disks، Storage، Shareها، Userها، Settings، SNMP و History نیاز دارند.

Authentication restoration باید پیش از تصمیم‌گیری درباره‌ی دسترسی به protected feature کامل شود.

## Decision

از React Router به‌همراه browser router و protected application layout استفاده می‌شود.

ساختار فعلی از نظر مفهومی:

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

Protected root، `MainLayout` را render می‌کند و feature pageها به‌عنوان child routeهای آن render می‌شوند.

Pathهای ناشناخته، Not Found page را render می‌کنند.

## Authentication Boundary

`ProtectedRoute` authenticated layout را guard می‌کند.

این component درباره‌ی backend authorization برای operationهای منفرد تصمیم نمی‌گیرد. Backend authorization همچنان authoritative است.

Route guard تا زمانی که auth restoration در حال load است منتظر می‌ماند تا session قابل restore به‌صورت زودهنگام redirect نشود.

Development auth bypass فقط زمانی وجود دارد که هر دو condition زیر برقرار باشند:

```text
Vite DEV mode
VITE_AUTH_BYPASS truthy
```

## Consequenceها

### Positive

- URL مربوط به featureها صریح و bookmarkable است؛
- concernهای shared authenticated layout متمرکز باقی می‌مانند؛
- navigation و deep linking ساده و مستقیم است؛
- route structure یک map طبیعی برای feature documentation فراهم می‌کند.

### Tradeoffها

- static hosting در production باید SPA route fallback را پشتیبانی کند؛
- route nameها به external navigation contract تبدیل می‌شوند و نباید بدون دلیل تغییر کنند؛
- frontend route protection جایگزین backend authorization نیست.

## نیازمندی Hosting

چون `createBrowserRouter` از browser history استفاده می‌کند، direct navigation/refresh روی client route می‌تواند قبل از این‌که React request را handle کند به web server برسد.

Production web-server configuration باید برای application routeهایی که static file واقعی ندارند `index.html` را serve کند.

این requirement باید در deployment operations documentation نگهداری شود.

## Route Naming

برخی routeهای فعلی naming/casing تاریخی دارند، مانند:

```text
/Integrated-space
/block-space
```

Routeها را صرفاً به‌عنوان cosmetic cleanup rename نکنید و پیش از تغییر موارد زیر را در نظر بگیرید:

- bookmark/linkهای موجود؛
- navigation code؛
- documentation؛
- deployment/server rewriteها.

Route naming migration باید صریح باشد و ممکن است به redirect نیاز داشته باشد.

## Alternativeهای بررسی‌شده

### Server-rendered Multi-page Navigation

برای معماری فعلی رد شد، چون محصول از قبل یک client-side React admin UI با shared runtime state/providerها است.

### Manual Pathname Switching

رد شد، چون routing، nested layout، not-found و navigation behavior را بدون routing library دوباره پیاده‌سازی می‌کند.

## چه زمانی این Decision دوباره بررسی شود؟

اگر محصول به framework دارای server routing/SSR مهاجرت کرد یا deployment constraintها history strategy متفاوتی نیاز داشتند، این decision باید revisit شود.

هر migration باید authentication restoration و direct-navigation behavior را حفظ کند.

## مستندات مرتبط

- [`../../04-core-flows/routing-and-access-control.md`](../../04-core-flows/routing-and-access-control.md)
- [`../runtime-flow.md`](../runtime-flow.md)
- [`../../07-operations/deployment.md`](../../07-operations/deployment.md)
