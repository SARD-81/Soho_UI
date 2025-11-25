import { Box, Button, Chip, Tooltip, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useCallback, useMemo } from 'react';
import { PiBroomFill } from "react-icons/pi";
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
  onWipe?: (disk: DiskInventoryItem) => void;
  disabledDiskNames?: string[];
  wipingDiskNames?: string[];
  areActionsLoading?: boolean;
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
  onWipe,
  disabledDiskNames = [],
  wipingDiskNames = [],
  areActionsLoading = false,
}: DisksTableProps) => {
  const theme = useTheme();

  const disabledDisks = useMemo(
    () => new Set(disabledDiskNames.map((name) => name.trim()).filter(Boolean)),
    [disabledDiskNames]
  );

  const wipingDisks = useMemo(
    () => new Set(wipingDiskNames.map((name) => name.trim()).filter(Boolean)),
    [wipingDiskNames]
  );

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
        id: 'actions',
        header: 'عملیات',
        align: 'center',
        width: 160,
        renderCell: (disk) => {
          const isDisabled =
            areActionsLoading || disabledDisks.has(disk.disk) || wipingDisks.has(disk.disk);

          return (
            <Tooltip title="پاکسازی دیسک" arrow>
              <span>
                <Button
                  variant="contained"
                  size="small"
                  color="error"
                  disabled={isDisabled || !onWipe}
                  onClick={(event) => {
                    event.stopPropagation();
                    onWipe?.(disk);
                  }}
                  startIcon={<PiBroomFill size={18} />}
                >
                  پاکسازی
                </Button>
              </span>
            </Tooltip>
          );
        },
      },
    ];
  }, [areActionsLoading, disabledDisks, onWipe, wipingDisks]);

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