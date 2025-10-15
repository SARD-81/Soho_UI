import { Box, IconButton, Typography, useTheme } from '@mui/material';
import { MdClose } from 'react-icons/md';
import type { SambaUserTableItem } from '../../@types/samba';
import formatDetailValue from '../../utils/formatDetailValue';

interface SelectedSambaUsersDetailsPanelProps {
  items: SambaUserTableItem[];
  onRemove: (username: string) => void;
}

const SelectedSambaUsersDetailsPanel = ({
  items,
  onRemove,
}: SelectedSambaUsersDetailsPanelProps) => {
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
        borderRadius: '5px',
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
        مقایسه جزئیات کاربران اشتراک فایل
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        }}
      >
        {items.map((item) => {
          const entries = Object.entries(item.details ?? {}).sort(([a], [b]) =>
            a.localeCompare(b, 'fa-IR')
          );

          return (
            <Box
              key={item.username}
              sx={{
                borderRadius: '5px',
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
                  {item.username}
                </Typography>

                <IconButton
                  aria-label={`حذف ${item.username} از مقایسه`}
                  size="small"
                  onClick={() => onRemove(item.username)}
                  sx={{ color: 'var(--color-secondary)' }}
                >
                  <MdClose size={18} />
                </IconButton>
              </Box>

              {entries.length === 0 && (
                <Typography sx={{ color: 'var(--color-secondary)' }}>
                  اطلاعاتی برای نمایش وجود ندارد.
                </Typography>
              )}

              {entries.length > 0 && (
                <Box
                  sx={{
                    width: '100%',
                    bgcolor: listBackground,
                    borderRadius: '5px',
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
                        sx={{
                          fontWeight: 600,
                          color: 'var(--color-secondary)',
                          minWidth: 120,
                        }}
                      >
                        {key}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          color: 'var(--color-text)',
                          textAlign: 'left',
                          direction: 'ltr',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          flex: 1,
                        }}
                      >
                        {typeof value === 'string'
                          ? value
                          : formatDetailValue(value)}
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

export default SelectedSambaUsersDetailsPanel;
