# VolumesTable.tsx

## Overview
The `VolumesTable` component displays a data table of storage volumes with their attributes. It provides a tabular interface for viewing volume information and includes functionality for deleting volumes.

## Detailed File Structure and Components

### Import Statements
- Material UI components: `Box`, `CircularProgress`, `IconButton`, `Tooltip`, `Typography`
- React hooks: `useMemo` for memoizing computed values
- React Icons: `MdDeleteOutline` from 'react-icons/md' for the delete icon
- Type definitions:
  - `DataTableColumn` from '../../@types/dataTable.ts': Column type definition for the data table
  - `VolumeEntry` from '../../@types/volume': Type definition for individual volume entries
- Custom components: `DataTable` from '../DataTable': Generic data table component

### Interface Definition (`VolumesTableProps`)
```ts
interface VolumesTableProps {
  volumes: VolumeEntry[];
  attributeKeys: string[];
  isLoading: boolean;
  error: Error | null;
  onDeleteVolume: (volume: VolumeEntry) => void;
  isDeleteDisabled: boolean;
}
```
- Defines the type for props expected by the component
- `volumes`: Array of volume objects to display
- `attributeKeys`: Array of attribute keys to dynamically create columns
- `isLoading`: Boolean to show loading state
- `error`: Error object or null if no error
- `onDeleteVolume`: Callback function when user clicks delete
- `isDeleteDisabled`: Boolean to disable delete buttons

### Style Definitions
#### `valueTypographySx`
```ts
const valueTypographySx = {
  fontWeight: 600,
  color: 'var(--color-text)',
} as const;
```
- Defines consistent styling for general value text
- Uses font weight 600 (semi-bold) and text color variable

#### `numericValueTypographySx`
```ts
const numericValueTypographySx = {
  ...valueTypographySx,
  display: 'block',
  textAlign: 'right' as const,
  direction: 'ltr' as const,
  fontVariantNumeric: 'tabular-nums',
};
```
- Extends `valueTypographySx` with additional numeric formatting
- Right-aligns text for proper numeric alignment
- Sets text direction to LTR for numeric values
- Uses tabular numbers for consistent digit width

### Component Props Destructuring
```ts
const {
  volumes,
  attributeKeys,
  isLoading,
  error,
  onDeleteVolume,
  isDeleteDisabled,
}: VolumesTableProps
```
- Destructures all props passed to the component

### Column Definition with useMemo
```ts
const columns = useMemo<DataTableColumn<VolumeEntry>[]>(() => {
  // Column definition logic
}, [attributeKeys, isDeleteDisabled, onDeleteVolume]);
```
- Uses `useMemo` to optimize column calculation performance
- Only recalculates when dependencies change (attributeKeys, isDeleteDisabled, onDeleteVolume)

#### Base Columns Definition
```ts
const baseColumns: DataTableColumn<VolumeEntry>[] = [
  {
    id: 'pool',
    header: 'نام Pool', // Pool Name in Persian
    align: 'left',
    renderCell: (volume) => (
      <Typography sx={{ fontWeight: 700, color: 'var(--color-text)' }}>
        {volume.poolName}
      </Typography>
    ),
  },
  {
    id: 'volume',
    header: 'نام Volume', // Volume Name in Persian
    align: 'left',
    renderCell: (volume) => (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
        <Typography sx={{ fontWeight: 700, color: 'var(--color-text)' }}>
          {volume.volumeName}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: 'var(--color-secondary)' }}
        >
          {volume.fullName}
        </Typography>
      </Box>
    ),
  },
];
```
- Creates the two fixed columns: pool name and volume information
- Pool column displays the pool name in bold
- Volume column shows both volume name and full name in a stacked layout
- Uses appropriate styling for each text element

#### Dynamic Columns Creation
```ts
const dynamicColumns = attributeKeys.map<DataTableColumn<VolumeEntry>>(
  (key) => ({
    id: `attribute-${key}`,
    header: key,
    align: 'left',
    renderCell: (volume) => {
      const rawValue = volume.attributeMap[key];
      const isNumericValue =
        typeof rawValue === 'number' && Number.isFinite(rawValue);

      return (
        <Typography
          sx={isNumericValue ? numericValueTypographySx : valueTypographySx}
        >
          {isNumericValue
            ? new Intl.NumberFormat('en-US').format(rawValue)
            : (rawValue ?? '—')}
        </Typography>
      );
    },
  })
);
```
- Maps over `attributeKeys` to create dynamic columns
- Each column has an ID prefixed with 'attribute-'
- Determines if the value is numeric to apply different styling
- Formats numeric values with Intl.NumberFormat for proper display
- Uses '—' as fallback for null/undefined values
- Applies appropriate styles based on value type

