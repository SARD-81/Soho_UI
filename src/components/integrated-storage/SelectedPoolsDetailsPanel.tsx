import { Box, Typography, useTheme } from '@mui/material';
import { useMemo } from 'react';
import type { ZpoolDetailEntry } from '../../@types/zpool';
import DetailCard from '../common/DetailCard';
import {
  createDetailPanelContainerSx,
  detailCardsWrapperSx,
} from '../common/detailPanelStyles';
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
        مقایسه جزئیات فضا های یکپارچه
      </Typography>

      <Box sx={detailCardsWrapperSx}>
        {items.map(({ poolName, detail, isLoading, error }) => {
          const entries = detail
            ? Object.entries(detail).map(([key, value]) => ({
                label: key,
                value: formatDetailValue(value),
              }))
            : [];

          return (
            <DetailCard
              key={poolName}
              title={poolName}
              entries={entries}
              onRemove={() => onRemove(poolName)}
              isLoading={isLoading}
              error={
                error
                  ? `خطا در دریافت اطلاعات این فضا: ${error.message}`
                  : null
              }
            />
          );
        })}
      </Box>
    </Box>
  );
};

export default SelectedPoolsDetailsPanel;
