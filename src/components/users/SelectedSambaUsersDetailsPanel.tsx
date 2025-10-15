import { Box, IconButton, Typography, useTheme } from '@mui/material';
import { MdClose } from 'react-icons/md';
import type { SambaUserTableItem } from '../../@types/samba';
import formatDetailValue from '../../utils/formatDetailValue';
import {
  createDetailPanelCardSx,
  createDetailPanelContainerSx,
  createDetailPanelListSx,
  detailPanelHeaderSx,
  detailPanelItemRowSx,
  detailPanelItemsWrapperSx,
  detailPanelKeySx,
  detailPanelValueSx,
} from '../../constants/detailPanelStyles';

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
  if (!items.length) {
    return null;
  }

  return (
    <Box
      sx={createDetailPanelContainerSx(theme)}
    >
      <Typography
        variant="h6"
        sx={detailPanelHeaderSx}
      >
        مقایسه جزئیات کاربران اشتراک فایل
      </Typography>

      <Box sx={detailPanelItemsWrapperSx}>
        {items.map((item) => {
          const entries = Object.entries(item.details ?? {}).sort(([a], [b]) =>
            a.localeCompare(b, 'fa-IR')
          );

          return (
            <Box
              key={item.username}
              sx={createDetailPanelCardSx(theme)}
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
                  sx={createDetailPanelListSx(theme)}
                >
                  {entries.map(([key, value], index) => (
                    <Box
                      key={key}
                      sx={{
                        ...detailPanelItemRowSx,
                        pb: 1,
                        borderBottom:
                          index === entries.length - 1
                            ? 'none'
                            : `1px dashed ${dividerColor}`,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={detailPanelKeySx}
                      >
                        {key}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={detailPanelValueSx}
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