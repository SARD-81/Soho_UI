# CreateVolumeModal.tsx

## Overview
The `CreateVolumeModal` component is a modal dialog that allows users to create new storage volumes. It provides a form interface with fields for selecting a pool, entering a volume name, and specifying the size and unit of the new volume.

## Detailed File Structure and Components

### Import Statements
- Various Material UI components: `Box`, `FormControl`, `FormHelperText`, `InputLabel`, `MenuItem`, `Select`, `TextField`, `Typography`
- `SelectChangeEvent` from '@mui/material/Select': Type for select change event
- `ChangeEvent` from 'react': Type for change event
- React functions: `useEffect` for side effects, `useState` for local state
- `UseCreateVolumeReturn` type from '../../hooks/useCreateVolume': Type definition for the create volume controller
- `removePersianCharacters` utility function from '../../utils/text': Function to sanitize input
- `BlurModal` component from '../BlurModal': Custom modal component with blur effect
- `ModalActionButtons` component from '../common/ModalActionButtons': Reusable set of action buttons for modals

### Interface Definition (`CreateVolumeModalProps`)
```ts
interface CreateVolumeModalProps {
  controller: UseCreateVolumeReturn;
  poolOptions: string[];
}
```
- Defines the type for props expected by the component
- `controller`: Contains all necessary state and functions from the useCreateVolume hook
- `poolOptions`: Array of available pools to select from

### Input Styles Definition (`inputBaseStyles`)
```ts
const inputBaseStyles = {
  backgroundColor: 'var(--color-input-bg)',
  borderRadius: '5px',
  color: 'var(--color-text)',
  '& fieldset': {
    borderColor: 'var(--color-input-border)',
  },
  '&:hover fieldset': {
    borderColor: 'var(--color-input-focus-border)',
  },
  '&.Mui-focused fieldset': {
    borderColor: 'var(--color-input-focus-border)',
  },
};
```
- Defines consistent styling for input fields using CSS variables
- Includes hover and focus states for interactive feedback
- Uses CSS custom properties for theme consistency

### Component Props Destructuring
```ts
const {
  controller,
  poolOptions,
}: CreateVolumeModalProps
```
- Destructures both controller and poolOptions props passed to the component

### Controller State Destructuring
```ts
const {
  isOpen,
  closeCreateModal,
  handleSubmit,
  selectedPool,
  setSelectedPool,
  poolError,
  volumeName,
  setVolumeName,
  nameError,
  sizeValue,
  setSizeValue,
  sizeUnit,
  setSizeUnit,
  sizeError,
  apiError,
  isCreating,
  setNameError,
} = controller;
```
- Extracts all state and functions from the controller
- Includes form fields (pool selection, volume name, size)
- Includes state handlers and validation errors
- Includes form submission and loading states

### Local State Management
```ts
const [hasPersianName, setHasPersianName] = useState(false);
```
- Tracks if Persian characters were detected in the volume name field

### useEffect Hooks
#### First useEffect (Modal State Reset)
```ts
useEffect(() => {
  if (!isOpen) {
    setHasPersianName(false);
  }
}, [isOpen]);
```
- Resets the Persian character warning when modal closes

#### Second useEffect (Persian Character Notification Timer)
```ts
useEffect(() => {
  if (!hasPersianName) {
    return;
  }

  const timeoutId = window.setTimeout(() => {
    setHasPersianName(false);
  }, 3000);

  return () => {
    window.clearTimeout(timeoutId);
  };
}, [hasPersianName]);
```
- Automatically clears the Persian character warning after 3 seconds
- Implements cleanup function to prevent memory leaks

### Event Handler Functions
#### `handlePoolChange`
```ts
const handlePoolChange = (event: SelectChangeEvent<string>) => {
  setSelectedPool(event.target.value);
};
```
- Updates selected pool based on user selection

#### `handleNameChange`
```ts
const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
  const { value } = event.target;
  const sanitizedValue = removePersianCharacters(value);
  setHasPersianName(sanitizedValue !== value);
  setVolumeName(sanitizedValue);
  if (nameError) {
    setNameError(null);
  }
};
```
- Sanitizes input to remove Persian characters
- Sets warning state if Persian characters detected
- Updates volume name with sanitized value
- Clears name error when user starts typing

#### `handleSizeChange`
```ts
const handleSizeChange = (event: ChangeEvent<HTMLInputElement>) => {
  setSizeValue(event.target.value.replace(/[^\\d.]/g, ''));
};
```
- Filters input to only allow digits and decimal points
- Prevents invalid characters in size field

