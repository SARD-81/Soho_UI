import { Box, IconButton, Typography, useTheme } from '@mui/material';
import { useMemo } from 'react';
import { MdClose } from 'react-icons/md';
import type { SambaUserTableItem } from '../../@types/samba';
import { createDetailPanelStyles } from '../../constants/detailPanels';
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
  const styles = useMemo(() => createDetailPanelStyles(theme), [theme]);

  if (!items.length) {
    return null;
  }

  return (
    <Box sx={styles.root}>
      <Typography variant="h6" sx={styles.title}>
        مقایسه جزئیات کاربران اشتراک فایل
      </Typography>

      <Box sx={styles.cardsWrapper}>
        {items.map((item) => {
          const entries = Object.entries(item.details ?? {}).sort(([a], [b]) =>
            a.localeCompare(b, 'fa-IR')
          );

          return (
            <Box key={item.username} sx={styles.card}>
              <Box sx={styles.cardHeader}>
                <Typography sx={styles.cardTitle}>
                  {item.username}
                </Typography>

                <IconButton
                  aria-label={`حذف ${item.username} از مقایسه`}
                  size="small"
                  onClick={() => onRemove(item.username)}
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
