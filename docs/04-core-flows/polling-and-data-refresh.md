# Polling و Data Refresh

این سند canonical inventory مربوط به continuous server-state refresh behavior در SOHO UI است.

این سند جای historical polling auditها را به‌عنوان source of truth گرفته است. هرجا این سند با audit قدیمی اختلاف داشت، implementation فعلی hook را verify کنید و همین سند را update کنید.

## Design Goalها

Polling فقط جایی وجود دارد که data آن‌قدر سریع تغییر می‌کند که passive invalidation یا mount-time refresh کافی نیست.

Application تلاش می‌کند از موارد زیر جلوگیری کند:

- duplicate polling تصادفی برای resourceهای equivalent؛
- hidden-tab background traffic؛
- global window-focus refetch storm؛
- fast polling برای configuration data با تغییر کند؛
- persistence side effect ناشی از observational read.

Dedicated query key زمانی مجاز است که subsystem عمداً monitoring lifecycle یا cadence مستقل نیاز داشته باشد. در این حالت باید مستند شود، چون React Query آن key را cache entry جدا در نظر می‌گیرد.

## Global Defaultها

Defaultهای QueryClient:

- `refetchOnMount: 'always'`
- `refetchOnWindowFocus: false`
- `refetchOnReconnect: false`
- `staleTime: 10_000`
- `gcTime: 5 minutes`
- query retry به‌صورت global غیرفعال

Feature hookها می‌توانند این defaultها را override کنند.

## Polling Inventory فعلی

Intervalهای زیر از سورس فعلی verify شده‌اند:

| Resource / Monitor | Query / Endpoint | Interval | Scope / Behavior |
| --- | --- | ---: | --- |
| System uptime | `['system','uptime']` → `/api/system/uptime/` | 1 s | Dashboard uptime badge تا زمانی که mounted است؛ background polling غیرفعال. |
| CPU | `['cpu']` → `/api/system/cpu/` | 2 s | تا زمانی که mounted است؛ background polling غیرفعال. |
| Memory | `['memory']` → `/api/system/memory/` | 2 s | تا زمانی که mounted است؛ background polling غیرفعال. |
| Network bandwidth | `['network','bandwidth-snapshots', interfaceNames]` → per-interface `/api/system/network/{name}/bandwidth/` | 2 s | پس از دریافت interface nameها شروع می‌شود؛ background polling غیرفعال. |
| Zpool list | `['zpool']` → `/api/zpool/` | 30 s default | برای ordinary zpool consumerها و status monitoring؛ background polling غیرفعال. |
| Available unpartitioned disks برای storage dialogها | legacy key `['disk','partitioned']` | 5 s در Integrated Storage | فقط هنگام workflowهای create/add/replace که eligible disk لازم دارند enable می‌شود. نام historical hook/key misleading است. |
| Pool device slots | `['zpool','devices','slots', ...]` | 30 s default | فقط تا زمانی که consuming view enabled/mounted است؛ background polling غیرفعال. |
| Dashboard 3D pool device slots | همان pool-slot query family | 10 s caller override | `ServerSlots3DWidget` عمداً physical slot mapping را سریع‌تر از hook default refresh می‌کند. |
| Selected zpool details | `['zpool', poolName, 'details']` | 30 s وقتی enabled | با disable شدن detail query متوقف می‌شود. |
| Services list | `['services']` → `/api/system/service/` | 5 s | تا زمانی که mounted است؛ background polling غیرفعال. |
| Individual service status | `['services','status', service.unit]` → `/api/system/service/{unit}/` | 5 s | یک query برای هر service نمایش‌داده‌شده؛ background polling غیرفعال. |
| Notification capacity: zpool | `['notifications','capacity','zpool']` با `fetchZpools` | 60 s | Dedicated notification query؛ cache entry جدا از `['zpool']`. |
| Notification capacity: filesystems | `['notifications','capacity','filesystems']` با `fetchFileSystems` | 60 s | Dedicated notification query؛ cache entry جدا از ordinary filesystem query. |
| Notification temperature: disk inventory | `['disk','inventory']` → `/api/disk/` | 30 s | برای disk-temperature monitoring؛ background polling غیرفعال. |

Caller دقیق می‌تواند بعضی hook defaultها را override کند. هنگام مستندسازی یک page، interval واقعی‌ای را که همان page ارسال می‌کند ثبت کنید، نه فقط hook default را.