#### `handleUnitChange`
```ts
const handleUnitChange = (event: SelectChangeEvent<'GB' | 'TB'>) => {
  setSizeUnit(event.target.value as 'GB' | 'TB');
};
```
- Updates selected size unit (GB/TB)

### JSX Return Structure
The component renders a `BlurModal` wrapper containing:
- Modal configuration:
  - `open`: Set to the `isOpen` state to control visibility
  - `onClose`: Calls `closeCreateModal` function when user closes modal
  - `title`: "ایجاد Volume جدید" (Create New Volume in Persian)
  - `actions`: Action buttons defined with `ModalActionButtons`

### ModalActionButtons Configuration
- `onCancel`: Closes the modal without submitting
- `confirmLabel`: "ایجاد" (Create in Persian)
- `loadingLabel`: "در حال ایجاد…" (Creating in Persian)
- `isLoading`: Shows loading state during creation
- `disabled`: Prevents interaction during creation process
- `confirmProps`: Configures submit button with form ID and type

### Form Structure
- Form element with ID 'create-volume-form' that triggers `handleSubmit` on submission
- Box container with flex column layout and gap of 3 units

#### Pool Selection Section
- `FormControl` with full width and error handling
- `InputLabel` for pool selection ("انتخاب Pool" - Select Pool)
- `Select` component with:
  - Current `selectedPool` value
  - `handlePoolChange` event handler
  - Custom styling using `inputBaseStyles`
  - Custom menu styling with card background and text color
  - Conditional rendering of "no pools available" message
  - List of `poolOptions` as selectable `MenuItem` components
  - `FormHelperText` for error display

#### Volume Name Field
- `TextField` component for volume name input
- Shows current `volumeName` value
- Uses `handleNameChange` event handler
- Full width with auto-complete off
- Error state based on `nameError` or `hasPersianName`
- Helper text with Persian validation messages
- Custom input and label styling
- Shows Persian character warning when applicable

#### Size Input Section
- Box container with responsive grid layout (1fr on mobile, 2fr 1fr on tablet+)
- Size `TextField`:
  - Label "حجم" (Size in Persian)
  - Current `sizeValue` value
  - `handleSizeChange` event handler
  - Decimal input mode
  - Error state based on `sizeError`
  - Helper text with validation message
  - Custom input styling
- Unit `FormControl`:
  - Full width
  - `InputLabel` for unit selection ("واحد" - Unit)
  - `Select` component for GB/TB selection
  - Current `sizeUnit` value
  - `handleUnitChange` event handler
  - Custom styling and menu options

#### API Error Display
- Conditionally renders error message `Typography` if `apiError` exists
- Uses error color and bold styling

## Purpose and Functionality
- Provides a form interface for creating new storage volumes
- Includes validation for volume name (prevents Persian characters)
- Allows users to select a pool from available options
- Enables users to specify volume size with numeric input and unit selection (GB/TB)
- Handles form submission and error reporting during the creation process

## Props
- `controller`: An object of type `UseCreateVolumeReturn` which contains:
  - `isOpen`: Boolean indicating if the modal is open
  - `closeCreateModal`: Function to close the modal
  - `handleSubmit`: Function to handle form submission
  - `selectedPool`: Currently selected pool value
  - `setSelectedPool`: Function to update the selected pool
  - `poolError`: Error message related to pool selection
  - `volumeName`: Current value of the volume name input
  - `setVolumeName`: Function to update the volume name
  - `nameError`: Error message related to volume name
  - `sizeValue`: Current value of the size input
  - `setSizeValue`: Function to update the size value
  - `sizeUnit`: Current selected size unit (GB/TB)
  - `setSizeUnit`: Function to update the size unit
  - `sizeError`: Error message related to size
  - `apiError`: API error messages
  - `isCreating`: Boolean indicating if creation is in progress
  - `setNameError`: Function to set name error
- `poolOptions`: Array of string options for pool selection

## UI Elements
- Uses `BlurModal` component as the base modal
- Uses `ModalActionButtons` for submit/cancel buttons
- Pool selection dropdown with available options
- Volume name text field with Persian character validation
- Size input field with numeric validation
- Size unit dropdown (GB/TB) with numeric formatting
- Error message display areas

## Key Features
- Prevents entry of Persian characters in the volume name field
- Shows temporary notice when Persian characters are detected
- Numeric input validation for size field
- Responsive grid layout for size and unit inputs
- Form validation and error handling
- Loading state during volume creation
- Fully localized in Persian
- Disabled controls during creation process
- Form submission handling