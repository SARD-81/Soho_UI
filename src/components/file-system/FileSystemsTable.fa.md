# FileSystemsTable.tsx

## نمای کلی
کامپوننت `FileSystemsTable` یک جدول داده است که اطلاعات فضاهای فایلی موجود را نمایش می‌دهد. این کامپوننت از کامپوننت عمومی DataTable استفاده می‌کند و شامل ستون‌های مختلفی با امکان حذف فضاهای فایلی است.

## ساختار فایل و اجزاء به تفصیل

### دستورات واردات
- کامپوننت‌های Material UI: `Box`, `CircularProgress`, `IconButton`, `Tooltip`, `Typography`
- هوک `useMemo` از 'react': برای بهینه‌سازی محاسبات ستون‌ها
- `MdDeleteOutline` از 'react-icons/md': آیکون حذف
- نوع `DataTableColumn` از '../../@types/dataTable'
- نوع `FileSystemEntry` از '../../@types/filesystem'
- کامپوننت `DataTable` از '../DataTable'

### تعریف رابط (`FileSystemsTableProps`)
```ts
interface FileSystemsTableProps {
  filesystems: FileSystemEntry[];
  attributeKeys: string[];
  isLoading: boolean;
  error: Error | null;
  onDeleteFilesystem: (filesystem: FileSystemEntry) => void;
  isDeleteDisabled: boolean;
}
```
- تعریف نوع props مورد انتظار توسط کامپوننت
- `filesystems`: آرایه‌ای از فضاهای فایلی برای نمایش
- `attributeKeys`: کلیدهای ویژگی برای ستون‌های پویا (در حال حاضر غیرفعال)
- `isLoading`: نشان می‌دهد که آیا داده‌ها در حال بارگذاری هستند یا خیر
- `error`: شیء خطا در صورت بروز مشکل، در غیر اینصورت null
- `onDeleteFilesystem`: تابع کال‌بک برای حذف یک فضای فایلی
- `isDeleteDisabled`: نشان می‌دهد که آیا عملیات حذف غیرفعال است یا خیر

### تجزیه Props کامپوننت
```ts
const {
  filesystems,
  attributeKeys,
  isLoading,
  error,
  onDeleteFilesystem,
  isDeleteDisabled,
}: FileSystemsTableProps
```
- تمام props ارسالی به کامپوننت را استخراج می‌کند

### تابع کمکی برای دریافت مقدار ویژگی
```ts
const getAttributeValue = (filesystem: FileSystemEntry, key: string) =>
  filesystem.attributeMap?.[key] ?? '—';
```
- یک تابع کمکی برای دریافت مقدار یک کلید از attributeMap
- در صورت عدم وجود مقدار، نماد '—' را برمی‌گرداند

### محاسبه ستون‌ها با useMemo
```ts
const columns = useMemo<DataTableColumn<FileSystemEntry>[]>(() => {
  // تعریف ستون‌ها
}, [attributeKeys, isDeleteDisabled, onDeleteFilesystem]);
```
- استفاده از useMemo برای بهینه‌سازی محاسبه ستون‌ها
- وابستگی به attributeKeys، isDeleteDisabled و onDeleteFilesystem

### ستون‌های اصلی جدول
#### ستون نام فضای فایلی
```ts
{
  id: 'filesystem',
  header: 'نام فضای فایلی',
  align: 'left',
  renderCell: (filesystem) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
      <Typography sx={{ fontWeight: 700, color: 'var(--color-text)' }}>
        {filesystem.filesystemName}
      </Typography>
    </Box>
  ),
}
```
- نمایش نام فضای فایلی با فونت ضخیم

#### ستون mountpoint
```ts
{
  id: 'mountpoint',
  header: 'mountpoint',
  align: 'left',
  renderCell: (filesystem) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
      <Typography sx={{ fontWeight: 700, color: 'var(--color-text)' }}>
        {filesystem.mountpoint}
      </Typography>
    </Box>
  ),
}
```
- نمایش محل mount فضای فایلی

