# API Error Handling

این سند مشخص می‌کند SOHO UI در حال حاضر API failureها را چگونه detect، normalize، log و در UI نمایش می‌دهد.

Frontend باید context کافی برای operator و maintainer حفظ کند، بدون اینکه هر component به تمام backend response shapeها tightly coupled شود.

## لایه‌های error handling

API failure می‌تواند در چند layer handle شود:

```text
backend response
   ↓
Axios transport/interceptor
   ↓
API helper / normalization layer
   ↓
React Query query or mutation
   ↓
page/modal/table presentation
```

هر layer مسئولیت متفاوتی دارد.

## Shared Axios response interceptor

Shared application client، failed Axios responseها را ابتدا از طریق helper زیر log می‌کند:

```text
logApiErrorDetails(error)
```

و سپس special 401 recovery logic را اعمال می‌کند.

Non-401 errorها دوباره به owning query/mutation reject می‌شوند.

Interceptor نباید هر error را به generic toast تبدیل کند، چون presentation باید در feature‌ای انجام شود که operator context لازم را دارد.

## helper مرکزی error message

Shared helper:

```text
extractApiErrorMessage(error, fallback)
```

Lookup order فعلی برای Axios response objectها شامل موارد زیر است:

```text
detail
message
error.message
error.detail
```

اگر response field شناخته‌شده وجود نداشته باشد:

1. اگر `Error.message` موجود است از آن استفاده می‌شود؛
2. در غیر این صورت stable fallback ارائه‌شده استفاده می‌شود.

برای mutationهای معمولی feature، این helper باید به parserهای تکراری response shape ترجیح داده شود.

## Error code و development logging

`logApiErrorDetails()` همچنین تلاش می‌کند error code را از fieldهای زیر extract کند:

```text
code
error.code
```

و normalized console message زیر را log می‌کند:

```text
[API Error] code: <code>, message: <message>
```

این diagnostic logging است، نه operator-facing UX.

Raw internal code را به user نمایش ندهید مگر اینکه support/troubleshooting purpose مستند داشته باشد.

## feature-specific legacy error shapeها

برخی endpointها فعلاً shapeهای اضافه‌ای مانند موارد زیر برمی‌گردانند:

```text
errors: string
errors: string[]
error: string
```

Featureهایی مثل Web Share، Volume creation، NFS و Samba create flow compatibility extractor مخصوص این shapeها دارند.

تا زمانی که backend contractها heterogeneous هستند این کار قابل قبول است، اما code جدید نباید one-off parserهای تازه را بی‌دلیل زیاد کند.

جهت‌گیری long-term بهتر است backend error envelope یکسان باشد.

## Logical failure داخل HTTP success

برخی API helperها نمی‌توانند فقط به HTTP status متکی باشند.

بعضی backend responseها ممکن است داخل response از نوع 2xx این shape را برگردانند:

```json
{
  "ok": false,
  "error": "operation failed"
}
```

نمونه‌هایی از frontend code که این pattern را صریحاً handle می‌کنند:

- disk inventory/detail؛
- disk partition count؛
- pool-device readها؛
- general system settings response assertionها.

وقتی endpoint contract فعلی `ok:false` را پشتیبانی می‌کند، API helper باید آن را به `Error`/rejected query تبدیل کند و نگذارد UI آن را empty success در نظر بگیرد.

## 401 یک حالت خاص است

HTTP 401 مربوط به normal application request وارد centralized token recovery می‌شود، به شرط اینکه:

```text
originalRequest exists
and
originalRequest._retry is not already true
```

Recovery sequence:

1. refresh token دریافت می‌شود؛
2. اگر refresh token وجود نداشته باشد session فوراً clear می‌شود؛
3. اگر refresh دیگری active است، failed request queue می‌شود؛
4. در غیر این صورت یک refresh request شروع می‌شود؛
5. access token جدید ذخیره می‌شود؛
6. queued requestها replay می‌شوند؛
7. original request replay می‌شود.

