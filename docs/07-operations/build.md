# Build

این سند build contract تأییدشده‌ی SOHO UI و artifact/informationهایی را مشخص می‌کند که باید به owner مربوط به Operations یا DevOps تحویل داده شوند.

SOHO UI یک React/TypeScript application است که با Vite build می‌شود. خروجی production یک directory استاتیک به نام `dist/` است؛ پس از build برای render کردن frontend به Node application server نیاز نیست.

## build tooling فعلی repository

`package.json` scriptهای زیر را تعریف می‌کند:

```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "preview": "vite preview"
}
```

در حال حاضر `test` script وجود ندارد.

`package-lock.json` commit شده و از lockfile version 3 استفاده می‌کند.

Repository همچنین frontend validation workflow زیر را دارد:

```text
.github/workflows/frontend-validation.yml
```

این workflow در حال حاضر با Node.js 22 اجرا می‌شود و commandهای زیر را اجرا می‌کند:

```text
npm ci
npm run lint
npm run build
```

Repository همچنان موارد زیر را ندارد:

- Dockerfile؛
- Nginx configuration file؛
- package-level Node version pin از طریق `.nvmrc` یا `package.json#engines`.

CI workflow یک environment تأییدشده با Node 22 فراهم می‌کند، اما هنوز general package-level Node version declaration محسوب نمی‌شود.

## CI quality gate

Frontend validation workflow روی موارد زیر اجرا می‌شود:

- push به audit/documentation branch فعال در دوره‌ی cleanup پروژه؛
- pull requestهایی که target آن‌ها `main` است.

Workflow commit status با context زیر publish می‌کند:

```text
frontend-validation
```

Job sequence:

```text
checkout
→ pending validation status
→ setup Node.js 22
→ npm ci
→ npm run lint
→ npm run build
→ final validation status
```

Status ناموفق `frontend-validation` باید تا زمانی که علت lint/build failure فهمیده و اصلاح نشده merge blocker باشد.

## sequence پیشنهادی برای release build

از clean checkout مربوط به commit مورد نظر:

```bash
npm ci
npm run lint
npm run build
```

دلیل استفاده از `npm ci` برای release/CI build:

- dependencyها را از lockfile commit‌شده install می‌کند؛
- اگر package metadata و lockfile inconsistent باشند fail می‌شود؛
- از rewrite شدن opportunistic dependency resolution جلوگیری می‌کند؛
- از dependency tree تمیز شروع می‌کند.

برای local development معمولی، وقتی عمداً dependency را تغییر می‌دهید `npm install` همچنان قابل قبول است.

## رفتار build command

Production command:

```bash
npm run build
```

که عملاً به این sequence تبدیل می‌شود:

```text
tsc -b
  ↓
vite build
```

بنابراین build موفق دو layer مهم را verify می‌کند:

1. TypeScript project compilation/type checking؛
2. Vite production bundling.

در release process مستقیماً `vite build` اجرا نکنید و بعد ادعا نکنید normal project build pass شده است؛ چون این کار step صریح `tsc -b` را skip می‌کند.

## TypeScript quality gateها

`tsconfig.app.json` در حال حاضر strict checkهای زیر را فعال دارد:

```text
strict
noUnusedLocals
noUnusedParameters
noFallthroughCasesInSwitch
noUncheckedSideEffectImports
```

Compile failure باید در source/type definition اصلاح شود، نه با release command ضعیف‌تر bypass شود.

## Lint

اجرا کنید:

```bash
npm run lint
```

Lint command فعلی:

```text
eslint .
```

Build script به‌صورت خودکار ESLint را اجرا نمی‌کند؛ به همین دلیل CI lint و build را به‌صورت دو gate جدا اجرا می‌کند.

## وضعیت automated test

در `package.json` هنوز automated behavioral test runner/script وجود ندارد.

بنابراین executable CI gate فعلی این sequence را verify می‌کند:

```text
npm ci
npm run lint
npm run build
```

