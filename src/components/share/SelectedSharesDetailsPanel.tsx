import { Box, IconButton, Typography, useTheme } from '@mui/material';
import { useMemo } from 'react';
import { MdClose } from 'react-icons/md';
import type { SambaShareDetails } from '../../@types/samba';
import { createDetailPanelStyles } from '../../constants/detailPanels';
import formatDetailValue from '../../utils/formatDetailValue';

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
  const styles = useMemo(() => createDetailPanelStyles(theme), [theme]);

  if (!items.length) {
    return null;
  }

  return (
    <Box sx={styles.root}>
      <Typography variant="h6" sx={styles.title}>
        مقایسه جزئیات اشتراک‌ها
      </Typography>

      <Box sx={styles.cardsWrapper}>
        {items.map(({ shareName, detail }) => {
          const entries = Object.entries(detail ?? {}).sort(([a], [b]) =>
            a.localeCompare(b, 'fa-IR')
          );

          return (
            <Box key={shareName} sx={styles.card}>
              <Box sx={styles.cardHeader}>
                <Typography sx={styles.cardTitle}>
                  {shareName}
                </Typography>

                <IconButton
                  aria-label={`حذف ${shareName} از مقایسه`}
                  size="small"
                  onClick={() => onRemove(shareName)}
                  sx={styles.removeButton}
                >
                  <MdClose size={18} />
                </IconButton>
              </Box>

              {entries.length === 0 && (
                <Typography sx={styles.emptyState}>
                  اطلاعاتی برای نمایش وجود ندارد.
                </Typography>
              )}

              {entries.length > 0 && (
                <Box sx={styles.infoList}>
                  {entries.map(([key, value], index) => (
                    <Box key={key} sx={styles.getInfoRow(index === entries.length - 1)}>
                      <Typography variant="body2" sx={styles.keyText}>
                        {key}
                      </Typography>

                      <Typography variant="body2" sx={styles.valueText}>
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
