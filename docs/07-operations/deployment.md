# Deployment

این سند deployment model و operational requirementهای لازم برای serve کردن SOHO UI به‌عنوان production static application را تعریف می‌کند. الگوی reference در این سند Debian + Nginx است.

این سند عمداً یک **deployment contract/reference** است و ادعا نمی‌کند repository در حال حاضر deployment automation کامل دارد.

Repository اکنون frontend validation workflow زیر را دارد:

```text
.github/workflows/frontend-validation.yml
```

اما هنوز موارد زیر را ندارد:

- `Dockerfile`؛
- Nginx config داخل repository؛
- repository-managed release/deploy script؛
- deployment workflow کامل برای publish/activate کردن release روی server.

این زیرساخت‌ها می‌توانند بعداً اضافه شوند، اما باید application contractهای این سند را حفظ کنند.

## Deployment model

Production build مربوط به SOHO UI استاتیک است:

```text
source
  ↓ npm ci
TypeScript/Vite build
  ↓
dist/
  ↓
Nginx static hosting
  ↓
browser
```

Node.js برای **build کردن** frontend لازم است، نه برای serve کردن frontend ساخته‌شده در runtime وقتی Nginx `dist/` را host می‌کند.

## Artifact مورد نیاز

Production web server به محتوای directory زیر نیاز دارد:

```text
dist/
```

که باید توسط release process تأییدشده در سند زیر ساخته شده باشد:

[`build.md`](./build.md)

`src/` tree را به‌عنوان web root deploy نکنید.

## Build-time configuration باید از قبل صحیح باشد

پیش از تولید `dist/`، production valueهای مناسب را برای موارد زیر configure کنید:

```text
VITE_API_BASE_URL
VITE_AUTH_API_BASE_URL   optional
VITE_USE_MOCKS=false
VITE_AUTH_BYPASS=false
```

Vite client environment valueها را هنگام build substitute می‌کند.

اگر API URL بعد از deployment تغییر کند، artifact قبلی معمولاً باید rebuild شود؛ مگر اینکه architecture جداگانه‌ای برای runtime configuration اضافه شود.

## Same-origin در برابر cross-origin API deployment

دو topology رایج زیر معتبر هستند.

### Topology A — public origin مشترک با Nginx proxy

Browser origin نمونه:

```text
https://soho.example.com
```

Nginx frontend fileها را serve می‌کند و `/api/` را به backend proxy می‌کند.

Build می‌تواند public frontend origin را به‌عنوان API base استفاده کند:

```env
VITE_API_BASE_URL=https://soho.example.com
```

Auth base سپس به شکل زیر derive می‌شود:

```text
https://soho.example.com/api/auth/
```

مزایا:

- browser CORS model ساده‌تر؛
- یک public TLS origin؛
- backend می‌تواند روی internal address/port باقی بماند.

### Topology B — API origin جدا

مثال:

```text
frontend: https://soho.example.com
backend:  https://api.example.com
```

Build:

```env
VITE_API_BASE_URL=https://api.example.com
```

و backend باید CORS/authorization headerهای درست را برای frontend origin configure کند.

`VITE_AUTH_API_BASE_URL` فقط وقتی استفاده شود که auth واقعاً path/origin متفاوتی از normal backend base داشته باشد.

## Nginx SPA fallback

SOHO از browser-history routing با `createBrowserRouter` استفاده می‌کند.

Requestهایی مانند:

```text
/settings
/file-system
/Integrated-space
```

وقتی static file واقعی در آن path وجود ندارد باید SPA `index.html` را برگردانند.

Reference pattern در Nginx:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

بدون این fallback ممکن است:

- navigation داخل SPA درست کار کند؛
- direct URL entry یا browser refresh روی nested route با Nginx 404 fail شود.

این fallback یک deployment requirement است، نه workaround برای React Router bug.

## Reference Nginx static server

Configuration زیر فقط baseline نمونه است و باید با domain، TLS، path، backend topology و organization security policy واقعی تطبیق داده شود:

```nginx
server {
    listen 443 ssl http2;
    server_name soho.example.com;

    root /var/www/soho/current;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        try_files $uri =404;
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location = /index.html {
        add_header Cache-Control "no-cache";
    }
}
```

