# DashboardLayoutPanel.tsx

## نمای کلی
کامپوننت `DashboardLayoutPanel` یک کشوی کناری است که امکان مدیریت چیدمان داشبورد را فراهم می‌کند. کاربران می‌توانند ویجت‌ها را فعال/غیرفعال کنند، گزینه‌های مختلف چیدمان را انتخاب کنند و کنترل کلی بر روی نمایش داشبورد داشته باشند.

## ساختار فایل و اجزاء به تفصیل

### دستورات واردات
- کامپوننت‌های Material UI: `Box`, `Button`, `Divider`, `Drawer`, `IconButton`, `Stack`, `Switch`, `ToggleButton`, `ToggleButtonGroup`, `Tooltip`, `Typography`
- آیکون‌های Material UI از 'react-icons/md': `MdClose`, `MdLayers`, `MdOutlineLayersClear`, `MdOutlineSettingsBackupRestore`

### تعریف رابط (`DashboardLayoutPanelOption`)
```ts
export interface DashboardLayoutPanelOption {
  id: string;
  label: string;
  description?: string;
  isDefault?: boolean;
}
```
- تعریف ساختار یک گزینه چیدمان ویجت
- `id`: شناسه منحصر به فرد برای گزینه
- `label`: برچسب قابل نمایش برای گزینه
- `description`: توضیحات اختیاری برای گزینه
- `isDefault`: نشان می‌دهد آیا این گزینه چیدمان پیش‌فرض است یا خیر

### تعریف رابط (`DashboardLayoutPanelWidget`)
```ts
export interface DashboardLayoutPanelWidget {
  id: string;
  title: string;
  description?: string;
  options: DashboardLayoutPanelOption[];
  activeOptionId: string;
  hidden: boolean;
}
```
- تعریف ساختار یک ویجت در داشبورد
- `id`: شناسه منحصر به فرد برای ویجت
- `title`: عنوان ویجت
- `description`: توضیحات اختیاری برای ویجت
- `options`: آرایه‌ای از گزینه‌های چیدمان موجود برای ویجت
- `activeOptionId`: شناسه گزینه چیدمان فعال فعلی
- `hidden`: نشان می‌دهد آیا ویجت در حال حاضر پنهان است یا خیر

### تعریف رابط (`DashboardLayoutPanelProps`)
```ts
interface DashboardLayoutPanelProps {
  open: boolean;
  widgets: DashboardLayoutPanelWidget[];
  onClose: () => void;
  onToggleWidget: (widgetId: string) => void;
  onSelectLayout: (widgetId: string, optionId: string) => void;
  onHideAll: () => void;
  onShowAll: () => void;
  onReset: () => void;
  isDirty: boolean;
}
```
- تعریف نوع props مورد انتظار توسط کامپوننت
- `open`: نشان می‌دهد که آیا کشو باز است یا خیر
- `widgets`: آرایه‌ای از ویجت‌های قابل مدیریت در داشبورد
- `onClose`: تابع کال‌بک برای بستن کشو
- `onToggleWidget`: تابع کال‌بک برای فعال/غیرفعال کردن یک ویجت
- `onSelectLayout`: تابع کال‌بک برای انتخاب یک چیدمان خاص برای ویجت
- `onHideAll`: تابع کال‌بک برای مخفی کردن همه ویجت‌ها
- `onShowAll`: تابع کال‌بک برای نمایش همه ویجت‌ها
- `onReset`: تابع کال‌بک برای بازگرداندن چیدمان به حالت پیش‌فرض
- `isDirty`: نشان می‌دهد که آیا چیدمان با تغییراتی متفاوت از حالت پیش‌فرض است یا خیر

### تجزیه Props کامپوننت
```ts
const {
  open,
  widgets,
  onClose,
  onToggleWidget,
  onSelectLayout,
  onHideAll,
  onShowAll,
  onReset,
  isDirty,
}: DashboardLayoutPanelProps
```
- تمام props ارسالی به کامپوننت را استخراج می‌کند