اگر refresh fail شود، تمام queued requestها fail می‌شوند و authenticated frontend session clear می‌شود.

جزئیات:

[`authentication-api.md`](./authentication-api.md)

## همه‌ی errorها را مرکزی retry نکنید

Global default فعلی React Query، automatic retry را disable کرده است.

این تصمیم برای administration UI عمدی است، چون mutation و operational action ممکن است safe برای replay کورکورانه نباشند.

Broad transport-level retry برای موارد زیر اضافه نکنید:

- create/delete mutation؛
- disk wipe/cleanup؛
- service control؛
- system settings change؛
- network reconfiguration؛
- credential/password change.

اگر observational GET خاصی باید retry شود، behavior را در همان query صریح و همراه rationale مستند کنید.

## Query errorها

Server-state resourceهای مستقل باید مستقل fail شوند.

مثال:

- failure یک Dashboard telemetry widget نباید کل Dashboard را blank کند؛
- failure detail یک selected disk نباید کل inventory را مخفی کند؛
- failure یک pool-device slot lookup نباید result موفق poolهای دیگر را پاک کند؛
- failure یک General Settings query نباید لزوماً تمام settings sectionهای نامرتبط را disable کند.

وقتی resourceها lifecycle مستقل دارند، resource-local error state را به global page failure ترجیح دهید.

## Mutation errorها

Mutation failure نباید owning modal را مثل success close/reset کند.

Pattern معمول:

```text
submit
  ↓
mutation pending
  ↓
 success -> invalidate + close/reset + success feedback
 failure -> preserve form/target + expose error + retry/recovery option
```

این رفتار مخصوصاً زمانی مهم است که operator configuration پیچیده‌ای وارد کرده و نباید بعد از backend validation failure آن را از دست بدهد.

## Toast در برابر inline/modal error

برای operation result کوتاه از transient toast feedback استفاده کنید.

وقتی error به form یا confirmation context مربوط است و user برای تصمیم بعدی باید آن را ببیند، inline/modal state مناسب‌تر است.

چند flow فعلی عمداً هر دو را دارند:

- modal backend failure را نگه می‌دارد؛
- toast immediate global feedback می‌دهد.

یک raw error طولانی را در چند surface تکراری نمایش ندهید.

## partial-failure workflowها

یک frontend workflow می‌تواند error گزارش دهد در حالی که stepهای قبلی backend قبلاً success شده‌اند.

نمونه‌های مهم فعلی:

### Pool delete

Sequence:

```text
destroy pool
   ↓
clear/wipe former disks
```

اگر disk cleanup پس از destroy fail شود، pool ممکن است از قبل حذف شده باشد.

### Web Share create

Sequence:

```text
create Web Share
   ↓
set permission 777
```

Permission failure، Web Share ایجادشده را rollback نمی‌کند.

### Samba group create

Sequence:

```text
create group
   ↓
add users one-by-one
```

Membership failure باعث delete شدن group تازه ایجادشده نمی‌شود.

### Samba membership batch

برای هر username یک PUT جدا ارسال می‌شود. اگر username بعدی fail شود، change موفق قبلی rollback نمی‌شود.

### Web-user → OS-user creation

Web user می‌تواند در صورت failure بعدی OS-user creation باقی بماند.

### OS-user → Samba-user creation

OS user می‌تواند در صورت failure بعدی Samba-user creation باقی بماند.

Error copy و troubleshooting document باید actual partial state را توضیح دهند و نباید القا کنند transaction rollback شده است.

## best-effort sub-stepها

برخی workflowها عمداً بعد از failure یک sub-step ادامه می‌دهند.

نمونه‌ی فعلی:

```text
disk cleanup
```

`clear-zfs` best-effort است و wipe بعدی همچنان attempt می‌شود.

در نتیجه final workflow موفق می‌تواند یک non-fatal sub-step failure هم داشته باشد.

