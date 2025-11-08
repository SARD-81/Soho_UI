# ModalActionButtons.tsx

## نمای کلی
کامپوننت `ModalActionButtons` مجموعه استانداردی از دکمه‌های اقدام را برای مودال‌ها فراهم می‌کند، معمولاً شامل دکمه‌های لغو و تأیید با استایل و رفتار یکسان است. گزینه‌های سفارشی‌سازی برای برچسب‌ها، استایل و رفتار را ارائه می‌دهد در حالی که یک الگوی UI/UX یکسان را حفظ می‌کند.

## ساختار فایل و اجزاء به تفصیل

### دستورات واردات
- کامپوننت‌های Material UI: `Box`, `Button`
- انواع Material UI: `ButtonProps`, `SxProps`, `Theme`

### تعریف رابط (`ModalActionButtonsProps`)
```ts
interface ModalActionButtonsProps {
  onConfirm?: ButtonProps['onClick'];
  onCancel?: ButtonProps['onClick'];
  confirmLabel: string;
  cancelLabel?: string;
  disabled?: boolean;
  isLoading?: boolean;
  loadingLabel?: string;
  confirmProps?: ButtonProps;
  cancelProps?: ButtonProps;
  disableConfirmGradient?: boolean;
}
```
- نوع props مورد انتظار توسط کامپوننت را تعریف می‌کند
- `onConfirm`: تابع کال‌بک اختیاری برای کلیک دکمه تأیید
- `onCancel`: تابع کال‌بک اختیاری برای کلیک دکمه لغو
- `confirmLabel`: برچسب الزامی برای دکمه تأیید
- `cancelLabel`: برچسب اختیاری برای دکمه لغو (به طور پیش‌فرض 'انصراف')
- `disabled`: بولین اختیاری برای غیرفعال کردن هر دو دکمه
- `isLoading`: بولین اختیاری برای نمایش حالت بارگذاری در دکمه تأیید
- `loadingLabel`: برچسب اختیاری برای نمایش در هنگام بارگذاری
- `confirmProps`: props اضافی برای ارسال به دکمه تأیید
- `cancelProps`: props اضافی برای ارسال به دکمه لغو
- `disableConfirmGradient`: بولین اختیاری برای غیرفعال کردن گرادیانت در دکمه تأیید

### تجزیه Props کامپوننت
```ts
const {
  onConfirm,
  onCancel,
  confirmLabel,
  cancelLabel = 'انصراف',
  disabled = false,
  isLoading = false,
  loadingLabel,
  confirmProps,
  cancelProps,
  disableConfirmGradient = false,
}: ModalActionButtonsProps
```
- تمام props ارسالی به کامپوننت را استخراج می‌کند
- مقادیر پیش‌فرض را برای props اختیاری تنظیم می‌کند

### تعاریف استایل
#### استایل‌های دکمه پایه (`baseButtonSx`)
```ts
const baseButtonSx: SxProps<Theme> = {
  borderRadius: '5px',
  fontWeight: 600,
};
```
- استایل‌های مشترک را برای هر دو دکمه تأیید و لغو تعریف می‌کند
- شعاع حاشیه و وزن فونت را تنظیم می‌کند

#### استایل‌های دکمه گرادیانتی (`gradientButtonSx`)
```ts
const gradientButtonSx: SxProps<Theme> = {
  px: 4,
  background:
    'linear-gradient(135deg, var(--color-primary) 0%, rgba(31, 182, 255, 0.95) 100%)',
  boxShadow: '0 14px 28px -18px rgba(0, 198, 169, 0.8)',
  '&:hover': {
    background:
      'linear-gradient(135deg, rgba(0, 198, 169, 0.95) 0%, rgba(18, 140, 200, 0.95) 100%)',
  },
};
```
- پس‌زمینه گرادیانتی را برای دکمه تأیید تعریف می‌کند
- شامل سایه و افکت فلور می‌شود
- از متغیرهای CSS برای تم یکسان استفاده می‌کند

#### استایل‌های دکمه لغو (`cancelButtonSx`)
```ts
const cancelButtonSx: SxProps<Theme> = {
  px: 3,
};
```
- پدینگ خاص را برای دکمه لغو تعریف می‌کند

### تابع ادغام استایل (`mergeSx`)
```ts
const mergeSx = (
  ...styles: Array<SxProps<Theme> | undefined>
): SxProps<Theme> =>
  styles
    .filter(Boolean)
    .flatMap((style) =>
      Array.isArray(style) ? style : [style]
    ) as SxProps<Theme>;
```
- تابع ابزارکاری برای ادغام چندین شیء استایل Sx
- استایل‌های تعریف نشده را فیلتر می‌کند
- آرایه‌های استایل را در یک آرایه واحد صاف می‌کند

### تجزیه Props تأیید
```ts
const {
  sx: confirmSxProp,
  disabled: confirmDisabledProp,
  onClick: confirmOnClickProp,
  variant: confirmVariant,
  color: confirmColor,
  ...confirmRest
} = confirmProps ?? {};
```
- props فردی را از شیء confirmProps استخراج می‌کند
- استایل، وضعیت غیرفعال، عنصر کلیک، نوع و رنگ را جدا می‌کند
- props باقی‌مانده را در confirmRest جمع‌آوری می‌کند

