# CreateFileSystemModal.tsx

## نمای کلی
کامپوننت `CreateFileSystemModal` یک مودال فرم است که به کاربران امکان می‌دهد یک فضای فایلی جدید ایجاد کنند. این کامپوننت شامل فیلدهای فرم با اعتبارسنجی‌های جامع و کنترل‌های ورودی سفارشی است.

## ساختار فایل و اجزاء به تفصیل

### دستورات واردات
- کامپوننت‌های Material UI: `Box`, `FormControl`, `FormHelperText`, `InputLabel`, `MenuItem`, `Select`, `TextField`, `Typography`
- `InputAdornment` از '@mui/material/InputAdornment': کامپوننت برای افزودن المان‌های جانبی به ورودی
- انواع Material UI: `SelectChangeEvent` از '@mui/material/Select'
- انواع React: `ChangeEvent`, `FormEvent` از 'react'
- هوک‌های React: `useEffect`, `useMemo`, `useState`
- آیکون‌های React: `FiAlertCircle`, `FiCheckCircle` از 'react-icons/fi'
- نوع `FileSystemEntry` از '../../@types/filesystem'
- نوع `UseCreateFileSystemReturn` از '../../hooks/useCreateFileSystem'
- تابع `removePersianCharacters` از '../../utils/text'
- کامپوننت‌های سفارشی: `BlurModal`, `ModalActionButtons`

### تعریف رابط (`CreateFileSystemModalProps`)
```ts
interface CreateFileSystemModalProps {
  controller: UseCreateFileSystemReturn;
  poolOptions: string[];
  existingFilesystems: FileSystemEntry[];
}
```
- تعریف نوع props مورد انتظار توسط کامپوننت
- `controller`: شیء حاوی وضعیت و توابع مورد نیاز از هوک useCreateFileSystem
- `poolOptions`: آرایه‌ای از گزینه‌های فضای یکپارچه برای انتخاب
- `existingFilesystems`: آرایه‌ای از فضاهای فایلی موجود برای اعتبارسنجی تکراری

### تعریف استایل ورودی
```ts
const inputBaseStyles = {
  backgroundColor: 'var(--color-input-bg)',
  borderRadius: '5px',
  color: 'var(--color-text)',
  '& fieldset': {
    borderColor: 'var(--color-input-border)',
  },
  '&:hover fieldset': {
    borderColor: 'var(--color-input-focus-border)',
  },
  '&.Mui-focused fieldset': {
    borderColor: 'var(--color-input-focus-border)',
  },
};
```
- استایل‌های یکسان برای تمام فیلدهای ورودی
- شامل رنگ‌ها، حاشیه و حالت‌های مختلف (hover، focus)

### تجزیه Props کامپوننت
```ts
const {
  controller,
  poolOptions,
  existingFilesystems,
}: CreateFileSystemModalProps
```
- تمام props ارسالی به کامپوننت را استخراج می‌کند

### تجزیه کنترلر
```ts
const {
  isOpen,
  closeCreateModal,
  handleSubmit,
  selectedPool,
  setSelectedPool,
  poolError,
  setPoolError,
  filesystemName,
  setFileSystemName,
  nameError,
  quotaAmount,
  setQuotaAmount,
  quotaError,
  apiError,
  isCreating,
  setNameError,
} = controller;
```
- تمام مقادیر و توابع مورد نیاز از کنترلر استخراج می‌شوند
- شامل وضعیت فرم، توابع مدیریتی، ارائه خطا و وضعیت ایجاد

### مدیریت وضعیت محلی
```ts
const [hasPersianName, setHasPersianName] = useState(false);
const [hasPersianQuota, setHasPersianQuota] = useState(false);
```
- وضعیت برای ردیابی وجود کاراکترهای فارسی در فیلدهای ورودی

