# chartStyles.ts

## Overview
The `chartStyles` module provides utility functions and default styling configurations for all chart components in the application. It includes helper functions for merging chart properties, default styling for tooltips and legends, and consistent theming across different chart types.

## Detailed File Structure and Components

### Type Guard Function (`isRecord`)
```ts
const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);
```
- Type guard to check if a value is a plain object (record)
- Returns true only if the value is a non-null object and not an array
- Used in the mergeRecords function to determine if objects should be merged recursively

### Object Merging Function (`mergeRecords`)
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
- Deeply merges two record objects
- If override is undefined, returns a copy of base
- Recursively merges nested objects when both values are records
- Otherwise, overrides the base value with the override value
- Preserves base properties that aren't overridden

### Default Tooltip Styling (`tooltipSx`)
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
- Defines default styling for chart tooltips
- Sets RTL direction for proper Persian text display
- Uses CSS variables for consistent theming (text color and Vazir font)
- Applies styling to all tooltip elements (table, cell, label, value)

### Default Legend Styling (`legendSx`)
```ts
const legendSx: Record<string, unknown> = {
  color: 'var(--color-text)',
  fontFamily: 'var(--font-vazir)',
};
```
- Defines default styling for chart legends
- Uses CSS variables for consistent theming (text color and Vazir font)

### Legend Position Configuration (`legendPosition`)
```ts
const legendPosition = {
  vertical: 'top' as const,
  horizontal: 'center' as const,
};
```
- Defines default position for chart legends
- Uses const assertion to maintain literal types
- Sets vertical position to 'top' and horizontal to 'center'

### Legend Position Type (`LegendPosition`)
```ts
type LegendPosition = {
  vertical?: 'top' | 'middle' | 'bottom';
  horizontal?: 'left' | 'center' | 'right' | 'start' | 'end';
};
```
- Type definition for legend positioning options
- Supports standard CSS positioning values for both directions

### Default Slot Properties Exports
```ts
export const defaultTooltipSlotProps = {
  sx: tooltipSx as SxProps<Theme>,
};

export const defaultLegendSlotProps = {
  sx: legendSx as SxProps<Theme>,
  position: legendPosition,
};
```
- Exports default configurations for tooltip and legend slot properties
- Applies proper typing with SxProps<Theme> type assertion

### Type Definitions for Slot Properties
```ts
type TooltipSlotProps = { sx?: SxProps<Theme> } & Record<string, unknown>;

type LegendSlotProps =
  | ({ sx?: SxProps<Theme>; position?: LegendPosition } & Record<string, unknown>)
  | null
  | undefined;
```
- Defines specific types for tooltip and legend slot properties
- Allows for additional properties in the records
- Handles the special case where legend props can be null

### Generic Chart Slot Props Type
```ts
export type GenericChartSlotProps = Record<string, unknown>;
```
- Generic type for chart slot properties
- Used throughout the module for type consistency

### Merge Slot Props Options Type
```ts
export type MergeSlotPropsOptions = {
  includeLegend?: boolean;
  legendPosition?: LegendPosition;
};
```
- Type definition for options to the merge function
- Allows specifying whether to include legend and custom positioning

### Main Merging Function (`mergeChartSlotProps`)
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
- Main function that merges custom slot props with default chart styling
- Handles tooltip properties by merging custom styles with default tooltip styles
- Conditionally handles legend properties based on includeLegend option
- Properly handles the case where legend props is null
- Returns properly typed result based on whether input was undefined

## Purpose and Functionality
- Provides consistent styling across all chart components
- Offers utility functions for merging chart properties
- Handles RTL text direction for Persian localization
- Applies application-specific theming (colors and fonts)
- Manages tooltip and legend configurations with default styling

## Exports
- `mergeChartSlotProps`: Function to merge custom properties with default chart styles
- `defaultTooltipSlotProps`: Default tooltip configuration
- `defaultLegendSlotProps`: Default legend configuration
- Various type definitions for consistent typing

## Key Features
- Deep merging of nested configuration objects
- RTL support for Persian text
- Default styling using CSS variables
- Type-safe property merging
- Flexible legend inclusion/exclusion
- Proper TypeScript typing throughout
- Consistent theming across chart components