# API Conventions

این سند conventionهای فعلی سمت frontend برای API integration در SOHO UI را تعریف می‌کند.

هدف این است که integrationهای جدید با authentication، React Query، persistence، error handling و operational workflowهای موجود در application سازگار بمانند.

## مالکیت transport

Normal application traffic باید از این module عبور کند:

```text
src/lib/axiosInstance.ts
```

Shared Axios client مالک cross-cutting behaviorهای زیر است:

- resolve کردن `VITE_API_BASE_URL`؛
- JSON request headerها؛
- attach کردن Bearer access token؛
- centralized transport policy مربوط به `save_to_db`؛
- recovery از 401 و token refresh؛
- queue کردن failed requestها هنگام refresh؛
- schedule کردن StateSync پس از mutation موفق؛
- ثبت optional mock adapter؛
- API-error logging مشترک.

Feature hook/componentها نباید این مسئولیت‌ها را دوباره پیاده‌سازی کنند.

## استثنای authentication transport

Token issue، refresh و verify عمداً از isolated auth client داخل این فایل استفاده می‌کنند:

```text
src/lib/authApi.ts
```

این جداسازی مانع آن می‌شود که token refresh به‌صورت recursive وارد Axios 401 interceptor معمولی شود.

Authentication base URL resolution در اسناد زیر توضیح داده شده است:

- [`../03-development/configuration.md`](../03-development/configuration.md)
- [`authentication-api.md`](./authentication-api.md)

Logout متفاوت است: یک authenticated application mutation است و بنابراین از shared Axios instance معمولی استفاده می‌کند.

## Base URLها

Normal application API:

```text
VITE_API_BASE_URL
```

Optional authentication API جدا:

```text
VITE_AUTH_API_BASE_URL
```

اگر مقدار authentication-specific وجود نداشته باشد، auth client یک base با انتهای `/api/auth/` از `VITE_API_BASE_URL` derive می‌کند.

Production origin را داخل hook یا component hard-code نکنید.

## conventionهای URL

Backend pathها کاملاً uniform نیستند. APIهای فعلی شکل‌های مختلفی دارند:

```text
/api/zpool/
/api/volume/create
/api/system/network
/api/system/service/{unit}/control/?action=...
/api/filesystem/delete/?name=...
```

Endpoint spelling، trailing slash یا path family را صرفاً بر اساس preference شخصی normalize نکنید. Verified backend contract را حفظ کنید.

Dynamic identifierها باید URL encode شوند:

```ts
encodeURIComponent(resourceName)
```

این موضوع مخصوصاً برای موارد زیر مهم است:

- service unit name؛
- disk name؛
- pool name؛
- filesystem full name؛
- username؛
- group name؛
- share name؛
- network-interface name.

## Query parameterها

در صورت امکان برای query parameter از Axios `params` استفاده کنید و arbitrary user value را دستی به URL concatenate نکنید.

نمونه‌ها:

```text
property=all
contain_system_groups=false
name=<filesystem>
action=<service-action>
include_system=false
```

اگر endpoint فعلی verified inline query pattern دارد، تا زمانی که کل request contract عمداً refactor نشده آن را حفظ کنید.

## Domain payload نباید مالک persistence باشد

یکی از invariantهای اصلی architecture این است:

```text
normal /api/ request      -> save_to_db=false
StateSync canonical GET   -> save_to_db=true
```

Feature-domain payload باید فقط business data مربوط به همان operation را داشته باشد.

Fieldهایی مثل موارد زیر اضافه نکنید:

```text
save_to_db
saveToDb
persist
snapshot
```

مگر اینکه centralized persistence architecture عمداً در حال تغییر باشد.

Request interceptor مقدارهای stale مربوط به caller-level `save_to_db` را strip/normalize می‌کند تا legacy code نتواند non-canonical response را ناخواسته persist کند.

Contract کامل:

- [`../04-core-flows/state-sync-save-to-db.md`](../04-core-flows/state-sync-save-to-db.md)
- [`../02-architecture/decisions/ADR-003-state-sync-persistence.md`](../02-architecture/decisions/ADR-003-state-sync-persistence.md)

## observational request در برابر mutation

HTTP method به‌تنهایی persistence semantics را مشخص نمی‌کند.