### تجزیه Props لغو
```ts
const {
  sx: cancelSxProp,
  disabled: cancelDisabledProp,
  onClick: cancelOnClickProp,
  variant: cancelVariant,
  color: cancelColor,
  ...cancelRest
} = cancelProps ?? {};
```
- props فردی را از شیء cancelProps استخراج می‌کند
- استایل، وضعیت غیرفعال، عنصر کلیک، نوع و رنگ را جدا می‌کند
- props باقی‌مانده را در cancelRest جمع‌آوری می‌کند

### توابع عنصر رویداد
#### عنصر کلیک تأیید
```ts
const handleConfirmClick: ButtonProps['onClick'] = (event) => {
  if (confirmOnClickProp) {
    confirmOnClickProp(event);
  }

  if (onConfirm) {
    onConfirm(event);
  }
};
```
- کلیک دکمه تأیید را مدیریت می‌کند
- هم عنصر onClick سفارشی و هم کال‌بک onConfirm را فراخوانی می‌کند اگر ارائه شده باشد

#### عنصر کلیک لغو
```ts
const handleCancelClick: ButtonProps['onClick'] = (event) => {
  if (cancelOnClickProp) {
    cancelOnClickProp(event);
  }

  if (onCancel) {
    onCancel(event);
  }
};
```
- کلیک دکمه لغو را مدیریت می‌کند
- هم عنصر onClick سفارشی و هم کال‌بک onCancel را فراخوانی می‌کند اگر ارائه شده باشد

### محاسبه وضعیت غیرفعال
```ts
const confirmDisabled = Boolean(disabled || isLoading || confirmDisabledProp);
const cancelDisabled = Boolean(disabled || cancelDisabledProp);
```
- وضعیت نهایی غیرفعال را برای دکمه تأیید محاسبه می‌کند
- وضعیت غیرفعال کلی، وضعیت بارگذاری و props خاص را در نظر می‌گیرد
- وضعیت نهایی غیرفعال را برای دکمه لغو با در نظر گرفتن وضعیت غیرفعال کلی و props خاص محاسبه می‌کند

### ادغام استایل
```ts
const confirmSx = mergeSx(
  baseButtonSx,
  disableConfirmGradient ? undefined : gradientButtonSx,
  confirmSxProp
);

const cancelSx = mergeSx(baseButtonSx, cancelButtonSx, cancelSxProp);
```
- استایل‌ها را برای دکمه تأیید با یا بدون گرادیانت ادغام می‌کند
- استایل‌ها را برای دکمه لغو با استایل پایه و استایل خاص ادغام می‌کند

### ساختار بازگشت JSX
کامپوننت یک کانتینر Box را رندر می‌کند که شامل موارد زیر است:
- چیدمان فلکس برای چینش دکمه‌ها
- فاصله بین دکمه‌ها و مکان‌یابی مرکزی
- رندر شرطی دکمه لغو (فقط اگر onCancel ارائه شده باشد)
- دکمه تأیید همیشه با پشتیبانی از حالت بارگذاری رندر می‌شود
- مدیریت مناسب انواع دکمه، رنگ‌ها و وضعیت‌های غیرفعال
- پشتیبانی از برچسب بارگذاری برای دکمه تأیید

## هدف و عملکرد
- دکمه‌های اقدام استاندارد را برای مودال‌ها فراهم می‌کند
- از هر دو اقدام تأیید و لغو پشتیبانی می‌کند
- حالت بارگذاری را با برچسب بارگذاری سفارشی ارائه می‌دهد
- امکان سفارشی‌سازی props و استایل دکمه را فراهم می‌کند
- وضعیت‌های غیرفعال را در سطوح مختلف مدیریت می‌کند
- UI/UX یکسان را در سراسر مودال‌ها حفظ می‌کند
- از چیدمان متن RTL (فارسی) پشتیبانی می‌کند

## Props
- `onConfirm`: کال‌بک برای کلیک دکمه تأیید
- `onCancel`: کال‌بک برای کلیک دکمه لغو
- `confirmLabel`: برچسب برای دکمه تأیید
- `cancelLabel`: برچسب برای دکمه لغو (به طور پیش‌فرض 'انصراف')
- `disabled`: هر دو دکمه را غیرفعال می‌کند
- `isLoading`: حالت بارگذاری را در دکمه تأیید نشان می‌دهد
- `loadingLabel`: برچسبی که در هنگام بارگذاری نشان داده می‌شود
- `confirmProps`: props اضافی برای دکمه تأیید
- `cancelProps`: props اضافی برای دکمه لغو
- `disableConfirmGradient`: گرادیانت را در دکمه تأیید غیرفعال می‌کند

## ویژگی‌های کلیدی
- استایل و رفتار یکسان در سراسر مودال‌ها
- پشتیبانی از حالت بارگذاری با برچسب‌های سفارشی
- استایل گرادیانتی برای دکمه تأیید (اختیاری)
- سفارشی‌سازی انعطاف‌پذیر از طریق props
- رندر شرطی دکمه لغو
- مدیریت مناسب وضعیت غیرفعال
- عملکرد ادغام استایل
- پشتیبانی RTL
- پیاده‌سازی ایمن از نظر نوع