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
import { buildDetailPanelStyles } from '../common/detailPanelStyles';

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
  const {
    wrapper,
    header,
    collection,
    card,
    list,
    keyText,
    valueText,
    removeButton,
    emptyState,
    dividerColor,
  } = buildDetailPanelStyles(theme);

  if (!items.length) {
    return null;
  }

  return (
    <Box component="section" sx={wrapper}>
      <Typography variant="h6" sx={header}>
        مقایسه جزئیات فضا های یکپارچه
      </Typography>

      <Box sx={collection}>
        {items.map(({ poolName, detail, isLoading, error }) => {
          const entries = detail ? Object.entries(detail) : [];

          return (
            <Box key={poolName} sx={card}>
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
                  sx={removeButton}
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
                <Typography sx={{ color: 'var(--color-error)', fontWeight: 600 }}>
                  خطا در دریافت اطلاعات این فضا یکپارچه: {error.message}
                </Typography>
              )}

              {!isLoading && !error && entries.length === 0 && (
                <Typography sx={emptyState}>
                  اطلاعاتی برای نمایش وجود ندارد.
                </Typography>
              )}

              {!isLoading && !error && entries.length > 0 && (
                <Box
                  sx={{
                    ...list,
                    width: '100%',
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
                      <Typography variant="body2" sx={keyText}>
                        {key}
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          ...valueText,
                          fontWeight: 700,
                          color: 'var(--color-primary)',
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
