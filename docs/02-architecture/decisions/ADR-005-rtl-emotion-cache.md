# ADR-005: استفاده از RTL Emotion Cache برای Material UI Styling

- وضعیت: Accepted
- Scope: RTL style transformation و integration با Material UI

## Context

SOHO UI عمدتاً یک interface مدیریتی فارسی و right-to-left است، در حالی که بسیاری از technical valueهای داخل آن مانند IP، hostname، filesystem path، metric و service name ذاتاً left-to-right باقی می‌مانند.

Material UI برای styling از Emotion استفاده می‌کند. Application به یک mechanism یکپارچه نیاز دارد که directional CSS را mirror کند و در عین حال semantic DOM direction و LTR islandهای صریح را در محل مناسب ممکن نگه دارد.

## Decision

از یک Emotion cache اختصاصی که با RTL Stylis processing configure شده استفاده می‌شود و این cache نزدیک application root provide می‌شود.

Runtime provider order شامل RTL cache پیش از render شدن feature UI است.

Semantic HTML direction همچنان concern مستقلی است. Component/pageها هرجا browser text/layout semantics نیاز داشته باشد می‌توانند از `dir="rtl"` یا `dir="ltr"` واقعی استفاده کنند.

## چرا هم Style Mirroring و هم Semantic Direction مهم‌اند؟

Stylis می‌تواند directional CSS propertyها را transform کند، اما نمی‌تواند معنی HTML `dir` attribute را جایگزین کند.

برای مثال، Settings page یک RTL DOM boundary صریح ایجاد می‌کند، چون tab/table content علاوه بر mirrored style به semantic RTL direction نیز نیاز دارد.

به همین شکل technical valueها می‌توانند عمداً در application RTL به‌صورت LTR render شوند.

## Consequenceها

### Positive

- directional styleهای Material UI به‌صورت یکپارچه transform می‌شوند؛
- feature componentها مجبور نیستند تک‌تک margin/padding ruleها را دستی mirror کنند؛
- behavior مربوط به Persian layout متمرکز می‌شود؛
- technical LTR content را می‌توان صریح handle کرد، بدون این‌که کل application به یک direction strategy واحد force شود.

### Tradeoffها

- توسعه‌دهنده باید تفاوت CSS mirroring و DOM `dir` را درک کند؛
- hardcoded directional CSS همچنان می‌تواند در صورت bypass کردن reusable token/layout conventionها نتیجه‌ی غلط ایجاد کند؛
- third-party componentها ممکن است به explicit direction handling نیاز داشته باشند.

## Ruleها

1. Shared RTL Emotion cache را به‌عنوان root styling concern حفظ کنید.
2. هرجا actual browser direction semantics لازم است از semantic `dir` attribute استفاده کنید.
3. Technical valueها را زمانی که readability بهتر می‌شود LTR نگه دارید.
4. Logical/shared layout style را به manual left/right inversion پراکنده ترجیح دهید.
5. پس از تغییر styling infrastructure، dialog، table، tab، input، icon و popover را در RTL test کنید.
6. صرفاً به این دلیل که یک component بدون RTL processing ظاهراً درست است، processing سراسری RTL را حذف نکنید.

## Alternativeهای بررسی‌شده

### Manual RTL CSS در همه‌جا

رد شد، چون directional styling decisionها را duplicate می‌کند و نگهداری آن در Material UI componentها دشوار است.

### فقط قراردادن `dir="rtl"` روی Root Element

به‌تنهایی برای CSS-in-JS ruleهایی که به directional transformation نیاز دارند کافی نیست.

### Force کردن تمام Valueها به RTL

رد شد، چون technical stringهایی مثل IP address، hostname، version و path با LTR direction خواناتر هستند.

## چه زمانی این Decision دوباره بررسی شود؟

اگر UI framework/styling engine تغییر کرد یا محصول به‌صورت runtime language switching کاملاً bidirectional شد، این decision باید revisit شود.

Bidirectional redesign نیازمند explicit cache/theme/direction switching است؛ نه حذف ad-hoc contract فعلی RTL.

## فایل‌های مرتبط

- `src/rtl-cache.ts`
- `src/main.tsx`
- `src/pages/Settings.tsx`

## مستندات مرتبط

- [`../frontend-architecture.md`](../frontend-architecture.md)
- [`../../05-features/settings.md`](../../05-features/settings.md)
