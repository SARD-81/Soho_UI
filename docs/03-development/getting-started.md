# شروع کار

این راهنما workflow تأییدشده‌ی توسعه‌ی local برای SOHO UI را توضیح می‌دهد.

در این سند عمداً فقط tooling و commandهایی مستند شده‌اند که در وضعیت فعلی repository واقعاً وجود دارند.

## پیش‌نیازها

از یک release پشتیبانی‌شده‌ی Node.js LTS به‌همراه npm استفاده کنید.

Repository در حال حاضر version مربوط به Node.js را از طریق `.nvmrc`، `.node-version` یا فیلد `engines` در `package.json` pin نمی‌کند؛ بنابراین توسعه‌دهنده باید version محلی Node را reasonably up-to-date و سازگار با Vite 7 و dependencyهای نصب‌شده نگه دارد.

پیش از نصب dependencyها، runtime را بررسی کنید:

```bash
node --version
npm --version
```

## نصب Dependencyها

از root مربوط به repository اجرا کنید:

```bash
npm install
```

فایل `package-lock.json` داخل repository commit شده و باید با `package.json` همگام باقی بماند.

برای installهای reproducible در CI/deployment، زمانی که lockfile معتبر و بدون تغییر است استفاده از `npm ci` ترجیح دارد.

## Environment

برای development معمول که به backend متصل است، حداقل مقدار زیر لازم است:

```env
VITE_API_BASE_URL=https://backend.example.com
```

Flagهای development-only که در حال حاضر توسط سورس‌کد شناخته می‌شوند عبارت‌اند از:

```env
VITE_USE_MOCKS=true
VITE_AUTH_BYPASS=true
```

`VITE_AUTH_BYPASS` علاوه بر environment variable توسط `import.meta.env.DEV` نیز guard شده است؛ بنابراین production build صرفاً به دلیل وجود این environment variable نمی‌تواند bypass را فعال کند.

پیش از اضافه‌کردن environment variable جدید به frontend، [`configuration.md`](./configuration.md) را مطالعه کنید.

## اجرای Development Server

```bash
npm run dev
```

Vite server configuration فعلی:

```text
host: 0.0.0.0
port: 5173
```

Bind شدن روی `0.0.0.0` باعث می‌شود server از hostهای دیگر در network قابل دسترسی باشد. بنابراین development machine را متناسب با این موضوع ایمن نگه دارید و dev server را بدون ضرورت در معرض networkهای untrusted قرار ندهید.

## Vite Base Path

پروژه از configuration زیر استفاده می‌کند:

```ts
base: './'
```

این مقدار باعث تولید relative asset path در bundle نهایی می‌شود و هنگام serve کردن build در یک filesystem/web-server location غیر از root اهمیت دارد.

مقدار `base` را بدون بررسی تغییر ندهید؛ پس از تغییر آن باید production routing و static asset resolution را verify کنید.

## اجرای Lint

```bash
npm run lint
```

Lint scope فعلی، کل repository از طریق ESLint flat config است و `dist/` ignore می‌شود.

Configuration مربوط به TypeScript/React شامل موارد زیر است:

- ESLint recommended JavaScript rules؛
- TypeScript ESLint recommended rules؛
- React Hooks recommended-latest rules؛
- React Refresh Vite rules.

Rule مربوط به `react-refresh/only-export-components` به‌صورت صریح disable شده است.

## اجرای Production Build

```bash
npm run build
```

Script مربوطه:

```text
tsc -b && vite build
```

بنابراین موفق بودن build نیازمند موفق بودن هر دو مرحله‌ی زیر است:

1. TypeScript project compilation/type checking؛
2. Vite production bundling.

خروجی تولیدشده در مسیر زیر قرار می‌گیرد:

```text
dist/
```

## Preview گرفتن از Build

```bash
npm run preview
```

از preview فقط برای بررسی local مربوط به Vite build تولیدشده استفاده کنید. Production deployment باید از static web server/reverse-proxy configuration موردنظر استفاده کند.

## Automated Testها

در حال حاضر `package.json` فاقد `test` script است و test runner تأییدشده‌ای برای application در toolchain مستندشده وجود ندارد.

موفق بودن `npm run build` یا `npm run lint` معادل داشتن automated behavioral test coverage نیست.

به [`testing.md`](./testing.md) مراجعه کنید.

## Formatting

Repository دارای Prettier configuration زیر است:

```text
singleQuote: true
trailingComma: es5
tabWidth: 2
semi: true
```

Pluginهای زیر نیز load می‌شوند:

- `prettier-plugin-organize-imports`؛
- `prettier-plugin-tailwindcss`.

در حال حاضر npm script اختصاصی با نام `format` وجود ندارد. اگر formatting را دستی اجرا می‌کنید، داخل یک feature change محدود از ایجاد repository-wide formatting churn غیرمرتبط خودداری کنید.

## TypeScript Strictness

Application TypeScript configuration، strict mode و چند check مربوط به maintainability را فعال می‌کند، از جمله:

```text
strict
noUnusedLocals
noUnusedParameters
noFallthroughCasesInSwitch
noUncheckedSideEffectImports
```

Application از bundler module resolution، `react-jsx` و `noEmit` استفاده می‌کند.

Warning/errorهای جدید TypeScript را blocker برای change در نظر بگیرید؛ نه این‌که آن‌ها را با castهای گسترده یا ignore directiveها suppress کنید.

## Workflow پیشنهادی برای Change

برای یک change معمول:

1. مستند feature/core-flow مرتبط را بخوانید؛
2. پیش از edit، ownership مربوط به query/API/state را مشخص کنید؛
3. کوچک‌ترین code change منسجم را اعمال کنید؛
4. اگر contract مستندشده تغییر کرد، documentation را نیز به‌روزرسانی کنید؛
5. lint را اجرا کنید؛
6. build را اجرا کنید؛
7. تا زمانی که automated coverage وجود ندارد، UI flowهای تحت تأثیر را دستی verify کنید؛
8. Git diff نهایی را از نظر formatting/dead code غیرمرتبط بررسی کنید؛
9. با یک commit message متمرکز commit کنید.

## پیش از تغییر Infrastructure Code

پیش از تغییر بخش‌های زیر، document متناظر را بخوانید:

- auth/session → [`../04-core-flows/authentication.md`](../04-core-flows/authentication.md)
- Axios/interceptorها → [`../04-core-flows/api-request-lifecycle.md`](../04-core-flows/api-request-lifecycle.md)
- React Query → [`../04-core-flows/server-state-and-cache.md`](../04-core-flows/server-state-and-cache.md)
- `save_to_db` / StateSync → [`../04-core-flows/state-sync-save-to-db.md`](../04-core-flows/state-sync-save-to-db.md)
- polling → [`../04-core-flows/polling-and-data-refresh.md`](../04-core-flows/polling-and-data-refresh.md)
- notificationها → [`../04-core-flows/notifications.md`](../04-core-flows/notifications.md)

## فایل‌های مرتبط

- `package.json`
- `package-lock.json`
- `vite.config.ts`
- `tsconfig.json`
- `tsconfig.app.json`
- `tsconfig.node.json`
- `eslint.config.js`
- `.prettierrc`
- `README.md`
