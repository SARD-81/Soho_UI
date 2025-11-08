# DetailComparisonPanel.tsx

## نمای کلی
کامپوننت `DetailComparisonPanel` یک پنل مقایسه برای نمایش و مقایسه ویژگی‌های جزئیات چندین مورد ایجاد می‌کند. یک چیدمان مبتنی بر گرید ارائه می‌دهد که به کاربران امکان می‌دهد مقادیر را در کنار هم مقایسه کنند، با پشتیبانی از حالات وضعیت مختلف (بارگذاری، خطا، خالی، اطلاعات) و عملکرد اختیاری حذف ستون.

## ساختار فایل و اجزاء به تفصیل

### دستورات واردات
- کامپوننت‌های Material UI: `Box`, `CircularProgress`, `IconButton`, `Typography`, `useTheme`
- `alpha` از '@mui/material/styles': تابعی برای ایجاد متغیرهای رنگ شفاف
- `MdClose` از 'react-icons/md': آیکون بستن برای حذف ستون
- نوع `ReactNode` از 'react': نوع برای فرزندان React

### تعریف نوع (`DetailComparisonStatus`)
```ts
export type DetailComparisonStatus =
  | { type: 'loading'; message?: string }
  | { type: 'error'; message: string }
  | { type: 'empty'; message: string }
  | { type: 'info'; message: string };
```
- نوع اتحادی برای حالات وضعیت مختلف در پنل مقایسه
- از حالت بارگذاری با پیام اختیاری پشتیبانی می‌کند
- از حالت خطا با پیام الزامی پشتیبانی می‌کند
- از حالت خالی با پیام الزامی پشتیبانی می‌کند
- از حالت اطلاعات با پیام الزامی پشتیبانی می‌کند

### تعریف رابط (`DetailComparisonColumn`)
```ts
export interface DetailComparisonColumn {
  id: string;
  title: string;
  onRemove?: () => void;
  values: Record<string, unknown>;
  status?: DetailComparisonStatus;
}
```
- ساختار هر ستون در پنل مقایسه را تعریف می‌کند
- `id`: شناسه منحصر به فرد برای ستون
- `title`: عنوان نمایشی برای ستون
- `onRemove`: کال‌بک اختیاری برای حذف ستون
- `values`: رکورد نگاشت کلیدهای ویژگی به مقادیر آنها
- `status`: حالت وضعیت اختیاری برای ستون

### تعریف رابط (`DetailComparisonPanelProps`)
```ts
interface DetailComparisonPanelProps {
  title: string;
  attributeLabel: string;
  columns: DetailComparisonColumn[];
  formatValue: (value: unknown) => ReactNode;
  emptyStateMessage: string;
  attributeSort?: (a: string, b: string) => number;
}
```
- نوع props مورد انتظار توسط کامپوننت را تعریف می‌کند
- `title`: عنوان اصلی برای پنل مقایسه
- `attributeLabel`: برچسب برای ستون ویژگی (اولین ستون)
- `columns`: آرایه‌ای از ستون‌هایی که باید در مقایسه نمایش داده شوند
- `formatValue`: تابعی برای قالب‌بندی مقادیر برای نمایش
- `emptyStateMessage`: پیامی که هنگامی که ویژگی‌ای برای نمایش وجود ندارد نمایش داده می‌شود
- `attributeSort`: تابع اختیاری برای مرتب‌سازی کلیدهای ویژگی

### تجزیه Props کامپوننت
```ts
const {
  title,
  attributeLabel,
  columns,
  formatValue,
  emptyStateMessage,
  attributeSort,
}: DetailComparisonPanelProps
```
- تمام props ارسالی به کامپوننت را استخراج می‌کند

### دسترسی به تم
```ts
const theme = useTheme();
```
- تم فعلی را برای استایل‌دهی دریافت می‌کند

### بازگشت زودهنگام برای ستون‌های خالی
```ts
if (!columns.length) {
  return null;
}
```
- در صورتی که هیچ ستونی ارائه نشود، null برمی‌گرداند

### منطق محدود کردن ستون
```ts
const visibleColumns =
  columns.length > 4 ? columns.slice(-4) : columns;
```
- تعداد ستون‌های قابل مشاهده را به حداکثر 4 محدود می‌کند
- اگر بیش از 4 عدد باشند، 4 عدد آخر را نمایش می‌دهد

### جمع‌آوری و مرتب‌سازی کلیدهای ویژگی
```ts
const attributeKeys = Array.from(
  visibleColumns.reduce((acc, column) => {
    Object.keys(column.values ?? {}).forEach((key) => acc.add(key));
    return acc;
  }, new Set<string>())
).sort((a, b) => {
  if (attributeSort) {
    return attributeSort(a, b);
  }

  return a.localeCompare(b, 'fa-IR');
});
```
- تمام کلیدهای ویژگی منحصر به فرد را از ستون‌های قابل مشاهده جمع‌آوری می‌کند
- کلیدها را با استفاده از تابع مرتب‌سازی سفارشی یا مقایسه مکانی فارسی مرتب می‌کند

