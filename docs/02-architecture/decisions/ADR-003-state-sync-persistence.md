# ADR-003: Persist کردن Canonical Snapshotها از طریق `StateSyncManager`

- وضعیت: Accepted
- Scope: Frontend-triggered `save_to_db` snapshot persistence

## Context

چند domain در backend دارای `save_to_db` contract هستند. در implementationهای قدیمی‌تر، feature code می‌توانست persistence flag را مستقیماً به GETهای عادی یا mutation payloadها اضافه کند.

این رویکرد fragile است، چون:

- mutation payload اغلب فقط partial change است و complete resource state نیست؛
- polling/manual refresh ممکن است به‌اشتباه snapshot را persist کند؛
- feature hookها ممکن است درباره‌ی مقدار true/false رفتار متفاوتی داشته باشند؛
- cross-domain effectها به‌راحتی از قلم می‌افتند؛
- mutationهای سریع می‌توانند persistence traffic تکراری ایجاد کنند.

Frontend به یک owner واحد نیاز دارد که تصمیم بگیرد **چه زمانی** canonical snapshot باید persist شود و **کدام complete endpoint** نماینده‌ی هر domain است.

## Decision

`StateSyncManager` به‌عنوان تنها owner در frontend برای canonical snapshot requestهای `save_to_db=true` استفاده می‌شود.

API traffic عادی توسط Axios transport policy به `save_to_db=false` force می‌شود.

پس از یک mutation موفق که mapping آن تعریف شده، StateSync یک یا چند canonical snapshot GET برای persisted domainهای تحت تأثیر schedule می‌کند.

## Persisted Domainها

بر اساس نسخه‌ی فعلی و صحیح contract در GitLab، domainهای StateSync عبارت‌اند از:

```text
zpool
filesystem
disk
nfs
samba-shares
webshare
```

هر domain یک canonical complete-read definition دارد.

در contract فعلی، `samba-users`، `samba-groups` و `snmp` StateSync domain مستقل نیستند و نباید صرفاً از روی namespace endpoint به‌عنوان persisted domain فرض شوند.

## Cross-domain Mapping

برخی mutation familyها عمداً به بیش از یک domain map می‌شوند.

Mappingهای اصلی فعلی:

```text
zpool      -> zpool + disk
filesystem -> filesystem + zpool
disk       -> disk + zpool
nfs        -> nfs
samba sharepoint -> samba-shares
webshare   -> webshare
```

Mapping، resource dependencyها را در یک محل ثبت می‌کند و از این جلوگیری می‌کند که هر feature hook persistence topology را جداگانه بداند.

## Coalescing

StateSync mutationهای سریع را با یک scheduling delay کوتاه coalesce می‌کند.

اگر زمانی که snapshot یک domain در حال اجراست mutation دیگری رخ دهد، پس از complete شدن snapshot فعلی دقیقاً یک follow-up snapshot درخواست می‌شود.

هدف، persistence مربوط به newest state نهایی است؛ بدون ایجاد snapshot queue نامحدود.

## Session Baseline

پس از login/session restoration، یک canonical baseline snapshot یک بار در هر authenticated frontend session درخواست می‌شود.

StrictMode render، token refresh یا auth renderهای تکراری باید همان baseline promise را reuse کنند و باعث duplicate full-session snapshot نشوند.

## Diagnostic Operationها

HTTP method به‌تنهایی semantics مربوط به StateSync را مشخص نمی‌کند.

یک POST موفق می‌تواند diagnostic باشد و persisted configuration را mutate نکند.

مثال:

```text
POST /api/snmp/test-connection/
```

در contract فعلی GitLab، SNMP اساساً StateSync domain ندارد؛ بنابراین این diagnostic request و سایر SNMP requestها نباید از طریق frontend StateSync، SNMP persistence snapshot schedule کنند.

## Consequenceها

### Positive

- persistence ownership متمرکز است؛
- database snapshotها complete current resource state را نمایش می‌دهند؛
- polling/manual read نمی‌تواند به‌صورت تصادفی persist کند؛
- cross-domain dependencyها صریح هستند؛
- mutationهای سریع coalesce می‌شوند؛
- legacy caller flagها می‌توانند از domain type/hookها حذف شوند.

### Tradeoffها

- URL-to-domain mapping باید با backend endpointها همگام بماند؛
- persisted domain جدید به central definition نیاز دارد؛
- diagnostic actionها یا namespaceهایی که persistence ندارند نباید صرفاً از HTTP method یا URL prefix به‌عنوان persisted mutation تشخیص داده شوند؛
- correctness در frontend همچنان به این وابسته است که canonical endpointها complete data برگردانند.

## Ruleها

1. Feature hook نباید `save_to_db=true` ارسال کند.
2. Ordinary request/mutationها traffic عملیاتی/observational با false transport semantics هستند.
3. Persistence behavior جدید را به StateSync mapping اضافه کنید، نه individual componentها.
4. Complete canonical snapshot را persist کنید، نه copy مربوط به mutation payload.
5. Mutation failشده نباید persistence را schedule کند.
6. Diagnostic action یا domain خارج از StateSync نباید صرفاً به دلیل POST/PUT بودن persistence snapshot ایجاد کند.
7. هنگام تغییر URL mapping، StateSync documentation و testها را نیز به‌روزرسانی کنید.

## Alternativeهای بررسی‌شده

### Persist از هر Mutation Hook

رد شد، چون ownership پراکنده می‌شود و partial payload ممکن است current complete state را نمایش ندهد.

### Persist روی هر GET/Poll

رد شد، چون observation نباید database side effect ایجاد کند و high-frequency monitoring persistence traffic زیادی تولید می‌کند.

### Backend به‌تنهایی Mutationها را Internally Persist کند

از نظر معماری ساده‌تر است، اما contract فعلی backend این‌گونه نیست. اگر در آینده backend تمام persistence را به‌صورت atomic مالک شد، این ADR باید عمداً supersede شود و StateSync retire شود.

## چه زمانی این Decision دوباره بررسی شود؟

در شرایط زیر revisit شود:

- backend mutation endpointها کاملاً مسئول persistence شوند؛
- snapshot persistence semantics تغییر کند؛
- websocket/event-driven backend synchronization جایگزین contract فعلی شود.

## مستندات مرتبط

- [`../../04-core-flows/state-sync-save-to-db.md`](../../04-core-flows/state-sync-save-to-db.md)
- [`../../04-core-flows/api-request-lifecycle.md`](../../04-core-flows/api-request-lifecycle.md)
- [`../data-flow.md`](../data-flow.md)
