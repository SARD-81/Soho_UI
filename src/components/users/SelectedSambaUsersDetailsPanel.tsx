import { Box, Typography, useTheme } from '@mui/material';
import { useMemo } from 'react';
import type { SambaUserTableItem } from '../../@types/samba';
import DetailCard from '../common/DetailCard';
import {
  createDetailPanelContainerSx,
  detailCardsWrapperSx,
} from '../common/detailPanelStyles';
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
        مقایسه جزئیات کاربران اشتراک فایل
      </Typography>

      <Box sx={detailCardsWrapperSx}>
        {items.map((item) => {
          const normalizedEntries = Object.entries(item.details ?? {})
            .sort(([a], [b]) => a.localeCompare(b, 'fa-IR'))
            .map(([key, value]) => ({
              label: key,
              value: typeof value === 'string' ? value : formatDetailValue(value),
            }));

          return (
            <DetailCard
              key={item.username}
              title={item.username}
              entries={normalizedEntries}
              onRemove={() => onRemove(item.username)}
            />
          );
        })}
      </Box>
    </Box>
  );
};

export default SelectedSambaUsersDetailsPanel;
