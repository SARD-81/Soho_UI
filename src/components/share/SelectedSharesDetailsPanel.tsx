import { Box, IconButton, Typography, useTheme } from '@mui/material';
import { MdClose } from 'react-icons/md';
import type { SambaShareDetails } from '../../@types/samba';
import formatDetailValue from '../../utils/formatDetailValue';
import { buildDetailPanelStyles } from '../common/detailPanelStyles';

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
        مقایسه جزئیات اشتراک‌ها
      </Typography>

      <Box sx={collection}>
        {items.map(({ shareName, detail }) => {
          const entries = Object.entries(detail ?? {}).sort(([a], [b]) =>
            a.localeCompare(b, 'fa-IR')
          );

          return (
            <Box key={shareName} sx={card}>
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

                      <Typography variant="body2" sx={valueText}>
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
