import type { SxProps, Theme } from '@mui/material/styles';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

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

const legendSx: Record<string, unknown> = {
  color: 'var(--color-text)',
  fontFamily: 'var(--font-vazir)',
};

const legendPosition = {
  vertical: 'top' as const,
  horizontal: 'center' as const,
};

type LegendPosition = {
  vertical?: 'top' | 'middle' | 'bottom';
  horizontal?: 'left' | 'center' | 'right' | 'start' | 'end';
};

export const defaultTooltipSlotProps = {
  sx: tooltipSx as SxProps<Theme>,
};

export const defaultLegendSlotProps = {
  sx: legendSx as SxProps<Theme>,
  position: legendPosition,
};

type TooltipSlotProps = { sx?: SxProps<Theme> } & Record<string, unknown>;

type LegendSlotProps =
  | ({ sx?: SxProps<Theme>; position?: LegendPosition } & Record<string, unknown>)
  | null
  | undefined;

export type GenericChartSlotProps = Record<string, unknown>;

export type MergeSlotPropsOptions = {
  includeLegend?: boolean;
  legendPosition?: LegendPosition;
};

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