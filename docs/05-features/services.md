# Services

## هدف

Feature مربوط به Services، سطح عملیاتی کنترل backend system serviceها است. این صفحه runtime state، boot-time enablement و actionهای operator را نمایش می‌دهد و اطلاعات service را به‌صورت پیوسته refresh می‌کند.

Route:

```text
/services
```

Entry point:

```text
src/pages/Services.tsx
```

## مسئولیت‌های اصلی

این feature موارد زیر را coordinate می‌کند:

- خواندن service list هر 5 ثانیه؛
- خواندن per-unit status هر 5 ثانیه؛
- merge کردن `enabled` state دقیق‌تر مربوط به per-unit response در list data؛
- derive کردن UI runtime status پایدار از چند backend field ممکن؛
- start و stop کردن serviceها؛
- enable و disable کردن serviceها در startup سیستم؛
- جلوگیری از Start وقتی service در حالت masked است؛
- الزام confirmation پیش از Stop؛
- refresh کردن هم list query و هم per-unit status query پس از control action موفق.

Action type زیرساخت همچنین `restart`، `reload`، `mask` و `unmask` را پشتیبانی می‌کند، اما table فعلی در UI عمدتاً Start/Stop و boot-time Enable/Disable را expose می‌کند.

## runtime flow

```mermaid
flowchart TD
    Page[Services page]
    Page --> LIST[useServices]
    Page --> STATUS[useServiceStatuses]
    Page --> ACTION[useServiceAction]

    LIST --> LISTAPI[GET /api/system/service/]
    STATUS --> DETAILAPI[GET /api/system/service/{unit}/]
    ACTION --> CTRL[PUT /api/system/service/{unit}/control/?action=...]

    ACTION --> IL[invalidate ['services']]
    ACTION --> IS[invalidate service status queries]
```

## Service list

Hook:

```text
useServices()
```

Query key:

```text
['services']
```

Endpoint:

```text
GET /api/system/service/
```

Refresh policy:

```text
5 seconds
```

Background polling و window-focus refetch غیرفعال‌اند.

List query base service objectهای مورد استفاده صفحه و status-change notification monitoring در سایر قسمت‌های application را فراهم می‌کند.

## per-service status queryها

Hook:

```text
useServiceStatuses(services)
```

برای هر service برگشتی از list، یک query جدا ساخته می‌شود:

```text
['services', 'status', service.unit]
```

Endpoint:

```text
GET /api/system/service/{encoded-unit}/
```

هر query در زمان mount بودن هر 5 ثانیه refresh می‌شود.

Hook، boot-time `enabled` flag را از چند response shape ممکن استخراج می‌کند:

```text
data.status.enabled
data.enabled
status.enabled
enabled
```

صفحه سپس این value دقیق‌تر را روی list detail همان service overlay می‌کند.

## مشخصه‌ی backend load

Feature فعلی در هر polling cycle این requestها را اجرا می‌کند:

- یک service-list request هر 5 ثانیه؛
- به‌علاوه یک status request به ازای هر service نمایش‌داده‌شده، هر 5 ثانیه.

بنابراین API/network load تقریباً با تعداد serviceها رشد می‌کند:

```text
1 + N service requests per polling cycle
```

که `N` تعداد service unitها است.

این رفتار architecture فعلی است و React Query duplication bug نیست؛ list query و هر per-unit status query عمداً query key و endpoint متفاوت دارند.

اگر backend load مسئله شود، راه‌حل preferred این است که list contract تمام status fieldهای مورد نیاز را برگرداند یا batch status endpoint ایجاد شود؛ نه اینکه queryهای ضروری به‌صورت arbitrary suppress شوند.

## Row model

صفحه هر backend service را به ساختار زیر map می‌کند:

```ts
{
  name: service.unit,
  label: localized/display label,
  details: normalized backend details
}
```

`getServiceLabel()` unit name/descriptionهای شناخته‌شده را به label مناسب operator تبدیل می‌کند و raw service unit را برای backend identity حفظ می‌کند.

Raw unit name همچنان mutation/query identity است و به‌عنوان secondary text نمایش داده می‌شود.

## derive کردن runtime status

