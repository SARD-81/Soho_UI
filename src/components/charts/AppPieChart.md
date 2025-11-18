# AppPieChart.tsx

## Overview
The `AppPieChart` component is a wrapper around the Material UI X PieChart component, designed to provide default styling and configuration for pie charts in the application. It extends the base PieChart functionality with custom slot properties and styling options.

## Detailed File Structure and Components

### Import Statements
- `PieChart` and `PieChartProps` from '@mui/x-charts/PieChart': The base pie chart component from Material UI
- `mergeChartSlotProps` from './chartStyles': Utility function to merge chart slot properties with default styles

### Type Definition (`AppPieChartProps`)
```ts
export type AppPieChartProps = PieChartProps & {
  disableDefaultLegend?: boolean;
};
```
- Extends the standard PieChartProps with an additional option
- `disableDefaultLegend`: Optional boolean to control whether the default legend should be displayed (defaults to true for pie charts)

### Component Props Destructuring
```ts
const {
  slotProps,
  disableDefaultLegend = true,
  ...rest
}: AppPieChartProps
```
- Extracts the slotProps and disableDefaultLegend props
- Sets disableDefaultLegend default to true (different from other chart components)
- Uses rest to capture all other props to pass to the PieChart component

### Slot Properties Merging
```ts
const mergedSlotProps = mergeChartSlotProps<PieChartProps['slotProps']>(slotProps, {
  includeLegend: !disableDefaultLegend,
}) as PieChartProps['slotProps'];
```
- Merges custom slotProps with default chart styling
- Determines whether to include legend based on the disableDefaultLegend prop
- Uses type assertion to maintain proper typing

### JSX Return
```ts
return <PieChart {...rest} slotProps={mergedSlotProps} />;
```
- Renders the PieChart component with all passed props
- Applies the merged slot properties that include default styling

## Purpose and Functionality
- Wraps the Material UI X PieChart component with default styling
- Provides an option to disable the default legend (defaults to enabled=false for pie charts)
- Automatically applies consistent styling and theming across the application
- Merges custom properties with default chart properties using `mergeChartSlotProps`
- Maintains the full API of the original PieChart component while adding convenience features

## Props
- `disableDefaultLegend`: Optional boolean to control legend visibility (defaults to true, meaning legend is disabled by default)
- All other standard `PieChartProps` are passed through to the underlying PieChart component

## Key Features
- Default styling and theming applied automatically
- Legend visibility toggle option (different default behavior than other charts)
- Consistent with other chart components in the application
- Maintains compatibility with all original PieChart properties
- RTL support through merged styles from chartStyles
- Proper TypeScript typing

## Usage Patterns
- Use when you need a pie chart with default application styling
- By default, the legend is disabled (no need to specify disableDefaultLegend for this behavior)
- Use `disableDefaultLegend={false}` when you want to show the legend
- Pass any standard PieChart props for data, configuration, etc.