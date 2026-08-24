# Coding Conventions

این سند conventionهایی را ثبت می‌کند که در نگهداری SOHO UI مشاهده شده‌اند و به‌صورت آگاهانه پذیرفته شده‌اند.

هدف، consistency و کاهش هزینه‌ی rediscovery است؛ نه ایجاد bureaucracy روی style کدنویسی.

## اصول کلی

کدی را ترجیح دهید که ownership و behavior آن بدون اتکا به comment واضح باشد.

به‌طور مشخص:

- منطق server state را در hook/data layer نگه دارید، نه داخل JSX صفحه؛
- transport behavior را در `axiosInstance` متمرکز کنید؛
- behavior مربوط به persisted snapshot را در `StateSyncManager` متمرکز کنید؛
- برای authoritative backend state از React Query استفاده کنید؛
- برای temporary UI interaction state از local React state استفاده کنید؛
- دلیل‌ها و invariantهای غیرآشکار را مستند کنید، نه syntax خوانا را؛
- implementation قدیمی را به‌صورت commented code نگه ندارید.

## زبان و Formatting

Source code و commentهای داخل source باید برای consistency با codebase فعلی از identifier/comment انگلیسی استفاده کنند.

User-facing stringها هرجا محصول نیاز دارد می‌توانند فارسی باشند.

Prettier configuration فعلی انتظار موارد زیر را دارد:

```text
single quotes
2-space indentation
semicolons
ES5-style trailing commas
```

Pluginهای import organization و Tailwind formatting نیز configure شده‌اند.

از formatting changeهای بزرگ و غیرمرتبط در feature commitها خودداری کنید.

## TypeScript

Application با TypeScript strict settingها اجرا می‌شود.

موارد ترجیحی:

- domain interface صریح برای API modelها؛
- استفاده از `unknown` برای API shapeهای untrusted تا زمانی که narrow شوند؛
- type guard/normalizer در API boundary؛
- discriminated union برای mode/action state؛
- استفاده از `as const` برای query key/constantهای پایدار؛
- استفاده از `satisfies` در جایی که object shape را validate می‌کند بدون این‌که inference از بین برود.

از موارد زیر خودداری کنید:

- `any` گسترده؛
- استفاده‌ی عادی از `@ts-ignore` به‌عنوان راه‌حل؛
- castهایی که فقط یک model اشتباه را ساکت می‌کنند؛
- optional کردن تمام propertyها صرفاً برای فرار از درک backend contract.

اگر backend data ناسازگار است، normalization را یک بار در hook/service layer انجام دهید.

## React Componentها

Pageها باید عمدتاً موارد زیر را orchestrate کنند:

- feature hookها؛
- page-level modal/open state؛
- user feedback؛
- derived data لازم برای compose کردن child componentها.

وقتی یک مسئولیت reusable یا complex به‌صورت مستقل معنا پیدا می‌کند، آن را از page خارج کنید.

Transport policy، token handling، persistence logic یا global cache ruleها را داخل presentation component قرار ندهید.

## Hookها

Feature hook باید مالک موارد زیر باشد:

- React Query keyهای پایدار؛
- endpoint callها؛
- request/response normalization؛
- mutation invalidation اختصاصی feature؛
- query lifecycle optionهای اختصاصی feature.

Hook نباید global transport concernهایی را که Axios از قبل مدیریت می‌کند دوباره مالک شود.

نمونه‌های caller ownership ممنوع:

```text
save_to_db=true
manual Bearer header duplication
ad-hoc token refresh
feature-local copies of global 401 handling
```

## React Query Keyها

Query key را مانند یک API بین consumerها و invalidatorها در نظر بگیرید.

وقتی چند module از یک key استفاده می‌کنند، exported stable key ترجیح دارد:

```ts
export const sambaUsersQueryKey = ['samba-users'] as const;
```

برای resourceهای parameterized، parameterهایی را در key قرار دهید که واقعاً response را تغییر می‌دهند:

```ts
['os-users', { includeSystem }]
```

صرف این‌که همان resource در page دیگری مصرف می‌شود دلیل ساختن key جدید نیست، مگر این‌که واقعاً lifecycle/cadence مستقلی نیاز داشته باشد.

اگر monitoring key مستقل عمداً ساخته شده، دلیل آن را مستند کنید.

## API Normalization

Compatibility variantهای backend را نزدیک data boundary normalize کنید.

نمونه‌های موجود در codebase:

- boolean-like valueهای service/SNMP؛
- چند Web Share response shape؛
- attribute mapهای filesystem/volume؛
- Samba field nameها؛
- inversion مربوط به NFS option؛
- derivation مربوط به network configuration.

Componentها باید domain model قابل پیش‌بینی دریافت کنند، نه این‌که defensive parsing را در چند محل تکرار کنند.

## Mutationها

یک mutation باید:

1. یک backend operation با تعریف روشن ارسال کند؛
2. pending/error state مفید در اختیار caller بگذارد؛
3. پس از success، query keyهای تحت تأثیر را invalidate کند؛
4. در موارد لازم، persistence را به Axios/StateSync مرکزی واگذار کند.

اگر یک UI workflow به چند mutation نیاز دارد، partial-failure behavior آن را صریح مستند کنید.

یک workflow چند-requestی را atomic معرفی نکنید، مگر این‌که backend transaction یا rollback صریح فراهم کرده باشد.

## عملیات Destructive

