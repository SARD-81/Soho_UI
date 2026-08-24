# واژه‌نامه

این واژه‌نامه اصطلاحات اختصاصی پروژه را که در سورس‌کد SOHO UI و مستندات مهندسی استفاده می‌شوند تعریف می‌کند.

این معانی باید در سراسر پروژه به‌صورت یکسان استفاده شوند. هر زمان یک اصطلاح در backend یا محصول تغییر کرد، این واژه‌نامه و مستندات feature/API مرتبط نیز باید هم‌زمان به‌روزرسانی شوند.

## اصطلاحات Application و محصول

### SOHO UI

Frontend مبتنی بر React/TypeScript این repository که در مرورگر اجرا می‌شود.

این بخش، UI مدیریتی سامانه‌ی مدیریت Storage با نام StoreX است و برای دریافت state معتبر سیستم و اجرای mutationها با APIهای backend ارتباط برقرار می‌کند.

### StoreX

محصول/سامانه‌ی جامع‌تر مدیریت Storage که SOHO UI بخشی از آن است.

این repository فقط application مربوط به frontend را دربر می‌گیرد و شامل پیاده‌سازی کامل backend یا زیرساخت StoreX نیست.

### Operator

کاربر احراز هویت‌شده‌ای که از SOHO UI برای مشاهده یا مدیریت سیستم تحت کنترل استفاده می‌کند.

اشاره به Operator در frontend به معنی وجود یک role یا permission model مشخص در backend نیست؛ مرجع نهایی authorization همچنان backend است.

## اصطلاحات Storage

### Disk

یک device فیزیکی/block که توسط APIهای مربوط به disk در backend گزارش می‌شود.

Frontend می‌تواند اطلاعات inventory، جزئیات، slot و partition را نمایش دهد و عملیات cleanup مجاز را آغاز کند.

### Disk inventory

مجموعه‌ی canonical دیسک‌های فیزیکی در frontend که معمولاً با React Query key زیر نمایش داده می‌شود:

```text
['disk','inventory']
```

### Partition count

تعداد partitionهای یک disk که به‌صورت مستقل از backend دریافت می‌شود.

صفحه‌ی Disks از این مقدار به‌عنوان بخشی از UX ایمنی عملیات wipe استفاده می‌کند و فقط به inventory flag که ممکن است دقت کمتری داشته باشد متکی نیست.

### Integrated Storage

نام feature قابل مشاهده برای کاربر جهت مدیریت Storage مبتنی بر pool/ZFS-like.

Route:

```text
/Integrated-space
```

در سورس‌کد و APIها، این domain عمدتاً با `zpool` نمایش داده می‌شود.

### Zpool / pool

resource مربوط به storage pool در backend که از طریق endpointهای `/api/zpool/...` مدیریت می‌شود.

Frontend canonical collection key:

```text
['zpool']
```

### Vdev

نوع/grouping مربوط به virtual device در ZFS/pool که برای اعتبارسنجی نحوه‌ی چینش diskها هنگام ساخت یا توسعه‌ی یک pool استفاده می‌شود.

### Pool device

یک disk/device که در حال حاضر به یک pool متصل است.

APIهای pool-device همچنین در workflowهای مربوط به vdev type، slot mapping، wipe safety و replace/add device استفاده می‌شوند.

### Volume / Block Storage

resource مربوط به block storage که زیر `/api/volume/...` مدیریت می‌شود و در route زیر نمایش داده می‌شود:

```text
/block-space
```

Frontend، Volumeها را resourceای مستقل از Filesystemها و Zpoolها در نظر می‌گیرد.

### Filesystem

یک resource از نوع filesystem زیر `/api/filesystem/...` که معمولاً با یک نام منطقی کامل شناسایی می‌شود:

```text
pool/filesystem
```

Frontend collection key:

```text
['filesystems']
```

### Mountpoint

مسیر filesystem که یک filesystem روی آن mount یا expose می‌شود.

Mountpointها در File System، NFS، eligibility مربوط به Samba/Web Share و UIهای مرتبط استفاده می‌شوند.

### `canmount`

یک property مربوط به filesystem که رفتار mount خودکار/مجاز را کنترل می‌کند.

UI آن را به‌شکل یک کنترل on/off نمایش می‌دهد، اما مقدار backend ممکن است stringهایی مانند `on`/`off` باشد.

### Encryption key state

