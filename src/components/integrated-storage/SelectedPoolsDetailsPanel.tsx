import {
  Box,
  CircularProgress,
  IconButton,
  Typography,
  useTheme,
} from '@mui/material';
import { useMemo } from 'react';
import { MdClose } from 'react-icons/md';
import type { ZpoolDetailEntry } from '../../@types/zpool';
import { createDetailPanelStyles } from '../../constants/detailPanels';
import formatDetailValue from '../../utils/formatDetailValue';

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
  const styles = useMemo(() => createDetailPanelStyles(theme), [theme]);

  if (!items.length) {
    return null;
  }

  return (
    <Box sx={styles.root}>
      <Typography variant="h6" sx={styles.title}>
        مقایسه جزئیات فضا های یکپارچه
      </Typography>

      <Box sx={styles.cardsWrapper}>
        {items.map(({ poolName, detail, isLoading, error }) => {
          const entries = detail ? Object.entries(detail) : [];

          return (
            <Box key={poolName} sx={styles.card}>
              <Box sx={styles.cardHeader}>
                <Typography sx={styles.cardTitle}>
                  {poolName}
                </Typography>

                <IconButton
                  aria-label={`حذف ${poolName} از مقایسه`}
                  size="small"
                  onClick={() => onRemove(poolName)}
                  sx={styles.removeButton}
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
                    gap: 1.5,
                    py: 3,
                  }}
                >
                  <CircularProgress size={28} color="primary" />
                  <Typography sx={styles.statusText}>
                    در حال دریافت اطلاعات این فضا یکپارچه...
                  </Typography>
                </Box>
              )}

              {error && !isLoading && (
                <Typography sx={styles.errorText}>
                  خطا در دریافت اطلاعات این فضا یکپارچه: {error.message}
                </Typography>
              )}

              {!isLoading && !error && entries.length === 0 && (
                <Typography sx={styles.statusText}>
                  اطلاعاتی برای نمایش وجود ندارد.
                </Typography>
              )}

              {!isLoading && !error && entries.length > 0 && (
                <Box sx={styles.infoList}>
                  {entries.map(([key, value], index) => (
                    <Box key={key} sx={styles.getInfoRow(index === entries.length - 1)}>
                      <Typography variant="body2" sx={styles.keyText}>
                        {key}
                      </Typography>
                      <Typography variant="subtitle2" sx={styles.valueText}>
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
