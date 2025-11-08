# DetailComparisonPanel.tsx

## Overview
The `DetailComparisonPanel` component creates a comparison panel for displaying and comparing detailed attributes across multiple items. It provides a grid-based layout that allows users to compare values side-by-side, with support for different status states (loading, error, empty, info) and optional column removal functionality.

## Detailed File Structure and Components

### Import Statements
- Material UI components: `Box`, `CircularProgress`, `IconButton`, `Typography`, `useTheme`
- `alpha` from '@mui/material/styles': Function to create transparent color variants
- `MdClose` from 'react-icons/md': Close icon for column removal
- `ReactNode` type from 'react': Type for React children

### Type Definition (`DetailComparisonStatus`)
```ts
export type DetailComparisonStatus =
  | { type: 'loading'; message?: string }
  | { type: 'error'; message: string }
  | { type: 'empty'; message: string }
  | { type: 'info'; message: string };
```
- Union type for different status states in the comparison panel
- Supports loading state with optional message
- Supports error state with required message
- Supports empty state with required message
- Supports info state with required message

### Interface Definition (`DetailComparisonColumn`)
```ts
export interface DetailComparisonColumn {
  id: string;
  title: string;
  onRemove?: () => void;
  values: Record<string, unknown>;
  status?: DetailComparisonStatus;
}
```
- Defines the structure for each column in the comparison panel
- `id`: Unique identifier for the column
- `title`: Display title for the column
- `onRemove`: Optional callback for removing the column
- `values`: Record mapping attribute keys to their values
- `status`: Optional status state for the column

### Interface Definition (`DetailComparisonPanelProps`)
```ts
interface DetailComparisonPanelProps {
  title: string;
  attributeLabel: string;
  columns: DetailComparisonColumn[];
  formatValue: (value: unknown) => ReactNode;
  emptyStateMessage: string;
  attributeSort?: (a: string, b: string) => number;
}
```
- Defines the type for props expected by the component
- `title`: Main title for the comparison panel
- `attributeLabel`: Label for the attribute column (first column)
- `columns`: Array of columns to display in the comparison
- `formatValue`: Function to format values for display
- `emptyStateMessage`: Message to show when there are no attributes to display
- `attributeSort`: Optional function to sort attribute keys

### Component Props Destructuring
```ts
const {
  title,
  attributeLabel,
  columns,
  formatValue,
  emptyStateMessage,
  attributeSort,
}: DetailComparisonPanelProps
```
- Extracts all props passed to the component

### Theme Access
```ts
const theme = useTheme();
```
- Gets the current theme for styling

### Early Return for Empty Columns
```ts
if (!columns.length) {
  return null;
}
```
- Returns null if no columns are provided

### Column Limiting Logic
```ts
const visibleColumns =
  columns.length > 4 ? columns.slice(-4) : columns;
```
- Limits the number of visible columns to maximum 4
- Shows the last 4 columns if more than 4 are provided

### Attribute Keys Collection and Sorting
```ts
const attributeKeys = Array.from(
  visibleColumns.reduce((acc, column) => {
    Object.keys(column.values ?? {}).forEach((key) => acc.add(key));
    return acc;
  }, new Set<string>())
).sort((a, b) => {
  if (attributeSort) {
    return attributeSort(a, b);
  }

  return a.localeCompare(b, 'fa-IR');
});
```
- Collects all unique attribute keys from visible columns
- Sorts keys using custom sort function or Persian locale comparison

### Row Type Determination
```ts
const hasStatuses = visibleColumns.some((column) => column.status);
const hasAttributes = attributeKeys.length > 0;

const rows: Array<{ type: 'status' | 'attribute'; key: string; label: string }> = [];

if (hasStatuses) {
  rows.push({ type: 'status', key: '__status__', label: 'وضعیت' });
}

if (hasAttributes) {
  attributeKeys.forEach((key) => {
    rows.push({ type: 'attribute', key, label: key });
  });
}
```
- Determines if any columns have status to show a status row
- Creates rows array with proper type information
- Adds status row if any columns have status
- Adds attribute rows for each attribute key

### Grid and Style Calculations
```ts
const gridColumns = `repeat(${visibleColumns.length + 1}, minmax(200px, 1fr))`;
const headerGradient =
  theme.palette.mode === 'dark'
    ? `linear-gradient(135deg, ${alpha('#00c6a9', 0.3)} 0%, ${alpha('#1fb6ff', 0.2)} 100%)`
    : `linear-gradient(135deg, ${alpha('#00c6a9', 0.12)} 0%, ${alpha('#1fb6ff', 0.1)} 100%)`;
const borderColor = alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.4 : 0.25);
const backgroundColor = alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.9 : 1);
const selectedRowHover = alpha(theme.palette.primary.main, 0.08);
```
- Calculates grid column template for proper layout
- Creates gradient for header based on theme mode
- Calculates various colors with alpha transparency based on theme

### JSX Return Structure
The component renders a complex grid-based comparison panel with:
- Main panel container with title
- Header row with attribute label and column titles
- Optional remove buttons for each column
- Data rows containing attribute values or status indicators
- Different rendering logic for status vs attribute rows
- Persian locale text direction support
- Responsive styling with hover effects
- Loading, error, and empty state support

## Purpose and Functionality
- Displays a comparison panel for multiple items' attributes
- Supports up to 4 columns to maintain readability
- Provides status indicators (loading, error, empty, info) for each column
- Allows removal of columns when onRemove callback is provided
- Formats values using a custom formatter function
- Supports Persian locale for text display and sorting
- Responsive design with hover effects and proper styling

## Props
- `title`: Main title for the comparison panel
- `attributeLabel`: Label for the attribute column
- `columns`: Array of columns to compare
- `formatValue`: Function to format values for display
- `emptyStateMessage`: Message to show when no data is available
- `attributeSort`: Optional function to customize attribute sorting

## Key Features
- Grid-based comparison layout
- Status state support (loading, error, empty, info)
- Column removal functionality
- Automatic column limiting (max 4)
- Persian locale support
- Theme-aware styling
- Hover effects and responsive design
- Proper accessibility features
- Type-safe implementation