برداشت frontend از این‌که key مربوط به یک filesystem رمزگذاری‌شده load شده/در دسترس است یا خیر.

این state مشخص می‌کند actionهای load/unload/change-passphrase فعال باشند یا نه.

### Base64 passphrase encoding

Frontend بعضی passphraseهای filesystem را ابتدا به UTF-8 bytes و سپس به Base64 تبدیل می‌کند و بعد برای backend می‌فرستد.

Base64 **رمزنگاری نیست**. برای محرمانگی داده در زمان انتقال، HTTPS/TLS الزامی است.

## اصطلاحات Sharing

### Samba / SMB

Domain مربوط به file sharing که با APIهای Samba share، Samba user و Samba group نمایش داده می‌شود.

SOHO UI این بخش را در route زیر ارائه می‌کند:

```text
/share
```

### Samba Share

resource مربوط به Samba sharepoint زیر:

```text
/api/samba/sharepoints/
```

Frontend canonical share key:

```text
['samba','shares']
```

### Samba User

یک identity اختصاصی Samba که برای authentication/access در SMB استفاده می‌شود.

این identity با OS user و Web/UI user متفاوت است، حتی اگر usernameهای آن‌ها با یکدیگر مرتبط باشند.

Frontend collection key:

```text
['samba-users']
```

این query key یک cache identity در React Query است و نباید با StateSync domain اشتباه گرفته شود.

### Samba Group

یک Samba group که برای access membership استفاده می‌شود.

Frontend collection key:

```text
['samba-groups']
```

این query key نیز به معنی وجود persisted StateSync domain مستقل برای Samba Group نیست.

### Account Flags

یک property مربوط به Samba user که برای هر username query می‌شود تا enabled/disabled state آن مشخص شود.

برداشت فعلی frontend شامل موارد زیر است:

```text
D -> disabled
U -> enabled
```

### NFS

Domain مربوط به Network File System sharing که از طریق مسیر زیر مدیریت می‌شود:

```text
/api/nfs/shares/
```

Frontend collection key:

```text
['nfs','shares']
```

### `no_subtree_check`

یک option مربوط به NFS در frontend که counterpart آن در backend، `subtree_check` است.

تبدیل فعلی request عمداً به شکل زیر انجام می‌شود:

```text
subtree_check = !no_subtree_check
```

### Web Share

یک web-serving exposure برای shareای که شرایط لازم را دارد و بر پایه‌ی filesystem ساخته شده است.

در حال حاضر یک filesystem فقط زمانی eligible در نظر گرفته می‌شود که از قبل از طریق SMB یا NFS share شده باشد و هنوز Web Share نداشته باشد.

Frontend collection key:

```text
['webshare','shares']
```

## اصطلاحات User و Authentication

### OS User

resource مربوط به user سیستم‌عامل زیر `/api/os/user...`.

این user از Samba user و Web/UI user مستقل است.

### Web User / UI User

account مربوط به application/backend UI زیر:

```text
/api/system/ui-user/
```

تب Users در Settings این accountها را مدیریت می‌کند.

در workflow فعلی، ساخت Web User پس از آن یک request مستقل برای ساخت OS user اجرا می‌کند؛ این workflow اتمیک نیست.

### Access token

Bearer token کوتاه‌عمر که به requestهای معمول authenticated API متصل می‌شود.

طبق policy فعلی frontend، این token فقط در memory نگهداری می‌شود.

### Refresh token

Token مورد استفاده برای دریافت access token جدید.

طبق policy فعلی frontend، این token در `sessionStorage` نگهداری می‌شود و یک fallback در memory نیز دارد.

### Single-flight refresh

یک concurrency pattern در `axiosInstance` که در آن هنگام وقوع چند خطای هم‌زمان 401 فقط یک request برای token refresh اجرا می‌شود و سایر requestها در queue منتظر می‌مانند.

این الگو از ایجاد refresh storm جلوگیری می‌کند.

### Protected route

Routeای که محتوای application را فقط بعد از آن render می‌کند که initialization مربوط به authentication در frontend، وجود یک authenticated session را تأیید کرده باشد.

Protection در frontend برای کنترل UX/session است و جای authorization در backend را نمی‌گیرد.

### Idle timeout

محدودیت inactivity در frontend که پس از سپری‌شدن مدت مشخص بدون فعالیت، authenticated UI session را پاک/خاتمه می‌دهد (در حال حاضر 30 دقیقه).

## اصطلاحات API و Data Flow

