# AppGauge.tsx

## Overview
The `AppGauge` component is a wrapper around the Material UI X Gauge component, designed to provide default styling, consistent theming, and value formatting capabilities for gauge charts in the application. It addresses styling issues with the default gauge text and provides a convenient way to format displayed values.

## Detailed File Structure and Components

### Import Statements
- `GlobalStyles` from '@mui/material': Used to apply global CSS styles to the gauge component
- `Gauge` and `GaugeProps` from '@mui/x-charts/Gauge': The base gauge component from Material UI

### Type Definition (`AppGaugeProps`)
```ts
export type AppGaugeProps = GaugeProps & {
  valueFormatter?: (value: number | null) => string;
};
```
- Extends the standard GaugeProps with an additional option
- `valueFormatter`: Optional function to customize how the gauge value is displayed as text

### Component Props Destructuring
```ts
const { valueFormatter, text, ...rest }: AppGaugeProps
```
- Extracts the valueFormatter, text, and all other props
- Uses rest to capture all other props to pass to the Gauge component

### Text Formatting Logic
```ts
const gaugeText =
  text ??
  (({ value }: { value: number | null }) => {
    if (valueFormatter) {
      return valueFormatter(value ?? null);
    }

    const numericValue = typeof value === 'number' ? value : 0;
    return `${Math.round(numericValue)}`;
  });
```
- If a custom text function is provided, uses it directly
- Otherwise, creates a function that:
  - Uses the custom valueFormatter if provided
  - Falls back to rounding and converting the value to a string
  - Handles null/undefined values by defaulting to 0

### Global Styles Application
```ts
<GlobalStyles
  styles={{
    '.MuiGauge-valueText, .MuiGauge-valueText tspan': {
      fill: 'var(--color-text) !important',
      color: 'var(--color-text) !important',
    },
  }}
/>
```
- Applies CSS styles to override the default gauge text color
- Uses CSS variables for consistent theming
- Uses !important to ensure styles are applied despite potential conflicts
- Targets both the main text element and its tspan children

### JSX Return Structure
```ts
return (
  <>
    <GlobalStyles
      // styles configuration
    />
    <Gauge {...rest} text={gaugeText} />
  </>
);
```
- Returns a fragment containing the GlobalStyles and Gauge components
- Applies the formatted text function to the gauge
- Passes all other props to the Gauge component

## Purpose and Functionality
- Wraps the Material UI X Gauge component with default styling
- Provides a consistent color scheme using CSS variables
- Offers value formatting capabilities through the valueFormatter prop
- Ensures gauge text uses the application's text color
- Maintains the full API of the original Gauge component while adding styling and formatting features

## Props
- `valueFormatter`: Optional function to customize value display formatting
- `text`: Optional custom function to generate text content (overrides valueFormatter)
- All other standard `GaugeProps` are passed through to the underlying Gauge component

## Key Features
- Default styling and theming applied automatically
- Custom value formatting support
- Consistent with application's color scheme
- Maintains compatibility with all original Gauge properties
- RTL support through consistent theming
- Proper TypeScript typing

## Usage Patterns
- Use when you need a gauge with default application styling
- Pass a valueFormatter function to customize value display
- Use the text prop for completely custom text rendering
- Pass any standard Gauge props for data, configuration, etc.