#### Action Column Definition
```ts
const actionColumn: DataTableColumn<VolumeEntry> = {
  id: 'actions',
  header: 'عملیات', // Operations in Persian
  align: 'center',
  renderCell: (volume) => (
    <Tooltip title="حذف Volume"> // Delete Volume in Persian
      <span>
        <IconButton
          size="small"
          color="error"
          onClick={() => onDeleteVolume(volume)}
          disabled={isDeleteDisabled}
        >
          <MdDeleteOutline size={18} />
        </IconButton>
      </span>
    </Tooltip>
  ),
};
```
- Creates the action column with centered alignment
- Includes delete button with tooltip
- Uses error color for delete icon to indicate destructive action
- Disables button based on `isDeleteDisabled` prop
- Calls `onDeleteVolume` with the current volume when clicked

#### Columns Array Construction
```ts
return [...baseColumns, ...dynamicColumns, actionColumn];
```
- Combines base columns, dynamic columns, and action column
- Ensures all columns are included in the final array

### JSX Return Structure
The component renders a `DataTable` component with:
- `columns`: The memoized array of column definitions
- `data`: The `volumes` array passed as props
- `getRowId`: Function to extract unique ID from volume object
- `isLoading`: Loading state from props
- Custom rendering functions for different states

#### Loading State Rendering
```ts
renderLoadingState={() => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      alignItems: 'center',
    }}
  >
    <CircularProgress color="primary" size={32} />
    <Typography sx={{ color: 'var(--color-secondary)' }}>
      در حال دریافت اطلاعات Volume ها... // Loading volume information in Persian
    </Typography>
  </Box>
)}
```
- Shows circular progress indicator
- Displays loading message in Persian
- Centered layout for better visual presentation

#### Error State Rendering
```ts
renderErrorState={(tableError) => (
  <Typography sx={{ color: 'var(--color-error)' }}>
    خطا در دریافت اطلاعات Volume ها: {tableError.message} // Error loading volumes: {tableError.message} in Persian
  </Typography>
)}
```
- Shows error message with error styling
- Includes specific error message from the error object
- Persian localization for error message

#### Empty State Rendering
```ts
renderEmptyState={() => (
  <Typography sx={{ color: 'var(--color-secondary)' }}>
    هیچ Volumeی برای نمایش وجود ندارد. // No volumes to display in Persian
  </Typography>
)}
```
- Shows message when no volumes are available
- Uses secondary color for visibility
- Fully localized in Persian

## Purpose and Functionality
- Renders a table of storage volumes using the DataTable component
- Displays volume information including pool name, volume name, and additional attributes
- Provides delete functionality for each volume
- Shows loading, error, and empty states appropriately
- Formats numeric values with proper number formatting
- Applies responsive design to table columns

## Props
- `volumes`: Array of `VolumeEntry` objects representing the volumes to display
- `attributeKeys`: Array of string keys representing dynamic attributes to show in the table
- `isLoading`: Boolean indicating if data is currently loading
- `error`: Error object or null if no error occurred
- `onDeleteVolume`: Function called when a user clicks the delete button for a volume
- `isDeleteDisabled`: Boolean indicating if delete buttons should be disabled

## UI Elements
- Uses `DataTable` component as the base table implementation
- Displays pool name in bold
- Shows both volume name and full name for each volume
- Formats numeric attributes with proper number formatting and right alignment
- Delete button with tooltip in a dedicated actions column
- Loading state with progress indicator and message
- Error state display with error message
- Empty state display when no volumes are available

## Key Features
- Dynamic column generation based on `attributeKeys`
- Proper numeric formatting using `Intl.NumberFormat`
- Right alignment for numeric values
- RTL text direction for numeric values
- Tabular numbers formatting for numeric values
- Tooltip on delete button
- Disabled state for delete buttons
- Loading, error, and empty state handling
- Custom rendering for different value types
- Memoized column definitions for performance optimization
- Persian localization for UI text
- Proper accessibility features