Services page نیازمند توجه ویژه است، چون یک list query و یک per-unit status query برای هر service را هر 5 ثانیه اجرا می‌کند. در نتیجه request count با تعداد service unitهای نمایش‌داده‌شده رشد می‌کند.

## Resourceهای بدون Continuous Polling

هر backend resource نباید timer داشته باشد.

نمونه‌های verifyشده از سورس فعلی:

| Resource | Refresh Model |
| --- | --- |
| Filesystem list | fetch هنگام mount/revalidation/invalidation؛ `staleTime` برابر 15 s؛ بدون continuous interval در `useFileSystems`. |
| Volume list | fetch هنگام mount و mutation invalidation/manual refetch؛ بدون continuous interval. |
| Network interface/detail discovery | `useNetwork()` interface list و per-interface detail را بدون continuous base-data interval load می‌کند؛ فقط bandwidth snapshotها poll می‌شوند. |
| Disk status query مورد استفاده‌ی status notification | `useDisk()` وقتی بدون override call شود interval ندارد. |
| Samba/NFS/Web-share configuration | عمدتاً mount/invalidation-driven است، مگر hook مشخصی صریحاً interval اضافه کند. |
| System/configuration information | تا زمانی که hook فعلی صریحاً خلاف آن را تعریف نکرده، non-polling در نظر گرفته شود. |

صرفاً چون page بعد از mutation به data تازه نیاز دارد timer اضافه نکنید. برای configuration-style state، mutation invalidation mechanism ترجیحی است.

## Telemetry در برابر Configuration

یک distinction مفید:

### Telemetry

Valueهایی مثل uptime، CPU، memory، bandwidth، temperature و actively observed service status می‌توانند بدون frontend mutation تغییر کنند. این موارد candidate منطقی برای polling هستند.

### Configuration و Inventory

Valueهایی مانند user، share، setting، filesystem، volume یا one-time detail data معمولاً از طریق operation صریح تغییر می‌کنند. Query invalidation، mount-time fetch، manual refresh و targeted refetch را ترجیح دهید.

Storage health می‌تواند بین این دو category باشد؛ جایی که backend/system state مستقل از UI تغییر می‌کند، polling کندتر استفاده می‌شود.

## Background Behavior

Continuous polling hookها معمولاً باید مقدار زیر را تنظیم کنند:

```ts
refetchIntervalInBackground: false
```

این کار مانع ادامه‌ی administrative monitoring traffic زمانی می‌شود که tab hidden است.

هر exception آینده باید روشن کند hidden-tab update چرا لازم است و چه backend loadای قابل قبول است.

## Window Focus و Reconnect

Global focus/reconnect refetch غیرفعال است.

در نتیجه بازگشت به یک tab، fan-out بزرگی از requestها در administrative widgetهای mountشده ایجاد نمی‌کند.

Hook فقط زمانی باید این behavior را override کند که resource semantics آن را توجیه کند. برای مثال `useDiskInventory()` برای Disks feature به‌صورت صریح window-focus refetch را فعال می‌کند.

## Mutation Refresh

Mutation موفق UI state را در دو layer refresh می‌کند:

1. feature-specific `onSuccess` handler ممکن است keyهای دقیق تحت تأثیر را invalidate کند؛
2. global `MutationCache` پس از success active queryها را invalidate می‌کند.

Mutation failشده global success invalidation را trigger نمی‌کند.

این mechanism از polling جداست. Interval برابر 30 ثانیه به این معنی نیست که پس از action موفق user باید 30 ثانیه برای update UI صبر کند؛ اگر query تحت تأثیر فوراً invalidate شود، refresh زودتر انجام می‌شود.

## Polling Snapshot را Persist نمی‌کند

تمام polling requestها observational هستند.

آن‌ها از `axiosInstance` عبور می‌کنند و transport policy تضمین می‌کند normal requestها `save_to_db=false` داشته باشند.

Database snapshot persistence به‌صورت جدا توسط `StateSyncManager` پس از mutation موفق و هنگام authenticated-session baseline schedule می‌شود.

هیچ‌گاه `save_to_db=true` به polling hook اضافه نکنید.

## Shared در برابر Dedicated Query Consumer

React Query فقط زمانی request/cache را share می‌کند که consumerها query key یکسان و lifecycle سازگار داشته باشند.

Notification subsystem فعلی هر دو مدل را نشان می‌دهد.

### Shared/Ordinary Resource Keyها

Status-change monitoring از ordinary resource hookها استفاده می‌کند:

