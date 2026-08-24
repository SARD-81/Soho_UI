# ADR-002: متمرکزکردن API Transport در `axiosInstance`

- وضعیت: Accepted
- Scope: Authenticated API transport، request/response interceptorها و persistence transport policy

## Context

SOHO UI تعداد زیادی backend request در featureهای Storage، System، Sharing، User، Settings و Monitoring ارسال می‌کند.

چند behavior باید مستقل از این‌که کدام feature request را ایجاد کرده کاملاً یکسان باشند:

- backend base URL؛
- JSON headerها؛
- Bearer access token injection؛
- behavior مربوط به 401 refresh/replay؛
- optional mock adapter registration؛
- `save_to_db` transport policy؛
- StateSync scheduling پس از mutation موفق؛
- common API error diagnosticها.

پیاده‌سازی مستقل این موارد داخل feature hookها باعث drift در security و consistency می‌شود.

## Decision

برای API traffic عادی application از shared Axios instance در `src/lib/axiosInstance.ts` استفاده می‌شود.

Feature code فقط method، parameter و payload اختصاصی endpoint را مشخص می‌کند. Cross-cutting transport behavior متمرکز باقی می‌ماند.

Authentication token endpointهایی که نباید وارد normal 401-refresh interceptor loop شوند، از auth API client اختصاصی استفاده می‌کنند.

## Consequenceها

### Positive

- behavior مربوط به Authorization header در یک محل کنترل می‌شود؛
- یک refresh queue واحد از concurrent refresh storm جلوگیری می‌کند؛
- ordinary feature hook نمی‌تواند persistence policy را به‌صورت تصادفی bypass کند؛
- mock API behavior به‌شکل یکپارچه اعمال می‌شود؛
- مشاهده‌ی mutation موفق می‌تواند StateSync را به‌صورت مرکزی schedule کند.

### Tradeoffها

- interceptorها high-impact infrastructure هستند و نیازمند review دقیق‌اند؛
- URL classification logic باید auth، diagnostic و persisted mutation domainها را درست از هم تفکیک کند؛
- specialized callهایی که shared instance را bypass می‌کنند باید دلیل آن را مستند کنند.

## Transport Invariantها

1. Traffic عادی زیر `/api/` از `save_to_db=false` استفاده می‌کند.
2. فقط internal StateSync requestها مجازند `save_to_db=true` درخواست کنند.
3. Caller-level `save_to_db` flagهای stale به‌جای trust شدن normalize می‌شوند.
4. Access tokenها از memory-only token storage خوانده شده و به‌صورت مرکزی اضافه می‌شوند.
5. Authentication refresh از single-flight queue استفاده می‌کند.
6. Internal StateSync marker headerها پیش از transport حذف می‌شوند.
7. Feature code نباید token refresh loop مستقل پیاده‌سازی کند.

## Exception مربوط به Auth Client

Login/verify/refresh خارج از normal Axios instance مدیریت می‌شوند، چون عبور refresh request از interceptorای که خودش به 401 واکنش نشان می‌دهد می‌تواند recursion و refresh loop ایجاد کند.

این یک dependency boundary آگاهانه است، نه transport duplication تصادفی.

## Alternativeهای بررسی‌شده

### استفاده از Raw `fetch`/Axios Call داخل هر Hook

رد شد، چون behavior مربوط به token، persistence، error و refresh بین featureها diverge می‌کند.

### یک Axios Instance شامل Token Refresh Endpointها

رد شد، چون refresh endpointها failure semantics متفاوت دارند و نباید دوباره وارد normal refresh interceptor path شوند.

### Middleware در هر Feature Service

به دلیل duplicate کردن cross-cutting transport concernها غیرضروری تشخیص داده شد.

## چه زمانی این Decision دوباره بررسی شود؟

اگر frontend HTTP library را تغییر داد، generated API client معرفی شد یا authentication/persistence transport policy به architectural layer دیگری منتقل شد، این decision باید revisit شود.

هر جایگزین باید پیش از migration featureها security و persistence invariantهای فعلی را حفظ کند.

## مستندات مرتبط

- [`../../04-core-flows/api-request-lifecycle.md`](../../04-core-flows/api-request-lifecycle.md)
- [`../../04-core-flows/authentication.md`](../../04-core-flows/authentication.md)
- [`../../04-core-flows/state-sync-save-to-db.md`](../../04-core-flows/state-sync-save-to-db.md)