و برای changeهایی که behavior را تغییر می‌دهند همچنان targeted manual smoke verification لازم است.

جزئیات gap مربوط به testing و جهت‌گیری پیشنهادی آینده:

[`../03-development/testing.md`](../03-development/testing.md)

## Environment variableها build-time input هستند

Vite مقدارهای `VITE_*` را هنگام build داخل browser bundle embed می‌کند.

Settingهای verify‌شده:

```text
VITE_API_BASE_URL
VITE_AUTH_API_BASE_URL   optional
VITE_USE_MOCKS
VITE_AUTH_BYPASS
```

Production build باید **پیش از** `npm run build` مقدارهای مناسب production را دریافت کند.

تغییر environment variable روی server پس از تولید `dist/`، مقدارهایی را که از قبل داخل JavaScript bundle embed شده‌اند rewrite نمی‌کند.

## ایمنی production environment

Expectation برای production release:

```text
VITE_USE_MOCKS=false
VITE_AUTH_BYPASS=false
```

`VITE_AUTH_BYPASS` علاوه بر این توسط `import.meta.env.DEV` نیز guard می‌شود، اما production configuration همچنان باید آن را disabled نگه دارد تا release configuration مبهم نباشد.

هرگز secret را داخل Vite environment variable قرار ندهید. Browser user می‌تواند client bundle/configuration را inspect کند.

جزئیات:

[`../03-development/configuration.md`](../03-development/configuration.md)

## انتخاب API base configuration

### یک backend origin/path

Setup معمول می‌تواند فقط این مقدار را داشته باشد:

```env
VITE_API_BASE_URL=https://api.example.com
```

Auth client سپس این URL را derive می‌کند:

```text
https://api.example.com/api/auth/
```

### auth origin/path جدا

وقتی authentication عمداً جدا host شده است:

```env
VITE_API_BASE_URL=https://api.example.com
VITE_AUTH_API_BASE_URL=https://auth.example.com/api/auth/
```

Auth URL جدا فقط وقتی configure شود که deployment topology واقعاً به آن نیاز دارد.

## خروجی Vite

Vite production build موفق assetهای static را داخل directory زیر می‌نویسد:

```text
dist/
```

محتوای معمول artifact:

```text
index.html
assets/*
public/static assets copied by Vite
```

Hashed asset filenameها build output هستند و نباید در server configuration hard-code شوند.

## Vite base path

`vite.config.ts` فعلی شامل این مقدار است:

```text
base: './'
```

هر تغییر در hosting path/base باید در برابر این موارد test شود:

- root navigation؛
- nested client routeها؛
- direct page refresh؛
- JS/CSS loading؛
- fontها؛
- 3D/static assetها؛
- browser history routing.

## verify کردن build artifact

بعد از build موفق حداقل این command را اجرا کنید:

```bash
ls -la dist
```

سپس برای local production-bundle smoke check در environment دارای browser از command زیر استفاده کنید:

```bash
npm run preview
```

`vite preview` verification server است، نه production web server مستندشده.

## manual smoke checklist

Automated lint/build جای runtime smoke verification را نمی‌گیرد. پیش از release representative high-risk pathهای زیر را verify کنید:

- login؛
- refresh/reload یک authenticated session؛
- logout؛
- direct navigation به protected nested route؛
- load شدن CPU/memory/network/zpool data در Dashboard؛
- load شدن Integrated Storage list؛
- load شدن File System list؛
- یک non-destructive Settings read flow؛
- API 401 recovery در صورت امکان تست امن؛
- load شدن static font/icon/3D assetها بدون 404؛
- browser refresh روی nested route باید SPA را برگرداند، نه Nginx 404.

Destructive storage/system mutation فقط در environmentی smoke-test شود که انجام آن امن باشد.

## چه چیزی به DevOps / Operations تحویل داده شود

برای deployment handoff یکی از این دو مدل را ارائه کنید.

### Option A — prebuilt artifact

