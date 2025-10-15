import {
  Box,
  CircularProgress,
  IconButton,
  Typography,
  useTheme,
} from '@mui/material';
import { MdClose } from 'react-icons/md';
import type { ZpoolDetailEntry } from '../../@types/zpool';
import formatDetailValue from '../../utils/formatDetailValue';
import {
  createDetailPanelCardSx,
  createDetailPanelContainerSx,
  createDetailPanelListSx,
  detailPanelHeaderSx,
  detailPanelItemRowSx,
  detailPanelKeySx,
  detailPanelItemsWrapperSx,
  detailPanelValueSx,
} from '../../constants/detailPanelStyles';

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

const SelectedPoolsDetailsPanel = ({
  items,
  onRemove,
}: SelectedPoolsDetailsPanelProps) => {
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
        مقایسه جزئیات فضا های یکپارچه
      </Typography>

      <Box sx={detailPanelItemsWrapperSx}>
        {items.map(({ poolName, detail, isLoading, error }) => {
          const entries = detail ? Object.entries(detail) : [];

          return (
            <Box
              key={poolName}
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
                  خطا در دریافت اطلاعات این فضا یکپارچه: {error.message}
                </Typography>
              )}

              {!isLoading && !error && entries.length === 0 && (
                <Typography sx={{ color: 'var(--color-secondary)' }}>
                  اطلاعاتی برای نمایش وجود ندارد.
                </Typography>
              )}

              {!isLoading && !error && entries.length > 0 && (
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
                        variant="subtitle2"
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

export default SelectedPoolsDetailsPanel;