مثال:

- `GET /api/system/cpu/` observational است.
- `POST /api/snmp/config/` backend SNMP configuration را تغییر می‌دهد، اما در نسخه‌ی فعلی GitLab یک StateSync domain مستقل برای SNMP وجود ندارد.
- `POST /api/snmp/test-connection/` با وجود استفاده از POST diagnostic است.
- `POST /api/system/time/hwclock/` با `action=show` observational است ولی actionهای دیگر می‌توانند mutating باشند.

هنگام اضافه کردن endpoint، operation را بر اساس domain effect طبقه‌بندی کنید، نه فقط method.

اگر request موفق از نوع POST/PUT/PATCH/DELETE است ولی StateSync-owned domain را تغییر نمی‌دهد، resolver نباید برای آن persisted snapshot اشتباه schedule کند.

## مالکیت React Query

Authoritative backend state باید در React Query نگهداری شود.

Stable query key باید backend resource/lifecycle را نمایش دهد، برای مثال:

```text
['zpool']
['filesystems']
['volumes']
['disk','inventory']
['services']
['services','status',unit]
['nfs','shares']
['samba-users']
['webshare','shares']
['snmp','info']
```

صرفاً چون یک resource در صفحه‌ی دیگری هم نمایش داده می‌شود query key جدید نسازید. Shared resource معمولاً باید cache identity مشترک داشته باشد.

Key متفاوت زمانی منطقی است که data source، parameter، lifecycle یا semantic resource واقعاً متفاوت باشد.

## رفتار پس از mutation موفق

یک mutation معمولاً دو concern مستقل بعد از success دارد:

1. **UI freshness** — React Query resource مرتبط invalidate/refetch شود.
2. **Persistence** — shared Axios response interceptor از `StateSyncManager` می‌خواهد برای persisted domainهای map‌شده canonical snapshot schedule کند.

Feature hook باید concern اول را مدیریت کند.

Concern دوم نباید دستی داخل feature hook پیاده‌سازی شود.

## StateSync URL mapping

بر اساس `stateSyncManager.ts` صحیح در GitLab، persisted domainهای فعلی عبارت‌اند از:

```text
zpool
filesystem
disk
nfs
samba-shares
webshare
```

Cross-domain mappingهای اصلی:

```text
/api/zpool...       -> zpool + disk
/api/filesystem...  -> filesystem + zpool
/api/disk...        -> disk + zpool
/api/nfs...         -> nfs
/api/samba/sharepoints... -> samba-shares
other /api/samba... -> samba-shares
/api/webshare...    -> webshare
```

در نسخه‌ی فعلی، `samba-users`، `samba-groups` و `snmp` StateSync domain مستقل نیستند.

همچنین backend domainهای زیر خارج از persisted frontend snapshot map فعلی هستند:

- Volumes؛
- OS users؛
- Web/UI users؛
- system service control؛
- general system settings؛
- network configuration؛
- SNMP configuration به‌عنوان domain مستقل.

برای domain بدون mapping، با local persistence flag مسئله را دور نزنید. ابتدا backend persistence contract را confirm کنید.

## conventionهای polling

Polling cadence متعلق به resource hook است، نه generic API helper.

Component فقط وقتی باید override ارائه کند که همان resource در یک operational context خاص cadence متفاوت لازم داشته باشد؛ مانند 3D slot view.

Polling ruleها باید در این سند canonical نیز منعکس شوند:

[`../04-core-flows/polling-and-data-refresh.md`](../04-core-flows/polling-and-data-refresh.md)

High-frequency polling معمولاً باید این behavior را داشته باشد:

```text
refetchIntervalInBackground = false
```

مگر اینکه background refresh یک product requirement عمدی باشد.

## Cancellation

Read helperها در lifecycleهایی که cancellation را پشتیبانی می‌کنند باید `AbortSignal` مربوط به React Query را به Axios منتقل کنند.

این رفتار برای موارد زیر مفید است:

- page navigation؛
- query disablement؛
- تغییر resource identity؛
- جلوگیری از obsolete detail request.

وقتی React Query + Axios signal کافی است، custom cancellation mechanism جدید نسازید.

## Response normalization