### ساختار JSX اصلی
کامپوننت یک کامپوننت `Drawer` از Material UI رندر می‌کند که شامل بخش‌های زیر است:

#### سرصفحه کشو
- عنوان "مدیریت چیدمان داشبورد" با فونت Vazir
- دکمه بستن با آیکون `MdClose`

#### بدنه اصلی کشو
- دستورالعمل کاربر به زبان فارسی
- لیست ویجت‌ها که هر کدام شامل:
  - عنوان و توضیحات ویجت
  - سوییچ فعال/غیرفعال برای مخفی/نمایش ویجت
  - گروه دکمه‌های تغییر وضعیت برای انتخاب چیدمان (در صورت وجود چند گزینه)

#### پایینه کشو
- دکمه "مخفی کردن همه" با آیکون `MdOutlineLayersClear`
- دکمه "نمایش همه" با آیکون `MdLayers`
- دکمه "بازگردانی چیدمان پیش‌فرض" با آیکون `MdOutlineSettingsBackupRestore` که در صورت عدم تغییر در چیدمان غیرفعال است

### منطق نمایش گزینه‌های چیدمان
```ts
const hasMultipleOptions = widget.options.length > 1;
```
- تعیین می‌کند آیا برای یک ویجت بیش از یک گزینه چیدمان وجود دارد یا خیر
- گروه دکمه‌های تغییر وضعیت تنها در صورت وجود چندین گزینه نمایش داده می‌شود

### مدیریت انتخاب چیدمان
```ts
onChange={(_, optionId: string | null) => {
  if (!optionId) return;
  onSelectLayout(widget.id, optionId);
}}
```
- تابعی برای مدیریت تغییر چیدمان ویجت
- پیش از فراخوانی کال‌بک، اطمینان حاصل می‌کند که optionId تهی نیست

### مدیریت سوییچ ویجت
```ts
checked={!widget.hidden}
onChange={() => onToggleWidget(widget.id)}
```
- وضعیت سوییچ مطابق با وضعیت مخفی بودن ویجت است
- در صورت تغییر وضعیت، کال‌بک مربوطه فراخوانی می‌شود

## هدف و عملکرد
- ارائه یک رابط کاربری برای مدیریت چیدمان داشبورد
- امکان مخفی/نمایش هر ویجت به طور جداگانه
- امکان انتخاب چیدمان متفاوت برای هر ویجت
- نمایش توضیحات ویجت و گزینه‌های چیدمان
- امکان مدیریت چیدمان به صورت گروهی (همه مخفی/نمایش)
- امکان بازگشت به چیدمان پیش‌فرض

## Props
- `open`: نشان می‌دهد که آیا کشو باز است یا خیر
- `widgets`: آرایه‌ای از ویجت‌های قابل مدیریت
- `onClose`: کال‌بک برای بستن کشو
- `onToggleWidget`: کال‌بک برای فعال/غیرفعال کردن ویجت
- `onSelectLayout`: کال‌بک برای انتخاب چیدمان ویجت
- `onHideAll`: کال‌بک برای مخفی کردن همه ویجت‌ها
- `onShowAll`: کال‌بک برای نمایش همه ویجت‌ها
- `onReset`: کال‌بک برای بازگرداندن چیدمان پیش‌فرض
- `isDirty`: نشان می‌دهد که آیا چیدمان تغییر کرده است یا خیر

## ویژگی‌های کلیدی
- طراحی واکنش‌گرا با عرض متفاوت برای موبایل و دسکتاپ
- پشتیبانی از زبان فارسی و فونت Vazir
- وضعیت‌بندی واضح برای گزینه‌های پیش‌فرض
- اسکرول اتوماتیک برای لیست ویجت‌های طولانی
- مدیریت گروهی ویجت‌ها
- نمایش وضعیت تغییرات در چیدمان
- امکان بازگشت به حالت پیش‌فرض
- رابط کاربری کاربرپسند با راهنما و نکات