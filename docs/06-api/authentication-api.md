# Authentication API

این سند transport contract مربوط به authentication در frontend SOHO UI را توضیح می‌دهد.

برای session lifecycle کامل، سند زیر را نیز بخوانید:

[`../04-core-flows/authentication.md`](../04-core-flows/authentication.md)

## جداسازی transport

SOHO برای authentication-related traffic از دو Axios client استفاده می‌کند.

### Isolated auth client

تعریف‌شده در:

```text
src/lib/authApi.ts
```

برای موارد زیر استفاده می‌شود:

- صدور access/refresh token؛
- access-token refresh؛
- token verification.

این operationها عمداً shared Axios response interceptor را bypass می‌کنند.

دلیل: اگر refresh از client معمولی استفاده کند و خودش 401 بگیرد، ممکن است به‌صورت recursive وارد همان 401 recovery flow شود که قرار است مشکل را حل کند.

### Shared application client

Logout از این client استفاده می‌کند:

```text
src/lib/axiosInstance.ts
```

چون logout یک authenticated application mutation است و باید Bearer access token فعلی را همراه داشته باشد.

## resolve کردن authentication base URL

Isolated auth client base URL را با این ترتیب resolve می‌کند.

### 1. explicit auth base

اگر مقدار زیر configure شده و non-empty باشد:

```text
VITE_AUTH_API_BASE_URL
```

پس از trailing-slash normalization مستقیماً استفاده می‌شود.

مثال:

```env
VITE_AUTH_API_BASE_URL=https://api.example.com/api/auth/
```

### 2. derive از application base

اگر auth-specific value وجود نداشته باشد، client به این مقدار fallback می‌کند:

```text
VITE_API_BASE_URL
```

و مطمئن می‌شود path با این بخش پایان یابد:

```text
/api/auth/
```

مثال:

```text
VITE_API_BASE_URL=https://api.example.com
                      ↓
https://api.example.com/api/auth/
```

اگر application URL از قبل با `/auth` تمام شود، helper segment دیگری از auth اضافه نمی‌کند.

### 3. empty base

اگر هیچ‌کدام از variableها configure نشده باشند، auth client از base URL خالی استفاده می‌کند و relative requestها نسبت به browser origin resolve می‌شوند.

این behavior می‌تواند پشت same-origin reverse proxy مفید باشد، اما باید در deployment configuration عمدی باشد.

## Login / token issue

Frontend helper:

```text
login()
```

Request:

```http
POST <auth-base>/token/
Content-Type: application/json
```

Payload:

```json
{
  "username": "operator",
  "password": "..."
}
```

Expected response shape:

```json
{
  "access": "<access-token>",
  "refresh": "<refresh-token>"
}
```

Ownership سمت frontend پس از success:

- access token → memory-only token storage؛
- refresh token → session storage با in-memory fallback؛
- username → session storage با in-memory fallback؛
- authenticated React state → `AuthContext`؛
- initial canonical StateSync baseline → توسط authenticated-session flow trigger می‌شود.

خود login helper مالک UI navigation، toast message یا StateSync نیست.

## Access-token verification

Frontend helper:

```text
verifyAccessToken(token)
```

Request:

```http
POST <auth-base>/token/verify/
```

Payload:

```json
{
  "token": "<access-token>"
}
```

Response موفق به معنی verification success است و frontend helper body خاصی نیاز ندارد.

در application initialization، access state موجود فقط پس از verification موفق restore می‌شود.

## Access-token refresh

Frontend helper:

```text
refreshAccessToken(refresh)
```

Request:

```http
POST <auth-base>/token/refresh/
```

Payload:

```json
{
  "refresh": "<refresh-token>"
}
```

Expected response:

```json
{
  "access": "<new-access-token>"
}
```

Frontend فعلی انتظار دارد refresh token موجود همچنان قابل استفاده باشد؛ helper rotated refresh token را از response مصرف نمی‌کند.

اگر backend در آینده refresh-token rotation اضافه کند، frontend contract باید عمداً update شود.

## Automatic 401 recovery

Normal application requestها از shared Axios instance استفاده می‌کنند.

وقتی response برابر 401 باشد و original request هنوز retry نشده باشد:

1. refresh token خوانده می‌شود؛
2. اگر وجود نداشته باشد local session state clear می‌شود؛
3. اگر refresh دیگری فعال نیست، یک refresh request شروع می‌شود؛
4. 401های concurrent داخل `failedQueue` منتظر می‌مانند؛
5. access token جدید ذخیره می‌شود؛
6. Axios default Authorization header update می‌شود؛
7. token-refreshed auth event emit می‌شود؛
8. queued requestها با همان access token جدید replay می‌شوند؛
9. original failed request نیز replay می‌شود.

این یک طراحی **single-flight refresh** است.

هدف این است که burst از expired-token requestها باعث burst از refresh requestهای مستقل نشود.

## Refresh failure

اگر refresh fail شود:

1. تمام queued requestها reject می‌شوند؛
2. frontend token/session storage clear می‌شود؛
3. session-cleared event emit می‌شود؛
4. original request با refresh failure reject می‌شود؛
5. React authentication state به session-cleared event واکنش نشان می‌دهد و protected routing بسته می‌شود.

این failure را با infinite retry کردن token refresh پنهان نکنید.

