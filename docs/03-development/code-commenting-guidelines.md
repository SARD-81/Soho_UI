# راهنمای Comment‌نویسی در Code

## هدف

Commentها در SOHO UI برای حفظ reasoningهایی استفاده می‌شوند که خود code به‌تنهایی نمی‌تواند آن‌ها را به‌شکل ایمن منتقل کند.

هدف پروژه **زیاد بودن تعداد commentها نیست**. Clean code باید از طریق naming، structure، typeها و functionهای کوچک و متمرکز خوانا باقی بماند. Comment زمانی توجیه دارد که intent، constraint، risk یا historical contextای را حفظ کند که maintainer آینده در غیر این صورت ممکن است اشتباه برداشت کند.

قاعده‌ی اصلی:

> Code باید **what** و **how** را توضیح دهد. Comment باید **why**، **constraintها** و **نکات غافلگیرکننده** را توضیح دهد.

## زبان

Engineering commentهای داخل source fileها باید انگلیسی نوشته شوند.

دلایل:

- source identifierها و library APIها انگلیسی هستند؛
- high-value commentهای موجود نیز انگلیسی‌اند؛
- استفاده از یک زبان friction مربوط به maintenance در codebase را کاهش می‌دهد؛
- termهای فنی نیاز به ترجمه‌ی مکرر ندارند.

User-facing UI text می‌تواند فارسی باشد.

## فرایند تصمیم‌گیری پیش از اضافه‌کردن Comment

پیش از نوشتن comment این sequence را طی کنید:

```text
Can the code be understood without a comment?
│
├── Yes → Do not add one.
│
└── No
    │
    ├── Is the code unnecessarily complicated?
    │   ├── Yes → Refactor first.
    │   └── No
    │
    └── Would the reason/constraint/side effect be easy to forget?
        ├── No → Prefer clearer code.
        └── Yes → Add a concise comment.
```

Comment نباید جایگزین refactoring شود.

## Categoryهای مناسب برای Comment

### 1. Architectural Contractها

از comment برای محافظت از global invariantهایی استفاده کنید که از روی یک statement منفرد قابل تشخیص نیستند.

نمونه‌ی خوب از design مربوط به transport/state-sync:

```ts
/**
 * Persistence contract:
 * - normal API requests never persist snapshots;
 * - only StateSyncManager may request save_to_db=true;
 * - stale caller-level flags must not bypass the transport policy.
 */
```

این comment مفید است، چون حذف یا bypass کردن behavior مربوطه یک system-wide persistence contract را تغییر می‌دهد.

### 2. تصمیم‌های حساس به Security

Security behavior اغلب در صورتی که توسعه‌دهنده‌ی آینده بخشی از آن را حذف کند «ساده‌تر» به نظر می‌رسد. دلیل وجود آن را حفظ کنید.

مثال:

```ts
// Access tokens remain memory-only. Persist only the refresh token for the
// current browser session so a reload can restore authentication without
// leaving the bearer token in persistent browser storage.
```

Security comment ننویسید مگر این‌که code واقعاً statement داخل آن را enforce کند.

### 3. Ordering و Lifecycle Constraintها

وقتی order بخشی از correctness است comment اضافه کنید.

مثال:

```ts
// Clear local auth state before notifying the backend so protected routes are
// inaccessible even when the logout endpoint is slow or unavailable.
clearAuthState();
```

بدون comment ممکن است maintainer، `clearAuthState()` را بعد از request منتقل کند و ناخواسته failure behavior را تغییر دهد.

### 4. Race Condition و Concurrency Protection

اگر code برای جلوگیری از duplicate work، stale overwrite، request storm یا re-entrancy وجود دارد، invariant را مستند کنید؛ نه هر branch را.

مثال:

```ts
/**
 * Coalesces rapid mutations into one canonical snapshot. If another mutation
 * arrives while the snapshot is running, queue exactly one follow-up run so
 * persisted state converges to the newest observed system state.
 */
```

### 5. Business Ruleهایی که دلیلشان آشکار نیست

اول expressive code را ترجیح دهید. فقط زمانی comment اضافه کنید که origin یا reason مربوط به rule از روی code مشخص نباشد.

ضعیف:

```ts
// Mirror requires an even number of disks.
if (count % 2 !== 0) { ... }
```

وقتی domain context اهمیت دارد بهتر است:

```ts
// The backend models MIRROR vdevs as disk pairs; reject an unmatched device
// here so the user receives validation before the create request is sent.
```

اگر rule به‌خودی‌خود روشن و پایدار است، comment لازم نیست.

### 6. Compatibility و Migration Behavior

Temporary compatibility logic باید مشخص کند چه زمانی امکان حذف آن وجود دارد.

مثال:

```ts
// Compatibility: older callers may still include save_to_db in mutation
// payloads. Force it to false here until those legacy payload fields have been
// removed from all hooks.
```

هنگام حذف compatibility code، comment مربوط به آن نیز باید حذف شود.

### 7. Browser/Framework Behavior غیرآشکار

