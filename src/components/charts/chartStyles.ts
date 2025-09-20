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

export const defaultTooltipSlotProps = {
  sx: tooltipSx as SxProps<Theme>,
};

export const defaultLegendSlotProps = {
  sx: legendSx as SxProps<Theme>,
  position: legendPosition,
};

export type GenericChartSlotProps = {
  tooltip?: { sx?: SxProps<Theme> } & Record<string, unknown>;
  legend?:
    | ({
        sx?: SxProps<Theme>;
        position?: { vertical?: 'top' | 'bottom'; horizontal?: 'left' | 'center' | 'right' };
      } & Record<string, unknown>)
    | null;
  [key: string]: unknown;
};

export type MergeSlotPropsOptions = {
  includeLegend?: boolean;
  legendPosition?: { vertical?: 'top' | 'bottom'; horizontal?: 'left' | 'center' | 'right' };
};

export const mergeChartSlotProps = <TS extends GenericChartSlotProps | undefined>(
  slotProps: TS,
  { includeLegend = true, legendPosition: legendPositionOverride }: MergeSlotPropsOptions = {}
) => {
  const tooltipProps = slotProps?.tooltip ?? {};
  const mergedTooltipSx = mergeRecords(
    tooltipSx,
    (tooltipProps.sx as Record<string, unknown> | undefined) ?? undefined
  );

  const result: GenericChartSlotProps = {
    ...(slotProps ?? {}),
    tooltip: {
      ...tooltipProps,
      sx: mergedTooltipSx as SxProps<Theme>,
    },
  };

  if (includeLegend) {
    if (slotProps && 'legend' in slotProps && slotProps.legend === null) {
      result.legend = null;
    } else {
      const baseLegend = {
        ...defaultLegendSlotProps,
        position: mergeRecords(
          legendPosition,
          legendPositionOverride as Record<string, unknown> | undefined
        ) as typeof legendPosition,
      };

      const legendProps = slotProps?.legend;
      if (legendProps) {
        result.legend = {
          ...baseLegend,
          ...legendProps,
          position: mergeRecords(
            baseLegend.position,
            (legendProps.position as Record<string, unknown> | undefined) ?? undefined
          ) as typeof legendPosition,
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

  return result as TS extends undefined ? GenericChartSlotProps : GenericChartSlotProps & NonNullable<TS>;
};
