import { Box, Button, Chip, Tooltip, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useCallback, useMemo } from 'react';
import { MdOutlineTravelExplore } from 'react-icons/md';
import type { DataTableColumn } from '../../@types/dataTable';
import type { DiskInventoryItem } from '../../@types/disk';
import { formatBytes } from '../../utils/formatters';
import DataTable from '../DataTable';

interface DisksTableProps {
  disks: DiskInventoryItem[];
  isLoading: boolean;
  error: Error | null;
  selectedDiskNames: string[];
  onToggleSelect: (disk: DiskInventoryItem, checked: boolean) => void;
  onIdentify?: (disk: DiskInventoryItem) => void;
}

const formatStateLabel = (state: string | null | undefined) => {
  const normalized = state?.trim();
  return normalized && normalized.length > 0 ? normalized : '-';
};

const resolveStateColor = (
  state: string | null | undefined
): 'default' | 'success' | 'warning' | 'error' => {
  const normalized = state?.toLowerCase();

  switch (normalized) {
    case 'online':
    case 'live':
    case 'running':
      return 'success';
    case 'degraded':
    case 'recovering':
      return 'warning';
    case 'offline':
    case 'faulted':
    case 'failed':
      return 'error';
    default:
      return 'default';
  }
};

const DisksTable = ({
  disks,
  isLoading,
  error,
  selectedDiskNames,
  onToggleSelect,
  onIdentify,
}: DisksTableProps) => {
  const theme = useTheme();

  const handleRowClick = useCallback(
    (disk: DiskInventoryItem) => {
      const isSelected = selectedDiskNames.includes(disk.disk);
      onToggleSelect(disk, !isSelected);
    },
    [onToggleSelect, selectedDiskNames]
  );

  const resolveRowSx = useCallback(
    (disk: DiskInventoryItem) => {
      const isSelected = selectedDiskNames.includes(disk.disk);

      if (!isSelected) {
        return {};
      }

      return {
        backgroundColor: alpha(theme.palette.primary.main, 0.12),
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.18),
        },
      };
    },
    [selectedDiskNames, theme]
  );

  const columns = useMemo<DataTableColumn<DiskInventoryItem>[]>(() => {
    return [
      {
        id: 'disk',
        header: 'نام دیسک',
        align: 'left',
        renderCell: (disk) => (
          <Typography sx={{ fontWeight: 700, color: 'var(--color-text)' }}>
            {disk.disk}
          </Typography>
        ),
      },
      {
        id: 'total_bytes',
        header: 'حجم کل',
        align: 'center',
        renderCell: (disk) => (
          <Typography sx={{ fontWeight: 600, color: 'var(--color-text)' }}>
            {formatBytes(disk.total_bytes, { fallback: '-' })}
          </Typography>
        ),
      },
      {
        id: 'wwn',
        header: 'شناسه WWN',
        align: 'center',
        renderCell: (disk) => {
          const wwn = disk.wwn?.trim();

          if (!wwn) {
            return (
              <Typography sx={{ color: 'var(--color-secondary)' }}>
                -
              </Typography>
            );
          }

          return (
            <Typography
              sx={{
                color: 'var(--color-primary)',
                fontFamily: 'monospace',
                direction: 'ltr',
                textTransform: 'none',
              }}
            >
              {wwn}
            </Typography>
          );
        },
      },
      {
        id: 'state',
        header: 'وضعیت',
        align: 'center',
        width: 140,
        renderCell: (disk) => (
          <Chip
            label={formatStateLabel(disk.state)}
            color={resolveStateColor(disk.state)}
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600, px: 0.5 }}
          />
        ),
      },
      {
        id: 'identify',
        header: 'شناسایی دیسک',
        align: 'center',
        width: 160,
        renderCell: (disk) => (
          <Tooltip title="شناسایی دیسک" arrow>
            <span>
              <Button
                variant="contained"
                size="small"
                color="primary"
                onClick={(event) => {
                  event.stopPropagation();
                  onIdentify?.(disk);
                }}
                startIcon={<MdOutlineTravelExplore size={18} />}
              >
                شناسایی
              </Button>
            </span>
          </Tooltip>
        ),
      },
    ];
  }, [ onIdentify]);

  return (
    <DataTable<DiskInventoryItem>
      columns={columns}
      data={disks}
      getRowId={(disk) => disk.disk}
      isLoading={isLoading}
      error={error}
      onRowClick={handleRowClick}
      bodyRowSx={(disk: DiskInventoryItem) => ({
        ...resolveRowSx(disk),
        transition: 'background-color 0.2s ease',
      })}
      renderEmptyState={() => (
        <Box sx={{ color: 'var(--color-secondary)' }}>
          دیسکی برای نمایش وجود ندارد.
        </Box>
      )}
    />
  );
};

export default DisksTable;
