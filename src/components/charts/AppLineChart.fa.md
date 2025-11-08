# AppLineChart.tsx

## نمای کلی
کامپوننت `AppLineChart` یک پوشش برای کامپوننت LineChart از Material UI X است که برای ارائه استایل و پیکربندی پیش‌فرض برای نمودارهای خطی در برنامه طراحی شده است. این کامپوننت عملکرد پایه LineChart را با خصوصیات و گزینه‌های سفارشی استایل گسترش می‌دهد.

## ساختار فایل و اجزاء به تفصیل

### دستورات واردات
- `LineChart` و `LineChartProps` از '@mui/x-charts/LineChart': کامپوننت نمودار خطی پایه از Material UI
- `mergeChartSlotProps` از './chartStyles': تابع ابزارکاری برای ادغام خصوصیات شکاف نمودار با استایل‌های پیش‌فرض

### تعریف نوع (`AppLineChartProps`)
```ts
export type AppLineChartProps = LineChartProps & {
  disableDefaultLegend?: boolean;
};
```
- استاندارد LineChartProps را با یک گزینه اضافی گسترش می‌دهد
- `disableDefaultLegend`: بولین اختیاری برای کنترل نمایش قانونچه پیش‌فرض (به طور پیش‌فرض نادرست است)

### تجزیه Props کامپوننت
```ts
const {
  slotProps,
  disableDefaultLegend = false,
  ...rest
}: AppLineChartProps
```
- props slotProps و disableDefaultLegend را استخراج می‌کند
- disableDefaultLegend را به طور پیش‌فرض به نادرست تنظیم می‌کند
- از rest برای ضبط تمام props دیگر برای ارسال به کامپوننت LineChart استفاده می‌کند

### ادغام خصوصیات شکاف
```ts
const mergedSlotProps = mergeChartSlotProps<LineChartProps['slotProps']>(slotProps, {
  includeLegend: !disableDefaultLegend,
}) as LineChartProps['slotProps'];
```
- props شکاف سفارشی را با استایل نمودار پیش‌فرض ادغام می‌کند
- تصمیم می‌گیرد که قانونچه را بر اساس ویژگی disableDefaultLegend وارد کند یا خیر
- از تأیید نوع برای حفظ تایپ صحیح استفاده می‌کند

### بازگشت JSX
```ts
return <LineChart {...rest} slotProps={mergedSlotProps} />;
```
- کامپوننت LineChart را با تمام props ارسال شده رندر می‌کند
- خصوصیات شکاف ادغام شده را که شامل استایل پیش‌فرض است اعمال می‌کند

## هدف و عملکرد
- کامپوننت Material UI X LineChart را با استایل پیش‌فرض پوشش می‌دهد
- یک گزینه برای غیرفعال کردن قانونچه پیش‌فرض فراهم می‌کند
- به طور خودکار استایل و تم ثابتی را در سراسر برنامه اعمال می‌کند
- خصوصیات سفارشی را با خصوصیات نمودار پیش‌فرض با استفاده از `mergeChartSlotProps` ادغام می‌کند
- API کامل کامپوننت اصلی LineChart را حفظ می‌کند در حالی که ویژگی‌های راحت را اضافه می‌کند

## Props
- `disableDefaultLegend`: بولین اختیاری برای کنترل دیده شدن قانونچه (به طور پیش‌فرض نادرست است)
- تمام props استاندارد `LineChartProps` به کامپوننت LineChart درونی منتقل می‌شوند

## ویژگی‌های کلیدی
- استایل و تم پیش‌فرض به طور خودکار اعمال می‌شود
- گزینه تغییر وضعیت دیده شدن قانونچه
- با سایر کامپوننت‌های نمودار در برنامه سازگار است
- سازگاری با تمام خصوصیات اصلی LineChart را حفظ می‌کند
- پشتیبانی RTL از طریق استایل‌های ادغام شده از chartStyles
- تایپ‌نویسی صحیح TypeScript

## الگوهای استفاده
- هنگامی که به یک نمودار خطی با استایل پیش‌فرض برنامه نیاز دارید استفاده کنید
- هنگامی که می‌خواهید قانونچه را مخفی کنید از `disableDefaultLegend={true}` استفاده کنید
- هر props استاندارد LineChart را برای داده، پیکربندی و غیره ارسال کنید