`ServicesTable` از چند backend field برای derive کردن UI status استفاده می‌کند، چون service-manager response ممکن است state را به شکل‌های مختلف نمایش دهد.

UI statusهای ممکن:

```text
running
stopped
transitioning
error
masked
```

### Masked

Service وقتی masked محسوب می‌شود که `masked` یا `mask` به true normalize شود.

### Error

وجود `failed` در status token یا active state به Error map می‌شود.

### Running

Running زمانی تشخیص داده می‌شود که یکی از این شرایط برقرار باشد:

- active state برابر `active` و sub-state یکی از `running`، `exited` یا `listening` باشد؛
- status token برابر `running` یا `active` باشد.

### Transitioning

وقتی runtime action مربوط به row pending است، UI موقتاً `transitioning` نشان می‌دهد و به backend status قبلی اعتماد نمی‌کند.

### Stopped

هر state دیگری که با موارد بالا match نشود fallback به Stopped است.

## boolean-like service flagها

Boot-time enabled state ممکن است boolean، number یا string باشد.

Truthy valueها:

```text
true
1
yes
on
enabled
active
```

Falsy valueها:

```text
false
0
no
off
disabled
inactive
```

اگر value قابل normalize نباشد، startup switch disabled و همراه tooltip توضیحی نمایش داده می‌شود؛ UI نباید state را حدس بزند.

## Service actionها

Hook:

```text
useServiceAction()
```

Endpoint pattern:

```text
PUT /api/system/service/{service}/control/?action={action}
```

Service unit و action URL encode می‌شوند.

Action typeهای پشتیبانی‌شده در frontend model:

```text
start
restart
stop
reload
enable
disable
mask
unmask
```

### actionهای فعلاً قابل دسترس در table

Runtime button:

- Running service → Stop
- Non-running service → Start

Boot-time switch:

- Enabled → Disable
- Disabled → Enable

Action typeهای دیگر در hook/type contract وجود دارند ولی در `ServicesTable` فعلی direct control ندارند.

## Stop confirmation

Start مستقیم از action button اجرا می‌شود.

Stop متفاوت است: table ابتدا confirmation modal باز می‌کند و هشدار می‌دهد stopping service ممکن است دسترسی کاربر را مختل کند.

فقط confirmation باعث اجرای Stop mutation می‌شود.

این تفاوت را حفظ کنید مگر product requirement صریحاً destructive/availability-risk UX را تغییر دهد.

## قانون masked service

وقتی derived status برابر `masked` باشد، Start disabled است و tooltip توضیح می‌دهد ابتدا mask باید برداشته شود.

Table فعلی Unmask button ندارد، هرچند `unmask` در `ServiceActionType` وجود دارد.

در نتیجه ممکن است برای recover کردن masked service به management path/API client دیگری نیاز باشد. این یک current-product limitation مهم است.

## رفتار pending action

`useServiceAction()` یک mutation instance برای کل صفحه است.

صفحه این valueها را به table می‌دهد:

```text
isActionLoading
activeServiceName
activeAction
```

Table از آن‌ها برای نمایش per-row transition/loading UI مربوط به mutation فعال استفاده می‌کند.

Pending state مربوط به runtime Start/Stop از semantics بصری Boot Enable/Disable جدا نگه داشته می‌شود تا toggle کردن startup enablement باعث نمایش runtime status به شکل transitioning نشود.

## refresh پس از action

پس از هر control action موفق، hook این query را invalidate می‌کند:

```text
['services']
```

و تمام queryهایی که key آن‌ها با pattern زیر شروع می‌شود:

```text
['services', 'status', ...]
```

در نتیجه هم base service list و هم تمام mounted unit-status queryها refresh می‌شوند.

Feature پس از action موفق منتظر interval پنج‌ثانیه‌ای بعدی نمی‌ماند.

## مدیریت خطا

Mutation backend error payloadهای رایج زیر را normalize می‌کند:

- plain string response؛
- `detail`؛
- `message`؛
- `error`؛
- `errors` به شکل string/array؛
- Axios fallback message.

صفحه سپس action-specific toast با target service نمایش می‌دهد.

