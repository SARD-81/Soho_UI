# ConfirmDeleteFileSystemModal.tsx

## نمای کلی
کامپوننت `ConfirmDeleteFileSystemModal` یک مودال تأیید است که قبل از حذف یک فضای فایلی به کاربر اخطار می‌دهد. این کامپوننت اطمینان می‌دهد که کاربر از انجام عملیات غیرقابل برگشت حذف آگاه است.

## ساختار فایل و اجزاء به تفصیل

### دستورات واردات
- `Box` و `Typography` از '@mui/material': کامپوننت‌های Material UI برای چیدمان و نمایش متن
- `UseDeleteFileSystemReturn` از '../../hooks/useDeleteFileSystem': نوع بازگشتی هوک حذف فضای فایلی
- `BlurModal` از '../BlurModal': کامپوننت مودال سفارشی با افکت تاری
- `ModalActionButtons` از '../common/ModalActionButtons': کامپوننت دکمه‌های عملیاتی مودال

### تعریف رابط (`ConfirmDeleteFileSystemModalProps`)
```ts
interface ConfirmDeleteFileSystemModalProps {
  controller: UseDeleteFileSystemReturn;
}
```
- تعریف نوع props مورد انتظار توسط کامپوننت
- `controller`: شیء حاوی وضعیت و توابع مورد نیاز از هوک useDeleteFileSystem

### تجزیه Props کامپوننت
```ts
const {
  controller,
}: ConfirmDeleteFileSystemModalProps
```
- props controller را از کامپوننت استخراج می‌کند

### تجزیه وضعیت کنترلر
```ts
const {
  isOpen,
  targetFileSystem,
  closeModal,
  confirmDelete,
  isDeleting,
  errorMessage,
} = controller;
```
- `isOpen`: بولینی که نشان می‌دهد مودال باز است یا خیر
- `targetFileSystem`: فضای فایلی که قرار است حذف شود
- `closeModal`: تابع بستن مودال
- `confirmDelete`: تابع تأیید و اجرای حذف
- `isDeleting`: بولینی که نشان می‌دهد عملیات حذف در حال اجرا است یا خیر
- `errorMessage`: پیام خطا در صورت بروز مشکل

### منطق کنسول لاگ خطا
```ts
if (errorMessage) {
  console.log(errorMessage);
}
```
- در صورت وجود پیام خطا، آن را در کنسول چاپ می‌کند
- این برای اهداف عیب‌یابی است

### ساختار JSX اصلی
کامپوننت یک کامپوننت `BlurModal` اصلی رندر می‌کند که شامل موارد زیر است:

#### پیکربندی مودال
- `open`: بر اساس وضعیت `isOpen` تعیین می‌شود
- `onClose`: تابع `closeModal` برای بستن مودال
- `title`: عنوان "حذف فضای فایلی" به زبان فارسی

#### دکمه‌های عملیاتی
- `onCancel`: تابع `closeModal` برای لغو عملیات
- `onConfirm`: تابع `confirmDelete` برای تأیید حذف
- `confirmLabel`: برچسب "حذف"
- `loadingLabel`: برچسب "در حال حذف..." در حالت بارگذاری
- `isLoading`: نشان می‌دهد که آیا حذف در حال اجرا است یا خیر
- `disabled`: در حین حذف غیرفعال می‌شود
- `disableConfirmGradient`: غیرفعال کردن گرادیانت روی دکمه تأیید
- `confirmProps`: تنظیم رنگ دکمه تأیید به 'error' برای نشان دادن عملیات خطرناک

#### محتوای اصلی مودال
- یک Box با چیدمان ستونی و فاصله‌گذاری
- پیام تأیید حذف با نمایش نام فضای فایلی هدف
- پیام اخطار که عملیات قابل بازگشت نیست
- (بخش خطا در حال حاضر توسط کامنت غیرفعال شده است)

## هدف و عملکرد
- نمایش یک مودال تأیید قبل از حذف فضای فایلی
- اخطار به کاربر درباره غیرقابل برگشت بودن عملیات
- نمایش نام فضای فایلی مورد نظر برای حذف
- ارائه کنترل‌های تأیید و لغو
- نمایش وضعیت بارگذاری در حین حذف

## Props
- `controller`: شیء حاوی وضعیت و توابع مورد نیاز از هوک useDeleteFileSystem که شامل موارد زیر است:
  - `isOpen`: وضعیت نمایش مودال
  - `targetFileSystem`: فضای فایلی مورد نظر برای حذف
  - `closeModal`: تابع بستن مودال
  - `confirmDelete`: تابع تأیید حذف
  - `isDeleting`: وضعیت اجرای حذف
  - `errorMessage`: پیام خطا در صورت بروز مشکل

## ویژگی‌های کلیدی
- طراحی مودال با افکت تاری (BlurModal)
- تأکید بصری روی نام فضای فایلی با فونت ضخیم
- دکمه تأیید با رنگ خطا برای نشان دادن عملیات خطرناک
- وضعیت بارگذاری در حین اجرای حذف
- غیرفعال کردن دکمه‌ها در حین اجرای عملیات
- پشتیبانی از زبان فارسی
- مدیریت خطا با لاگ در کنسول
- کد تمیز و ساختار یافته