import { Box, IconButton, Typography, useTheme } from '@mui/material';
import { MdClose } from 'react-icons/md';
import type { SambaShareDetails } from '../../@types/samba';
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

interface ShareDetailItem {
  shareName: string;
  detail: SambaShareDetails;
}

interface SelectedSharesDetailsPanelProps {
  items: ShareDetailItem[];
  onRemove: (shareName: string) => void;
}

const SelectedSharesDetailsPanel = ({
  items,
  onRemove,
}: SelectedSharesDetailsPanelProps) => {
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
        مقایسه جزئیات اشتراک‌ها
      </Typography>

      <Box sx={detailPanelItemsWrapperSx}>
        {items.map(({ shareName, detail }) => {
          const entries = Object.entries(detail ?? {}).sort(([a], [b]) =>
            a.localeCompare(b, 'fa-IR')
          );

          return (
            <Box
              key={shareName}
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
                  {shareName}
                </Typography>

                <IconButton
                  aria-label={`حذف ${shareName} از مقایسه`}
                  size="small"
                  onClick={() => onRemove(shareName)}
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

export default SelectedSharesDetailsPanel;