### هوک‌های افکت برای بازنشانی وضعیت
```ts
useEffect(() => {
  if (!isOpen) {
    setHasPersianName(false);
    setHasPersianQuota(false);
  }
}, [isOpen]);

useEffect(() => {
  if (!hasPersianName) {
    return;
  }

  const timeoutId = window.setTimeout(() => {
    setHasPersianName(false);
  }, 3000);

  return () => {
    window.clearTimeout(timeoutId);
  };
}, [hasPersianName]);

useEffect(() => {
  if (!hasPersianQuota) {
    return;
  }

  const timeoutId = window.setTimeout(() => {
    setHasPersianQuota(false);
  }, 3000);

  return () => {
    window.clearTimeout(timeoutId);
  };
}, [hasPersianQuota]);
```
- بازنشانی وضعیت‌های هشدار فارسی هنگام بستن مودال
- حذف خودکار نمایش هشدار فارسی پس از 3 ثانیه

### توابع مدیریت کنترل ورودی
#### تغییر فضای یکپارچه
```ts
const handlePoolChange = (event: SelectChangeEvent<string>) => {
  if (poolError) {
    setPoolError(null);
  }
  setSelectedPool(event.target.value);
};
```
- برای پاک کردن خطای فضای یکپارچه قبلی و تنظیم مقدار جدید

#### تغییر نام فضای فایلی
```ts
const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
  const { value } = event.target;
  const sanitizedValue = removePersianCharacters(value);
  setHasPersianName(sanitizedValue !== value);
  setFileSystemName(sanitizedValue);
  if (nameError) {
    setNameError(null);
  }
};
```
- پاک‌سازی ورودی از کاراکترهای فارسی
- نمایش هشدار در صورت وجود کاراکتر فارسی
- تنظیم مقدار پاک‌شده در وضعیت

#### تغییر حجم فضای فایلی
```ts
const handleQuotaChange = (event: ChangeEvent<HTMLInputElement>) => {
  const { value } = event.target;
  const sanitizedValue = removePersianCharacters(value);
  setHasPersianQuota(sanitizedValue !== value);

  const numericOnlyValue = sanitizedValue
    .replace(/,/g, '.')
    .replace(/[^\d.]/g, '')
    .replace(/(.*\.)\./g, '$1');

  setQuotaAmount(numericOnlyValue);
};
```
- پاک‌سازی ورودی از کاراکترهای فارسی
- محدود کردن ورودی فقط به اعداد و نقاط اعشار
- جلوگیری از چندین نقطه اعشار در عدد

### اعتبارسنجی نام فضای فایلی
```ts
const normalizedFilesystemMap = useMemo(() => {
  return existingFilesystems.reduce<Record<string, Set<string>>>(
    (acc, fs) => {
      const poolKey = fs.poolName.trim().toLowerCase();
      const nameKey = fs.filesystemName.trim().toLowerCase();

      if (!poolKey || !nameKey) {
        return acc;
      }

      if (!acc[poolKey]) {
        acc[poolKey] = new Set();
      }

      acc[poolKey].add(nameKey);
      return acc;
    },
    {}
  );
}, [existingFilesystems]);

const trimmedPool = selectedPool.trim();
const trimmedName = filesystemName.trim();
const normalizedPool = trimmedPool.toLowerCase();
const isDuplicate =
  trimmedPool.length > 0 &&
  trimmedName.length > 0 &&
  normalizedFilesystemMap[normalizedPool]?.has(trimmedName.toLowerCase());
const isSameAsPool =
  trimmedPool.length > 0 &&
  trimmedName.length > 0 &&
  trimmedName.toLowerCase() === normalizedPool;
const hasOnlyEnglishAlphanumeric =
  trimmedName.length === 0 || /^[A-Za-z0-9]+$/.test(trimmedName);
const startsWithNumber =
  trimmedName.length > 0 && /^[0-9]/.test(trimmedName);
const isNameFormatValid =
  trimmedName.length === 0 || (hasOnlyEnglishAlphanumeric && !startsWithNumber);
const shouldShowSuccess =
  trimmedPool.length > 0 &&
  trimmedName.length > 0 &&
  isNameFormatValid &&
  !isDuplicate &&
  !isSameAsPool;
```
- ایجاد نگاشت فضاهای فایلی موجود برای اعتبارسنجی تکراری
- بررسی موارد مانند تکرار، نام مشابه با فضای یکپارچه، فرمت نام و شروع با عدد

