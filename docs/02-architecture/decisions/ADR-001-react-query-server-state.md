# ADR-001: استفاده از TanStack React Query برای Server State

- وضعیت: Accepted
- Scope: خواندن server state در frontend، mutation lifecycle، cache invalidation و polling

## Context

SOHO UI یک frontend مدیریتی روی backend مربوط به Storage/System است که state آن می‌تواند تغییر کند. بسیاری از valueها ممکن است خارج از component محلی‌ای که آن‌ها را render می‌کند تغییر کنند؛ از جمله system telemetry، storage state، serviceها، shareها، userها و settingها.

Frontend برای موارد زیر به handling یکپارچه نیاز دارد:

- loading/error state؛
- caching؛
- stale/fresh policy؛
- request deduplication بر اساس resource identity؛
- mutation invalidation؛
- controlled polling؛
- conditional queryها؛
- cancellation/abort behavior.

نگه‌داشتن copyهای authoritative backend data در component stateهای پراکنده باعث duplicate شدن lifecycle logic و دشوارشدن consistency بین pageها می‌شود.

## Decision

TanStack React Query به‌عنوان owner اصلی **client-side server state** استفاده می‌شود.

Feature hookها stable query key، endpoint call، normalization و feature-specific lifecycle configuration را تعریف می‌کنند.

React Query cache، durable application persistence نیست و نباید به‌عنوان authoritative database در نظر گرفته شود.

## Consequenceها

### Positive

- query lifecycle یکپارچه بین featureها؛
- query identity صریح از طریق keyها؛
- invalidation هدفمند پس از mutation؛
- امکان محدودکردن polling به consumerهای mounted/enabled؛
- جداسازی server state از transient UI state؛
- pageها به‌جای تبدیل‌شدن به request-state machine، orchestration layer باقی می‌مانند.

### Tradeoffها

- design مربوط به query key به architectural contract تبدیل می‌شود؛
- keyهای متفاوت که یک endpoint را call می‌کنند cache/request lifecycle مستقل دارند؛
- توسعه‌دهنده باید invalidation ownership را درک کند؛
- React Query مسئله‌ی backend persistence، authorization یا transactional consistency را حل نمی‌کند.

## Ruleها

1. Valueهای authoritative در backend باید در حالت عادی در React Query قرار بگیرند، مگر دلیل قوی‌تری وجود داشته باشد.
2. Query keyها باید stable و meaningful باشند.
3. Parameter valueهایی که response را تغییر می‌دهند باید بخشی از key باشند.
4. بدون justification برای resource/lifecycle یکسان، page-specific duplicate key ایجاد نکنید.
5. Dedicated monitoring keyهایی که عمداً traffic مستقل ایجاد می‌کنند باید مستند شوند.
6. Mutation موفق queryهای تحت تأثیر را invalidate می‌کند؛ mutation ناموفق نباید وانمود کند state تغییر کرده است.
7. React Query cache هرگز نباید mechanism مربوط به `save_to_db` persistence باشد.

## Alternativeهای بررسی‌شده

### Request با Component-local `useEffect` + `useState`

به‌عنوان default رد شد، چون cancellation، stale state، loading/error، invalidation و polling behavior را بین featureها duplicate می‌کند.

### Zustand برای Server State

به‌عنوان server-state layer اصلی رد شد. Zustand همچنان برای client-only shared UI state مانند detail split-view state مفید است، اما استفاده از آن برای server state نیازمند بازسازی lifecycle machineryای است که React Query از قبل فراهم می‌کند.

### Global Redux-like Normalized Store

برای معماری فعلی frontend لازم نیست و synchronization boilerplate بین requestها و stored entityها را افزایش می‌دهد.

## چه زمانی این Decision دوباره بررسی شود؟

در شرایط زیر revisit شود:

- application به data platform کاملاً متفاوتی مهاجرت کند؛
- offline-first synchronized persistence به core requirement تبدیل شود؛
- React Query دیگر با نیازهای server-state lifecycle سازگار نباشد.

جایگزین باید صریحاً caching، invalidation، polling، concurrency و migration مربوط به query contractهای موجود را پوشش دهد.

## مستندات مرتبط

- [`../data-flow.md`](../data-flow.md)
- [`../../04-core-flows/server-state-and-cache.md`](../../04-core-flows/server-state-and-cache.md)
- [`../../04-core-flows/polling-and-data-refresh.md`](../../04-core-flows/polling-and-data-refresh.md)