Delete یا destructive changeها معمولاً باید زمانی که activation تصادفی می‌تواند loss یا service impact معنی‌دار ایجاد کند، explicit confirmation داشته باشند.

نمونه‌ها:

- disk cleanup؛
- حذف pool/filesystem/share؛
- stop کردن serviceها؛
- حذف administrative user/group.

Backend همچنان مسئول authorization و integrity ruleها است.

## Error Handling

وقتی backend error message اطلاعات actionable ارائه می‌دهد از آن استفاده کنید، اما response shapeهای رایج را در utility/hook مشترک normalize کنید و parsing یکسان را در هر component تکرار نکنید.

برای operationهای چندمرحله‌ای، مشخص کنید کدام stage fail شده است.

خوب:

```text
Web Share created, permission update failed
```

کم‌فایده‌تر:

```text
Operation failed
```

یک error را صرفاً به این دلیل مخفی نکنید که React Query invalidation بعدی ممکن است UI را repair کند.

## کدهای حساس به Security

Security invariantها باید صریح و محافظه‌کارانه باشند.

نمونه‌های فعلی:

- access tokenها فقط در memory باقی می‌مانند؛
- refresh tokenها session-scoped هستند؛
- auth bypass نیازمند Vite development mode است؛
- protected routeها پیش از redirect منتظر auth restoration می‌مانند؛
- local logout پیش از کامل‌شدن backend logout انجام می‌شود.

این behaviorها را به‌عنوان بخشی از refactor نامرتبط تضعیف نکنید.

## Browser Storage

از local/session storage به‌عنوان جایگزین بدون ساختار برای application state استفاده نکنید.

Browser persistence فعلی ownerهای مشخصی دارد، مانند:

- refresh token/session username؛
- idle activity timestamp؛
- dashboard layout/preferenceها؛
- notification bookkeeping.

اگر storage جدیدی اضافه می‌کنید، موارد زیر را تعریف کنید:

- owner؛
- key؛
- lifetime؛
- cleanup behavior؛
- این‌که value authoritative است یا صرفاً client bookkeeping.

Secretهایی را که معماری عمداً در memory نگه می‌دارد هرگز persist نکنید.

## Commentها

از [`code-commenting-guidelines.md`](./code-commenting-guidelines.md) پیروی کنید.

قاعده‌ی کوتاه:

> اگر خود کد WHAT/HOW را توضیح می‌دهد، comment فقط زمانی باید باقی بماند که WHY، یک constraint، invariant، lifecycle ordering، security reasoning، concurrency behavior یا compatibility context را حفظ کند.

Dead commented implementation را حذف کنید. Git history نقش archive را دارد.

## TODO / FIXME

TODO باید context کافی داشته باشد تا actionable و بعداً removable باشد.

ترجیحاً:

```ts
// TODO(#142): Remove this compatibility branch after the legacy response
// format is no longer supported by the backend.
```

اجتناب کنید از:

```ts
// TODO fix this
```

## Importها

Import pathها را مطابق relative-module conventionهای موجود یکپارچه نگه دارید.

Path oddityها را اصلاح کنید و صرفاً به دلیل قدیمی بودن حفظ نکنید؛ برای مثال duplicate slash.

در محل مناسب از type-only import استفاده کنید:

```ts
import type { SomeType } from './types';
```

## CSS / UI Styling

Design token/CSS variableهای موجود و shared component styleها را به design systemهای hardcoded و one-off ترجیح دهید.

Technical LTR valueها در صورت نیاز برای خوانایی می‌توانند داخل UI فارسی RTL قرار بگیرند.

Semantic direction (`dir`) را از CSS mirroring جدا نگه دارید، به‌خصوص زمانی که DOM واقعاً به direction attribute نیاز دارد.

## اضافه‌کردن Feature جدید

یک feature جدید معمولاً باید شامل موارد زیر باشد:

- route/entry point در صورت نیاز؛
- feature document؛
- query keyهای پایدار؛
- API model normalizeشده؛
- ruleهای mutation/invalidation؛
- تصمیم صریح درباره‌ی StateSync ownership؛
- تصمیم درباره‌ی polling؛
- error handling؛
- test در صورت وجود infrastructure مربوطه؛
- extension/failure note در behaviorهای غیرآشکار.

## Review Checklist

پیش از complete در نظر گرفتن یک change:

- آیا data owner مشخص است؟
- آیا query keyها درست reuse شده‌اند؟
- آیا هیچ caller دوباره ownership مربوط به `save_to_db` را وارد کرده است؟
- آیا partial failureهای workflow چندمرحله‌ای درک شده‌اند؟
- آیا dead comment/code حذف شده‌اند؟
- آیا security/lifecycle invariantها حفظ شده‌اند؟
- آیا contract مستندشده‌ای تغییر کرده است؟
- آیا lint پاس می‌شود؟
- آیا build پاس می‌شود؟
- اگر automated test وجود ندارد، آیا flow تحت تأثیر دستی verify شده است؟

## مستندات مرتبط

- [`project-structure.md`](./project-structure.md)
- [`code-commenting-guidelines.md`](./code-commenting-guidelines.md)
- [`testing.md`](./testing.md)
- [`../04-core-flows/server-state-and-cache.md`](../04-core-flows/server-state-and-cache.md)
- [`../04-core-flows/state-sync-save-to-db.md`](../04-core-flows/state-sync-save-to-db.md)