### نمایش آیکون تأیید/هشدار
```ts
const adornmentIcon =
  isDuplicate || isSameAsPool ? (
    <FiAlertCircle color="var(--color-error)" size={18} />
  ) : shouldShowSuccess ? (
    <FiCheckCircle color="var(--color-success)" size={18} />
  ) : null;
```
- نمایش آیکون هشدار در صورت وجود مشکل
- نمایش آیکون موفقیت در صورت ورودی معتبر

### مدیریت ارسال فرم
```ts
const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
  if (!hasOnlyEnglishAlphanumeric && trimmedName.length > 0) {
    event.preventDefault();
    setNameError('نام فضای فایلی باید فقط شامل حروف انگلیسی و اعداد باشد.');
    return;
  }

  if (startsWithNumber) {
    event.preventDefault();
    setNameError('نام فضای فایلی نمی‌تواند با عدد شروع شود.');
    return;
  }

  if (isDuplicate) {
    event.preventDefault();
    setNameError('فضای فایلی با این نام در این فضای یکپارچه وجود دارد.');
    return;
  }

  if (isSameAsPool) {
    event.preventDefault();
    setNameError('نام فضای فایلی نمی‌تواند با نام فضای یکپارچه یکسان باشد.');
    return;
  }

  handleSubmit(event);
};
```
- جلوگیری از ارسال فرم در صورت وجود خطاهای اعتبارسنجی
- نمایش پیام‌های خطای مناسب
- فراخوانی تابع ارسال در صورت معتبر بودن ورودی

### ساختار JSX اصلی
کامپوننت شامل فرمی با موارد زیر است:

#### پیکربندی مودال
- عنوان "ایجاد فضای فایلی"
- دکمه‌های ایجاد/انصراف با وضعیت بارگذاری

#### فیلد انتخاب فضای یکپارچه
- دropdown با گزینه‌های موجود
- اعتبارسنجی و پیام خطا

#### فیلد نام فضای فایلی
- اعتبارسنجی فرمت نام
- جلوگیری از کاراکترهای فارسی
- نمایش آیکون وضعیت
- محدودیت‌های نام فضای فایلی (بدون تکرار، بدون شروع با عدد)

#### فیلد حجم فضای فایلی
- فقط ورود اعداد و نقاط اعشار
- نمایش واحد GB
- جلوگیری از کاراکترهای فارسی

## هدف و عملکرد
- ارائه فرم ایجاد فضای فایلی با اعتبارسنجی‌های جامع
- جلوگیری از نام‌های تکراری و نامناسب
- اعتبارسنجی فرمت نام (فقط انگلیسی، بدون شروع با عدد)
- جلوگیری از استفاده از کاراکترهای فارسی
- نمایش بازخورد بصری در مورد وضعیت ورودی

## Props
- `controller`: شیء حاوی وضعیت و توابع مورد نیاز از هوک useCreateFileSystem
- `poolOptions`: گزینه‌های فضای یکپارچه برای انتخاب
- `existingFilesystems`: فضاهای فایلی موجود برای اعتبارسنجی تکراری

## ویژگی‌های کلیدی
- اعتبارسنجی کامل فرمت نام فضای فایلی
- نمایش آیکون وضعیت در فیلدهای ورودی
- جلوگیری از کاراکترهای فارسی
- اعتبارسنجی تکراری نام‌ها
- فرم بازیابی‌پذیر با تمیز کردن خطاهای قبلی
- پشتیبانی از اعداد اعشاری در حجم
- استفاده از useMemo برای بهینه‌سازی عملکرد
- زبان فارسی