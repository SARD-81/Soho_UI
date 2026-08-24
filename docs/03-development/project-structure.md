# ساختار پروژه

## هدف

این سند توضیح می‌دهد مسئولیت‌ها در repository کجا قرار گرفته‌اند و هنگام تغییر behavior باید از کجا شروع کرد. هدف آن ارائه‌ی یک navigation guide است، نه یک directory listing تولیدشده به‌صورت خودکار.

## ساختار سطح بالا

```text
Soho_UI/
├── docs/                  مستندات مهندسی و runtime
├── public/                Static assetهایی که مستقیماً توسط Vite serve می‌شوند
├── src/                   سورس‌کد application
├── index.html             Vite HTML entry
├── package.json           Scriptها و dependency declarationها
├── vite.config.ts         Vite configuration
├── tsconfig*.json         TypeScript configuration
├── eslint.config.js       ESLint configuration
└── .prettierrc            Formatting configuration
```

`repomix-output.xml` یک snapshot تولیدشده از repository است و نباید به‌عنوان source-of-truth implementation file در نظر گرفته شود.

## نقشه‌ی مسئولیت‌های `src/`

Source tree فعلی شامل بخش‌های اصلی زیر است:

```text
src/
├── @types/        Shared TypeScript declarationها
├── assets/        Visual/static assetهایی که در source مدیریت می‌شوند
├── components/    Reusable UI و application-shell componentها
├── config/        ساختارهای declarative مربوط به UI/configuration
├── constants/     Shared label، option، limit و static mappingها
├── contexts/      React context providerها برای cross-cutting state/actionها
├── hooks/         Feature/data/action hookها و reusable React behavior
├── lib/           Integration و infrastructure moduleها
├── mock/          Legacy/feature mock material در محل‌های موجود
├── mocks/         Mock API setup و fixtureها
├── pages/         Route-level page componentها
├── routes/        Router definition و access-control wrapperها
├── schemas/       Validation/data schemaها
├── stores/        Shared client/UI storeها
├── utils/         General-purpose utilityها
├── App.tsx        Composition مربوط به application زیر global providerها
├── main.tsx       Browser bootstrap و global provider setup
├── index.css      Global CSS
└── rtl-cache.ts   Emotion cache مورد استفاده برای RTL styling
```

## Entry Pointها

### `src/main.tsx`

هنگام تغییر behavior مربوط به application-wide providerها، React Query defaultها یا bootstrap ordering از این فایل شروع کنید.

Provider chain فعلی:

```text
StrictMode
└── AuthProvider
    └── QueryClientProvider
        └── CacheProvider (RTL)
            └── ThemeProvider
                └── App
```

تغییر در این فایل می‌تواند کل application را تحت تأثیر قرار دهد و باید به‌عنوان cross-cutting change review شود.

### `src/App.tsx`

برای تغییر infrastructure سراسری render در application، مانند MUI theme integration، global toaster، global loader یا router mounting از این فایل شروع کنید.

این فایل باید composition-oriented باقی بماند و feature logic در آن انباشته نشود.

## Routing

### `src/routes/Routes.tsx`

این فایل route map و سریع‌ترین source of truth برای route-level feature entry pointها است.

در موارد زیر از آن استفاده کنید:

- اضافه/حذف کردن page route؛
- پیدا کردن page component مسئول یک URL؛
- بررسی protected بودن route؛
- review کردن naming/case مربوط به pathهای موجود.

### `src/routes/ProtectedRoute.tsx`

مسئول authenticated access gating برای protected application tree است.

Route-auth check را در هر page تکرار نکنید. اگر access policy پیچیده‌تر شد، مانند role/permission، routing/access-control layer را به‌صورت آگاهانه توسعه دهید.

## Pageها

`src/pages/` شامل route-level composition componentها است.

یک page باید عمدتاً:

- feature componentها را compose کند؛
- route-level state را متصل کند؛
- feature hookها را invoke کند؛
- page-specific presentation behavior را هماهنگ کند.

Page نباید محل پیش‌فرض برای reusable API logic، token handling یا cross-feature infrastructure شود.

