import { Box, IconButton, Typography, useTheme } from '@mui/material';
import { MdClose } from 'react-icons/md';
import type { SambaUserTableItem } from '../../@types/samba';
import formatDetailValue from '../../utils/formatDetailValue';
import { buildDetailPanelStyles } from '../common/detailPanelStyles';

interface SelectedSambaUsersDetailsPanelProps {
  items: SambaUserTableItem[];
  onRemove: (username: string) => void;
}

const SelectedSambaUsersDetailsPanel = ({
  items,
  onRemove,
}: SelectedSambaUsersDetailsPanelProps) => {
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
        مقایسه جزئیات کاربران اشتراک فایل
      </Typography>

      <Box sx={collection}>
        {items.map((item) => {
          const entries = Object.entries(item.details ?? {}).sort(([a], [b]) =>
            a.localeCompare(b, 'fa-IR')
          );

          return (
            <Box key={item.username} sx={card}>
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
                  sx={removeButton}
                >
                  <MdClose size={18} />
                </IconButton>
              </Box>

              {entries.length === 0 && (
                <Typography sx={emptyState}>
                  اطلاعاتی برای نمایش وجود ندارد.
                </Typography>
              )}

              {entries.length > 0 && (
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
                        variant="body2"
                        sx={valueText}
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