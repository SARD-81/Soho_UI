# مستندات SOHO UI

این directory مرجع اصلی برای فهم، نگهداری، توسعه، build و operationهای frontend پروژه‌ی SOHO است.

هدف این مستندات توضیح تک‌تک خط‌های code نیست. هدف، حفظ دانشی است که بازسازی دوباره‌ی آن پرهزینه است: system boundaryها، architectural decisionها، runtime flowها، business ruleها، operational constraintها، API contractها، failure modeها و implementation detailهایی که از روی code به‌سادگی قابل تشخیص نیستند.

## نحوه‌ی استفاده از این مستندات

اگر بعد از مدت طولانی به پروژه برگشتید، پیشنهاد می‌شود اسناد را با این ترتیب بخوانید:

1. [`01-overview/project-overview.md`](./01-overview/project-overview.md) — application چیست و چه مسئولیت‌هایی دارد.
2. [`01-overview/scope.md`](./01-overview/scope.md) — boundary میان ownership frontend/backend و limitationهای فعلی محصول.
3. [`01-overview/glossary.md`](./01-overview/glossary.md) — terminology اختصاصی پروژه.
4. [`02-architecture/frontend-architecture.md`](./02-architecture/frontend-architecture.md) — ownership moduleهای frontend و ساختار runtime.
5. [`02-architecture/runtime-flow.md`](./02-architecture/runtime-flow.md) — bootstrap اپلیکیشن، request flow، auth flow و mutation flow.
6. [`02-architecture/data-flow.md`](./02-architecture/data-flow.md) — boundary میان backend state، React Query، UI state و StateSync.
7. [`02-architecture/decisions/`](./02-architecture/decisions/) — دلیل architectural choiceهای اصلی.
8. [`03-development/getting-started.md`](./03-development/getting-started.md) — setup محلی و اولین verification stepها.
9. [`03-development/project-structure.md`](./03-development/project-structure.md) — مسئولیت هر بخش codebase و نقطه‌ی شروع برای تغییر featureها.
10. [`03-development/configuration.md`](./03-development/configuration.md) — Vite/environment configuration تأییدشده.
11. [`03-development/coding-conventions.md`](./03-development/coding-conventions.md) — conventionهای coding و ownership ruleهای پروژه.
12. [`03-development/code-commenting-guidelines.md`](./03-development/code-commenting-guidelines.md) — قواعد مربوط به commentهای مفید داخل source code.
13. [`03-development/testing.md`](./03-development/testing.md) — quality gateهای فعلی و gap صریح مربوط به automated test.
14. [`04-core-flows/authentication.md`](./04-core-flows/authentication.md) — login، token storage، session restore، refresh، idle timeout و logout.
15. [`04-core-flows/routing-and-access-control.md`](./04-core-flows/routing-and-access-control.md) — protected routing و boundary مربوط به frontend access control.
16. [`04-core-flows/api-request-lifecycle.md`](./04-core-flows/api-request-lifecycle.md) — Axios، React Query، 401 recovery، persistence policy و mutation StateSync.
17. [`04-core-flows/server-state-and-cache.md`](./04-core-flows/server-state-and-cache.md) — ownership مربوط به server state، cache، invalidation و UI freshness.
18. [`04-core-flows/state-sync-save-to-db.md`](./04-core-flows/state-sync-save-to-db.md) — canonical backend snapshot persistence و invariantهای `save_to_db`.
19. [`04-core-flows/polling-and-data-refresh.md`](./04-core-flows/polling-and-data-refresh.md) — polling inventory نگهداری‌شده و refresh policy.
20. [`04-core-flows/notifications.md`](./04-core-flows/notifications.md) — notification baselineها، monitoring lifecycle و duplicate suppression.
21. پیش از تغییر feature-specific behavior، سند مربوط به آن feature در [`05-features/`](./05-features/) مطالعه شود.
22. پیش از اضافه یا تغییر backend integration، [`06-api/api-conventions.md`](./06-api/api-conventions.md) و [`06-api/endpoint-map.md`](./06-api/endpoint-map.md) مطالعه شوند.
23. پیش از build، deployment، rollback یا production troubleshooting، سند مرتبط در [`07-operations/`](./07-operations/) مطالعه شود.

## نقشه‌ی مستندات

### Overview

- [`01-overview/project-overview.md`](./01-overview/project-overview.md)
- [`01-overview/scope.md`](./01-overview/scope.md)
- [`01-overview/glossary.md`](./01-overview/glossary.md)

### Architecture

- [`02-architecture/frontend-architecture.md`](./02-architecture/frontend-architecture.md)
- [`02-architecture/runtime-flow.md`](./02-architecture/runtime-flow.md)
- [`02-architecture/data-flow.md`](./02-architecture/data-flow.md)

Architecture Decisionها:

- [`02-architecture/decisions/ADR-001-react-query-server-state.md`](./02-architecture/decisions/ADR-001-react-query-server-state.md)
- [`02-architecture/decisions/ADR-002-centralized-axios.md`](./02-architecture/decisions/ADR-002-centralized-axios.md)
- [`02-architecture/decisions/ADR-003-state-sync-persistence.md`](./02-architecture/decisions/ADR-003-state-sync-persistence.md)
- [`02-architecture/decisions/ADR-004-client-side-routing.md`](./02-architecture/decisions/ADR-004-client-side-routing.md)
- [`02-architecture/decisions/ADR-005-rtl-emotion-cache.md`](./02-architecture/decisions/ADR-005-rtl-emotion-cache.md)

### Development

- [`03-development/getting-started.md`](./03-development/getting-started.md)
- [`03-development/project-structure.md`](./03-development/project-structure.md)
- [`03-development/configuration.md`](./03-development/configuration.md)
- [`03-development/coding-conventions.md`](./03-development/coding-conventions.md)
- [`03-development/code-commenting-guidelines.md`](./03-development/code-commenting-guidelines.md)
- [`03-development/testing.md`](./03-development/testing.md)

### Core Flowها

- [`04-core-flows/authentication.md`](./04-core-flows/authentication.md)
- [`04-core-flows/routing-and-access-control.md`](./04-core-flows/routing-and-access-control.md)
- [`04-core-flows/api-request-lifecycle.md`](./04-core-flows/api-request-lifecycle.md)
- [`04-core-flows/server-state-and-cache.md`](./04-core-flows/server-state-and-cache.md)
- [`04-core-flows/state-sync-save-to-db.md`](./04-core-flows/state-sync-save-to-db.md)
- [`04-core-flows/polling-and-data-refresh.md`](./04-core-flows/polling-and-data-refresh.md)
- [`04-core-flows/notifications.md`](./04-core-flows/notifications.md)

### Featureها

Feature documentها user flow واقعی در سطح page، query/mutation ownership، backend dependency، business rule، failure mode و extension point را توضیح می‌دهند.

- [`05-features/dashboard.md`](./05-features/dashboard.md) — widgetهای live monitoring، per-user layout customization، polling، uptime و 3D server slotها.
- [`05-features/disks.md`](./05-features/disks.md) — disk inventory/detail، pool ownership، partition safety check و destructive cleanup flow.
- [`05-features/integrated-storage.md`](./05-features/integrated-storage.md) — zpool lifecycle، create/add/replace/delete/import/export، slot mapping، propertyها و conditional storage polling.
- [`05-features/block-storage.md`](./05-features/block-storage.md) — Volume list/create/delete، manual refresh، dynamic attribute و boundary فعلی Volume نسبت به StateSync.
- [`05-features/file-system.md`](./05-features/file-system.md) — filesystem CRUD، mount/canmount، encryption key lifecycle، passphrase handling، detail state و cross-domain StateSync.
- [`05-features/services.md`](./05-features/services.md) — service list/status polling، Start/Stop، boot enablement، status normalization و per-unit query fan-out.
- [`05-features/users.md`](./05-features/users.md) — OS-user management، dormant Samba integration، duplicate check و non-atomic OS-to-Samba creation path.
- [`05-features/samba-shares.md`](./05-features/samba-shares.md) — Samba shares/users/groups، member management، Account Flags fan-out، partial-failure workflow و StateSync boundary فعلی.
- [`05-features/nfs-shares.md`](./05-features/nfs-shares.md) — NFS CRUD، filesystem mountpoint dependency، option translation، service restart behavior و NFS StateSync.
- [`05-features/web-share.md`](./05-features/web-share.md) — filesystem/share eligibility، Web Share creation دو مرحله‌ای، permission handling و Web Share StateSync.
- [`05-features/snmp.md`](./05-features/snmp.md) — SNMP configuration، connection diagnostic، response normalization و تفکیک config mutation از diagnostic behavior؛ SNMP در نسخه‌ی فعلی GitLab StateSync domain مستقل ندارد.
- [`05-features/settings.md`](./05-features/settings.md) — general system settings، network configuration، Web userها و cross-domain user creation.
- [`05-features/history.md`](./05-features/history.md) — وضعیت placeholder فعلی History و implementation checklist.

تمام routed featureهای فعلی محصول یا feature document کامل دارند یا در مورد History، placeholder state آن‌ها صریحاً مستند شده است.

### API

- [`06-api/api-conventions.md`](./06-api/api-conventions.md) — shared transport، query/mutation، persistence، normalization و integration ruleها.
- [`06-api/authentication-api.md`](./06-api/authentication-api.md) — auth base resolution، token endpointها، 401 recovery و logout contract.
- [`06-api/error-handling.md`](./06-api/error-handling.md) — error normalization، logical failure، partial failure، retry و presentation ruleها.
- [`06-api/endpoint-map.md`](./06-api/endpoint-map.md) — map مرکزی Feature → Method → Endpoint → Query/owner → StateSync.