Pageهای route-level فعلی شامل موارد زیر هستند:

- Dashboard
- Disks
- IntegratedStorage
- BlockStorage
- FileSystem
- Services
- Users
- Settings
- Share (SMB/Samba)
- ShareNfs
- WebShare
- History
- SnmpService
- LoginPage
- NotFoundPage

برخی فایل‌ها در `pages/` ممکن است historical باشند یا دیگر route نشده باشند. پیش از active فرض کردن یک page، usage آن را از طریق `Routes.tsx` تأیید کنید.

## Componentها

`src/components/` شامل reusable UI componentها و چند concern مربوط به application shell است.

`MainLayout.tsx` حالت خاصی دارد: این فایل protected application shell است و در حال حاضر navigation، notificationها، idle-session handling، theme controlها و UI مربوط به system power action را هماهنگ می‌کند.

هنگام تغییر یک component، مشخص کنید در کدام دسته قرار می‌گیرد:

1. صرفاً presentational؛
2. feature-specific ولی reusable در یک domain؛
3. application-shell/global infrastructure.

هرچه category گسترده‌تر باشد، بررسی downstream callerها پیش از تغییر behavior مهم‌تر است.

## Hookها

`src/hooks/` یکی از behavior layerهای اصلی application است.

Hookهای فعلی categoryهایی مانند موارد زیر را پوشش می‌دهند:

- server-state queryها؛
- create/update/delete mutationها؛
- storage/pool/filesystem operationها؛
- sharing و user-management operationها؛
- system/network/SNMP configuration؛
- session/activity behavior؛
- reusable feature UI state.

### انتظارهای Design از Hook

یک feature hook می‌تواند مالک موارد زیر باشد:

- query/mutation configuration؛
- feature-level form/action state؛
- validation لازم برای آماده‌سازی request؛
- query-key invalidation اختصاصی feature؛
- تبدیل API errorها به errorهای معنادار برای feature.

Hook نباید shared infrastructure مانند `axiosInstance` را bypass کند یا token refresh را مستقلاً پیاده‌سازی کند.

### پیش از تغییر یک Mutation Hook

تمام موارد زیر را بررسی کنید:

1. کدام endpoint را call می‌کند؟
2. آیا `axiosInstance` از قبل global policy روی آن request اعمال می‌کند؟
3. کدام React Query keyها به‌صورت local invalidate می‌شوند؟
4. بعد از success، `StateSyncManager` کدام persisted state domainها را schedule می‌کند؟
5. آیا payload شامل legacy fieldای است که transport layer حالا آن را override می‌کند؟
6. آیا hook شامل business validationای است که باید حفظ یا به shared utility/schema منتقل شود؟

این بررسی اهمیت ویژه دارد، چون repository در طول زمان تکامل پیدا کرده و بعضی hookها ممکن است fieldهایی را از behavior قدیمی API/persistence حفظ کرده باشند.

## Contextها

`src/contexts/` در حال حاضر cross-cutting React contextهایی مانند موارد زیر دارد:

- `AuthContext` — authenticated session state/actionها؛
- `ThemeContext` — theme state؛
- `SystemPowerActionsContext` — shared access به reboot/shutdown actionهای guardشده.

فقط زمانی از context استفاده کنید که React-tree-wide access واقعاً بخشی از مسئولیت باشد. صرفاً برای جلوگیری از prop passing بین یک یا دو component نزدیک، context جدید نسازید.

## Infrastructure و API Integration (`src/lib/`)

این directory شامل بخشی از high-impact codeهای frontend است.

### Authentication / Transport

- `authApi.ts`
- `authEvents.ts`
- `axiosInstance.ts`
- `tokenStorage.ts`

### Storage/Integration Serviceها

نمونه‌ها:

- `diskApi.ts`
- `diskMaintenance.ts`
- `diskPartitions.ts`
- `poolDevices.ts`
- `shareService.ts`
- `sambaUserService.ts`
- `sambaGroupService.ts`

### هماهنگی State Persistence

- `stateSyncManager.ts`