Backend compatibility normalization باید نزدیک data layer انجام شود.

نمونه‌های فعلی:

- handling مربوط به disk `ok === false`؛
- Web Share multi-shape normalization؛
- Samba boolean/account-flag normalization؛
- SNMP boolean-like test-result normalization؛
- network response alias discovery؛
- filesystem legacy list/detail compatibility.

در حد امکان component باید stable frontend model دریافت کند.

Backend-version field aliasها را در JSX table/modalهای مختلف پخش نکنید.

## `ok: false` با HTTP success

برخی backend endpointها می‌توانند logical failure را در HTTP success response اعلام کنند:

```json
{
  "ok": false,
  "error": "..."
}
```

هرجا endpoint contract فعلی نیاز دارد، API helper باید این shape را به failed/rejected frontend operation تبدیل کند.

فرض نکنید `2xx` همیشه به معنی domain success است.

## Error messageها

در صورت امکان از shared helper زیر استفاده کنید:

```text
extractApiErrorMessage(error, fallback)
```

این helper shapeهای رایج زیر را recognize می‌کند:

```text
detail
message
error.message
error.detail
Error.message
```

بعضی feature-specific APIها legacy shape اضافی مانند `errors` دارند. تا زمانی که response contractها unify نشده‌اند، compatibility extractorهای آن‌ها باید نزدیک API layer مرتبط باقی بمانند.

جزئیات:

[`error-handling.md`](./error-handling.md)

## multi-request workflowها

برخی user actionها ظاهراً یک operation هستند ولی چند backend request اجرا می‌کنند.

مثال:

- pool delete: destroy pool، سپس cleanup diskهای قبلی؛
- Web Share create: create share، سپس set permission؛
- Samba group create: create group، سپس add userها یکی‌یکی؛
- Samba group member update: یک PUT به ازای هر username؛
- Settings Web-user create: create Web user، سپس OS user؛
- Users OS-first Samba creation: create OS user، سپس Samba user.

این flowها معمولاً **frontend transaction نیستند** و automatic rollback ندارند.

هنگام پیاده‌سازی multi-request workflow جدید:

1. ترتیب requestها را مستند کنید.
2. مشخص کنید failure در request شماره N چه اثری دارد.
3. atomicityای را که backend guarantee نکرده ادعا نکنید.
4. recovery/troubleshooting guidance را در feature document مالک workflow نگه دارید.

## destructive operationها

Delete/wipe/stop operationهایی که availability یا data-loss risk معنادار دارند باید confirmation-driven باقی بمانند.

Frontend confirmation فقط UX protection است. Backend authorization و resource-integrity validation authoritative باقی می‌مانند.

## checklist تغییر API

هنگام add یا modify کردن endpoint integration:

1. method/path/trailing-slash دقیق را verify کنید.
2. owning feature/domain را مشخص کنید.
3. dynamic path identifier را URL encode کنید.
4. برای read یک stable React Query key تعریف کنید.
5. برای mutation success invalidation را تعریف کنید.
6. مشخص کنید operation واقعاً persisted state را تغییر می‌دهد یا خیر.
7. فقط در صورت نیاز StateSync mapping را update کنید.
8. caller-level ownership برای `save_to_db` ایجاد نکنید.
9. backend response alias را در data boundary normalize کنید.
10. در صورت وجود، behavior مربوط به logical `ok:false` را تعریف کنید.
11. error را با fallback message پایدار normalize کنید.
12. برای multi-request flow، partial failure را مستند کنید.
13. [`endpoint-map.md`](./endpoint-map.md) را update کنید.
14. feature/core-flow document مربوط را update کنید.

## فایل‌های مرتبط

- `src/lib/axiosInstance.ts`
- `src/lib/authApi.ts`
- `src/lib/stateSyncManager.ts`
- `src/utils/apiError.ts`

## مستندات مرتبط

- [`authentication-api.md`](./authentication-api.md)
- [`error-handling.md`](./error-handling.md)
- [`endpoint-map.md`](./endpoint-map.md)
- [`../04-core-flows/api-request-lifecycle.md`](../04-core-flows/api-request-lifecycle.md)
- [`../04-core-flows/server-state-and-cache.md`](../04-core-flows/server-state-and-cache.md)