## `_retry` guard

Original Axios config پیش از refresh/replay این مقدار را دریافت می‌کند:

```text
_retry = true
```

این flag مانع آن می‌شود که همان request بیش از یک بار به‌صورت recursive وارد 401 recovery شود.

## Logout

Frontend helper:

```text
logout(refresh)
```

Request:

```http
POST /api/system/ui-user/logout/
Authorization: Bearer <access-token>
```

Payload:

```json
{
  "refresh": "<refresh-token>"
}
```

برخلاف token issue/refresh/verify، این request از shared application Axios client استفاده می‌کند.

### local-first logout invariant

React authentication flow local authenticated state را **پیش از** منتظر ماندن برای backend logout request clear می‌کند.

نتیجه:

- protected routeها فوراً غیرقابل دسترس می‌شوند؛
- logout endpoint کند یا unavailable باعث authenticated ماندن user در UI نمی‌شود؛
- backend token invalidation همچنان attempt می‌شود.

بدون بررسی security و UX consequence، این ordering را برعکس نکنید.

## Authorization header

برای normal application traffic، shared request interceptor access token فعلی را از memory-only token storage می‌خواند و header زیر را اضافه می‌کند:

```http
Authorization: Bearer <access-token>
```

اگر access token موجود نباشد، این logic header را اضافه نمی‌کند.

Authentication endpointهای isolated client به shared interceptor متکی نیستند.

## Token storage model

Design فعلی frontend عمداً persistent storage برای access token ندارد.

### Access token

Storage:

```text
memory only
```

### Refresh token

Storage:

```text
sessionStorage
```

با in-memory fallback وقتی storage در دسترس نباشد.

### Username

Session identity username نیز همین session-storage/fallback model را دارد.

Feature جداگانه‌ی «remember username» فقط username preference را ذخیره می‌کند و نباید به password/token persistence توسعه پیدا کند.

## Session restore

در application initialization، authentication provider موارد زیر را بررسی می‌کند:

- stored refresh token؛
- stored username؛
- last-activity timestamp؛
- in-memory access token در صورت وجود.

High-level recovery order:

```text
session starts
   ↓
idle timeout check
   ↓
access token available?
   ├─ yes -> verify
   └─ no  -> refresh token available?
                ├─ yes -> refresh
                └─ no  -> unauthenticated
```

Restoration موفق سپس canonical StateSync baseline مربوط به session را یک بار اجرا می‌کند.

## Idle timeout

Frontend یک inactivity timeout برابر 30 دقیقه enforce می‌کند.

Activity timestamp در session storage persist می‌شود تا page reload inactivity history را reset نکند.

این یک frontend session-control layer است. Backend token expiry و authorization باید مستقل از آن enforce شوند.

## Authentication endpointها و StateSync

Auth endpointها از normal `save_to_db` transport policy و StateSync mutation scheduling خارج هستند.

Token/session operationها managed-system persistence domain نیستند.

Authentication URL را به `StateSyncManager` map نکنید.

## مدیریت خطا

Login/verify/refresh errorها به caller propagate می‌شوند.

401 مربوط به ordinary application requestها به شکل centralized که بالا توضیح داده شد handle می‌شود.

Non-401 application error فقط به‌دلیل اینکه user authenticated است به authentication failure تبدیل نمی‌شود.

## security invariantها

- Access token را هرگز در `localStorage` persist نکنید.
- Login password را ذخیره نکنید.
- Auth token refresh را روی isolated client نگه دارید.
- 401 retry guard را حفظ کنید.
- Single-flight refresh را حفظ کنید مگر اینکه concurrency-safe design معادل جایگزین شود.
- Backend authorization authoritative است؛ frontend protected route به‌تنهایی access control کافی نیست.
- `VITE_AUTH_BYPASS` باید همچنان توسط `import.meta.env.DEV` gate شود.
- `VITE_*` environment valueها برای browser قابل مشاهده‌اند و نباید secret داشته باشند.

## خلاصه endpointها

| Operation | Client | Method | Endpoint |
| --- | --- | --- | --- |
| Login/token issue | isolated auth client | POST | `<auth-base>/token/` |
| Refresh access token | isolated auth client | POST | `<auth-base>/token/refresh/` |
| Verify access token | isolated auth client | POST | `<auth-base>/token/verify/` |
| Logout | shared app client | POST | `/api/system/ui-user/logout/` |

## فایل‌های مرتبط

- `src/lib/authApi.ts`
- `src/lib/axiosInstance.ts`
- `src/lib/tokenStorage.ts`
- `src/lib/authEvents.ts`
- `src/contexts/AuthContext.tsx`
- `src/routes/ProtectedRoute.tsx`
- `src/hooks/useSessionActivityTimeout.ts`
- `src/hooks/useRememberUsername.ts`

## مستندات مرتبط

- [`api-conventions.md`](./api-conventions.md)
- [`error-handling.md`](./error-handling.md)
- [`endpoint-map.md`](./endpoint-map.md)
- [`../04-core-flows/authentication.md`](../04-core-flows/authentication.md)
- [`../04-core-flows/routing-and-access-control.md`](../04-core-flows/routing-and-access-control.md)
- [`../03-development/configuration.md`](../03-development/configuration.md)