با `axiosInstance.ts`، `tokenStorage.ts` و `stateSyncManager.ts` به‌عنوان infrastructure contract برخورد کنید. یک تغییر ظاهراً کوچک ممکن است تمام featureها را تحت تأثیر قرار دهد.

## Storeها

`src/stores/` در حال حاضر به‌صورت selective برای shared client/UI state استفاده می‌شود. این directory مالک remote backend state نیست.

پیش از ساخت Zustand store جدید از خود بپرسید:

- آیا این در واقع server state است؟ اگر بله، معمولاً React Query owner صحیح است.
- آیا این transient local state است؟ اگر بله، component/hook state احتمالاً کافی است.
- آیا چند component دور از هم باید همین client-only state را share کنند؟ اگر بله، store ممکن است توجیه داشته باشد.

## Constants، Config، Schema و Utilityها

### `src/constants/`

برای shared mapping/option/labelهای پایدار که runtime state نیستند استفاده شود. نمونه‌های فعلی شامل metadata مربوط به CPU/memory، constantهای disk، navigation definitionها، service labelها، settings constantها و valueهای مربوط به VDEV هستند.

Behavior قابل تغییر business را صرفاً به این دلیل که فایل `constants` نام دارد داخل آن پنهان نکنید.

### `src/config/`

برای declarative configuration که behavior/layout را drive می‌کند استفاده شود. `detailLayouts.ts` نمونه‌ی فعلی است.

### `src/schemas/`

برای reusable structured validation و schema definition استفاده شود.

### `src/utils/`

برای utility functionهای context-free یا low-context استفاده شود. اگر یک utility نیازمند دانش گسترده از lifecycle یک feature است، احتمالاً باید نزدیک‌تر به همان feature قرار گیرد.

## Mockها

Application می‌تواند از طریق environment configuration یک Axios mock adapter را فعال کند. Mock behavior باید به‌صورت روشن از production transport behavior جدا بماند.

هنگام debug کردن API response غیرمنتظره، پیش از فرض‌کردن این‌که داده از backend آمده بررسی کنید mock mode فعال نباشد.

## Documentation

`docs/` بخشی از codebase نگهداری‌شده است.

وقتی یک documented contract تغییر می‌کند، document مرتبط را در همان pull request به‌روزرسانی کنید.

مستندات مهم فعلی شامل موارد زیر هستند:

- project overview؛
- frontend architecture؛
- code commenting guidelines؛
- state synchronization contract؛
- polling audit؛
- notification/data refresh noteها؛
- general settings noteها.

## نقطه‌ی شروع برای Changeهای رایج

| Change | از اینجا شروع کنید | سپس بررسی کنید |
| --- | --- | --- |
| اضافه‌کردن route/page | `src/routes/Routes.tsx` | target page و در صورت دخالت shell behavior، `MainLayout` |
| تغییر login/session behavior | `src/contexts/AuthContext.tsx` | `authApi`، `axiosInstance`، `tokenStorage`، `ProtectedRoute` و idle-timeout hook |
| تغییر API base/transport behavior | `src/lib/axiosInstance.ts` | تمام shared interceptorها و state-sync contract |
| تغییر persistence snapshotها | `src/lib/stateSyncManager.ts` | `axiosInstance` و `docs/state-sync-save-to-db.md` |
| تغییر polling | query hook مرتبط | `docs/api-polling-audit.md` و page/component observerها |
| اضافه‌کردن mutation | feature hook مرتبط | endpoint ownership، query invalidation و state-sync domain mapping |
| اضافه‌کردن global client state | ابتدا owner موجود | توجیه context/store |
| تغییر theme/RTL | `ThemeContext`، `theme` و `rtl-cache.ts` | global CSS و assumptionهای direction در MUI |
| تغییر system power actionها | `MainLayout` / `usePowerAction` | `SystemPowerActionsContext` و confirmation/countdown componentها |

## این نقشه را به‌روز نگه دارید

این سند باید زمانی evolve شود که responsibility بین directoryها جابه‌جا می‌شود یا architectural layer جدیدی معرفی می‌شود. برای هر component یا filename جدید نیازی به edit این سند نیست.