### Operations

- [`07-operations/build.md`](./07-operations/build.md) — reproducible build input، commandها، artifact contract و release evidence.
- [`07-operations/deployment.md`](./07-operations/deployment.md) — static Nginx deployment model، SPA fallback، API topology، caching، TLS، atomic release و rollback.
- [`07-operations/troubleshooting.md`](./07-operations/troubleshooting.md) — runbook مربوط به build، Nginx، auth، API، StateSync، polling و partial failure.

Repository در حال حاضر frontend validation workflow زیر را دارد:

```text
.github/workflows/frontend-validation.yml
```

این workflow `npm ci`، `npm run lint` و `npm run build` را validate می‌کند. با این حال repository هنوز `Dockerfile`، Nginx config و automated deployment pipeline کامل برای publish/activate کردن release روی server ندارد.

Operations documentation application/deployment contract تأییدشده را توضیح می‌دهد، بدون اینکه automationای را که وجود ندارد موجود فرض کند.

### سایر یادداشت‌های نگهداری‌شده

- [`general-settings.md`](./general-settings.md) — جزئیات API/normalization/UI مربوط به General Settings؛ سند سطح بالاتر Settings به این subdocument reference می‌دهد.

### Legacy compatibility redirectها

این fileها فقط برای اینکه linkهای قدیمی break نشوند نگه داشته شده‌اند. Behavior جدید را داخل آن‌ها مستند نکنید:

- [`api-polling-audit.md`](./api-polling-audit.md) → canonical polling documentation
- [`notifications-and-data-refresh.md`](./notifications-and-data-refresh.md) → canonical notification/refresh documentation
- [`state-sync-save-to-db.md`](./state-sync-save-to-db.md) → canonical StateSync documentation

## اصول نگارش و نگهداری مستندات

### Decision را مستند کنید، نه syntax را

Code خودش نشان می‌دهد local variable چگونه assign می‌شود یا component چگونه render می‌شود. Documentation باید به سؤال‌هایی مثل این‌ها پاسخ دهد:

- چرا این flow به این شکل طراحی شده است؟
- کدام module مالک این responsibility است؟
- هنگام تغییر implementation چه invariantهایی باید حفظ شوند؟
- این mutation چه domainهای دیگری را متاثر می‌کند؟
- lifecycle مورد انتظار این data چیست؟
- کدام behavior با وجود غیرعادی به نظر رسیدن، عمدی است؟

### یک source of truth نگه دارید

Detailed behavior را در چند سند duplicate نکنید. سند high-level باید به flow document دقیق link بدهد، نه اینکه contract کامل آن را دوباره بنویسد.

### همراه behavior change، docs را update کنید

اگر change یک architectural contract، business rule، runtime flow، API convention یا operational procedure مستندشده را تغییر می‌دهد ولی documentation مرتبط update نشده، change کامل نیست.

### برای flowها از diagram استفاده کنید

وقتی ordering، ownership یا dependency با visualization بهتر از prose قابل فهم است، از Mermaid diagram استفاده کنید.

## ساختار فعلی

```text
docs/
├── index.md
├── 01-overview/
│   ├── project-overview.md
│   ├── scope.md
│   └── glossary.md
├── 02-architecture/
│   ├── frontend-architecture.md
│   ├── runtime-flow.md
│   ├── data-flow.md
│   └── decisions/
├── 03-development/
│   ├── getting-started.md
│   ├── project-structure.md
│   ├── configuration.md
│   ├── coding-conventions.md
│   ├── code-commenting-guidelines.md
│   └── testing.md
├── 04-core-flows/
│   ├── authentication.md
│   ├── routing-and-access-control.md
│   ├── api-request-lifecycle.md
│   ├── server-state-and-cache.md
│   ├── state-sync-save-to-db.md
│   ├── polling-and-data-refresh.md
│   └── notifications.md
├── 05-features/
│   ├── dashboard.md
│   ├── disks.md
│   ├── integrated-storage.md
│   ├── block-storage.md
│   ├── file-system.md
│   ├── services.md
│   ├── users.md
│   ├── samba-shares.md
│   ├── nfs-shares.md
│   ├── web-share.md
│   ├── snmp.md
│   ├── settings.md
│   └── history.md
├── 06-api/
│   ├── api-conventions.md
│   ├── authentication-api.md
│   ├── error-handling.md
│   └── endpoint-map.md
└── 07-operations/
    ├── build.md
    ├── deployment.md
    └── troubleshooting.md
```

از اینجا به بعد، behavior changeهای آینده باید همین structure را update کنند و source موازی و competing برای documentation ایجاد نکنند.
