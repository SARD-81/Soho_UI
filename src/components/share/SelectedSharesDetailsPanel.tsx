import { Box, Typography, useTheme } from '@mui/material';
import { useMemo } from 'react';
import type { SambaShareDetails } from '../../@types/samba';
import DetailCard from '../common/DetailCard';
import {
  createDetailPanelContainerSx,
  detailCardsWrapperSx,
} from '../common/detailPanelStyles';
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
  const containerSx = useMemo(() => createDetailPanelContainerSx(theme), [theme]);

  if (!items.length) {
    return null;
  }

  return (
    <Box sx={containerSx}>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 800,
          color: 'var(--color-primary)',
          textAlign: 'center',
          textShadow: '0 10px 28px rgba(0, 0, 0, 0.18)',
        }}
      >
        مقایسه جزئیات اشتراک‌ها
      </Typography>

      <Box sx={detailCardsWrapperSx}>
        {items.map(({ shareName, detail }) => {
          const normalizedEntries = Object.entries(detail ?? {})
            .sort(([a], [b]) => a.localeCompare(b, 'fa-IR'))
            .map(([key, value]) => ({
              label: key,
              value: formatDetailValue(value),
            }));

          return (
            <DetailCard
              key={shareName}
              title={shareName}
              entries={normalizedEntries}
              onRemove={() => onRemove(shareName)}
            />
          );
        })}
      </Box>
    </Box>
  );
};

export default SelectedSharesDetailsPanel;