- directory/archive تأییدشده‌ی `dist/`؛
- source commit SHA مورد استفاده برای build؛
- build date/release identifier؛
- production API/auth base valueهای استفاده‌شده هنگام build؛
- نتیجه‌ی `frontend-validation` یا evidence معادل lint/build؛
- deployment/rollback note.

### Option B — source-based build

موارد زیر را ارائه کنید:

- repository و commit/tag دقیق؛
- `package.json` + `package-lock.json` همان revision؛
- `VITE_*` valueهای مورد نیاز؛
- commandها:

```bash
npm ci
npm run lint
npm run build
```

- expected output directory: `dist/`؛
- Node/npm versionی که برای release validate شده است.

Option B زمانی بهتر است که deployment pipeline خودش reproducible artifact تولید کند.

## Node version policy

CI فعلاً با این version validate می‌کند:

```text
Node.js 22
```

Project هنوز package-level/general developer version pin زیر را ندارد:

- `.nvmrc`؛
- `.node-version`؛
- `package.json#engines`.

تا زمان اضافه شدن policy رسمی، برای reproduce کردن environment فعلی CI از Node 22 استفاده کنید و Node/npm version دقیق production release را ثبت کنید.

Commandهای مفید:

```bash
node --version
npm --version
```

اگر در آینده package-level Node policy اضافه شد، CI و این سند باید با هم update شوند.

## triage مربوط به build failure

### `npm ci` fail می‌شود

بررسی کنید:

- compatibility مربوط به Node/npm؛
- package-lock consistency؛
- registry/network access؛
- corrupted npm cache فقط پس از بررسی error واقعی؛
- آیا `package.json` تغییر کرده ولی `package-lock.json` update نشده است.

### TypeScript fail می‌شود

Normal build را اجرا کنید و source/type issue گزارش‌شده را اصلاح کنید. در release build، `tsc -b` را skip نکنید.

### ESLint fail می‌شود

Lint failure را از type error جدا بررسی کنید. Rule/file دقیق را ببینید؛ فقط برای unblock کردن release ruleها را globally disable نکنید.

### CI fail است ولی local build pass می‌شود

مقایسه کنید:

- Node/npm version؛
- lockfile state؛
- uncommitted local fileها؛
- environment valueها؛
- case-sensitive import pathهایی که ممکن است روی Linux متفاوت رفتار کنند.

GitHub Actions یک clean-room signal مهم است، چون از fresh checkout و `npm ci` شروع می‌کند.

### Build موفق است ولی API به backend اشتباه اشاره می‌کند

احتمالاً هنگام build مقدار اشتباه `VITE_API_BASE_URL` یا `VITE_AUTH_API_BASE_URL` استفاده شده است. با value صحیح rebuild کنید؛ تغییر Nginx environment variable به‌تنهایی bundle موجود را تغییر نمی‌دهد.

### Build موفق است ولی nested route refresh fail می‌شود

این معمولاً web-server SPA fallback problem است، نه Vite compile problem. سند زیر را ببینید:

[`deployment.md`](./deployment.md)

## Release evidence

برای هر release حداقل این موارد را نگه دارید:

```text
commit SHA
frontend-validation result
Node version
npm version
environment-name / non-secret VITE endpoints
artifact checksum or release package identity
manual smoke verification notes
```

این کار «frontend deploy‌شده» را به reproducible artifact تبدیل می‌کند، نه directory copy بدون traceability.

## فایل‌های مرتبط

- `.github/workflows/frontend-validation.yml`
- `package.json`
- `package-lock.json`
- `vite.config.ts`
- `tsconfig.app.json`
- `eslint.config.js`
- `.prettierrc`

## مستندات مرتبط

- [`deployment.md`](./deployment.md)
- [`troubleshooting.md`](./troubleshooting.md)
- [`../03-development/getting-started.md`](../03-development/getting-started.md)
- [`../03-development/configuration.md`](../03-development/configuration.md)
- [`../03-development/testing.md`](../03-development/testing.md)
