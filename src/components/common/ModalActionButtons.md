# ModalActionButtons.tsx

## Overview
The `ModalActionButtons` component provides a standardized set of action buttons for modals, typically featuring cancel and confirm buttons with consistent styling and behavior. It offers customization options for labels, styling, and behavior while maintaining a consistent UI/UX pattern.

## Detailed File Structure and Components

### Import Statements
- Material UI components: `Box`, `Button`
- Material UI types: `ButtonProps`, `SxProps`, `Theme`

### Interface Definition (`ModalActionButtonsProps`)
```ts
interface ModalActionButtonsProps {
  onConfirm?: ButtonProps['onClick'];
  onCancel?: ButtonProps['onClick'];
  confirmLabel: string;
  cancelLabel?: string;
  disabled?: boolean;
  isLoading?: boolean;
  loadingLabel?: string;
  confirmProps?: ButtonProps;
  cancelProps?: ButtonProps;
  disableConfirmGradient?: boolean;
}
```
- Defines the type for props expected by the component
- `onConfirm`: Optional callback function for confirm button click
- `onCancel`: Optional callback function for cancel button click
- `confirmLabel`: Required label for the confirm button
- `cancelLabel`: Optional label for the cancel button (defaults to 'انصراف')
- `disabled`: Optional boolean to disable both buttons
- `isLoading`: Optional boolean to show loading state on confirm button
- `loadingLabel`: Optional label to show when loading
- `confirmProps`: Additional props to pass to confirm button
- `cancelProps`: Additional props to pass to cancel button
- `disableConfirmGradient`: Optional boolean to disable gradient on confirm button

### Component Props Destructuring
```ts
const {
  onConfirm,
  onCancel,
  confirmLabel,
  cancelLabel = 'انصراف',
  disabled = false,
  isLoading = false,
  loadingLabel,
  confirmProps,
  cancelProps,
  disableConfirmGradient = false,
}: ModalActionButtonsProps
```
- Extracts all props passed to the component
- Sets default values for optional props

### Style Definitions
#### Base Button Styles (`baseButtonSx`)
```ts
const baseButtonSx: SxProps<Theme> = {
  borderRadius: '5px',
  fontWeight: 600,
};
```
- Defines common styles for both confirm and cancel buttons
- Sets border radius and font weight

#### Gradient Button Styles (`gradientButtonSx`)
```ts
const gradientButtonSx: SxProps<Theme> = {
  px: 4,
  background:
    'linear-gradient(135deg, var(--color-primary) 0%, rgba(31, 182, 255, 0.95) 100%)',
  boxShadow: '0 14px 28px -18px rgba(0, 198, 169, 0.8)',
  '&:hover': {
    background:
      'linear-gradient(135deg, rgba(0, 198, 169, 0.95) 0%, rgba(18, 140, 200, 0.95) 100%)',
  },
};
```
- Defines gradient background for confirm button
- Includes shadow and hover effect
- Uses CSS variables for consistent theming

#### Cancel Button Styles (`cancelButtonSx`)
```ts
const cancelButtonSx: SxProps<Theme> = {
  px: 3,
};
```
- Defines specific padding for cancel button

### Style Merging Function (`mergeSx`)
```ts
const mergeSx = (
  ...styles: Array<SxProps<Theme> | undefined>
): SxProps<Theme> =>
  styles
    .filter(Boolean)
    .flatMap((style) =>
      Array.isArray(style) ? style : [style]
    ) as SxProps<Theme>;
```
- Utility function to merge multiple Sx style objects
- Filters out undefined styles
- Flattens arrays of styles into a single array

### Confirm Props Destructuring
```ts
const {
  sx: confirmSxProp,
  disabled: confirmDisabledProp,
  onClick: confirmOnClickProp,
  variant: confirmVariant,
  color: confirmColor,
  ...confirmRest
} = confirmProps ?? {};
```
- Extracts individual props from confirmProps object
- Separates styling, disabled state, onClick handler, variant, and color
- Collects remaining props in confirmRest

### Cancel Props Destructuring
```ts
const {
  sx: cancelSxProp,
  disabled: cancelDisabledProp,
  onClick: cancelOnClickProp,
  variant: cancelVariant,
  color: cancelColor,
  ...cancelRest
} = cancelProps ?? {};
```
- Extracts individual props from cancelProps object
- Separates styling, disabled state, onClick handler, variant, and color
- Collects remaining props in cancelRest

### Event Handler Functions
#### Confirm Click Handler
```ts
const handleConfirmClick: ButtonProps['onClick'] = (event) => {
  if (confirmOnClickProp) {
    confirmOnClickProp(event);
  }

  if (onConfirm) {
    onConfirm(event);
  }
};
```
- Handles confirm button click
- Calls both custom onClick prop and onConfirm callback if provided

#### Cancel Click Handler
```ts
const handleCancelClick: ButtonProps['onClick'] = (event) => {
  if (cancelOnClickProp) {
    cancelOnClickProp(event);
  }

  if (onCancel) {
    onCancel(event);
  }
};
```
- Handles cancel button click
- Calls both custom onClick prop and onCancel callback if provided

### Disabled State Calculation
```ts
const confirmDisabled = Boolean(disabled || isLoading || confirmDisabledProp);
const cancelDisabled = Boolean(disabled || cancelDisabledProp);
```
- Calculates final disabled state for confirm button
- Considers global disabled, loading state, and specific prop
- Calculates final disabled state for cancel button considering global disabled and specific prop

### Style Merging
```ts
const confirmSx = mergeSx(
  baseButtonSx,
  disableConfirmGradient ? undefined : gradientButtonSx,
  confirmSxProp
);

const cancelSx = mergeSx(baseButtonSx, cancelButtonSx, cancelSxProp);
```
- Merges styles for confirm button with or without gradient
- Merges styles for cancel button with base and specific styles

### JSX Return Structure
The component renders a Box container with:
- Flex layout for button arrangement
- Gap between buttons and centered positioning
- Conditional rendering of cancel button (only if onCancel is provided)
- Confirm button always rendered with loading state support
- Proper handling of button variants, colors, and disabled states
- Loading label support for confirm button

## Purpose and Functionality
- Provides standardized action buttons for modals
- Supports both confirm and cancel actions
- Offers loading state with custom loading label
- Allows customization of button props and styling
- Handles disabled states at different levels
- Maintains consistent UI/UX across modals
- Supports RTL text layout (Persian)

## Props
- `onConfirm`: Callback for confirm button click
- `onCancel`: Callback for cancel button click
- `confirmLabel`: Label for confirm button
- `cancelLabel`: Label for cancel button (defaults to 'انصراف')
- `disabled`: Disables both buttons
- `isLoading`: Shows loading state on confirm button
- `loadingLabel`: Label to show when loading
- `confirmProps`: Additional props for confirm button
- `cancelProps`: Additional props for cancel button
- `disableConfirmGradient`: Disables gradient on confirm button

## Key Features
- Consistent styling and behavior across modals
- Loading state support with custom labels
- Gradient styling for confirm button (optional)
- Flexible customization through props
- Conditional rendering of cancel button
- Proper disabled state management
- Style merging functionality
- RTL support
- Type-safe implementation