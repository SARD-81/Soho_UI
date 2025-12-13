import { Box, Chip, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import ToggleBtn from '../ToggleBtn';

interface ShareBooleanToggleProps {
  value: boolean;
  onToggle: (checked: boolean) => void;
  disabled?: boolean;
  errorMessage?: string | null;
  id?: string;
}

const ShareBooleanToggle = ({
  value,
  onToggle,
  disabled = false,
  errorMessage,
  id,
}: ShareBooleanToggleProps) => {
  const theme = useTheme();

  const statusLabel = value ? 'فعال' : 'غیرفعال';
  const statusColor = value ? theme.palette.success.main : theme.palette.text.secondary;

  return (
    <Stack spacing={0.5} alignItems="center">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          py: 0.25,
        }}
      >
        <ToggleBtn id={id} checked={value} onChange={onToggle} disabled={disabled} />
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
      {errorMessage && (
        <Typography variant="caption" sx={{ color: 'var(--color-error)' }}>
          {errorMessage}
        </Typography>
      )}
    </Stack>
  );
};

export default ShareBooleanToggle;
