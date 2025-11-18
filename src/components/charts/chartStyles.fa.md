# chartStyles.ts

## نمای کلی
ماژول `chartStyles` توابع ابزارکاری و پیکربندی‌های استایل پیش‌فرض را برای تمام کامپوننت‌های نمودار در برنامه فراهم می‌کند. این ماژول شامل توابع کمکی برای ادغام خصوصیات نمودار، استایل پیش‌فرض برای راهنمای‌ها و قانونچه‌ها و تم ثابت در انواع مختلف نمودار است.

## ساختار فایل و اجزاء به تفصیل

### تابع محافظ نوع (`isRecord`)
```ts
const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);
```
- محافظ نوع برای بررسی اینکه آیا یک مقدار یک شیء ساده (رکورد) است یا خیر
- فقط زمانی درست برمی‌گرداند که مقدار یک شیء غیر تهی باشد و آرایه نباشد
- در تابع mergeRecords برای تعیین اینکه آیا اشیاء باید بازگشتی ادغام شوند استفاده می‌شود

### تابع ادغام شیء (`mergeRecords`)
```ts
const mergeRecords = (
  base: Record<string, unknown>,
  override?: Record<string, unknown>
): Record<string, unknown> => {
  if (!override) {
    return { ...base };
  }

  const result: Record<string, unknown> = { ...base };

  Object.entries(override).forEach(([key, value]) => {
    const baseValue = result[key];

    if (isRecord(baseValue) && isRecord(value)) {
      result[key] = mergeRecords(baseValue, value);
    } else if (value !== undefined) {
      result[key] = value;
    }
  });

  return result;
};
```
- به صورت عمیق دو شیء رکورد را ادغام می‌کند
- اگر ارزش دهی نبود، یک کپی از پایه را برمی‌گرداند
- اشیاء تودرتو را به صورت بازگشتی ادغام می‌کند زمانی که هر دو مقدار رکورد باشند
- در غیر این صورت، مقدار پایه را با مقدار ارزش دهی جایگزین می‌کند
- خصوصیات پایه که ارزش دهی نشده‌اند را حفظ می‌کند

### استایل راهنمای پیش‌فرض (`tooltipSx`)
```ts
const tooltipSx: Record<string, unknown> = {
  direction: 'rtl',
  '& .MuiChartsTooltip-table': {
    direction: 'rtl',
    color: 'var(--color-text)',
    fontFamily: 'var(--font-vazir)',
  },
  '& .MuiChartsTooltip-cell': {
    color: 'var(--color-text)',
    fontFamily: 'var(--font-vazir)',
  },
  '& .MuiChartsTooltip-label': {
    color: 'var(--color-text)',
    fontFamily: 'var(--font-vazir)',
  },
  '& .MuiChartsTooltip-value': {
    color: 'var(--color-text)',
    fontFamily: 'var(--font-vazir)',
  },
};
```
- استایل پیش‌فرض را برای راهنمای نمودار تعریف می‌کند
- جهت RTL را برای نمایش صحیح متن فارسی تنظیم می‌کند
- از متغیرهای CSS برای تم ثابت استفاده می‌کند (رنگ متن و فونت وزیر)
- استایل را به تمام عناصر راهنما اعمال می‌کند (جدول، سلول، برچسب، مقدار)

### استایل قانونچه پیش‌فرض (`legendSx`)
```ts
const legendSx: Record<string, unknown> = {
  color: 'var(--color-text)',
  fontFamily: 'var(--font-vazir)',
};
```
- استایل پیش‌فرض را برای قانونچه نمودار تعریف می‌کند
- از متغیرهای CSS برای تم ثابت استفاده می‌کند (رنگ متن و فونت وزیر)

### پیکربندی موقعیت قانونچه (`legendPosition`)
```ts
const legendPosition = {
  vertical: 'top' as const,
  horizontal: 'center' as const,
};
```
- موقعیت پیش‌فرض را برای قانونچه نمودار تعریف می‌کند
- از تأیید const برای حفظ انواع لیترال استفاده می‌کند
- موقعیت عمودی را روی 'top' و افقی را روی 'center' تنظیم می‌کند

### نوع موقعیت قانونچه (`LegendPosition`)
```ts
type LegendPosition = {
  vertical?: 'top' | 'middle' | 'bottom';
  horizontal?: 'left' | 'center' | 'right' | 'start' | 'end';
};
```
- تعریف نوع برای گزینه‌های موقعیت قانونچه
- مقادیر استاندارد CSS موقعیت‌یابی را برای هر دو جهت پشتیبانی می‌کند

### صدورهای خصوصیات شکاف پیش‌فرض
```ts
export const defaultTooltipSlotProps = {
  sx: tooltipSx as SxProps<Theme>,
};

export const defaultLegendSlotProps = {
  sx: legendSx as SxProps<Theme>,
  position: legendPosition,
};
```
- پیکربندی‌های پیش‌فرض را برای خصوصیات شکاف راهنما و قانونچه صادر می‌کند
- تایپ مناسب را با تأیید نوع SxProps<Theme> اعمال می‌کند

