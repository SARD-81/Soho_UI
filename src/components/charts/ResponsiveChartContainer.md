# ResponsiveChartContainer.tsx

## Overview
The `ResponsiveChartContainer` component provides a responsive container for chart components, automatically adjusting its width based on the container size. It uses the ResizeObserver API to monitor size changes and provide the appropriate width to child chart components.

## Detailed File Structure and Components

### Import Statements
- `Box` from '@mui/material': Material UI container component for layout
- React hooks: `useEffect` for side effects, `useRef` for DOM references, `useState` for state management
- `ReactNode` type from 'react': Type for React children

### Type Definition (`ResponsiveChartContainerProps`)
```ts
export type ResponsiveChartContainerProps = {
  height: number;
  children: (width: number) => ReactNode;
};
```
- Defines the type for props expected by the component
- `height`: Required number specifying the fixed height of the container
- `children`: Function that receives the calculated width and returns ReactNode children

### Component Props Destructuring
```ts
const {
  height,
  children,
}: ResponsiveChartContainerProps
```
- Extracts the height and children props from the component properties

### State and Ref Initialization
```ts
const containerRef = useRef<HTMLDivElement | null>(null);
const [width, setWidth] = useState(0);
```
- `containerRef`: Reference to the container DOM element for ResizeObserver
- `width`: State variable to track the current width of the container (initialized to 0)

### useEffect Hook for Resizing
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
- Runs only once when the component mounts (empty dependency array)
- Gets the container DOM element from the ref
- Defines updateWidth function to measure and update the width
- Falls back to getBoundingClientRect if ResizeObserver is not available
- Creates a ResizeObserver to track size changes
- Observes the container element for size changes
- Updates width immediately to get initial size
- Returns a cleanup function to disconnect the observer

### JSX Return Structure
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
- Renders a Box component with a ref to the container
- Sets width to 100% to fill available space
- Sets minHeight to the specified height prop
- Conditionally renders children only when width > 0 to avoid rendering before measurement
- Passes the measured width to the children render function

## Purpose and Functionality
- Creates a responsive container that adapts to its parent's width
- Uses ResizeObserver to efficiently track size changes
- Provides the current width to child chart components through a render function
- Ensures charts render only when dimensions are available
- Maintains a fixed height while allowing width to be responsive

## Props
- `height`: Number specifying the fixed height of the container
- `children`: Function that receives the calculated width and returns ReactNode children

## Key Features
- Responsive width calculation using ResizeObserver
- Efficient size tracking without continuous polling
- Graceful degradation when ResizeObserver is not available
- Conditional rendering to avoid rendering before dimensions are available
- Proper cleanup to prevent memory leaks
- Compatible with any chart component that accepts width as a prop
- Proper TypeScript typing

## Usage Patterns
- Wrap any chart component that needs responsive width
- Pass a function as children that receives width and returns a chart component
- Specify the desired fixed height for the container
- The chart component inside will receive the calculated width as a parameter

## Example Usage
```ts
<ResponsiveChartContainer height={300}>
  {(width) => <BarChart width={width} height={300} {...otherProps} />}
</ResponsiveChartContainer>
```