### تعیین نوع ردیف
```ts
const hasStatuses = visibleColumns.some((column) => column.status);
const hasAttributes = attributeKeys.length > 0;

const rows: Array<{ type: 'status' | 'attribute'; key: string; label: string }> = [];

if (hasStatuses) {
  rows.push({ type: 'status', key: '__status__', label: 'وضعیت' });
}

if (hasAttributes) {
  attributeKeys.forEach((key) => {
    rows.push({ type: 'attribute', key, label: key });
  });
}
```
- تعیین می‌کند که آیا هر ستونی وضعیت دارد تا یک ردیف وضعیت نشان داده شود
- آرایه ردیف‌ها را با اطلاعات نوع مناسب ایجاد می‌کند
- اگر هر ستونی وضعیت داشت، ردیف وضعیت اضافه می‌کند
- برای هر کلید ویژگی، ردیف ویژگی اضافه می‌کند

### محاسبات گرید و استایل
```ts
const gridColumns = `repeat(${visibleColumns.length + 1}, minmax(200px, 1fr))`;
const headerGradient =
  theme.palette.mode === 'dark'
    ? `linear-gradient(135deg, ${alpha('#00c6a9', 0.3)} 0%, ${alpha('#1fb6ff', 0.2)} 100%)`
    : `linear-gradient(135deg, ${alpha('#00c6a9', 0.12)} 0%, ${alpha('#1fb6ff', 0.1)} 100%)`;
const borderColor = alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.4 : 0.25);
const backgroundColor = alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.9 : 1);
const selectedRowHover = alpha(theme.palette.primary.main, 0.08);
```
- قالب ستون گرید را برای چیدمان مناسب محاسبه می‌کند
- گرادیانتی برای سرصفحه بر اساس حالت تم ایجاد می‌کند
- انواع رنگ‌های مختلف با شفافیت آلفا بر اساس تم محاسبه می‌کند

### ساختار بازگشت JSX
کامپوننت یک پنل مقایسه گرید-مبنا پیچیده را رندر می‌کند که شامل موارد زیر است:
- کانتینر اصلی پنل با عنوان
- ردیف سرصفحه با برچسب ویژگی و عناوین ستون
- دکمه‌های حذف اختیاری برای هر ستون
- ردیف‌های داده حاوی مقادیر ویژگی یا نشانگرهای وضعیت
- منطق رندر متفاوت برای ردیف‌های وضعیت در برابر ردیف‌های ویژگی
- پشتیبانی از جهت متن فارسی
- استایل پاسخگو با افکت‌های فلور
- پشتیبانی از حالت‌های بارگذاری، خطا و خالی

## هدف و عملکرد
- نمایش یک پنل مقایسه برای ویژگی‌های چندین مورد
- پشتیبانی از حداکثر 4 ستون برای حفظ خوانایی
- ارائه نشانگرهای وضعیت (بارگذاری، خطا، خالی، اطلاعات) برای هر ستون
- امکان حذف ستون‌ها هنگامی که کال‌بک onRemove ارائه شود
- قالب‌بندی مقادیر با استفاده از یک تابع قالب‌بندی سفارشی
- پشتیبانی از مکان فارسی برای نمایش و مرتب‌سازی متن
- طراحی پاسخگو با افکت‌های فلور و استایل‌دهی مناسب

## Props
- `title`: عنوان اصلی برای پنل مقایسه
- `attributeLabel`: برچسب برای ستون ویژگی
- `columns`: آرایه‌ای از ستون‌های مقایسه
- `formatValue`: تابعی برای قالب‌بندی مقادیر برای نمایش
- `emptyStateMessage`: پیامی که هنگامی که داده‌ای موجود نیست نمایش داده می‌شود
- `attributeSort`: تابع اختیاری برای سفارشی کردن مرتب‌سازی ویژگی

## ویژگی‌های کلیدی
- چیدمان مقایسه مبتنی بر گرید
- پشتیبانی از حالت وضعیت (بارگذاری، خطا، خالی، اطلاعات)
- عملکرد حذف ستون
- محدود کردن خودکار ستون (حداکثر 4 عدد)
- پشتیبانی از مکان فارسی
- استایل‌دهی آگاه از تم
- افکت‌های فلور و طراحی پاسخگو
- ویژگی‌های دسترسی مناسب
- پیاده‌سازی ایمن از نظر نوع