این مثال فرض می‌کند Vite hashed fileها را زیر `/assets/` تولید می‌کند و عمداً `index.html` را aggressively cache نمی‌کند تا release جدید بتواند user را به hashed assetهای جدید هدایت کند.

Immutable caching را بدون بررسی روی public fileهای unhashed اعمال نکنید.

## Reference same-origin backend proxy

وقتی Nginx backend را هم front می‌کند، یک نمونه‌ی baseline می‌تواند این باشد:

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:8000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Slash behavior مربوط به `proxy_pass` در Nginx مهم است. این template را بدون test کپی نکنید؛ path نهایی backend را verify کنید.

Backend address/port و proxy headerها deployment-specific هستند و توسط frontend repository تعریف نمی‌شوند.

## Authentication پشت reverse proxy

در topology deploy‌شده تمام pathهای زیر را verify کنید:

```text
/api/auth/token/
/api/auth/token/refresh/
/api/auth/token/verify/
/api/system/ui-user/logout/
```

Frontend ممکن است endpointهای معمول `/api/...` را درست بزند ولی `/api/auth/...` را نتواند reach کند؛ در این حالت application ظاهراً load می‌شود ولی login/refresh fail خواهد شد.

## Relative Vite base

Vite config فعلی:

```text
base: './'
```

این مقدار relative asset reference تولید می‌کند.

پیش از تغییر deployment path یا اضافه کردن trailing-slash redirect، موارد زیر را verify کنید:

- `/`؛
- `/dashboard`؛
- `/settings`؛
- direct route refresh؛
- route URL با/بدون trailing slash در صورت server rewrite؛
- JS/CSS asset URL؛
- fontها؛
- 3D/public assetها.

صرفاً برای حل Nginx routing issue مقدار `base` را تغییر ندهید؛ ابتدا SPA fallback و hosting path مورد نظر را بررسی کنید.

## layout پیشنهادی برای atomic release

Repository filesystem path خاصی prescribe نمی‌کند، اما production deployment بهتر است immutable release directory و atomic `current` pointer داشته باشد.

مثال:

```text
/var/www/soho/
├── releases/
│   ├── 20260824-<sha1>/
│   ├── 20260830-<sha2>/
│   └── ...
└── current -> releases/20260830-<sha2>
```

Deployment sequence:

1. artifact تأییدشده در release directory جدید upload/extract شود؛
2. expected fileها و permissionها verify شوند؛
3. symlink مربوط به `current` به‌صورت atomic switch شود؛
4. فقط اگر Nginx configuration تغییر کرده Nginx reload شود؛
5. smoke test اجرا شود؛
6. حداقل یک known-good release قبلی برای rollback نگه داشته شود.

Static application release معمولاً وقتی فقط file/symlink تغییر کرده و root از `current` resolve می‌شود به Nginx reload نیاز ندارد؛ با operational policy سرور واقعی تطبیق دهید.

## Rollback

Rollback frontend static باید معمولاً artifact-based باشد، نه source edit مستقیم روی production server.

Concept:

```text
current -> previous known-good release
```

سپس smoke checkها دوباره اجرا شوند.

Rollback نیازمند توجه به API compatibility نیز هست: frontend قدیمی ممکن است با backend contract جدید سازگار نباشد.

اگر backend schema/API semantics هم‌زمان incompatible تغییر کرده، فرض نکنید frontend artifact rollback به‌تنهایی امن است.

## File ownership و permission

Nginx برای static file/directory به read و execute traversal access نیاز دارد، اما نباید برای immutable release artifact نیاز به write access داشته باشد.

Deployment patternی که web-server worker بتواند application JavaScript یا release directory را تغییر دهد بی‌دلیل ایجاد نکنید.

User/group دقیق به server policy وابسته است؛ `www-data` روی Debian رایج است ولی این repository آن را mandate نمی‌کند.

## TLS

Production authentication tokenها و sensitive administrative operationها نیازمند HTTPS هستند.

Application موارد حساسی مانند این‌ها را transmit می‌کند:

- Bearer access token؛
- refresh token هنگام logout؛
- passwordها؛
- filesystem passphraseهایی که Base64 encoded هستند؛
- network/system administration requestها.

Base64 encryption نیست. TLS transport confidentiality boundary است.

TLS را روی Nginx یا upstream proxy/load balancer تأییدشده terminate کنید و forwarded-protocol header درست را برای backend حفظ کنید.

## Security headerها