### `axiosInstance`

Axios client مشترک application.

این client مسئول رفتارهای cross-cutting زیر است:

- application API base URL؛
- اضافه‌کردن Bearer token؛
- policy مربوط به `save_to_db`؛
- refresh/replay در خطای 401؛
- زمان‌بندی StateSync؛
- log کردن خطاهای مشترک API.

### `authClient`

Axios client ایزوله‌شده در `authApi.ts` که برای token issue، refresh و verification استفاده می‌شود.

این client عمداً shared 401 interceptor را دور می‌زند.

### React Query / TanStack Query

Library و لایه‌ی معماری مسئول state معتبر backend که در frontend cache می‌شود.

### Query key

شناسه‌ی array-based و پایدار که React Query برای نمایش lifecycle/resourceهای backend استفاده می‌کند.

نمونه‌ها:

```text
['zpool']
['filesystems']
['services','status',unit]
```

### Invalidation

فرآیند stale/eligible کردن یک resource در React Query برای authoritative refetch پس از mutation.

Invalidation، **freshness مربوط به UI** را کنترل می‌کند و مسئول persistence مربوط به database snapshot نیست.

### `staleTime`

مدتی که React Query داده‌ی cacheشده را fresh در نظر می‌گیرد؛ پس از آن lifecycle ruleهای معمول ممکن است باعث refetch شوند.

این مقدار با polling interval یکسان نیست.

### `gcTime`

مدتی که داده‌ی بدون استفاده در React Query cache می‌تواند پیش از garbage collection باقی بماند.

### Polling / `refetchInterval`

اجرای دوره‌ای یک query تا زمانی که مطابق policy همان hook، query enabled/mounted باشد.

Polling یک عملیات observational است، مگر این‌که خود endpoint دارای side effect باشد؛ حالتی که اصولاً باید از آن اجتناب شود.

### Mutation

یک عملیات API با هدف تغییر state سیستم/backend که معمولاً با React Query `useMutation` نمایش داده می‌شود.

برخی actionهای backend از نظر عملیاتی mutating هستند، حتی اگر HTTP method غیرمعمولی داشته باشند؛ بنابراین semantics باید بررسی شود و نباید فقط از روی method نتیجه‌گیری کرد.

### Diagnostic action

عملیاتی که ممکن است از POST/PUT استفاده کند اما persisted configuration را تغییر نمی‌دهد.

مثال:

```text
POST /api/snmp/test-connection/
```

Diagnostic actionها نباید باعث ایجاد persisted StateSync snapshot شوند.

### Logical failure

Responseای از backend که در آن transport در سطح HTTP ممکن است موفق باشد، اما payload شکست عملیات را گزارش می‌کند؛ برای مثال:

```json
{
  "ok": false,
  "error": "..."
}
```

API helperهای frontend باید در endpointهایی که این رفتار جزئی از contract آن‌هاست، reject/throw کنند.

### Partial failure

یک workflow چند-requestی که در آن ممکن است مرحله‌های ابتدایی موفق شوند ولی یک request بعدی fail شود.

نمونه‌ها شامل cleanup پس از pool delete، permission setup برای Web Share، batchهای Samba membership و ساخت user بین چند domain هستند.

## اصطلاحات Persistence

### `save_to_db`

پارامتر request در backend که طبق SOHO API contract مشخص می‌کند آیا request باید باعث persist شدن یک canonical snapshot شود یا خیر.

معماری frontend policy زیر را enforce می‌کند:

```text
normal API traffic    -> save_to_db=false
StateSync snapshot    -> save_to_db=true
```

Feature code نباید مالک این flag باشد.

### StateSyncManager

Coordinator در frontend که مسئول درخواست canonical persisted snapshot پس از mutationهای موفق در domainهای mapشده است.

فایل:

```text
src/lib/stateSyncManager.ts
```

### StateSync domain

یک persisted resource family منطقی که برای `StateSyncManager` شناخته‌شده است.

بر اساس `stateSyncManager.ts` صحیح در GitLab، domainهای فعلی عبارت‌اند از:

```text
zpool
filesystem
disk
nfs
samba-shares
webshare
```

`Samba User`، `Samba Group` و `SNMP` در runtime فعلی StateSync domain مستقل نیستند، حتی اگر برای data/query خودشان React Query key مستقل داشته باشند.

### Canonical snapshot

