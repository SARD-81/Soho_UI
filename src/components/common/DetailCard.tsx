import {
  Box,
  CircularProgress,
  IconButton,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { MdClose } from 'react-icons/md';

export interface DetailCardEntry {
  label: string;
  value: ReactNode;
}

interface DetailCardProps {
  title: string;
  entries: DetailCardEntry[];
  onRemove?: () => void;
  isLoading?: boolean;
  error?: string | null;
  emptyMessage?: string;
}

const DetailCard = ({
  title,
  entries,
  onRemove,
  isLoading = false,
  error = null,
  emptyMessage = 'اطلاعاتی برای نمایش وجود ندارد.',
}: DetailCardProps) => {
  const theme = useTheme();
  const borderColor = alpha(
    theme.palette.primary.main,
    theme.palette.mode === 'dark' ? 0.32 : 0.18
  );
  const rowBorderColor = alpha(
    theme.palette.primary.main,
    theme.palette.mode === 'dark' ? 0.28 : 0.14
  );
  const stripeBackground = alpha(
    theme.palette.primary.main,
    theme.palette.mode === 'dark' ? 0.18 : 0.08
  );
  const labelBackground = alpha(
    theme.palette.primary.main,
    theme.palette.mode === 'dark' ? 0.26 : 0.16
  );
  const containerShadow = alpha(theme.palette.common.black, 0.5);

  const renderValue = (value: ReactNode) => {
    if (typeof value === 'string' || typeof value === 'number') {
      return (
        <Typography
          component="span"
          sx={{
            color: 'var(--color-text)',
            fontWeight: 600,
            fontSize: '0.95rem',
            direction: 'ltr',
            textAlign: 'left',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            lineHeight: 1.8,
          }}
        >
          {value}
        </Typography>
      );
    }

    return value;
  };

  return (
    <Box
      sx={{
        flex: '0 0 auto',
        width: 'fit-content',
        minWidth: 280,
        maxWidth: '100%',
        borderRadius: '16px',
        border: `1px solid ${borderColor}`,
        backgroundColor:
          theme.palette.mode === 'dark'
            ? 'color-mix(in srgb, var(--color-card-bg) 78%, transparent)'
            : 'rgba(255, 255, 255, 0.92)',
        boxShadow: `0 28px 60px -38px ${containerShadow}`,
        overflow: 'hidden',
        backdropFilter: 'blur(18px)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          px: 2.5,
          py: 1.75,
          background:
            'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',
          color: 'var(--color-bg)',
        }}
      >
        <Typography sx={{ fontWeight: 800, fontSize: '1.05rem' }}>
          {title}
        </Typography>

        {onRemove ? (
          <IconButton
            size="small"
            onClick={onRemove}
            sx={{
              color: 'var(--color-bg)',
              '&:hover': {
                backgroundColor: 'color-mix(in srgb, var(--color-bg) 18%, transparent)',
              },
            }}
            aria-label={`حذف ${title} از مقایسه`}
          >
            <MdClose size={18} />
          </IconButton>
        ) : null}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, px: 2.5, py: 2.5 }}>
        {isLoading ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              py: 2.5,
            }}
          >
            <CircularProgress color="primary" size={28} />
          </Box>
        ) : null}

        {!isLoading && error ? (
          <Typography sx={{ color: 'var(--color-error)', fontWeight: 600, textAlign: 'center' }}>
            {error}
          </Typography>
        ) : null}

        {!isLoading && !error && entries.length === 0 ? (
          <Typography sx={{ color: 'var(--color-secondary)', fontWeight: 500, textAlign: 'center' }}>
            {emptyMessage}
          </Typography>
        ) : null}

        {!isLoading && !error && entries.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {entries.map((entry, index) => (
              <Box
                key={`${entry.label}-${index}`}
                sx={{
                  borderRadius: '12px',
                  border: `1px solid ${rowBorderColor}`,
                  overflow: 'hidden',
                  backgroundColor: index % 2 === 0 ? 'transparent' : stripeBackground,
                  boxShadow: `0 16px 38px -30px ${containerShadow}`,
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 22px 45px -28px ${alpha(containerShadow, 0.9)}`,
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(140px, max-content) minmax(160px, 1fr)',
                  }}
                >
                  <Box
                    sx={{
                      px: 1.8,
                      py: 1.2,
                      backgroundColor: labelBackground,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Typography
                      component="span"
                      sx={{
                        color: 'var(--color-bg)',
                        fontWeight: 700,
                        fontSize: '0.92rem',
                      }}
                    >
                      {entry.label}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      px: 2,
                      py: 1.2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      direction: 'ltr',
                    }}
                  >
                    {renderValue(entry.value)}
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        ) : null}
      </Box>
    </Box>
  );
};

export default DetailCard;
