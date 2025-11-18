# ResponsiveChartContainer.tsx

## نمای کلی
کامپوننت `ResponsiveChartContainer` یک کانتینر واکنش‌گرا برای کامپوننت‌های نمودار فراهم می‌کند، به طور خودکار عرض آن را بر اساس اندازه کانتینر تنظیم می‌کند. این کامپوننت از API ResizeObserver برای نظارت بر تغییرات اندازه و ارائه عرض مناسب به کامپوننت‌های نمودار فرزند استفاده می‌کند.

## ساختار فایل و اجزاء به تفصیل

### دستورات واردات
- `Box` از '@mui/material': کامپوننت کانتینر Material UI برای چیدمان
- هوک‌های React: `useEffect` برای اثرات جانبی، `useRef` برای مراجع DOM، `useState` برای مدیریت وضعیت
- نوع `ReactNode` از 'react': نوع برای فرزندان React

### تعریف نوع (`ResponsiveChartContainerProps`)
```ts
export type ResponsiveChartContainerProps = {
  height: number;
  children: (width: number) => ReactNode;
};
```
- نوع props مورد انتظار توسط کامپوننت را تعریف می‌کند
- `height`: عدد الزامی که ارتفاع ثابت کانتینر را مشخص می‌کند
- `children`: تابعی که عرض محاسبه شده را دریافت می‌کند و فرزندان ReactNode را برمی‌گرداند

### تجزیه Props کامپوننت
```ts
const {
  height,
  children,
}: ResponsiveChartContainerProps
```
- props ارتفاع و فرزندان را از خصوصیات کامپوننت استخراج می‌کند

### مقداردهی اولیه وضعیت و مرجع
```ts
const containerRef = useRef<HTMLDivElement | null>(null);
const [width, setWidth] = useState(0);
```
- `containerRef`: مرجعی به عنصر DOM کانتینر برای ResizeObserver
- `width`: متغیر وضعیت برای ردیابی عرض فعلی کانتینر (با مقدار 0 مقداردهی اولیه می‌شود)

### هوک useEffect برای تغییر اندازه
```ts
useEffect(() => {
  const element = containerRef.current;
  if (!element) {
    return;
  }

  const updateWidth = () => {
    setWidth(element.getBoundingClientRect().width);
  };

  if (typeof ResizeObserver === 'undefined') {
    updateWidth();
    return;
  }

  const observer = new ResizeObserver((entries) => {
    const entry = entries[0];
    if (entry) {
      setWidth(entry.contentRect.width);
    }
  });

  observer.observe(element);
  updateWidth();

  return () => {
    observer.disconnect();
  };
}, []);
```
- فقط یک بار هنگام نصب کامپوننت اجرا می‌شود (آرایه وابستگی خالی)
- عنصر DOM کانتینر را از مرجع دریافت می‌کند
- تابع updateWidth را تعریف می‌کند تا اندازه‌گیری و به‌روزرسانی عرض را انجام دهد
- در صورت در دسترس نبودن ResizeObserver به getBoundingClientRect برمی‌گردد
- یک ResizeObserver برای ردیابی تغییرات اندازه ایجاد می‌کند
- عنصر کانتینر را برای تغییرات اندازه مشاهده می‌کند
- عرض را بلافاصله به‌روز می‌کند تا اندازه اولیه را دریافت کند
- یک تابع تمیزکاری برای قطع اتصال مشاهده‌گر برمی‌گرداند

### ساختار بازگشت JSX
```ts
return (
  <Box
    ref={containerRef}
    sx={{
      width: '100%',
      minHeight: height,
    }}
  >
    {width > 0 && children(width)}
  </Box>
);
```
- یک کامپوننت Box با یک مرجع به کانتینر رندر می‌کند
- عرض را روی 100% تنظیم می‌کند تا فضای در دسترس را پر کند
- حداقل ارتفاع را روی ویژگی ارتفاع مشخص شده تنظیم می‌کند
- فرزندان را فقط به صورت شرطی هنگامی که عرض > 0 است رندر می‌کند تا از رندر قبل از اندازه‌گیری جلوگیری کند
- عرض اندازه‌گیری شده را به تابع رندر فرزندان ارسال می‌کند

## هدف و عملکرد
- یک کانتینر واکنش‌گرا ایجاد می‌کند که با عرض والد خود سازگار می‌شود
- از ResizeObserver برای ردیابی کارآمد تغییرات اندازه استفاده می‌کند
- عرض فعلی را به کامپوننت‌های نمودار فرزند از طریق یک تابع رندر ارائه می‌دهد
- اطمینان حاصل می‌کند که نمودارها فقط زمانی رندر می‌شوند که ابعاد در دسترس باشند
- یک ارتفاع ثابت را حفظ می‌کند در حالی که اجازه می‌دهد عرض واکنش‌گرا باشد

## Props
- `height`: عددی که ارتفاع ثابت کانتینر را مشخص می‌کند
- `children`: تابعی که عرض محاسبه شده را دریافت می‌کند و فرزندان ReactNode را برمی‌گرداند

## ویژگی‌های کلیدی
- محاسبه عرض واکنش‌گرا با استفاده از ResizeObserver
- ردیابی کارآمد اندازه بدون نمونه‌گیری مداوم
- کاهش شایسته هنگام در دسترس نبودن ResizeObserver
- رندر شرطی برای جلوگیری از رندر قبل از در دسترس بودن ابعاد
- تمیزکاری مناسب برای جلوگیری از نشت حافظه
- سازگار با هر کامپوننت نموداری که عرض را به عنوان یک ویژگی می‌پذیرد
- تایپ‌نویسی صحیح TypeScript

## الگوهای استفاده
- هر کامپوننت نموداری که به عرض واکنش‌گرا نیاز دارد را بپوشانید
- یک تابع را به عنوان فرزندان ارسال کنید که عرض را دریافت می‌کند و یک کامپوننت نمودار را برمی‌گرداند
- ارتفاع ثابت مورد نظر برای کانتینر را مشخص کنید
- کامپوننت نمودار داخلی عرض محاسبه شده را به عنوان یک پارامتر دریافت خواهد کرد

## مثال استفاده
```ts
<ResponsiveChartContainer height={300}>
  {(width) => <BarChart width={width} height={300} {...otherProps} />}
</ResponsiveChartContainer>
```