یک GET از backend که post-mutation state معتبر یک domain را نمایش می‌دهد و توسط StateSync با `save_to_db=true` درخواست می‌شود.

Frontend فقط snapshot را درخواست می‌کند؛ persistence واقعی در database بر عهده‌ی backend است.

### Cross-domain StateSync

یک mutation می‌تواند بیش از یک persisted domain را تحت تأثیر قرار دهد.

نمونه‌ها:

```text
zpool mutation      -> zpool + disk
filesystem mutation -> filesystem + zpool
disk mutation       -> disk + zpool
```

برای Samba، mutationهای `/api/samba/sharepoints...` و در resolver فعلی GitLab سایر `/api/samba...` mutationها به `samba-shares` map می‌شوند؛ `samba-users` و `samba-groups` persisted domain مستقل نیستند.

## اصطلاحات UI/State

### Detail split view

الگوی مشترک UI/store برای نمایش یک resource فعال به‌همراه resourceهای pinشده جهت comparison/detail.

نمونه‌های آن در Disks، Integrated Storage، File System و Samba share viewها دیده می‌شوند.

### Active item

resource اصلی که در حال حاضر در یک detail split view انتخاب شده است.

### Pinned item

resourceای که برای comparison/detail همچنان visible نگه داشته می‌شود، حتی زمانی که resource دیگری active می‌شود.

### Dashboard layout

چیدمان browser-local مربوط به Dashboard widgetها برای هر user، شامل order، widgetهای hidden و size overrideها.

این مورد یک UI preference است و managed-system state در backend محسوب نمی‌شود.

### Draft layout

state موقت customization مربوط به Dashboard پیش از آن‌که Operator گزینه‌ی Save را انتخاب کند.

### RTL

جهت layout از راست به چپ که در UI فارسی استفاده می‌شود.

پروژه از RTL support در Emotion/Stylis به‌همراه `dir="rtl"` در محل‌های لازم استفاده می‌کند.

### LTR technical value

مقادیر فنی مانند IP address، hostname، service name یا path ممکن است برای خوانایی در یک صفحه‌ی RTL همچنان به‌صورت چپ‌به‌راست نمایش داده شوند.

## اصطلاحات Build و Operations

### Vite

Tooling مربوط به build/dev در frontend.

Command مربوط به production در نهایت static assetها را در مسیر زیر ایجاد می‌کند:

```text
dist/
```

### `VITE_*`

Environment variableهای build-time در Vite که در client code/bundle قابل دسترسی هستند.

این متغیرها نباید شامل secret باشند.

### `dist/`

Static production build artifact که توسط Vite ساخته می‌شود.

در production، یک static web server مانند Nginx همین خروجی را serve می‌کند.

### SPA fallback

رفتار web server که برای client-side routeهای ناشناخته `index.html` را برمی‌گرداند تا browser-history routing هنگام direct navigation یا refresh صحیح کار کند.

الگوی رایج Nginx:

```nginx
try_files $uri $uri/ /index.html;
```

### Release artifact

Build output تغییرناپذیر که به یک source revision و build configuration دقیق وابسته است.

### Atomic release

Deployment strategy که در آن ابتدا release جدید به‌صورت immutable آماده می‌شود و سپس با تغییر یک pointer/symlink فعال می‌گردد؛ در نتیجه rollback سریع امکان‌پذیر است.

## اصطلاحات Documentation

### Core flow

مکانیزم runtime مشترک بین featureها، مانند authentication، API lifecycle، cache، StateSync، polling یا notificationها.

### Feature document

مستندات اختصاصی یک page/domain که user flow، APIها، state، business ruleها، failureها و راهنمای extension را توضیح می‌دهد.

### ADR

Architecture Decision Record.

یک رکورد کوتاه و ماندگار که یک تصمیم معماری مهم، rationale آن، consequenceها و alternative/contextهای مرتبط را توضیح می‌دهد.

### Source of truth

تنها document/module نگهداری‌شده که مسئول یک contract مشخص است.

مستندات باید به source of truth لینک دهند، نه این‌که ruleهای جزئی را در چند document رقیب کپی کنند.

## مستندات مرتبط

- [`project-overview.md`](./project-overview.md)
- [`scope.md`](./scope.md)
- [`../02-architecture/`](../02-architecture/)
- [`../04-core-flows/`](../04-core-flows/)
- [`../05-features/`](../05-features/)
- [`../06-api/endpoint-map.md`](../06-api/endpoint-map.md)