Action ناموفق از مسیر `onSuccess` باعث invalidate شدن service queryها نمی‌شود.

## StateSync boundary

System service control جزو persisted StateSync domainهای frontend نیست.

بنابراین service operationها operational system-control action هستند، نه managed storage snapshot mutation.

`save_to_db` flag به service-control callها اضافه نکنید.

## ارتباط با Notifications

Resource-status observer مربوط به notification subsystem نیز `useServices()` را فراخوانی می‌کند.

چون همان canonical key یعنی `['services']` استفاده می‌شود، React Query می‌تواند ordinary service-list lifecycle را وقتی هر دو consumer mount هستند به اشتراک بگذارد.

Per-service status queryهای صفحه‌ی Services entryهای جدا هستند و با notification baseline storage یکی نیستند.

## invariantهای مهم

- `['services']` canonical service-list key است.
- Per-unit enabled-state key برابر `['services','status', unit]` است.
- List و per-unit queryها هر دو در زمان mount بودن هر 5 ثانیه polling می‌کنند.
- تعداد per-unit query با تعداد serviceها رشد می‌کند.
- Action موفق هم list و هم per-unit status query family را invalidate می‌کند.
- Stop باید confirmation-driven باقی بماند.
- Masked service از table فعلی قابل Start نیست.
- Unknown enabled state نباید حدس زده شود.
- Service control یک StateSync persistence domain نیست.

## failure scenarioهای رایج

### Startup switch disabled/unknown دیده می‌شود

Per-unit status response را بررسی کنید. `useServiceStatuses()` enabled state را در چند nested shape جست‌وجو می‌کند؛ اگر هیچ‌کدام boolean-like data نداشته باشند UI عمداً state را حدس نمی‌زند.

### در DevTools تعداد زیادی service request دیده می‌شود

تعداد service rowها را بشمارید. صفحه عمداً یک list request و به ازای هر service یک status query هر 5 ثانیه اجرا می‌کند.

### Start button disabled است در حالی که service stopped است

بررسی کنید derived state برابر `masked` نباشد. Masked service تا unmask شدن قابل Start نیست.

### Action موفق فوراً UI را update نمی‌کند

هر دو invalidation path در `useServiceAction()` و تطابق دقیق unit name با query-key identity را بررسی کنید.

### Runtime status اشتباه است

Backend fieldهای `active`، `active_state`، `sub`، `sub_state`، `status` و mask fieldها را بررسی کنید. Table status را از مجموعه‌ی این fieldها derive می‌کند، نه فقط یک property.

### Masked service از داخل صفحه قابل recover نیست

این limitation فعلی UI است: `unmask` در action type/hook contract وجود دارد ولی `ServicesTable` direct Unmask control ندارد.

## راهنمای توسعه

### expose کردن Restart/Reload/Mask/Unmask

1. product permission و operator-risk UX را confirm کنید.
2. به‌جای transport path دوم، `useServiceAction()` را reuse کنید.
3. برای disruptive operationها در صورت نیاز confirmation اضافه کنید.
4. صحت status derivation/loading state را حفظ کنید.
5. invalidation را روی canonical service query familyها نگه دارید.

### کاهش polling traffic

Intervalها را بدون فهم operational requirement صرفاً افزایش ندهید. اگر fan-out گران شد، backend status data را consolidate کنید یا batch endpoint بسازید.

## فایل‌های مرتبط

- `src/pages/Services.tsx`
- `src/components/services/ServicesTable.tsx`
- `src/constants/serviceLabels.ts`
- `src/hooks/useServices.ts`
- `src/hooks/useServiceStatuses.ts`
- `src/hooks/useServiceAction.ts`
- `src/@types/service.ts`

## مستندات مرتبط

- [`../04-core-flows/server-state-and-cache.md`](../04-core-flows/server-state-and-cache.md)
- [`../04-core-flows/polling-and-data-refresh.md`](../04-core-flows/polling-and-data-refresh.md)
- [`../04-core-flows/notifications.md`](../04-core-flows/notifications.md)
- [`../04-core-flows/api-request-lifecycle.md`](../04-core-flows/api-request-lifecycle.md)
