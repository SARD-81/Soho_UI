# Troubleshooting

این runbook برای diagnose کردن failureهای مربوط به build، deployment، authentication، API، cache، polling و operationهای feature-level در SOHO UI است.

قبل از تغییر code، ابتدا مشخص کنید واقعاً کدام layer fail شده است.

## classification اولیه

از این ترتیب استفاده کنید:

```text
1. Build artifact exists?
2. Nginx/static serving works?
3. SPA routing works?
4. Browser assets load?
5. API base points to intended backend?
6. Authentication API works?
7. Normal authenticated API works?
8. React Query/cache behavior correct?
9. Feature/backend domain operation correct?
10. StateSync persistence correct?
```

یک frontend symptom ممکن است منشأیی چند layer دورتر داشته باشد. قبل از پیدا کردن owning layer، فقط symptom ظاهری را patch نکنید.

## Build failureها

### `npm ci` fail می‌شود

بررسی کنید:

```bash
node --version
npm --version
```

سپس npm error واقعی را برای موارد زیر بررسی کنید:

- unsupported Node/npm combination؛
- registry/network failure؛
- mismatch بین `package.json` و `package-lock.json`؛
- filesystem permission problem؛
- corrupted dependency cache فقط وقتی evidence به آن اشاره دارد.

در release pipeline صرفاً برای عبور از lockfile mismatch، `npm ci` را با untracked `npm install` جایگزین نکنید.

### TypeScript build fail می‌شود

Normal build:

```bash
npm run build
```

شامل:

```text
tsc -b
vite build
```

TypeScript/source problem را اصلاح کنید. Release را با custom commandی که `tsc -b` را bypass می‌کند نسازید.

### Lint fail است ولی build pass می‌شود

اجرا کنید:

```bash
npm run lint
```

Build و lint دو gate جدا هستند. Successful bundle را معادل lint success در نظر نگیرید؛ ESLint error دقیق را بررسی کنید.

## `dist/` وجود ندارد

`npm run build` موفق باید directory زیر را تولید کند:

```text
dist/
```

بررسی:

```bash
ls -la dist
```

اگر directory وجود ندارد، قبل از دست زدن به Nginx build output را بررسی کنید.

## Blank page بعد از deployment

Browser Developer Tools را باز کنید.

بررسی کنید:

1. status مربوط به `index.html`؛
2. status مربوط به main JS/CSS bundle؛
3. console errorها؛
4. asset pathها؛
5. API requestها.

علت‌های رایج:

- Nginx root اشتباه؛
- artifact upload ناقص؛
- JS asset با 404؛
- cached `index.html` قدیمی که به asset حذف‌شده reference می‌دهد؛
- hosting-path assumption اشتباه با Vite `base: './'`؛
- runtime exception در browser console.

## Root کار می‌کند ولی refresh روی nested route برابر 404 است

Symptom:

```text
/dashboard works after clicking from /
```

اما direct navigation به موارد زیر:

```text
/settings
/file-system
/share
```

Nginx 404 می‌دهد.

علت معمول، نبود SPA fallback است.

Reference rule:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

قبل از reload، Nginx config را validate کنید:

```bash
sudo nginx -t
```

سپس از reload procedure معمول سازمان استفاده کنید، معمولاً:

```bash
sudo systemctl reload nginx
```

## Assetها روی `/` load می‌شوند ولی روی بعضی route formها fail هستند

Vite config فعلی:

```text
base: './'
```

در شرایط زیر actual asset URL را در browser Network/HTML بررسی کنید:

- routeها trailing slash می‌گیرند؛
- frontend زیر subpath می‌رود؛
- Nginx URL را redirect می‌کند؛
- reverse proxy path را rewrite می‌کند.

اگر خود JS/CSS request به location اشتباه می‌رود، فوراً React Router را مقصر ندانید.

## Font یا 3D asset با 404

بررسی کنید:

- browser request path؛
- محتوای `public/` داخل artifact؛
- expectation مربوط به Vite `/fonts` alias؛
- Nginx root؛
- filename case sensitivity روی Linux؛
- اینکه public asset واقعاً وارد deployed build شده است.

