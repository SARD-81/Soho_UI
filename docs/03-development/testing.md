# Testing

این سند وضعیت فعلی Quality Assurance در SOHO UI و مسیر هدف برای automated behavioral coverage را توضیح می‌دهد.

## وضعیت فعلی

`package.json` در حال حاضر scriptهای زیر را تعریف می‌کند:

```text
dev
build
lint
preview
```

هنوز `test` script وجود ندارد و هیچ unit، integration یا end-to-end test runner به‌عنوان test stack پروژه adopt نشده است. بنابراین پروژه نباید ادعای automated behavioral test coverage داشته باشد در حالی که چنین coverageای وجود ندارد.

Repository **در حال حاضر یک CI quality gate اجرایی دارد**:

```text
.github/workflows/frontend-validation.yml
```

Workflow در موارد زیر اجرا می‌شود:

- push روی `agent/project-documentation-audit` تا زمانی که این audit branch فعال باشد؛
- pull requestهایی که target آن‌ها `main` است.

این workflow از Node.js 22 استفاده می‌کند و commandهای زیر را اجرا می‌کند:

```text
npm ci
npm run lint
npm run build
```

Workflow همچنین commit status با نام `frontend-validation` publish می‌کند تا نتیجه‌ی lint/build به‌عنوان evidence مربوط به release/PR قابل مشاهده باشد.

CI ثابت می‌کند repository در environment مربوط به CI با موفقیت dependencyها را install می‌کند، lint و type-check می‌شود و bundle تولید می‌کند. CI **ثابت نمی‌کند** product workflowها یا backend integrationها از نظر behavior صحیح هستند.

## Quality Checkهای فعلی چه چیزی را پوشش می‌دهند؟

### Dependency Installation

CI command زیر را اجرا می‌کند:

```bash
npm ci
```

و از `package-lock.json` commitشده استفاده می‌کند.

این کار inconsistency بین lockfile و package metadata را شناسایی می‌کند و از opportunistic dependency resolution هنگام validation جلوگیری می‌کند.

### TypeScript / Production Build

```bash
npm run build
```

Command زیر را اجرا می‌کند:

```text
tsc -b && vite build
```

این مرحله موارد زیر را شناسایی می‌کند:

- بسیاری از static type errorها؛
- unused local/parameterهایی که TypeScript برای آن‌ها check فعال دارد؛
- invalid import یا module-resolution problem؛
- failure در production bundle.

اما صحیح بودن feature behavior را ثابت نمی‌کند.

### ESLint

```bash
npm run lint
```

Ruleهای configureشده‌ی TypeScript، React، Hook و lint عمومی را بررسی می‌کند.

Lint، semantics مربوط به backend یا user workflow را validate نمی‌کند.

### Manual Verification

تا زمانی که automated behavioral testها اضافه نشده‌اند، هر change مربوط به behavior همچنان نیازمند manual verification هدفمند روی flowهای تحت تأثیر است.

Manual verification باید در توضیحات PR صریح باشد و صرفاً با عبارت کلی «tested» توصیف نشود.

## Contract مربوط به CI Workflow

فایل canonical:

```text
.github/workflows/frontend-validation.yml
```

ترتیب job فعلی:

```text
checkout
→ publish pending frontend-validation status
→ setup Node.js 22
→ npm ci
→ npm run lint
→ npm run build
→ publish final frontend-validation status
```

Final status یکی از موارد زیر است:

```text
success
failure
error
```

CI failشده تا زمانی که علت lint/build آن درک و اصلاح نشده، blocker برای merge است.

صرفاً برای سبزکردن CI، commandهای اصلی پروژه را تضعیف یا bypass نکنید.

## حداقل Manual Regression Checklist

موارد مرتبط با change را انتخاب کنید.

### Authentication

- login success/failure؛
- refresh/session restore؛
- protected-route redirect؛
- logout؛
- idle-timeout behavior در صورت تأثیرپذیری.

### API / StateSync

- request عادی observational persistence behavior داشته باشد؛
- mutation موفق، UI data مورد انتظار را refresh کند؛
- persisted domainهای mapشده canonical snapshot خود را schedule کنند؛
- diagnostic/non-mutating POST actionها persistence side effect ایجاد نکنند؛
- mutation failشده success-only persistence را schedule نکند.

### Storage

- state مربوط به list/load؛
- create/update/delete resource مرتبط در صورت ایمن بودن؛
- confirmation flow برای destructive actionها؛
- cross-domain refreshهای تحت تأثیر؛
- pending/error state مربوط به modal؛
- partial-failure messaging در workflowهای چندمرحله‌ای.

### Share / User

- duplicate-name validation؛
- membership add/remove؛
- dependency errorها؛
- refresh مربوط به user/group/share query؛
- multi-request partial-failure state در صورت مرتبط بودن.

### Settings

- dirty form state overwrite نشود؛
- confirmation dialog پیش از changeهای اثرگذار روی سیستم اجرا شود؛
- endpoint صحیح network برای DHCP/static استفاده شود؛
- partial-failure behavior مربوط به Web-user/OS-user درک شده باشد؛
- متن فارسی/RTL بعد از source edit همچنان خوانا باشد.

## Layerهای پیشنهادی برای Automated Testing

وقتی test infrastructure اضافه شد، فقط به یک layer متکی نباشید.

### 1. Unit Test

Candidateهای مناسب شامل helperهای pure یا mostly-pure هستند، مانند:

- normalization utilityها؛
- NFS option translation؛
- Samba member parsing/merging؛
- Web Share normalization؛
- hostname/NTP validation؛
- notification threshold/fingerprint helperها؛
- StateSync URL-to-domain mapping؛
- service/SNMP boolean normalization.

این testها باید سریع و deterministic باشند.

