# Configuration

این سند، surface تأییدشده‌ی configuration در frontend مربوط به SOHO UI را تعریف می‌کند.

Frontend configuration باید صریح و حداقلی باقی بماند. Environment variableها داخل application ساخته‌شده با Vite compile می‌شوند و نباید حاوی secretهایی باشند که لازم است از browser user مخفی بمانند.

## Vite Environment Variableها

Variableهای زیر با سورس‌کد فعلی تأیید شده‌اند.

### `VITE_API_BASE_URL`

در `src/lib/axiosInstance.ts` به‌عنوان shared application Axios `baseURL` استفاده می‌شود.

مثال:

```env
VITE_API_BASE_URL=https://storage-api.example.com
```

تمام relative application API pathهایی که از shared Axios instance استفاده می‌کنند، نسبت به این مقدار resolve می‌شوند.

ملاحظات عملیاتی:

- از backend origin/path متناسب با deployment environment استفاده کنید؛
- وقتی origin مربوط به frontend و backend متفاوت است، CORS و network topology مرورگر را در نظر بگیرید؛
- path segmentهای trailing/duplicated اضافه نکنید که باعث resolve اشتباه requestهای موجود `/api/...` شوند؛
- authentication token/network behavior را از طریق origin واقعی deployment verify کنید.

### `VITE_AUTH_API_BASE_URL`

Base URL اختیاری برای authentication client ایزوله‌شده در `src/lib/authApi.ts`.

وقتی به‌صورت صریح configure شود، requestهای token issue/refresh/verify مستقیماً نسبت به همین مقدار resolve می‌شوند.

مثال:

```env
VITE_AUTH_API_BASE_URL=https://storage-api.example.com/api/auth/
```

اگر این variable وجود نداشته باشد یا مقدار آن خالی باشد، auth client به `VITE_API_BASE_URL` fallback می‌کند و یک authentication base با انتهای `/api/auth/` می‌سازد.

مثال:

```text
VITE_API_BASE_URL=https://storage-api.example.com
                         ↓
auth base=https://storage-api.example.com/api/auth/
```

Auth base به trailing slash normalize می‌شود تا relative requestهایی مثل `token/`، `token/refresh/` و `token/verify/` به‌شکل قابل پیش‌بینی resolve شوند.

فقط زمانی از `VITE_AUTH_API_BASE_URL` استفاده کنید که authentication عمداً روی origin/path متفاوتی نسبت به application API عادی host شده باشد. در deployment معمول با یک backend واحد، fallback مبتنی بر `VITE_API_BASE_URL` ترجیح دارد تا فقط یک endpoint setting نیاز به نگهداری داشته باشد.

### `VITE_USE_MOCKS`

Flag مربوط به development/testing که توسط `axiosInstance` استفاده می‌شود.

Truthy formهای قابل قبول فعلی:

```text
1
true
yes
on
```

اگر مقدار truthy باشد، `setupAxiosMockAdapter(axiosInstance)` register می‌شود.

مقدار default در صورت نبودن variable:

```text
false
```

Mock mode را در production deployment فعال نکنید، مگر این‌که محیط عمداً demonstration environment باشد و این behavior بررسی و تأیید شده باشد.

### `VITE_AUTH_BYPASS`

Bypass مربوط به route authentication که فقط برای development در نظر گرفته شده است.

Truthy formهای قابل قبول فعلی:

```text
1
true
yes
on
```

Runtime guard به‌شکل زیر است:

```text
import.meta.env.DEV && VITE_AUTH_BYPASS is truthy
```

بنابراین production build صرفاً با دریافت `VITE_AUTH_BYPASS=true` نمی‌تواند bypass را فعال کند.

این double guard یک security invariant است و نباید تضعیف شود.

## مقادیر Built-in در Vite

کد همچنین به مقادیر ارائه‌شده توسط خود Vite متکی است، مانند:

```text
import.meta.env.DEV
```

این مقادیر build/runtime-mode indicator هستند و custom deployment configuration محسوب نمی‌شوند.

## Environment Valueهای سمت Client عمومی هستند

هر variable با prefix `VITE_*` که توسط Vite استفاده شود می‌تواند بخشی از browser bundle شود.