Production Linux hosting case-sensitive است، حتی اگر developer قبلاً روی filesystem case-insensitive تست کرده باشد.

## بعد از deployment هنوز UI قدیمی دیده می‌شود

بررسی کنید:

1. Nginx `current`/root به release درست اشاره می‌کند؛
2. cache header مربوط به `index.html`؛
3. browser cache؛
4. CDN/proxy cache در صورت وجود؛
5. artifact جدید واقعاً hashed asset متفاوت دارد؛
6. source commit ثبت‌شده برای release.

Aggressive cache برای `index.html` می‌تواند user را روی release قدیمی نگه دارد حتی اگر fileهای جدید روی disk موجود باشند.

## UI load می‌شود ولی به backend اشتباه request می‌زند

Request URLهای browser Network را بررسی کنید.

`VITE_API_BASE_URL` و `VITE_AUTH_API_BASE_URL` build-time value هستند.

اگر bundle API origin اشتباه دارد:

```text
rebuild the frontend with correct VITE_* values
```

تغییر shell environment variable روی Nginx host بعد از build، JavaScript static موجود را rewrite نمی‌کند.

## CORS failure

معمولاً browser console error می‌دهد در حالی که curl یا server-to-server access کار می‌کند.

بررسی کنید:

- frontend origin؛
- API origin؛
- backend allowed originها؛
- اجازه‌ی Authorization header؛
- HTTP methodها مانند `PUT` و `DELETE`؛
- preflight OPTIONS؛
- reverse-proxy handling.

اگر frontend و API از یک public origin پشت Nginx proxy استفاده کنند، CORS complexity اغلب کمتر می‌شود.

CORS را با disable کردن browser security یا wildcard credential policy بدون فهم security implication حل نکنید.

## Login endpoint برابر 404 یا URL اشتباه است

Configured/derived auth base را verify کنید.

Expected token pathها relative به auth base هستند:

```text
token/
token/refresh/
token/verify/
```

اگر ordinary base این باشد:

```env
VITE_API_BASE_URL=https://api.example.com
```

Frontend این path را derive می‌کند:

```text
https://api.example.com/api/auth/
```

اگر auth جای دیگری host شده، `VITE_AUTH_API_BASE_URL` را configure کنید.

قبل از تغییر auth code، browser request URL واقعی را inspect کنید.

## Login موفق است ولی requestهای بعدی 401 می‌گیرند

بررسی کنید:

1. access token از login برگشته باشد؛
2. `AuthContext` authenticated state را set کرده باشد؛
3. shared Axios request دارای `Authorization: Bearer ...` باشد؛
4. token برای backend environment معتبر باشد؛
5. backend clock/token expiry؛
6. frontend و auth endpointها به یک intended environment اشاره کنند.

برای debugging shortcut، access token را در localStorage persist نکنید.

## 401 تکراری / refresh loop

Architecture مورد انتظار:

- یک isolated refresh request؛
- `_retry` guard به ازای failed request؛
- یک `isRefreshing` single-flight state؛
- queue برای failureهای concurrent.

بررسی کنید:

- refresh endpoint اشتباهاً روی shared `axiosInstance` منتقل نشده باشد؛
- `_retry` حذف نشده باشد؛
- refresh token missing/expired نباشد؛
- backend replayed request را حتی با access token جدید 401 نکند؛
- token scope/authorization operation را به دلیلی غیر از expiry reject نکرده باشد.

Refresh failure باید session را clear کند، نه اینکه بی‌نهایت recurse شود.

## Session بعد از browser reload ناپدید می‌شود

Design فعلی access token را memory-only نگه می‌دارد.

Session restoration به موارد زیر وابسته است:

- refresh token در `sessionStorage`؛
- username/session metadata؛
- idle timestamp؛
- refresh/verification موفق.

SessionStorage و auth network callها را بررسی کنید. صرفاً از بین رفتن memory-only access token روی reload bug نیست.

