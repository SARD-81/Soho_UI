import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { useMemo } from 'react';
import { MdAddCircleOutline, MdDeleteOutline, MdSwapHoriz } from 'react-icons/md';
import type { DataTableColumn } from '../../@types/dataTable.ts';
import type { ZpoolCapacityEntry } from '../../@types/zpool';
import type { PoolDiskSlot, PoolSlotMap } from '../../hooks/usePoolDeviceSlots';
import { formatBytes } from '../../utils/formatters.ts';
import DataTable from '../DataTable';
import {
  clampPercent,
  formatCapacity,
  resolveStatus,
} from './status';

interface PoolsTableProps {
  pools: ZpoolCapacityEntry[];
  isLoading: boolean;
  error: Error | null;
  onEdit: (pool: ZpoolCapacityEntry) => void;
  onDelete: (pool: ZpoolCapacityEntry) => void;
  onReplace: (pool: ZpoolCapacityEntry) => void;
  onAddDevices: (pool: ZpoolCapacityEntry) => void;
  isDeleteDisabled: boolean;
  selectedPools: string[];
  onToggleSelect: (pool: ZpoolCapacityEntry, checked: boolean) => void;
  slotMap?: PoolSlotMap;
  slotErrors?: Record<string, string>;
  isSlotLoading?: boolean;
  onSlotClick?: (poolName: string, slot: PoolDiskSlot) => void;
}

const numberValueSx = {
  fontWeight: 600,
  color: 'var(--color-text)',
  direction: 'rtl' as const,
  // textAlign: 'right' as const,
  display: 'block',
  fontVariantNumeric: 'tabular-nums',
};

const STATUS_COLOR_MAP = {
  active: 'success',
  warning: 'warning',
  maintenance: 'info',
  unknown: 'default',
} as const;