Security-header policy deployment/organization-specific است، اما production باید حداقل موارد زیر را ارزیابی کند:

- `Content-Security-Policy`؛
- `X-Content-Type-Options`؛
- `Referrer-Policy`؛
- clickjacking protection با `frame-ancestors` در CSP یا policy معادل؛
- HSTS در صورتی که HTTPS policy اجازه دهد.

CSP بیش از حد strict را بدون test کردن MUI/Emotion، fontها، Three.js assetها، API originها و inline/runtime styling behavior اعمال نکنید.

## Compression

Nginx gzip/Brotli policy می‌تواند transfer size مربوط به JS/CSS را کاهش دهد.

این server optimization است، نه frontend correctness requirement.

Compression را با response header واقعی verify کنید و formatهای binary از قبل compressed را بی‌دلیل دوباره compress نکنید.

## Cache policy

Conceptual split پیشنهادی:

### `index.html`

Short/no cache تا release جدید سریع discover شود.

### hashed Vite assetها

Long immutable cache، چون content hash با asset تغییر می‌کند.

### public/unhashed assetها

Policy کوتاه‌تر یا version-aware؛ immutability را فرض نکنید.

یکی از broken-release scenarioهای رایج، aggressive caching مربوط به `index.html` است که یا به assetهای حذف‌شده reference می‌دهد یا user را روی stale HTML نگه می‌دارد.

## Backend availability

Serve شدن موفق SPA توسط Nginx ثابت نمی‌کند application operational است.

Release smoke verification باید backend call واقعی هم شامل شود، مثل:

- authentication؛
- یک monitoring GET؛
- یک storage/configuration read مناسب environment.

## Health checking

Static-file health می‌تواند 200 بودن `/` یا `/index.html` را check کند، اما complete system health باید این موارد را جدا کند:

```text
frontend static serving
backend API reachability
auth API reachability
```

یک static 200 response را proof سلامت authenticated API workflow در نظر نگیرید.

## Release smoke checklist

بعد از switch کردن release:

1. `/` را باز کنید و SPA boot را verify کنید.
2. `/login` را verify کنید.
3. با test/operator account تأییدشده authenticate کنید.
4. Dashboard را باز و live API data را verify کنید.
5. Browser را روی nested route مثل `/settings` refresh کنید.
6. در browser network panel وجود نداشتن 404 برای asset/font را verify کنید.
7. verify کنید API requestها به origin مورد نظر می‌روند.
8. در صورت امکان auth refresh و protected navigation را verify کنید.
9. مطمئن شوید production mock/auth bypass behavior فعال نیست.
10. مگر اینکه environment برای mutation test باشد، فقط safe non-destructive feature read انجام دهید.

## inputهایی که DevOps برای deployment نیاز دارد

برای هر release handoff موارد زیر را تحویل دهید:

- source commit/tag دقیق؛
- verified `dist/` artifact یا reproducible build source؛
- Node/npm version در صورت build توسط DevOps؛
- مقدار `VITE_API_BASE_URL`؛
- مقدار اختیاری `VITE_AUTH_API_BASE_URL`؛
- production value صریح برای mock/auth-bypass flagها؛
- public frontend domain/path مورد انتظار؛
- backend public/internal topology؛
- اینکه Nginx باید `/api/` را proxy کند یا خیر؛
- owner مربوط به TLS certificate/termination؛
- SPA fallback لازم؛
- release/rollback procedure؛
- smoke-test result.

هیچ backend/database credential نباید به‌صورت `VITE_*` به frontend build داده شود.

## چه چیزی بهتر است در آینده automate شود

Mature deployment pipeline بهتر است این sequence را automate کند:

```text
checkout exact revision
npm ci
lint
build
artifact packaging/checksum
upload/release directory creation
atomic activation
smoke checks
rollback selection
```

Repository فعلی validation CI دارد، اما automated deployment pipeline کامل ندارد. اضافه کردن آن باید یک infrastructure change جدا و review‌شده باشد، نه server scripting بدون documentation.

## مستندات مرتبط

- [`build.md`](./build.md)
- [`troubleshooting.md`](./troubleshooting.md)
- [`../03-development/configuration.md`](../03-development/configuration.md)
- [`../04-core-flows/authentication.md`](../04-core-flows/authentication.md)
- [`../06-api/authentication-api.md`](../06-api/authentication-api.md)
