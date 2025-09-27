import {
  Box,
  CircularProgress,
  IconButton,
  Typography,
  useTheme,
} from '@mui/material';
import { MdClose } from 'react-icons/md';
import type { ZpoolDetailEntry } from '../../@types/zpool';

interface PoolDetailItem {
  poolName: string;
  detail: ZpoolDetailEntry | null;
  isLoading: boolean;
  error: Error | null;
}

interface SelectedPoolsDetailsPanelProps {
  items: PoolDetailItem[];
  onRemove: (poolName: string) => void;
}

const formatDetailValue = (value: unknown): string => {
  if (value == null) {
    return '-';
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return new Intl.NumberFormat('fa-IR').format(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => formatDetailValue(item)).join(', ');
  }

  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }

  return String(value);
};

const SelectedPoolsDetailsPanel = ({
  items,
  onRemove,
}: SelectedPoolsDetailsPanelProps) => {
  const theme = useTheme();
  const dividerColor =
    theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.08)'
      : 'rgba(0, 0, 0, 0.08)';
  const listBackground =
    theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.04)'
      : 'rgba(0, 0, 0, 0.03)';

  if (!items.length) {
    return null;
  }

  return (
    <Box
      sx={{
        mt: 3,
        borderRadius: 3,
        border: '1px solid var(--color-input-border)',
        backgroundColor: 'var(--color-card-bg)',
        boxShadow: '0 20px 45px -25px rgba(0, 0, 0, 0.35)',
        p: 3,
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 3,
          fontWeight: 700,
          color: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        مقایسه جزئیات Pool ها
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        }}
      >
        {items.map(({ poolName, detail, isLoading, error }) => {
          const entries = detail ? Object.entries(detail) : [];

          return (
            <Box
              key={poolName}
              sx={{
                borderRadius: 2,
                border: `1px solid ${dividerColor}`,
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(0, 0, 0, 0.35)'
                    : 'rgba(255, 255, 255, 0.9)',
                p: 2.5,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1.5,
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    fontSize: '1rem',
                  }}
                >
                  {poolName}
                </Typography>

                <IconButton
                  aria-label={`حذف ${poolName} از مقایسه`}
                  size="small"
                  onClick={() => onRemove(poolName)}
                  sx={{ color: 'var(--color-secondary)' }}
                >
                  <MdClose size={18} />
                </IconButton>
              </Box>

              {isLoading && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 3,
                  }}
                >
                  <CircularProgress size={28} color="primary" />
                </Box>
              )}

              {error && !isLoading && (
                <Typography sx={{ color: 'var(--color-error)' }}>
                  خطا در دریافت اطلاعات این Pool: {error.message}
                </Typography>
              )}

              {!isLoading && !error && entries.length === 0 && (
                <Typography sx={{ color: 'var(--color-secondary)' }}>
                  اطلاعاتی برای نمایش وجود ندارد.
                </Typography>
              )}

              {!isLoading && !error && entries.length > 0 && (
                <Box
                  sx={{
                    width: '100%',
                    bgcolor: listBackground,
                    borderRadius: 2,
                    px: 2,
                    py: 2,
                    border: `1px solid ${dividerColor}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  {entries.map(([key, value], index) => (
                    <Box
                      key={key}
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 2,
                        py: 0.75,
                        borderBottom:
                          index === entries.length - 1
                            ? 'none'
                            : `1px dashed ${dividerColor}`,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500, color: theme.palette.text.secondary }}
                      >
                        {key}
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 700,
                          color: 'var(--color-primary)',
                          textAlign: 'left',
                          direction: 'ltr',
                          wordBreak: 'break-word',
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {formatDetailValue(value)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default SelectedPoolsDetailsPanel;

