# Scope پروژه

این سند مشخص می‌کند repository مربوط به SOHO UI مسئول چه بخش‌هایی است، چه مسئولیت‌هایی را عمداً به backend/system layer واگذار می‌کند و کدام بخش‌های محصول در حال حاضر پیاده‌سازی شده‌اند.

مرز Scope اهمیت زیادی دارد، زیرا این frontend عملیات مدیریتی با اثر بالا انجام می‌دهد، اما پیاده‌سازی authoritative مربوط به Storage، سیستم‌عامل، authentication یا ruleهای persistence نیست.

## نقش محصول

SOHO UI، frontend مدیریتی مبتنی بر مرورگر برای سامانه‌ی مدیریت Storage با نام StoreX است.

وظیفه‌ی آن این است که به Operator احراز هویت‌شده اجازه دهد workflowهای مدیریتی پشتیبانی‌شده را از طریق APIهای backend مشاهده و آغاز کند.

این repository شامل frontend application code، client-side state management، API integration، presentation logic و مستندات مهندسی است.

پیاده‌سازی backend service یا کد مربوط به operating-system/storage در managed system داخل این repository قرار ندارد.

## موارد داخل Scope

### Authentication/Session UX

Frontend مالک موارد زیر است:

- login form و submit آن؛
- authenticated state در سمت client؛
- اضافه‌کردن access token به API requestها؛
- session recovery مبتنی بر refresh token؛
- single-flight recovery برای 401؛
- protected routeها؛
- idle-timeout behavior؛
- local-first logout UX.

Backend همچنان مسئول credential validation، token issuance، token validity، authorization و server-side token invalidation است.

### System Monitoring

Frontend داده‌های monitoring پشتیبانی‌شده را نمایش می‌دهد، از جمله:

- CPU؛
- memory؛
- network/interface telemetry؛
- system uptime؛
- health/capacity مربوط به storage pool؛
- اطلاعات disk/slot؛
- runtime state مربوط به serviceها.

Polling cadence و cache behavior مسئولیت frontend هستند؛ مقدار واقعی metricها توسط backend/system تعیین می‌شود.

### Storage Administration

بخش‌های UI پشتیبانی‌شده شامل موارد زیر هستند:

- مشاهده و cleanup مربوط به physical disk؛
- lifecycle مربوط به integrated/ZFS-like pool؛
- lifecycle مربوط به block Volume؛
- lifecycle و propertyهای filesystem؛
- mount/unmount/canmount؛
- عملیات پشتیبانی‌شده مربوط به encryption key/passphrase.

Validation و confirmation در frontend ایمنی را افزایش می‌دهند، اما جای storage-integrity checkهای backend را نمی‌گیرند.

### File-sharing Administration

Domainهای پشتیبانی‌شده شامل موارد زیر هستند:

- Samba share؛
- Samba user؛
- Samba group؛
- Samba access membership؛
- NFS share؛
- workflow مربوط به create/delete/permission در Web Share.

برخی workflowها چند resource را درگیر می‌کنند و در سطح frontend به‌صورت صریح non-atomic هستند.

### User Administration

Domainهای فعلی user در frontend از یکدیگر مستقل‌اند:

- OS user؛
- Samba user؛
- Web/UI user.

صرف این‌که بعضی workflowها این identityها را به هم مرتبط می‌کنند به این معنی نیست که باید آن‌ها را یک identity store واحد در نظر گرفت.

### System Configuration

تنظیمات پشتیبانی‌شده شامل موارد زیر هستند:

- hostname؛
- timezone؛
- NTP؛
- manual time؛
- hardware clock operations؛
- نمایش system version؛
- network interface configuration؛
- Web/UI user management؛
- SNMP configuration و diagnosticها.

### System Service/Power Actions

Frontend، service controlها و system power actionهای پشتیبانی‌شده را از طریق APIهای backend در اختیار Operator قرار می‌دهد.

این موارد system operationهایی هستند که توسط Operator آغاز می‌شوند؛ authorization و execution authoritative همچنان بر عهده‌ی backend است.

### Server-state Cache و Refresh

Frontend مالک موارد زیر است:

- React Query cache identity؛
- stale time؛
- polling intervalها؛
- mutation invalidation؛
- manual refetch UX؛
- conditional query enablement.

### Canonical Snapshotهای درخواست‌شده از Frontend

Frontend مالک **coordination policy** مربوط به canonical snapshot requestهای `save_to_db=true` از طریق `StateSyncManager` است.

Frontend مالک database در backend یا نحوه‌ی persistence داخلی snapshot توسط backend نیست.

### UI Preference/State

Frontend مالک presentation stateهای browser-local است، از جمله:

- Dashboard layout preferenceها؛
- modal state؛
- selected/pinned detail panelها؛
- theme state؛
- temporary form draftها.

این موارد نباید با authoritative state مربوط به managed system اشتباه گرفته شوند.

### Build Artifact

Repository مالک Vite production build contract است که خروجی زیر را ایجاد می‌کند:

```text
dist/
```

Operations می‌تواند این static artifact را از طریق Nginx یا static web server مناسب دیگری serve کند.

## سطح فعلی Product بر اساس Routeها

| Route | بخش | وضعیت فعلی |
| --- | --- | --- |
| `/login` | Authentication | پیاده‌سازی شده |
| `/dashboard` | Monitoring dashboard | پیاده‌سازی شده |
| `/disks` | Physical diskها | پیاده‌سازی شده |
| `/Integrated-space` | Integrated/Zpool storage | پیاده‌سازی شده |
| `/block-space` | Block storage/Volumeها | پیاده‌سازی شده |
| `/file-system` | Filesystemها | پیاده‌سازی شده |
| `/services` | System serviceها | پیاده‌سازی شده |
| `/users` | ارتباط OS/Samba user | بخشی پیاده‌سازی شده؛ tab مربوط به “Other Users” placeholder است |
| `/settings` | General/network/Web-user settings | پیاده‌سازی شده |
| `/share` | Samba administration | پیاده‌سازی شده |
| `/share-nfs` | NFS administration | پیاده‌سازی شده |
| `/web-share` | Web Share | پیاده‌سازی شده |
| `/history` | History | فقط placeholder |
| `/snmp-service` | SNMP | پیاده‌سازی شده |

برای هر route پیاده‌سازی‌شده، feature document متناظر در [`../05-features/`](../05-features/) وجود دارد.

## موارد صراحتاً خارج از Scope این Frontend

### Backend Implementation

این repository مالک موارد زیر نیست:

- Django یا سایر backend view/controllerها؛
- backend serializer/modelها؛
- database migrationها؛
- storage-management shell/system commandها؛
- پیاده‌سازی systemd؛
- پیاده‌سازی ZFS؛
- جزئیات داخلی Samba/NFS server configuration فراتر از API requestها؛
- backend job scheduling.

### Authorization Enforcement

Protected route در frontend و disabled buttonها security boundary نیستند.

Backend باید موارد زیر را enforce کند:

- authentication؛
- authorization؛
- role/permission policy؛
- دسترسی به destructive operationها؛
- ruleهای مربوط به resource ownership/dependency.

### Storage Integrity

Frontend نباید برای موارد زیر authoritative در نظر گرفته شود:

- این‌که یک disk واقعاً برای wipe ایمن است یا خیر؛
- این‌که یک pool قابل destroy شدن است یا خیر؛
- این‌که یک filesystem/share قابل حذف است یا خیر؛
- این‌که نام یک resource در کل سیستم unique است یا خیر؛
- conflictهای ناشی از administration هم‌زمان.

UI می‌تواند با استفاده از داده‌ی فعلی جلوی خطاهای واضح را بگیرد، اما backend باید دوباره validate کند.

### Transactionality بین Endpointها

Frontend برای workflowهای چند-requestی، database/distributed transaction فراهم نمی‌کند.

یک sequence از requestها می‌تواند partial success داشته باشد.

هرجا atomicity لازم است، ترجیحاً باید endpointای در backend وجود داشته باشد که کل transaction/recovery behavior را مالک باشد.

### Secret Storage

Frontend configuration نباید حاوی secretهای محرمانه‌ی server باشد.

مقادیر `VITE_*` در browser قابل مشاهده‌اند.