### 2. Hook/Data-layer Test

Contractهای مهم query/mutation را با network boundary mockشده test کنید:

- query key shape؛
- mapping مربوط به endpoint/method/payload؛
- invalidation پس از success؛
- compatibility response normalization؛
- abort/enable behavior در محل‌های معنادار.

از testهایی که فقط implementation detail را تکرار می‌کنند خودداری کنید.

### 3. Component Integration Test

Flowهای مفید شامل موارد زیر هستند:

- create/edit modalها؛
- destructive confirmation؛
- form validation؛
- pending/error stateها؛
- membership editorها؛
- settings dirty-state behavior.

User-visible behavior را به check کردن internal React state ترجیح دهید.

### 4. End-to-End Test

E2E scenarioهای باارزش شامل موارد زیر هستند:

- authentication/session lifecycle؛
- create/delete نمونه‌ای از storage resource در environment کنترل‌شده؛
- Samba/NFS/Web Share workflowها؛
- network/system settings روی test appliance ایمن؛
- StateSync persistence پس از mutation.

E2E testهای system administration نیازمند backend/environment ایزوله هستند، چون بسیاری از operationها destructive یا host-level هستند.

## مسیر پیشنهادی Tooling

هنوز behavioral test tool مشخصی اجباری نشده، چون repository یک test stack رسمی adopt نکرده است.

یک setup منطقی در آینده برای React/Vite می‌تواند شامل موارد زیر باشد:

- Vitest برای unit/hook test؛
- React Testing Library برای component behavior؛
- MSW یا Axios mock کنترل‌شده برای API boundary؛
- Playwright برای end-to-end browser flow.

این موارد recommendation هستند، نه infrastructure نصب‌شده‌ی فعلی.

پیش از اضافه‌کردن test stack، تصمیم مربوطه باید شامل موارد زیر ثبت شود:

- toolهای انتخاب‌شده؛
- دلیل تناسب آن‌ها با پروژه؛
- convention مربوط به test directory؛
- API mocking strategy؛
- CI commandها؛
- نیازمندی isolation برای destructive testها.

## Testهای آینده با بالاترین Priority

### StateSync URL Mapping

بر اساس contract فعلی GitLab، test کنید که:

- mutationهای zpool به `zpool + disk` map شوند؛
- filesystem به `filesystem + zpool` map شود؛
- disk به `disk + zpool` map شود؛
- NFS به domain مربوط به `nfs` map شود؛
- Samba sharepoint به `samba-shares` map شود؛
- Web Share به `webshare` map شود؛
- Samba user/group در contract فعلی StateSync domain مستقل ندارند؛
- SNMP در contract فعلی StateSync domain ندارد و requestهای SNMP نباید persistence snapshot از طریق frontend StateSync schedule کنند.

### Axios Persistence Policy

Test کنید که:

- API traffic عادی زیر `/api/` مقدار `save_to_db=false` دریافت کند؛
- body flagهای stale در سطح caller neutralize شوند؛
- internal requestهای StateSync مقدار true دریافت کنند؛
- auth endpointها exclude شوند؛
- internal StateSync header به backend leak نشود.

### Authentication Refresh Queue

Test کنید:

- چند response هم‌زمان 401 فقط یک refresh ایجاد کنند؛
- requestهای queueشده پس از success replay شوند؛
- failure در refresh باعث clear شدن session و reject شدن callهای queueشده شود.

### StateSync Coalescing

Test کنید:

- mutationهای سریع coalesce شوند؛
- mutation هنگام sync در حال اجرا دقیقاً یک follow-up schedule کند؛
- session reset، pending timer/baseline state را clear کند.

### Multi-stage Workflowها

Partial failure را برای موارد زیر test کنید:

- OS user → Samba user؛
- Web user → OS user؛
- Web Share → permission update؛
- Samba group → initial member addها.

## ارتباط Test، Comment و Documentation

وقتی یک invariant قابل اجرا و پایدار است، از comment به‌عنوان جایگزین test استفاده نکنید.

رابطه‌ی مورد انتظار:

- test، behavior را اثبات می‌کند؛
- CI اثبات می‌کند commandهای executable validation پاس شده‌اند؛
- comment توضیح می‌دهد behavior غیرآشکار چرا وجود دارد؛
- documentation، ownership، workflow و consequenceهای maintenance را توضیح می‌دهد.

## انتظار CI پس از اضافه‌شدن Test

وقتی automated test وجود داشت، merge gate را با command adoptشده‌ی test توسعه دهید؛ برای مثال:

```text
npm ci
npm run lint
npm run test
npm run build
```

در وضعیت فعلی، CI عمداً فقط quality gateهای lint/build تعریف‌شده در repository را اجرا می‌کند، چون `test` script وجود ندارد.

## Definition of Done

یک behavior change زمانی complete است که:

1. مستندات مرتبط به‌روزرسانی شده باشند؛
2. `frontend-validation` پاس شود؛
3. اگر behavioral validation لازم است، flow تحت تأثیر دستی verify شده باشد؛
4. partial-failure/error pathها بررسی شده باشند؛
5. final diff از نظر changeهای تصادفی review شده باشد.

## فایل‌های مرتبط

- `.github/workflows/frontend-validation.yml`
- `package.json`
- `package-lock.json`
- `tsconfig.app.json`
- `eslint.config.js`

## مستندات مرتبط

- [`getting-started.md`](./getting-started.md)
- [`coding-conventions.md`](./coding-conventions.md)
- [`../07-operations/build.md`](../07-operations/build.md)
- [`../04-core-flows/api-request-lifecycle.md`](../04-core-flows/api-request-lifecycle.md)
- [`../04-core-flows/state-sync-save-to-db.md`](../04-core-flows/state-sync-save-to-db.md)
