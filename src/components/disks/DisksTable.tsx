import { Box, Chip, Tooltip, Typography } from '@mui/material';
import { useCallback, useMemo } from 'react';
import type { DataTableColumn } from '../../@types/dataTable';
import type { DiskInventoryItem } from '../../@types/disk';
import { formatBytes } from '../../utils/formatters';
import DataTable from '../DataTable';
import { PiBroomFill } from 'react-icons/pi';

interface DisksTableProps {
  detailViewId: string;
  disks: DiskInventoryItem[];
  isLoading: boolean;
  error: Error | null;
  onWipe?: (disk: DiskInventoryItem) => void;
  disabledDiskNames?: string[];
  wipingDiskNames?: string[];
  areActionsLoading?: boolean;
  partitionStatus?: Record<
    string,
    { partitionCount: number | null; isLoading: boolean }
  >;
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
  detailViewId,
  disks,
  isLoading,
  error,
  onWipe,
  disabledDiskNames = [],
  wipingDiskNames = [],
  areActionsLoading = false,
  partitionStatus = {},
}: DisksTableProps) => {
  const disabledDisks = useMemo(
    () => new Set(disabledDiskNames.map((name) => name.trim()).filter(Boolean)),
    [disabledDiskNames]
  );

  const wipingDisks = useMemo(
    () => new Set(wipingDiskNames.map((name) => name.trim()).filter(Boolean)),
    [wipingDiskNames]
  );

  const resolvePartitionStatus = useCallback(
    (diskName: string) =>
      partitionStatus[diskName] ?? { partitionCount: null, isLoading: false },
    [partitionStatus]
  );

  const renderStateChip = useCallback(
    (label: string, color: 'default' | 'success' | 'warning' | 'error') => (
      <Chip
        label={label}
        color={color}
        variant="outlined"
        size="small"
        sx={{ fontWeight: 600, px: 0.5 }}
      />
    ),
    []
  );

  const handleRowClick = useCallback((disk: DiskInventoryItem) => {
    // DataTable will manage the active selection; this callback simply
    // preserves row click behavior without mutating shared state.
    return disk;
  }, []);

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
        id: 'disk',
        header: 'شماره اسلات',
        align: 'center',
        renderCell: (disk) => (
          <Chip
                      label={`اسلات ${disk.slot_number}`}
                      
                      sx={{
                        cursor: 'pointer',
                        fontWeight: 800,
                        color: 'var(--color-text)',
                        letterSpacing: '0.2px',
                        background:
                          'linear-gradient(135deg, rgba(25,123,255,0.12) 0%, rgba(21,196,197,0.2) 100%)',
                        border: '1px solid rgba(25,123,255,0.35)',
                        boxShadow: '0 16px 34px -26px rgba(25,123,255,0.9)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 16px 36px -24px rgba(14,174,164,0.9)',
                        },
                      }}
                    />
        ),
      },
      {
        id: 'total_bytes',
        header: 'حجم کل',
        align: 'center',
        renderCell: (disk) => (
          <Typography sx={{ fontWeight: 600, color: 'var(--color-text)',direction: 'rtl' }}>
            {formatBytes(disk.total_bytes , { fallback: '-' })}
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
                fontFamily: 'var(--font-roboto)',
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
        renderCell: (disk) =>
          renderStateChip(
            disk.state === 'running' ? 'فعال' :
            formatStateLabel(disk.state),
            resolveStateColor(disk.state)
          ),
      },
      {
        id: 'actions',
        header: 'عملیات',
        align: 'center',
        width: 160,
        renderCell: (disk) => {
          const isDisabled =
            areActionsLoading ||
            disabledDisks.has(disk.disk) ||
            wipingDisks.has(disk.disk);
          const { partitionCount, isLoading: isPartitionLoading } =
            resolvePartitionStatus(disk.disk);
          const hasPartitions =
            typeof partitionCount === 'number'
              ? partitionCount > 0
              : Boolean(disk.has_partition);
          const hasNoPartitions =
            typeof partitionCount === 'number'
              ? partitionCount === 0
              : disk.has_partition === false;

          if (disabledDisks.has(disk.disk) && hasPartitions) {
            return renderStateChip('در حال استفاده', 'error');
          }

          if (hasNoPartitions) {
            return renderStateChip('آزاد', 'warning');
          }

          return (
            <Tooltip title="پاکسازی دیسک" arrow>
              <span>
                {/* <Button
                  variant="contained"
                  size="small"
                  color="error"
                  disabled={
                    isDisabled ||
                    !onWipe ||
                    isPartitionLoading ||
                    hasNoPartitions ||
                    !hasPartitions
                  }
                  onClick={(event) => {
                    event.stopPropagation();
                    onWipe?.(disk);
                  }}
                > */}
                <Chip
                  label={<PiBroomFill size={18} />}
                  clickable={
                    isDisabled ||
                    !onWipe ||
                    isPartitionLoading ||
                    hasNoPartitions ||
                    !hasPartitions
                  }
                  onClick={(event) => {
                    event.stopPropagation();
                    onWipe?.(disk);
                  }}
                  color= "error"
                  variant="filled"
                  size="small"
                  sx={{ fontWeight: 600, px: 0.5 }}
                />
                {/* <PiBroomFill size={18} /> */}
                {/* </Button> */}
              </span>
            </Tooltip>
          );
        },
      },
    ];
  }, [
    areActionsLoading,
    disabledDisks,
    onWipe,
    renderStateChip,
    resolvePartitionStatus,
    wipingDisks,
  ]);

  return (
      <DataTable<DiskInventoryItem>
        detailViewId={detailViewId}
        columns={columns}
        data={disks}
        getRowId={(disk) => disk.disk}
      isLoading={isLoading}
      error={error}
      onRowClick={handleRowClick}
      renderEmptyState={() => (
        <Box sx={{ color: 'var(--color-secondary)' }}>
          دیسکی برای نمایش وجود ندارد.
        </Box>
      )}
    />
  );
};

export default DisksTable;