هیچ‌گاه موارد زیر را داخل Vite configuration در frontend قرار ندهید:

- private API key؛
- credential مربوط به backend database؛
- SSH credential؛
- signing secret؛
- long-lived privileged service token؛
- password.

اگر browser به authenticated access نیاز دارد، از مکانیزم authentication/session پشتیبانی‌شده‌ی application استفاده کنید؛ نه از secret جاسازی‌شده در build-time.

## Vite Configuration

`vite.config.ts` فعلی موارد زیر را تعریف می‌کند:

```text
base: ./
plugins: React + Tailwind CSS
server.host: 0.0.0.0
server.port: 5173
/fonts alias -> public/fonts
```

### `base: './'`

Relative base روی URLهای static asset تولیدشده اثر می‌گذارد.

هنگام تغییر deployment location یا history routing behavior، موارد زیر را verify کنید:

- JS/CSS asset resolution؛
- fontها؛
- behavior مربوط به direct navigation/refresh؛
- Nginx static-file fallback ruleها.

### `/fonts` Alias

Vite، مسیر `/fonts` را به مسیر زیر resolve می‌کند:

```text
public/fonts
```

Font asset directory را بدون به‌روزرسانی alias و verify کردن تمام CSS/font referenceها جابه‌جا نکنید.

## Runtime Configuration در برابر Build-time Configuration

Vite environment variableها در build-time جایگزین می‌شوند.

در نتیجه تغییر یک deployment environment value معمولاً نیازمند rebuild کردن frontend است، مگر این‌که application یک runtime configuration mechanism مستقل معرفی کند.

فرض نکنید تغییر server environment بعد از ساخته‌شدن `dist/` باعث تغییر valueهایی می‌شود که از قبل داخل static JavaScript bundle قرار گرفته‌اند.

## Configuration Ownership

از ownership ruleهای زیر استفاده کنید:

- normal backend base URL → `VITE_API_BASE_URL`؛
- optional separate authentication base URL → `VITE_AUTH_API_BASE_URL`؛
- dev mock/auth flagها → environment configuration؛
- feature business ruleها → source/domain logic، نه env variable مگر این‌که عمداً deployment-specific باشند؛
- query intervalها → hook/feature code و polling documentation؛
- design token/theme → theme/CSS source؛
- backend persistence semantics → معماری StateSync/Axios؛
- secretها → server-side/backend secret management، و هرگز Vite client env.

## اضافه‌کردن Environment Variable جدید

پیش از اضافه‌کردن `VITE_*` جدید:

1. مطمئن شوید value می‌تواند بدون ریسک در اختیار تمام browser userها قرار گیرد؛
2. تأیید کنید واقعاً deployment-specific است و product/business constant نیست؛
3. یک نام صریح انتخاب کنید؛
4. behavior مربوط به missing/default value را تعریف کنید؛
5. string/boolean valueها را به‌صورت مرکزی validate و normalize کنید؛
6. setting را در همین سند مستند کنید؛
7. آن را به deployment handoff documentation اضافه کنید؛
8. هر دو حالت absent و configured را test کنید.

اگر یک configuration module می‌تواند ownership را بهتر بیان کند، از `import.meta.env` readهای پراکنده و ad-hoc خودداری کنید.

## نمونه‌ی Development Environment

```env
VITE_API_BASE_URL=http://localhost:8000
# Optional only when auth is hosted separately:
# VITE_AUTH_API_BASE_URL=http://localhost:8000/api/auth/
VITE_USE_MOCKS=false
VITE_AUTH_BYPASS=false
```

Backend URL دقیق، environment-specific است؛ این مثال recommendation برای production نیست.

## فایل‌های مرتبط

- `vite.config.ts`
- `src/lib/axiosInstance.ts`
- `src/lib/authApi.ts`
- `src/routes/ProtectedRoute.tsx`
- `src/mocks/setupMocks.ts`

## مستندات مرتبط

- [`getting-started.md`](./getting-started.md)
- [`../04-core-flows/authentication.md`](../04-core-flows/authentication.md)
- [`../04-core-flows/api-request-lifecycle.md`](../04-core-flows/api-request-lifecycle.md)
- [`../07-operations/build.md`](../07-operations/build.md)
