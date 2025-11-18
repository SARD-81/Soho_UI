# ConfirmDeleteVolumeModal.tsx

## Overview
The `ConfirmDeleteVolumeModal` component is a modal dialog that provides users with a confirmation interface before deleting a storage volume. This component ensures that users are aware of the irreversible nature of the deletion operation.

## Detailed File Structure and Components

### Import Statements
- `Box, Typography` from '@mui/material': Material UI components used for layout and text display
- `UseDeleteVolumeReturn` type from '../../hooks/useDeleteVolume': Type definition for the delete volume controller
- `BlurModal` component from '../BlurModal': Custom modal component with blur effect
- `ModalActionButtons` component from '../common/ModalActionButtons': Reusable set of action buttons for modals

### Interface Definition (`ConfirmDeleteVolumeModalProps`)
```ts
interface ConfirmDeleteVolumeModalProps {
  controller: UseDeleteVolumeReturn;
}
```
- Defines the type for props expected by the component
- `controller`: Contains all necessary state and functions from the useDeleteVolume hook

### Component Props Destructuring
```ts
const {
  controller,
}: ConfirmDeleteVolumeModalProps
```
- Destructures the controller prop passed to the component

### Controller State Destructuring
```ts
const {
  isOpen,
  targetVolume,
  closeModal,
  confirmDelete,
  isDeleting,
  errorMessage,
} = controller;
```
- `isOpen`: Boolean that determines if the modal is visible
- `targetVolume`: The specific volume being targeted for deletion
- `closeModal`: Function to close the confirmation modal
- `confirmDelete`: Function to execute the deletion after confirmation
- `isDeleting`: Boolean to indicate when deletion is in progress
- `errorMessage`: String containing any error messages during deletion

### JSX Return Structure
The component renders a `BlurModal` wrapper containing:
- Modal configuration:
  - `open`: Set to the `isOpen` state to control visibility
  - `onClose`: Calls `closeModal` function when user closes modal
  - `title`: "حذف Volume" (Delete Volume in Persian)
  - `actions`: A set of action buttons defined with `ModalActionButtons`

### ModalActionButtons Configuration
- `onCancel`: Closes the modal without performing deletion
- `onConfirm`: Executes the deletion process
- `confirmLabel`: "حذف" (Delete in Persian)
- `loadingLabel`: "در حال حذف…" (Deleting in Persian)
- `isLoading`: Shows loading state during deletion
- `disabled`: Prevents interaction during deletion process
- `disableConfirmGradient`: Removes gradient from confirm button
- `confirmProps`: Sets the confirm button color to 'error' for visual warning

### Main Content Box
- Contains a flex column layout with gap of 2 units
- Uses a `Typography` component to display the confirmation message
- Shows the full name of the target volume in bold
- Includes a Persian warning that the operation is irreversible

### Error Message Handling
- Conditionally renders an error message `Typography` if `errorMessage` exists
- Uses error color styling for visibility
- Shows the actual error message in bold

## Purpose and Functionality
- Displays a confirmation modal for volume deletion operations
- Warns users that the operation is irreversible
- Shows the full name of the volume to be deleted
- Provides visual feedback if there are any errors during the deletion process
- Integrates with the volume deletion hook to handle the deletion logic

## Props
- `controller`: An object of type `UseDeleteVolumeReturn` which contains:
  - `isOpen`: Boolean indicating if the modal is open
  - `targetVolume`: The volume object to be deleted
  - `closeModal`: Function to close the modal
  - `confirmDelete`: Function to confirm and execute the deletion
  - `isDeleting`: Boolean indicating if the deletion is in progress
  - `errorMessage`: String containing any error messages

## UI Elements
- Uses `BlurModal` component as the base modal with blur effect
- Uses `ModalActionButtons` for the confirm/cancel buttons
- Shows a warning message in Persian about the irreversible deletion
- Displays the volume name in bold
- Shows error messages if any occur during the operation

## Key Features
- Fully localized in Persian
- Shows loading state during deletion
- Disabled confirm button during the deletion process
- Error handling display
- Confirmation required before performing destructive action