هنگام اضافه کردن best-effort step، structured information کافی برگردانید تا caller بتواند تصمیم بگیرد warning لازم است یا خیر.

## Dependency errorها

بعضی backend failureها domain dependency هستند، نه generic transport problem.

نمونه‌های فعلی UI:

- filesystem delete به‌دلیل share configuration block شده؛
- zpool delete به‌دلیل dependent filesystem/share state block شده؛
- Samba-user delete به‌دلیل استفاده شدن user در active share block شده.

Frontend می‌تواند backend context شناخته‌شده را به operator guidance مناسب تبدیل کند، اما backend باید authoritative integrity check باقی بماند.

Complex dependency rule را صرفاً در frontend validation بازسازی نکنید.

## Validation errorها

Frontend validation باید obvious invalid request را قبل از ارسال بگیرد و UX را بهتر کند، اما integrity enforcement نیست.

مثال:

- duplicate username/name بر اساس list فعلی؛
- pool/vdev disk count؛
- filesystem naming/quota؛
- SNMP IP validation؛
- hostname/NTP validation؛
- NFS client/path validation.

Client state می‌تواند stale باشد و operatorهای concurrent می‌توانند backend state را تغییر دهند. Backend validation الزامی باقی می‌ماند.

## Network و unavailable-backend failureها

وقتی response payload وجود ندارد، `extractApiErrorMessage()` ابتدا Axios/Error message و سپس feature fallback را استفاده می‌کند.

Feature code باید fallback message مشخص‌کننده‌ی operation داشته باشد، مثل:

```text
امکان دریافت اطلاعات دیسک‌ها وجود ندارد.
```

نه پیام بدون context مثل:

```text
خطا رخ داد.
```

## Cancellation یک operator error نیست

Query cancellation ناشی از navigation/disablement معمولاً نباید به application failure toast تبدیل شود.

در read helperهایی که پشتیبانی می‌کنند، React Query `AbortSignal` را به Axios بدهید تا obsolete requestها تمیز terminate شوند.

## Diagnostic actionها

Diagnostic result می‌تواند unsuccessful باشد بدون اینکه transport error رخ داده باشد.

SNMP test مثال واضح است:

```text
HTTP request succeeds
connection_success = false
```

UI این حالت را به structured failed diagnostic result تبدیل می‌کند، نه configuration mutation error.

Transport success و domain/diagnostic success را جدا نگه دارید.

## checklist برای error handling در API جدید

برای هر request جدید این موارد را مشخص کنید:

1. چه HTTP statusهایی expected هستند؟
2. آیا `2xx` می‌تواند `ok:false` یا logical failure معادل داشته باشد؟
3. کدام response fieldها human-readable error دارند؟
4. آیا operation safe برای retry است؟
5. Failure می‌تواند partial backend state باقی بگذارد؟
6. Modal باید باز بماند؟
7. Toast feedback مفید است؟
8. Error یک dependency/business rule است که operator guidance واضح‌تر لازم دارد؟
9. Cancellation ممکن است و باید silent بماند؟
10. آیا 401 باید به central auth recovery واگذار شود و feature-level handling نداشته باشد؟
11. Backend ممکن است sensitive information برگرداند که نباید مستقیم نمایش داده شود؟
12. Fallback message به‌اندازه کافی operation failure را مشخص می‌کند؟

## فایل‌های مرتبط

- `src/utils/apiError.ts`
- `src/lib/axiosInstance.ts`
- `src/lib/authApi.ts`

## مستندات مرتبط

- [`api-conventions.md`](./api-conventions.md)
- [`authentication-api.md`](./authentication-api.md)
- [`endpoint-map.md`](./endpoint-map.md)
- [`../04-core-flows/api-request-lifecycle.md`](../04-core-flows/api-request-lifecycle.md)
- [`../04-core-flows/authentication.md`](../04-core-flows/authentication.md)
