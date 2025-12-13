import { Box, IconButton, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { FiCheck, FiEdit2, FiX } from 'react-icons/fi';
import formatDetailValue from '../../utils/formatDetailValue';
import ShareBooleanToggle from './ShareBooleanToggle';

interface ShareDetailValueControlProps {
  attributeKey: string;
  value: unknown;
  onSubmit: (nextValue: unknown) => void;
  isUpdating: boolean;
  errorMessage: string | null;
}

const BOOLEAN_FIELDS = new Set([
  'available',
  'read only',
  'guest ok',
  'browseable',
  'inherit permissions',
]);

const EDITABLE_FIELDS = new Set([
  'max connections',
  'create mask',
  'directory mask',
]);

const normalizeBooleanValue = (attributeKey: string, value: unknown) => {
  if (!BOOLEAN_FIELDS.has(attributeKey)) {
    return null;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true' || normalized === 'yes') return true;
    if (normalized === 'false' || normalized === 'no') return false;
  }

  return null;
};

const ShareDetailValueControl = ({
  attributeKey,
  value,
  onSubmit,
  isUpdating,
  errorMessage,
}: ShareDetailValueControlProps) => {
  const booleanValue = useMemo(
    () => normalizeBooleanValue(attributeKey, value),
    [attributeKey, value]
  );
  const isEditableField = EDITABLE_FIELDS.has(attributeKey);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(() =>
    typeof value === 'string' || typeof value === 'number'
      ? String(value)
      : formatDetailValue(value)
  );

  const handleToggle = (checked: boolean) => {
    onSubmit(checked);
  };

  const handleConfirm = () => {
    onSubmit(draft);
    setIsEditing(false);
  };

  if (booleanValue !== null) {
    return (
      <ShareBooleanToggle
        value={booleanValue}
        onToggle={handleToggle}
        disabled={isUpdating}
        errorMessage={errorMessage}
        id={`${attributeKey}-toggle`}
      />
    );
  }

  if (isEditing) {
    return (
      <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
        <TextField
          size="small"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          autoFocus
          fullWidth
          inputProps={{ 'aria-label': `${attributeKey} value`}}
          sx={{'& .MuiInputBase-input': { color: 'var(--color-text)' },}}
        />
        <Tooltip title="ثبت">
          <span>
            <IconButton
              color="success"
              size="small"
              onClick={handleConfirm}
              disabled={isUpdating}
            >
              <FiCheck size={16} />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="انصراف">
          <IconButton
            color="inherit"
            size="small"
            onClick={() => setIsEditing(false)}
            disabled={isUpdating}
          >
            <FiX size={16} />
          </IconButton>
        </Tooltip>
      </Stack>
    );
  }

  if (!isEditableField) {
    return (
      <Stack spacing={0.5} alignItems="center">
        <Typography sx={{ color: 'var(--color-text)' }}>
          {formatDetailValue(value)}
        </Typography>
        {errorMessage && (
          <Typography variant="caption" sx={{ color: 'var(--color-error)' }}>
            {errorMessage}
          </Typography>
        )}
      </Stack>
    );
  }

  return (
    <Stack spacing={0.5} alignItems="center">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography sx={{ color: 'var(--color-text)' }}>
          {formatDetailValue(value)}
        </Typography>
        <Tooltip title="ویرایش سریع">
          <span>
            <IconButton
              size="small"
              onClick={() => setIsEditing(true)}
              disabled={isUpdating}
            >
              <FiEdit2 size={15} />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
      {errorMessage && (
        <Typography variant="caption" sx={{ color: 'var(--color-error)' }}>
          {errorMessage}
        </Typography>
      )}
    </Stack>
  );
};

export default ShareDetailValueControl;