Behaviorهایی را که به دلیل React StrictMode، browser lifecycle، storage availability، visibility change یا semantics خاص یک library وجود دارند مستند کنید.

مثال:

```ts
// Reuse the same baseline promise so React StrictMode and repeated auth renders
// cannot start multiple full state snapshots in one authenticated session.
```

## Commentهایی که معمولاً باید Reject شوند

### تکرار چیزی که Code خودش می‌گوید

بد:

```ts
// Set authenticated to true.
setIsAuthenticated(true);
```

بد:

```ts
// Loop through domains.
domains.forEach(...);
```

بد:

```ts
// Return if there is an error.
if (hasError) return;
```

این commentها noise را زیاد می‌کنند و به‌راحتی stale می‌شوند.

### Decorative Section Comment

از تقسیم فایل‌های بزرگ با commentهایی مانند نمونه‌ی زیر خودداری کنید:

```ts
// =============================
// FUNCTIONS
// =============================
```

اگر یک فایل برای خوانایی به تعداد زیادی visual section نیاز دارد، ممکن است مسئولیت‌های بیش از حدی داشته باشد. Extraction و naming بهتر را ترجیح دهید.

### توضیح‌دادن Name بد

بد:

```ts
// x is the number of selected disks.
const x = selectedDevices.length;
```

خود code را اصلاح کنید:

```ts
const selectedDeviceCount = selectedDevices.length;
```

### توضیح Dead یا Commented-out Code

Implementation قدیمی را به‌شکل commentشده نگه ندارید. Git history را نگه می‌دارد.

بد:

```ts
// const oldRequest = ...
// We used this before the backend change.
```

آن را حذف کنید. اگر تصمیم مربوطه در بلندمدت اهمیت دارد، آن را در ADR یا migration note ثبت کنید.

### Commentی که با Code تناقض دارد

Comment نباید code اشتباه را intentional جلوه دهد.

برای مثال اگر feature hook هنوز legacy fieldای می‌فرستد که transport layer آن را override می‌کند، این را اضافه نکنید:

```ts
// This is true here, but axios changes it to false later.
save_to_db: true,
```

بهتر است obsolete field حذف شود تا code و architecture با هم منطبق باشند.

## Policy مربوط به JSDoc

JSDoc برای exported behaviorهایی که contract غیرساده دارند مفید است. برای هر function اجباری نیست.

### Targetهای مناسب برای JSDoc

از JSDoc برای موارد زیر استفاده کنید:

- exported infrastructure functionهایی با lifecycle guarantee؛
- utilityهایی با input/output semantics غیرآشکار؛
- functionهایی که caller باید constraint مهمی را رعایت کند؛
- public reusable hookهایی که behavior آن‌ها از type signature مشخص نیست؛
- concurrency/state synchronization functionها؛
- functionهایی با side effect معنی‌دار و غیرآشکار.

مثال:

```ts
/**
 * Runs the canonical baseline snapshot once per authenticated session.
 * Repeated callers reuse the same promise until the session is reset.
 */
export const syncAllStateDomainsOnce = () => { ... };
```

### Targetهای نامناسب برای JSDoc

این را اضافه نکنید:

```ts
/** Returns the normalized path. */
const normalizePath = (url: string) => ...;
```

Name و type از قبل مفهوم را توضیح می‌دهند.

Boilerplateهایی مثل `@param` و `@returns` را زمانی که TypeScript همان information را منتقل می‌کند و semantic contract اضافه‌ای وجود ندارد تولید نکنید.

## Policy مربوط به TODO و FIXME

TODO بدون qualifier قابل قبول نیست.

بد:

```ts
// TODO: fix this
```

بد:

```ts
// TODO later
```

TODO/FIXME باید توضیح دهد:

1. چه چیزی هنوز باید تغییر کند؛
2. چرا در حال حاضر انجام نمی‌شود؛
3. چه condition یا tracked workای اجازه‌ی حذف آن را می‌دهد.

فرم ترجیحی:

```ts
// TODO(#142): Remove this compatibility branch after legacy API responses are
// no longer supported by the backend.
```

اگر issue وجود ندارد، context قابل search کافی قرار دهید تا TODO actionable باشد:

```ts
// TODO: Remove this legacy payload field after all create-pool requests have
// migrated to the transport-owned state-sync contract.
```

`FIXME` را فقط زمانی استفاده کنید که implementation فعلی واقعاً incorrect یا unsafe شناخته شده است؛ نه به‌عنوان synonym قوی‌تر برای TODO.

## File-level Comment

File headerای که فقط filename را تکرار می‌کند اضافه نکنید.

بد:

```ts
// This file handles authentication.
```

File-level comment فقط زمانی توجیه دارد که module یک contract غیرآشکار داشته باشد که به بیشتر محتوای آن مربوط است.

برای مثال، `axiosInstance.ts` ممکن است به یک policy comment کوتاه نزدیک persistence transport boundary نیاز داشته باشد، چون چند helper function صرفاً برای enforce کردن همان policy وجود دارند.

## راهنمای مخصوص React

### Componentها

JSX layout آشکار را comment نکنید.

بد:

```tsx
{/* Header */}
<AppBar>...</AppBar>
```

Comment زمانی مفید است که conditional rendering به lifecycle یا browser constraint غیرآشکاری وابسته باشد.

### Effectها

یک `useEffect` در حالت ایده‌آل باید از روی extracted function nameها و dependencyها قابل درک باشد. وقتی دلیل synchronization آشکار نیست، effect را comment کنید.

نمونه‌ی مناسب:

```ts
// Re-check the persisted idle timestamp when the tab becomes visible because
// background timer throttling must not let an expired session become active.
```

### Refها

وقتی ref برای enforce کردن lifecycle correctness استفاده می‌شود، نه صرفاً نگهداری DOM node، دلیل آن را comment کنید.

نمونه‌ها شامل جلوگیری از اجرای duplicate timeout، نگهداری latest callback بدون re-register کردن listener و guard کردن concurrent work هستند.

### React Query

Query option غیرمعمول را فقط زمانی مستند کنید که به دلیل domain-specific عمداً با project default متفاوت است.

ضعیف:

```ts
// Poll every 2 seconds.
refetchInterval: 2000,
```

بهتر:

```ts
// CPU is a live dashboard metric; keep the 2s cadence only while the widget is
// observed. Background-tab polling remains disabled by the global policy.
refetchInterval: 2000,
```

برای polling ruleهای گسترده، polling documentation را به تکرار همان comment در هر hook ترجیح دهید.

## API و Mutation Hookها

Mutation hookها زمانی ارزش comment دارند که ordering، dependency یا compatibility behavior داشته باشند.

پیش از اضافه‌کردن comment بررسی کنید hook مسئولیت globalای را که از قبل توسط بخش‌های زیر مدیریت می‌شود duplicate نکرده باشد:

- `axiosInstance`؛
- global `MutationCache`؛
- `StateSyncManager`؛
- shared error utilityها.

اگر hook شامل legacy fieldای است که transport آن را discard یا override می‌کند، حذف field را به توضیح mismatch ترجیح دهید.

## محل قرارگیری Comment

Comment را تا حد ممکن نزدیک codeای قرار دهید که intent آن را محافظت می‌کند.

ترجیحاً:

```ts
// Clear local state first so route access is revoked even if server logout fails.
clearAuthState();
await logoutRequest(refreshToken);
```

نه یک paragraph دور از code در ابتدای فایل طولانی.

برای invariant مربوط به کل module و چند function، یک block comment متمرکز نزدیک policy boundary قرار دهید و آن را در هر call site تکرار نکنید.

## Rule مربوط به Maintenance Comment

Comment بخشی از code است.

هنگام تغییر behavior مرتبط:

- comment را در همان commit به‌روزرسانی کنید؛
- commentهایی را که دیگر true نیستند حذف کنید؛
- historical description را به logic جدید متصل باقی نگذارید؛
- بررسی کنید link/issue referenceها هنوز معتبر باشند.

Comment قدیمی و اشتباه معمولاً از نبود comment خطرناک‌تر است.

## Comment Review Checklist

هنگام review از خود بپرسید:

- آیا این comment چیزی را توضیح می‌دهد که code نمی‌تواند واضح بیان کند؟
- آیا reason، invariant، constraint، side effect یا risk را ثبت می‌کند؟
- آیا naming/refactoring بهتر می‌تواند نیاز به آن را از بین ببرد؟
- آیا برای code فعلی accurate است، نه version قبلی؟
- آیا کنار behaviorی قرار دارد که از آن محافظت می‌کند؟
- آیا شش ماه بعد هم برای توسعه‌دهنده مفید خواهد بود؟
- آیا چون information چند فایل را پوشش می‌دهد، repository document یا ADR محل بهتری است؟

اگر پاسخ پرسش usefulness منفی است، comment را حذف کنید.

## چه زمانی به‌جای Comment از Docs یا ADR استفاده کنیم؟

وقتی information از یک local implementation decision محافظت می‌کند، in-code comment مناسب است.

وقتی information یک flow بین چند module را توضیح می‌دهد، documentation page مناسب‌تر است.

وقتی information توضیح می‌دهد چرا سیستم از میان alternativeها یک architecture option بلندمدت را انتخاب کرده، ADR استفاده کنید.

مثال:

```text
Why clear auth state before server logout?
→ In-code comment + authentication flow doc.

How does authentication work across AuthContext, Axios, tokenStorage and routes?
→ Core-flow documentation.

Why are access tokens memory-only instead of localStorage?
→ Security comment + authentication ADR if the decision needs formal history.
```

## Definition of Done برای Commentها

یک source-code change کامل نیست اگر policy غیرآشکار، security behavior، race protection، compatibility logic یا lifecycle ordering جدیدی معرفی کند و یکی از دو کار زیر انجام نشده باشد:

- intent از طریق code structure واضح شده باشد؛ یا
- حداقل comment مفیدی که reason را حفظ می‌کند اضافه شده باشد.

عکس آن هم صادق است: change کامل نیست اگر obsolete commentها را باقی بگذارد.