## User بعد از inactivity logout می‌شود

Frontend idle timeout فعلی 30 دقیقه است.

Activity timestamp در session storage از reload جان سالم به در می‌برد.

قبل از تغییر token behavior، بررسی کنید elapsed time واقعاً از timeout عبور کرده است یا خیر.

## `save_to_db=true` روی normal request دیده می‌شود

این behavior contract فعلی persistence را نقض می‌کند، مگر اینکه request یک internal StateSync canonical snapshot باشد.

Expected:

```text
normal /api traffic -> save_to_db=false
StateSync canonical GET -> save_to_db=true
```

بررسی کنید:

- request URL/params؛
- آیا internal marker مربوط به `X-Soho-State-Sync` قبل از interceptor removal درگیر بوده؛
- caller code برای legacy `save_to_db` field؛
- `applySaveToDbTransportPolicy()`.

برای جبران، caller flag بیشتری اضافه نکنید.

## Mutation موفق است ولی persisted snapshot اجرا نمی‌شود

بررسی کنید:

1. request از shared `axiosInstance` عبور کرده؛
2. method یکی از POST/PUT/PATCH/DELETE است؛
3. endpoint به‌عنوان auth classify نشده؛
4. `resolveStateDomainsForMutation(url)` URL را map می‌کند؛
5. domain دارای `STATE_SYNC_DEFINITIONS` canonical entry است؛
6. StateSync executor request موفق است.

به یاد داشته باشید بعضی domainها عمداً mapping ندارند، از جمله:

- Volumes؛
- OS users؛
- Web users؛
- services؛
- general settings؛
- network configuration؛
- SNMP به‌عنوان domain مستقل؛
- Samba user/group به‌عنوان domain مستقل.

در `stateSyncManager.ts` صحیح GitLab persisted domainهای فعلی عبارت‌اند از `zpool`، `filesystem`، `disk`، `nfs`، `samba-shares` و `webshare`.

## Diagnostic POST و persistence غیرمنتظره

HTTP POST به‌تنهایی به معنی persisted mutation نیست.

نمونه‌ی مهم:

```text
POST /api/snmp/test-connection/
```

این operation diagnostic است. در نسخه‌ی صحیح GitLab، SNMP اصلاً StateSync domain مستقل ندارد؛ بنابراین test connection هم نباید هیچ persisted StateSync snapshot مربوط به SNMP تولید کند.

برای actionهای مشابه، semantics domain را بررسی کنید و صرفاً بر اساس HTTP method mapping نسازید.

## UI بعد از mutation موفق refresh نمی‌شود

Persistence و UI freshness جدا هستند.

ابتدا React Query invalidation را بررسی کنید:

```text
mutation success
  ↓
correct query key invalidated?
  ↓
refetch returns changed backend state?
```

از `save_to_db` به‌عنوان cache-refresh mechanism استفاده نکنید.

## Duplicate/frequent request

قبل از حذف polling مشخص کنید requestها semantic purpose متفاوت ندارند.

مثال:

- Services عمداً یک list request + یک status request به ازای هر unit هر 5 ثانیه دارد؛
- Samba Account Flags عمداً یک query به ازای هر username نمایش‌داده‌شده fan-out می‌کند؛
- Dashboard Network base interface data جدا از bandwidth snapshot هر 2 ثانیه دارد؛
- Notification capacity checkها dedicated query مستقل از بعضی page cacheها دارند.

Polling inventory canonical:

[`../04-core-flows/polling-and-data-refresh.md`](../04-core-flows/polling-and-data-refresh.md)

## CPU / Memory / Network در hidden tab همچنان polling دارند

High-frequency telemetry مورد انتظار از این setting استفاده می‌کند:

```text
refetchIntervalInBackground=false
```

اگر hidden-tab traffic زیاد است، قبل از تغییر cadence actual query/hook و browser visibility state را inspect کنید.

## Integrated Storage request volume زیاد است

بررسی کنید lifecycle-gated resourceها permanently enabled نشده باشند:

- available/unpartitioned disk query فقط برای Create/Add/Replace فعال باشد؛
- importable pool query modal-scoped باشد؛
- pool slot mapping on-demand باشد؛
- detail queryها به selected/pinned pool محدود باشند.

## Wipe button غیرمنتظره disabled است

Disk wipe eligibility ترکیبی از موارد زیر است:

- pool membership؛
- partition-count readiness؛
- partition count؛
- wipe state فعلی.

پیش از تغییر button logic، dedicated partition-count endpoint و pool-device membership را بررسی کنید.

## Disk cleanup failure گزارش می‌دهد ولی disk تغییر کرده

`cleanupDisk()` multi-step است:

```text
clear-zfs (best effort)
  ↓
wipe (required)
```

هر دو request را inspect کنید. Failure در clear-ZFS می‌تواند همچنان با wipe attempt ادامه پیدا کند.

## Pool delete error می‌دهد ولی pool ناپدید شده

Pool delete sequence، pool را **پیش از** cleanup diskهای قبلی destroy می‌کند.

Disk cleanup failure بعدی می‌تواند UI error تولید کند در حالی که pool از قبل gone است.

قبل از retry کورکورانه‌ی destroy، backend zpool state را بررسی کنید.

## File System delete block شده

Backend dependency error شناخته‌شده می‌تواند active share configuration را نشان دهد.

Samba/NFS/Web Share resourceهای مرتبط را قبل از repeated deletion بررسی کنید.

Backend dependency enforcement authoritative است.

## مشکل encryption passphrase

Frontend filesystem passphrase را با sequence زیر ارسال می‌کند:

```text
UTF-8 → Base64
```

بررسی کنید:

- field name صحیح (`passphrase` یا `new_passphrase` بسته به endpoint)؛
- Base64 generation؛
- TLS transport؛
- backend decode expectation؛
- key/encryption status فعلی.

Base64 را encryption در نظر نگیرید.

## Volume change داخل StateSync snapshot نیست

این behavior architecture فعلی است و لزوماً failure نیست.

`/api/volume/*` در حال حاضر StateSync domain mapping ندارد.

اگر product requirement می‌گوید Volume باید snapshot persistence داشته باشد، backend contract را confirm کنید و StateSync را centrally extend کنید؛ `save_to_db=true` را به Volume hook اضافه نکنید.

## Samba user delete برابر HTTP 400

UI فعلی این response را active-share dependency محتمل در نظر می‌گیرد.

قبل از delete بررسی کنید Samba user کجا reference شده است.

Backend dependency check را از frontend bypass نکنید.

## Samba group membership فقط بخشی تغییر می‌کند

به ازای هر username یک PUT جدا ارسال می‌شود.

اگر request شماره N fail شود، requestهای 1 تا N-1 ممکن است قبلاً apply شده باشند.

Group membership را دوباره از backend بخوانید و desired final state را repair کنید؛ rollback را فرض نکنید.

## Web Share وجود دارد ولی permission برابر 777 نیست

Create دو مرحله‌ای است:

```text
POST /api/webshare/
  ↓
POST /api/webshare/set-permission/
```

اولی می‌تواند success شود و دومی fail شود.

هر دو request را مستقل بررسی کنید. Frontend در permission failure به‌صورت خودکار share را حذف نمی‌کند.

## NFS config و service state هم‌خوان نیستند

Create flow فعلی restart مربوط به این service را request می‌کند:

```text
nfs-server.service
```

آن هم پیش از submit کردن create mutation؛ در حالی که edit همان restart path را ندارد.

این یک current limitation مستندشده است. هنگام diagnosis، NFS API state و service restart را دو operation جدا در نظر بگیرید.

بدون confirm کردن backend/service semantics، production behavior را خودسرانه reorder نکنید.

## Services page request زیادی تولید می‌کند

مدل فعلی تقریباً این است:

```text
1 list request + N per-unit status requests every 5 seconds
```

اگر scale مشکل‌ساز شود، راه‌حل preferred یک backend batch/list contract است که status مورد نیاز را برگرداند؛ نه suppress کردن random frontend requestها و stale کردن data.