Credentialهای backend/database/SSH/signing خارج از Scope تنظیمات frontend هستند.

### Backend Snapshot Implementation

`StateSyncManager` مشخص می‌کند **چه زمانی** frontend باید canonical snapshot درخواست کند و کدام domainها تحت تأثیر قرار گرفته‌اند.

Backend مالک موارد زیر است:

- persistence storage واقعی؛
- transaction handling؛
- schema؛
- retention؛
- database consistency.

### Production Infrastructure Ownership

این repository در حال حاضر یک workflow مربوط به frontend validation در GitHub Actions دارد، اما یک راهکار کامل CI/CD یا Infrastructure as Code در آن نگهداری نمی‌شود.

مستندات frontend، build/deployment contract را تعریف می‌کنند؛ ولی server provisioning، TLS، firewall، monitoring، backup و عملیات backend به deployment/infrastructure environment تعلق دارند.

## محدودیت‌های فعلی محصول که مستند شده‌اند

### Automated Tests

در حال حاضر `package.json` فاقد automated `test` script/test runner است.

به [`../03-development/testing.md`](../03-development/testing.md) مراجعه کنید.

### History Page

`/history` در حال حاضر placeholder است و نباید به‌عنوان یک audit/history subsystem کامل توصیف شود.

### Tab مربوط به “Other Users” در Users

Tab دوم در `/users` در حال حاضر placeholder است.

### Volume StateSync

Volumeها در حال حاضر توسط هیچ StateSync domain در frontend نمایش داده نمی‌شوند.

### StateSync در General Settings / Network / OS Users / Web Users

این بخش‌ها در حال حاضر بدون frontend canonical snapshot domain و با اتکا به backend mutation + query refresh کار می‌کنند.

### NFS Service-Apply Behavior

در create flow فعلی، پیش از submit کردن NFS create درخواست restart برای `nfs-server.service` ارسال می‌شود؛ edit flow همان restart path را استفاده نمی‌کند. این behavior فعلی مستند شده و پیش از redesign نیازمند روشن‌شدن contract بین backend/system است.

### Node Version Pinning

پروژه در حال حاضر استفاده از Node LTS پشتیبانی‌شده را توصیه می‌کند، اما version دقیق Node در repository metadata pin نشده است.

### CI/CD

فایل `.github/workflows/frontend-validation.yml` برای validation مربوط به frontend وجود دارد، اما Dockerfile یا repository-managed deployment script در repository موجود نیست. بنابراین repository دارای validation CI است، ولی deployment pipeline کامل ندارد.

## پرسش‌های مرزبندی هنگام Change

پیش از پیاده‌سازی capability جدید، به این پرسش‌ها پاسخ دهید:

1. آیا این موضوع concern مربوط به presentation/cache در frontend است یا concern مربوط به integrity/security در backend؟
2. کدام backend resource authoritative است؟
3. آیا query key موجودی از قبل همان resource را نمایش می‌دهد؟
4. آیا این operation یک persisted StateSync domain را تغییر می‌دهد؟
5. آیا با وجود استفاده از POST/PUT، operation در واقع diagnostic/observational است؟
6. آیا workflow می‌تواند partial success داشته باشد؟
7. آیا destructive confirmation لازم است؟
8. آیا به‌جای چند request در frontend، backend باید یک transactional endpoint جدید داشته باشد؟
9. آیا feature واقعاً داخل Product Scope فعلی است یا فقط به‌صورت placeholder دیده می‌شود؟
10. کدام documentهای architecture/feature/API موجود باید به‌روزرسانی شوند؟

## مستندات مرتبط

- [`project-overview.md`](./project-overview.md)
- [`glossary.md`](./glossary.md)
- [`../02-architecture/frontend-architecture.md`](../02-architecture/frontend-architecture.md)
- [`../04-core-flows/server-state-and-cache.md`](../04-core-flows/server-state-and-cache.md)
- [`../04-core-flows/state-sync-save-to-db.md`](../04-core-flows/state-sync-save-to-db.md)
- [`../06-api/api-conventions.md`](../06-api/api-conventions.md)
- [`../07-operations/deployment.md`](../07-operations/deployment.md)