#### ستون فضای استفاده‌شده
```ts
{
  id: 'used',
  header: 'فضای استفاده‌شده',
  align: 'left',
  renderCell: (filesystem) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
      <Typography sx={{ fontWeight: 700, color: 'var(--color-text)' }}>
        {getAttributeValue(filesystem, 'Used')}
      </Typography>
    </Box>
  ),
}
```
- نمایش مقدار فضای استفاده شده از attributeMap

#### ستون فضای در دسترس
```ts
{
  id: 'available',
  header: 'فضای در دسترس',
  align: 'left',
  renderCell: (filesystem) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
      <Typography sx={{ fontWeight: 700, color: 'var(--color-text)' }}>
        {getAttributeValue(filesystem, 'Available')}
      </Typography>
    </Box>
  ),
}
```
- نمایش مقدار فضای در دسترس از attributeMap

#### ستون فضای ارجاع‌شده
```ts
{
  id: 'referenced',
  header: 'فضای ارجاع‌شده',
  align: 'left',
  renderCell: (filesystem) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
      <Typography sx={{ fontWeight: 700, color: 'var(--color-text)' }}>
        {getAttributeValue(filesystem, 'Referenced')}
      </Typography>
    </Box>
  ),
}
```
- نمایش مقدار فضای ارجاع شده از attributeMap

#### ستون عملیات
```ts
const actionColumn: DataTableColumn<FileSystemEntry> = {
  id: 'actions',
  header: 'عملیات',
  align: 'center',
  renderCell: (filesystem) => (
    <Tooltip title="حذف فضای فایلی">
      <span>
        <IconButton
          size="small"
          color="error"
          onClick={() => onDeleteFilesystem(filesystem)}
          disabled={isDeleteDisabled}
        >
          <MdDeleteOutline size={18} />
        </IconButton>
      </span>
    </Tooltip>
  ),
};
```
- دکمه حذف برای هر فضای فایلی
- نمایش راهنما با عنوان "حذف فضای فایلی"
- غیرفعال شدن در صورت isDeleteDisabled=true

### ساختار JSX اصلی
کامپوننت یک کامپوننت `DataTable` رندر می‌کند که شامل موارد زیر است:

#### پیکربندی جدول
- ستون‌ها با استفاده از متغیر columns
- داده‌ها از filesystems
- تابع getRowId برای تشخیص ردیف‌ها
- وضعیت بارگذاری و خطا

#### حالت بارگذاری
- نمایش نماد چرخ بارگذاری
- پیام "در حال دریافت اطلاعات فضا های فایلی ..." به زبان فارسی

#### حالت خطا
- نمایش پیام خطا به همراه متن اصلی خطا
- رنگ قرمز برای نمایش خطا

#### حالت خالی
- پیام "هیچ فضای فایلیی برای نمایش وجود ندارد." به زبان فارسی

## هدف و عملکرد
- نمایش لیست فضاهای فایلی در یک جدول ساختاریافته
- ارائه اطلاعات اصلی مانند نام فضای فایلی، mountpoint، فضاهای استفاده شده/در دسترس/ارجاع شده
- امکان حذف فضاهای فایلی از طریق دکمه حذف
- مدیریت حالت‌های بارگذاری، خطا و خالی

## Props
- `filesystems`: آرایه‌ای از فضاهای فایلی برای نمایش در جدول
- `attributeKeys`: کلیدهای ویژگی برای ستون‌های پویا (در حال حاضر غیرفعال)
- `isLoading`: نشان می‌دهد که آیا داده‌ها در حال بارگذاری هستند
- `error`: شیء خطا در صورت بروز مشکل
- `onDeleteFilesystem`: تابع برای حذف یک فضای فایلی
- `isDeleteDisabled`: نشان می‌دهد که آیا عملیات حذف باید غیرفعال شود

## ویژگی‌های کلیدی
- استفاده از کامپوننت عمومی DataTable برای ساختار جدول
- بهینه‌سازی با استفاده از useMemo برای محاسبه ستون‌ها
- نمایش اطلاعات فضاهای فایلی به صورت ساختاریافته
- پشتیبانی از حالت‌های مختلف (بارگذاری، خطا، خالی)
- دکمه حذف با امکان غیرفعال شدن شرطی
- پشتیبانی از زبان فارسی
- استایل‌دهی با استفاده از متغیرهای CSS
- کد تمیز و ساختار یافته