const PoolsTable = ({
  pools,
  isLoading,
  error,
  onEdit,
  onDelete,
  onReplace,
  onAddDevices,
  isDeleteDisabled,
  selectedPools,
  onToggleSelect,
  slotMap = {},
  slotErrors = {},
  isSlotLoading = false,
  onSlotClick,
}: PoolsTableProps) => {
  const columns: DataTableColumn<ZpoolCapacityEntry>[] = useMemo(
    () => [
      {
        id: 'name',
        header: 'نام فضای یکپارچه',
        align: 'left',
        renderCell: (pool) => (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            <Typography sx={{ fontWeight: 700, color: 'var(--color-text)' }}>
              {pool.name}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'total',
        header: 'ظرفیت کل',
        align: 'left',
        renderCell: (pool) => (
          <Typography sx={numberValueSx}>
            {formatCapacity(pool.totalBytes)}
          </Typography>
        ),
      },
      {
        id: 'used',
        header: 'حجم مصرف‌شده',
        align: 'center',
        cellSx: { minWidth: 180 },
        renderCell: (pool) => {
          const utilization = clampPercent(pool.capacityPercent);

          return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box
                sx={{
                  position: 'relative',
                  height: 7,
                  borderRadius: '5px',
                  marginTop: 1,
                  backgroundColor: 'rgba(0, 198, 169, 0.12)',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    width: `${utilization ?? 0}%`,
                    transition: 'width 0.3s ease',
                    height: '100%',
                    background:
                      'linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',
                  }}
                />
              </Box>
              <Typography variant="body2" sx={numberValueSx}>
                {formatBytes(pool.usedBytes)}
              </Typography>
            </Box>
          );
        },
      },
      {
        id: 'free',
        header: 'حجم آزاد',
        align: 'right',
        renderCell: (pool) => (
          <Typography sx={numberValueSx}>
            {formatCapacity(pool.freeBytes)}
          </Typography>
        ),
      },
      {
        id: 'vdev-type',
        header: 'نوع آرایه',
        align: 'right',
        renderCell: (pool) => (
          <Chip
            label={pool.vdevLabel || '-'}
            variant="outlined"
            size="small"
            sx={{ fontWeight: 700, px: 0.75, minWidth: 80 , color:"var(--color-secondary)" }}
          />
        ),
      },
      {
        id: 'slots',
        header: 'شماره اسلات دیسک‌ها',
        align: 'center',
        cellSx: { minWidth: 220 },
        renderCell: (pool) => {
          const poolSlots = slotMap[pool.name] ?? [];
          const poolError = slotErrors[pool.name];

          if (isSlotLoading && poolSlots.length === 0) {
            return <CircularProgress size={18} thickness={4} color="primary" />;
          }

          if (poolError) {
            return (
              <Typography sx={{ color: 'var(--color-error)', fontWeight: 700, fontSize: '0.9rem' }}>
                {poolError}
              </Typography>
            );
          }

          if (poolSlots.length === 0) {
            return (
              <Typography sx={{ color: 'var(--color-secondary)' }}>
                دستگاهی برای این فضا ثبت نشده است.
              </Typography>
            );
          }

          return (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
              {poolSlots.map((slot) => {
                const slotLabel = slot.slotNumber ?? 'نامشخص';
                const tooltipContent = (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 700 }}>
                      دیسک: {slot.diskName}
                    </Typography>
                    <Typography sx={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.9)' }}>
                      {slot.wwn ? `WWN: ${slot.wwn}` : 'WWN نامشخص'}
                    </Typography>
                  </Box>
                );

                return (
                  <Tooltip key={`${pool.name}-${slot.diskName}-${slotLabel}`} title={tooltipContent} arrow>
                    <Chip
                      label={`اسلات ${slotLabel}`}
                      onClick={() => onSlotClick?.(pool.name, slot)}
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
                  </Tooltip>
                );
              })}
            </Box>
          );
        },
      },
      {
        id: 'status',
        header: 'وضعیت',
        align: 'center',
        renderCell: (pool) => {
          const status = resolveStatus(pool.health);
          const color = STATUS_COLOR_MAP[status.key] ?? 'default';

          return (
            <Chip
              label={status.label}
              color={color}
              variant="outlined"
              size="small"
              sx={{ fontWeight: 700, px: 0.75, minWidth: 88, justifyContent: 'center' }}
            />
          );
        },
      },
      {
        id: 'actions',
        header: 'عملیات',
        align: 'center',
        renderCell: (pool) => (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5 }}>
            <Tooltip title="جایگزینی دیسک">
              <IconButton
                size="small"
                color="primary"
                onClick={() => onReplace(pool)}
              >
                <MdSwapHoriz size={24} />
              </IconButton>
            </Tooltip>
            <Tooltip title="افزودن دیسک">
              <IconButton
                size="small"
                color="primary"
                onClick={() => onAddDevices(pool)}
              >
                <MdAddCircleOutline size={20} />
              </IconButton>
            </Tooltip>
            <Tooltip title="حذف">
              <IconButton
                size="small"
                color="error"
                onClick={() => onDelete(pool)}
                disabled={isDeleteDisabled}
              >
                <MdDeleteOutline size={18} />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ],
    [
      isDeleteDisabled,
      isSlotLoading,
      onDelete,
      onEdit,
      onAddDevices,
      onReplace,
      onSlotClick,
      onToggleSelect,
      selectedPools,
      slotErrors,
      slotMap,
    ]
  );

  return (
    <DataTable<ZpoolCapacityEntry>
      columns={columns}
      data={pools}
      getRowId={(pool) => pool.name}
      isLoading={isLoading}
      error={error}
      renderLoadingState={() => (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            alignItems: 'center',
          }}
        >
          <CircularProgress color="primary" size={32} />
          <Typography sx={{ color: 'var(--color-secondary)' }}>
            در حال دریافت اطلاعات فضا های یکپارچه ...
          </Typography>
        </Box>
      )}
      renderErrorState={(tableError) => (
        <Typography sx={{ color: 'var(--color-error)' }}>
          خطا در دریافت اطلاعات فضا های یکپارچه: {tableError.message}
        </Typography>
      )}
      renderEmptyState={() => (
        <Typography sx={{ color: 'var(--color-secondary)' }}>
          هیچ فضا یکپارچه فعالی برای نمایش وجود ندارد.
        </Typography>
      )}
    />
  );
};

export default PoolsTable;