## Service Start disabled است

Masked service از table فعلی قابل Start نیست.

Hook `unmask` را پشتیبانی می‌کند ولی table Unmask action expose نمی‌کند.

Mask state را از management path تأییدشده resolve کنید و disabled Start button را فوراً UI bug فرض نکنید.

## Network configuration endpoint mismatch

Backend contract فعلی asymmetric است:

```text
DHCP   -> POST /api/network/{interface}/configure/
Static -> POST /api/system/network/{interface}/configure/
```

قبل از تغییر URL code، mode را verify کنید.

## Web user وجود دارد ولی OS user وجود ندارد

Settings ابتدا Web user را create می‌کند و سپس OS-user mutation جدا اجرا می‌کند.

این flow non-atomic است. در صورت OS-user creation failure، Web user می‌تواند به‌درستی باقی بماند.

در incident response بدون قصد صریح برای recovery، Web user را خودکار حذف نکنید.

## OS user وجود دارد ولی Samba user وجود ندارد

Users OS-first Samba workflow نیز sequential/non-atomic است.

هر mutation را جدا بررسی کنید.

## Power action behavior غیرمنتظره

Backend contract فعلی reboot/poweroff را با endpoint زیر اجرا می‌کند:

```text
GET /api/system/power/execute/?action=reboot|poweroff
```

اگرچه GET معمولاً safe/observational فرض می‌شود، این callها operationally mutating هستند.

این URLها را prefetch، health-check، crawl یا automatic replay نکنید.

## Nginx diagnostics

Checkهای رایج روی Debian/Nginx:

```bash
sudo nginx -t
sudo systemctl status nginx
```

Logها معمولاً از طریق این command قابل مشاهده‌اند:

```bash
sudo journalctl -u nginx
```

و/یا Nginx access/error log fileهای configure‌شده.

Log path و logging policy دقیق server-specific است.

هنگام debugging proxy failure، این دو مسیر را جداگانه مقایسه کنید:

```text
browser -> Nginx public URL
Nginx -> backend internal URL
```

## Browser diagnostics checklist

این اطلاعات را capture کنید:

- failing request URL؛
- method؛
- status code؛
- response body؛
- request headerها با حذف secret از report مشترک؛
- browser console error؛
- route URL؛
- deployed release SHA؛
- API origin؛
- اینکه failure بعد از hard refresh رخ می‌دهد یا فقط SPA navigation.

Access/refresh token را داخل issue tracker یا log paste نکنید.

## Release-level incident checklist

وقتی release جدید failure ایجاد می‌کند:

1. deployed SHA/artifact را مشخص کنید.
2. با previous known-good release مقایسه کنید.
3. static asset error را بررسی کنید.
4. built API endpoint/environment را verify کنید.
5. authentication را inspect کنید.
6. backend compatibility را بررسی کنید.
7. در صورت مناسب بودن static artifact را rollback کنید.
8. به یاد داشته باشید backend change ممکن است frontend-only rollback را incompatible کند.

## اطلاعات مورد نیاز برای escalation

یک incident report مفید برای frontend/backend بهتر است شامل موارد زیر باشد:

```text
feature/route
frontend release SHA
backend environment/version if known
exact endpoint + method
HTTP status
sanitized response payload
steps to reproduce
expected behavior
actual behavior
whether operation may have partially succeeded
relevant React Query key / StateSync domain
```

## مستندات مرتبط

- [`build.md`](./build.md)
- [`deployment.md`](./deployment.md)
- [`../06-api/endpoint-map.md`](../06-api/endpoint-map.md)
- [`../06-api/error-handling.md`](../06-api/error-handling.md)
- [`../04-core-flows/authentication.md`](../04-core-flows/authentication.md)
- [`../04-core-flows/state-sync-save-to-db.md`](../04-core-flows/state-sync-save-to-db.md)
- [`../04-core-flows/polling-and-data-refresh.md`](../04-core-flows/polling-and-data-refresh.md)
