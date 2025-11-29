import { Box, Chip } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useMemo } from 'react';
import ToggleBtn from '../ToggleBtn';
import { useSetZpoolProperty } from '../../hooks/useSetZpoolProperty';

interface PoolPropertyToggleProps {
  poolName: string;
  propertyKey: string;
  value: unknown;
}

const booleanLikeValues = new Set([
  'on',
  'enabled',
  'enable',
  'true',
  'yes',
  '1',
]);

const normalizeBooleanValue = (value: unknown) => {
  if (typeof value === 'boolean') {
    return value;
  }

  const normalized = String(value ?? '').trim().toLowerCase();
  return booleanLikeValues.has(normalized);
};

const PoolPropertyToggle = ({ poolName, propertyKey, value }: PoolPropertyToggleProps) => {
  const theme = useTheme();
  const mutation = useSetZpoolProperty(poolName);

  const isEnabled = useMemo(() => normalizeBooleanValue(value), [value]);

  const handleToggle = (checked: boolean) => {
    const nextValue = checked ? 'on' : 'off';
    mutation.mutate({ prop: propertyKey, value: nextValue });
  };

  const statusLabel = isEnabled ? 'فعال' : 'غیرفعال';
  const statusColor = isEnabled ? theme.palette.success.main : theme.palette.text.secondary;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
        py: 0.5,
      }}
    >
      <ToggleBtn
        checked={isEnabled}
        onChange={handleToggle}
        disabled={mutation.isPending}
        id={`${poolName}-${propertyKey}`}
      />
      <Chip
        label={statusLabel}
        size="small"
        variant="outlined"
        sx={{
          fontWeight: 700,
          color: statusColor,
          borderColor: alpha(statusColor, 0.4),
          minWidth: 76,
        }}
      />
    </Box>
  );
};

export default PoolPropertyToggle;