- poolها از طریق `useZpool()` / `['zpool']` با default cadence برابر 30 ثانیه؛
- diskها از طریق `useDisk()` / `['disk']` و بدون interval ارسال‌شده توسط همان caller؛
- serviceها از طریق `useServices()` / `['services']` با 5 ثانیه.

هرجا page consumer همان key را استفاده کند، React Query می‌تواند cache/query lifecycle را share کند.

Dashboard نیز ordinary `['zpool']` resource key را در چند widget reuse می‌کند و dashboard-only zpool cache نمی‌سازد.

### Dedicated Notification Keyها

Capacity monitoring عمداً query entry مستقل دارد:

- `['notifications','capacity','zpool']` هر 60 ثانیه؛
- `['notifications','capacity','filesystems']` هر 60 ثانیه.

این‌ها همان fetch function ordinary resource query را استفاده می‌کنند، ولی query key یکسان ندارند؛ بنابراین می‌توانند network request مستقل ایجاد کنند.

Disk-temperature monitoring نیز از disk-inventory key یعنی `['disk','inventory']` هر 30 ثانیه استفاده می‌کند.

دو query key متفاوت را صرفاً چون به endpoint یکسان می‌خورند یا fetch function مشترک دارند deduplicated توصیف نکنید.

## Conditional Polling

Polling باید زمانی که user دیگر از آن سودی نمی‌برد متوقف شود.

نمونه‌ها:

- legacy `usePartitionedDisks` query فقط زمانی enabled است که storage mutation dialog به available unpartitioned disk نیاز دارد؛
- zpool detail polling فقط برای detail انتخاب‌شده/enabled اجرا می‌شود؛
- Integrated Storage pool-slot mapping فقط بعد از نیاز UI به slot شروع می‌شود؛
- bandwidth polling به interface nameهای discoverشده وابسته است؛
- notification monitorها تا زمانی وجود دارند که `NotificationBootstrapper` در authenticated layout mount باشد.

استفاده از `enabled` یا `refetchInterval: false/undefined` را به زنده نگه‌داشتن timer مربوط به hidden feature ترجیح دهید.

## انتخاب Interval

هنگام اضافه‌کردن یا تغییر polling این پرسش‌ها را بررسی کنید:

1. Backend value بدون frontend mutation با چه سرعتی می‌تواند تغییر کند؟
2. Operator با چه سرعتی باید change را ببیند؟
3. Endpoint چقدر expensive است؟
4. چند instance از query ممکن است هم‌زمان mount باشد؟
5. آیا endpoint به hardware/system command fan-out می‌کند؟
6. آیا query key موجود می‌تواند همان semantics و cadence را پوشش دهد؟
7. آیا dedicated query key عمداً لازم است؟
8. آیا timer هنگام بسته‌شدن modal/page/detail view باید متوقف شود؟
9. آیا invalidation به‌جای polling کافی است؟

Interval تصادفی انتخاب نکنید. اگر value فقط هر 30 ثانیه update نیاز دارد، آن را هر 2 ثانیه poll نکنید.

## Polling Tierهای UI فعلی

یک mental model عملی برای application فعلی:

- **1 ثانیه:** Dashboard uptime؛
- **2 ثانیه:** high-frequency telemetry مانند CPU، memory و bandwidth؛
- **5 ثانیه:** operational status یا short-lived workflow state مانند serviceها و modal-scoped available-disk check؛
- **10 ثانیه:** Dashboard 3D physical slot mapping override؛
- **30 ثانیه:** slower storage-state monitoring، pool detail، default device-slot mapping و disk-temperature inventory؛
- **60 ثانیه:** notification-specific capacity monitoring؛
- **بدون interval:** configuration/inventory data که از lifecycle و invalidation refresh می‌شود.

این‌ها conventionهای مشاهده‌شده در code فعلی‌اند، نه constantهای immutable. هر تغییر باید با product و backend behavior توجیه شود.

## Manual Refresh

Manual refresh در محل‌هایی که وجود دارد باید React Query refetch/invalidation را call کند و observational read باقی بماند.

نباید:

- database snapshot را مستقیم trigger کند؛
- `save_to_db=true` تنظیم کند؛
- mutation را duplicate کند؛
- cacheهای نامرتبط را reset کند.

Block Storage در حال حاضر manual Volume refresh را از page header ارائه می‌دهد، در حالی که `['volumes']` non-polling باقی می‌ماند.

## Notificationها و Polling