### تعاریف نوع برای خصوصیات شکاف
```ts
type TooltipSlotProps = { sx?: SxProps<Theme> } & Record<string, unknown>;

type LegendSlotProps =
  | ({ sx?: SxProps<Theme>; position?: LegendPosition } & Record<string, unknown>)
  | null
  | undefined;
```
- انواع خاص را برای خصوصیات شکاف راهنما و قانونچه تعریف می‌کند
- اجازه می‌دهد خصوصیات اضافی در رکوردها وجود داشته باشد
- مورد خاصی را که props قانونچه می‌تواند تهی باشد مدیریت می‌کند

### نوع خصوصیات شکاف نمودار عمومی
```ts
export type GenericChartSlotProps = Record<string, unknown>;
```
- نوع عمومی برای خصوصیات شکاف نمودار
- در سراسر ماژول برای ثبات نوع استفاده می‌شود

### نوع گزینه‌های ادغام خصوصیات شکاف
```ts
export type MergeSlotPropsOptions = {
  includeLegend?: boolean;
  legendPosition?: LegendPosition;
};
```
- تعریف نوع برای گزینه‌ها به تابع ادغام
- امکان مشخص کردن اینکه آیا قانونچه و موقعیت سفارشی وارد شود را فراهم می‌کند

### تابع ادغام اصلی (`mergeChartSlotProps`)
```ts
export const mergeChartSlotProps = <TS extends object | undefined>(
  slotProps: TS,
  { includeLegend = true, legendPosition: legendPositionOverride }: MergeSlotPropsOptions = {}
) => {
  const baseSlotProps = (slotProps ?? {}) as GenericChartSlotProps;
  const tooltipProps = (baseSlotProps.tooltip as TooltipSlotProps | undefined) ?? {};
  const mergedTooltipSx = mergeRecords(
    tooltipSx,
    (tooltipProps.sx as Record<string, unknown> | undefined) ?? undefined
  );

  const result: GenericChartSlotProps = {
    ...baseSlotProps,
    tooltip: {
      ...tooltipProps,
      sx: mergedTooltipSx as SxProps<Theme>,
    },
  };

  if (includeLegend) {
    const legendProps = baseSlotProps.legend as LegendSlotProps;
    if (legendProps === null) {
      result.legend = null;
    } else {
      const baseLegend = {
        ...defaultLegendSlotProps,
        position: mergeRecords(
          legendPosition,
          legendPositionOverride as Record<string, unknown> | undefined
        ) as LegendPosition,
      };

      if (legendProps) {
        result.legend = {
          ...baseLegend,
          ...legendProps,
          position: mergeRecords(
            baseLegend.position ?? {},
            (legendProps.position as Record<string, unknown> | undefined) ?? undefined
          ) as LegendPosition,
          sx: mergeRecords(
            baseLegend.sx as Record<string, unknown>,
            (legendProps.sx as Record<string, unknown> | undefined) ?? undefined
          ) as SxProps<Theme>,
        };
      } else {
        result.legend = baseLegend;
      }
    }
  }

  return result as TS extends undefined
    ? GenericChartSlotProps
    : GenericChartSlotProps & NonNullable<TS>;
};
```
- تابع اصلی که props شکاف سفارشی را با استایل نمودار پیش‌فرض ادغام می‌کند
- خصوصیات راهنما را با ادغام استایل‌های سفارشی با استایل‌های راهنمای پیش‌فرض مدیریت می‌کند
- خصوصیات قانونچه را به صورت شرطی بر اساس گزینه includeLegend مدیریت می‌کند
- موردی که props قانونچه تهی است را به درستی مدیریت می‌کند
- نتیجه تایپ شده مناسب را بر اساس اینکه ورودی تهی بوده یا خیر برمی‌گرداند

## هدف و عملکرد
- استایل ثابتی را در سراسر تمام کامپوننت‌های نمودار فراهم می‌کند
- توابع ابزارکاری را برای ادغام خصوصیات نمودار ارائه می‌دهد
- جهت متن RTL را برای محلی‌سازی فارسی مدیریت می‌کند
- تم خاص برنامه (رنگ‌ها و فونت‌ها) را اعمال می‌کند
- پیکربندی‌های راهنما و قانونچه را با استایل پیش‌فرض مدیریت می‌کند

## صدورها
- `mergeChartSlotProps`: تابع برای ادغام خصوصیات سفارشی با استایل‌های نمودار پیش‌فرض
- `defaultTooltipSlotProps`: پیکربندی راهنمای پیش‌فرض
- `defaultLegendSlotProps`: پیکربندی قانونچه پیش‌فرض
- انواع مختلف تعاریف برای تایپ ثابت

## ویژگی‌های کلیدی
- ادغام عمیق اشیاء پیکربندی تودرتو
- پشتیبانی RTL برای متن فارسی
- استایل پیش‌فرض با استفاده از متغیرهای CSS
- ادغام خصوصیات ایمن از نظر نوع
- ورود/عدم ورود انعطاف‌پذیر قانونچه
- تایپ‌نویسی مناسب TypeScript در سراسر
- تم ثابت در کامپوننت‌های نمودار