Notificationها ترکیبی از ordinary shared resource key و dedicated monitoring query استفاده می‌کنند.

نمونه‌های فعلی:

- capacity monitoring از dedicated zpool/filesystem key با 60 ثانیه استفاده می‌کند؛
- pool status monitoring از ordinary zpool key با default برابر 30 ثانیه استفاده می‌کند؛
- service status-change monitoring ordinary services query پنج‌ثانیه‌ای را observe می‌کند؛
- disk status-change monitoring ordinary disk hook را بدون interval اضافی call می‌کند؛
- temperature monitoring از disk-inventory key با 30 ثانیه استفاده می‌کند.

برای threshold، baseline، fingerprint و duplicate suppression به [`notifications.md`](./notifications.md) مراجعه کنید.

## Debug کردن Duplicate Request

اگر endpoint در DevTools بیشتر از انتظار دیده می‌شود:

1. React Query key هر request را مشخص کنید؛
2. بررسی کنید دو consumer عمداً از key متفاوت برای equivalent backend data استفاده نمی‌کنند؛
3. پیش از فرض failure در React Query deduplication، notification-specific capacity keyها را بررسی کنید؛
4. در Services، مدل intentional شامل one-list-plus-N-status query را حساب کنید؛
5. بررسی کنید mutation invalidation نزدیک scheduled interval رخ نداده باشد؛
6. بررسی کنید mount/unmount cycle باعث revalidation نشده باشد؛
7. verify کنید query به‌اشتباه داخل hidden modal/detail component enabled نباشد؛
8. caller-specific interval override مانند 3D server slot view را بررسی کنید؛
9. فقط پس از روشن‌شدن query ownership و keyها سراغ React StrictMode بروید.

Request مشابه با key متفاوت دو query entry مستقل است، نه cache-deduplication bug.

## Debug کردن Missing Refresh

اگر view update نمی‌شود:

1. مشخص کنید resource اصلاً باید poll شود یا خیر؛
2. اگر نه، expected invalidation یا manual-refresh source را مشخص کنید؛
3. `enabled` conditionها را بررسی کنید؛
4. verify کنید mutation موفق بوده؛
5. query-key alignment بین consumer و invalidation را بررسی کنید؛
6. hook-level `staleTime` و mount behavior را بررسی کنید؛
7. verify کنید backend response واقعاً تغییر کرده است.

## Update کردن این سند

هر زمان hook یک `refetchInterval` اضافه، حذف یا تغییر می‌دهد، همین inventory را در همان change update کنید.

وقتی page یا notification monitor hook default را به‌شکل معنی‌دار override می‌کند یا dedicated query key می‌سازد، behavior را اینجا مستند کنید.

Historical audit fileها فقط compatibility redirect هستند و live configuration محسوب نمی‌شوند.

## فایل‌های مرتبط

- `src/main.tsx`
- `src/hooks/useCpu.ts`
- `src/hooks/useMemory.ts`
- `src/hooks/useNetwork.ts`
- `src/hooks/useSystemUptime.ts`
- `src/hooks/useZpool.ts`
- `src/hooks/useFileSystems.ts`
- `src/hooks/useVolumes.ts`
- `src/hooks/usePoolDeviceSlots.ts`
- `src/hooks/useZpoolDetails.ts`
- `src/hooks/useDisk.ts`
- `src/hooks/useDiskInventory.ts`
- `src/hooks/useServices.ts`
- `src/hooks/useServiceStatuses.ts`
- `src/hooks/useStartupNotificationChecks.ts`
- `src/hooks/useResourceStatusChangeNotifications.ts`
- `src/hooks/useDiskTemperatureNotifications.ts`
- `src/components/dashboard/server-3d/ServerSlots3DWidget.tsx`
- `src/pages/IntegratedStorage.tsx`
- `src/pages/BlockStorage.tsx`
- `src/pages/Services.tsx`

## مستندات مرتبط

- [`server-state-and-cache.md`](./server-state-and-cache.md)
- [`state-sync-save-to-db.md`](./state-sync-save-to-db.md)
- [`notifications.md`](./notifications.md)
- [`api-request-lifecycle.md`](./api-request-lifecycle.md)
- [`../05-features/dashboard.md`](../05-features/dashboard.md)
- [`../05-features/integrated-storage.md`](../05-features/integrated-storage.md)
- [`../05-features/block-storage.md`](../05-features/block-storage.md)
- [`../05-features/services.md`](../05-features/services.md)
