import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { useMemo } from 'react';
import { MdDeleteOutline } from 'react-icons/md';
import type { DataTableColumn } from '../../@types/dataTable.ts';
import type { ZpoolCapacityEntry } from '../../@types/zpool';
import { formatBytes } from '../../utils/formatters.ts';
import DataTable from '../DataTable';
import {
  clampPercent,
  formatCapacity,
  resolveStatus,
  STATUS_STYLES,
} from './status';

interface PoolsTableProps {
  pools: ZpoolCapacityEntry[];
  isLoading: boolean;
  error: Error | null;
  onEdit: (pool: ZpoolCapacityEntry) => void;
  onDelete: (pool: ZpoolCapacityEntry) => void;
  isDeleteDisabled: boolean;
  selectedPools: string[];
  onToggleSelect: (pool: ZpoolCapacityEntry, checked: boolean) => void;
}

const numberValueSx = {
  fontWeight: 600,
  color: 'var(--color-text)',
  direction: 'rtl' as const,
  // textAlign: 'right' as const,
  display: 'block',
  fontVariantNumeric: 'tabular-nums',
};

const PoolsTable = ({
  pools,
  isLoading,
  error,
  onEdit,
  onDelete,
  isDeleteDisabled,
  selectedPools,
  onToggleSelect,
}: PoolsTableProps) => {
  const columns: DataTableColumn<ZpoolCapacityEntry>[] = useMemo(
    () => [
      // {
      //   id: 'select',
      //   header: '',
      //   align: 'center',
      //   padding: 'checkbox',
      //   width: 52,
      //   headerSx: { width: 52 },
      //   cellSx: { width: 52 },
      //   getCellProps: () => ({ padding: 'checkbox' }),
      //   renderCell: (pool) => (
      //     <Checkbox
      //       checked={selectedPools.includes(pool.name)}
      //       onChange={(event) => onToggleSelect(pool, event.target.checked)}
      //       color="primary"
      //       inputProps={{ 'aria-label': `انتخاب ${pool.name}` }}
      //     />
      //   ),
      // },
      {
        id: 'name',
        header: 'نام فضای یکپارچه',
        align: 'left',
        renderCell: (pool) => (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            <Typography sx={{ fontWeight: 700, color: 'var(--color-text)' }}>
              {pool.name}
            </Typography>
            {/*<Typography*/}
            {/*  variant="caption"*/}
            {/*  sx={{ color: 'var(--color-secondary)' }}*/}
            {/*>*/}
            {/*  وضعیت گزارش‌شده: {pool.health ?? 'نامشخص'}*/}
            {/*</Typography>*/}
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
                {/*<Typography*/}
                {/*  component="span"*/}
                {/*  sx={{ mx: 0.5, color: 'var(--color-secondary)' }}*/}
                {/*>*/}
                {/*  از*/}
                {/*</Typography>*/}
                {/*{formatCapacity(pool.totalBytes)}*/}
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
        id: 'status',
        header: 'وضعیت',
        align: 'center',
        renderCell: (pool) => {
          const status = resolveStatus(pool.health);
          const statusStyle = STATUS_STYLES[status.key];

          return (
            <Chip
              label={status.label}
              sx={{
                px: 1.5,
                fontWeight: 600,
                backgroundColor: statusStyle.bg,
                color: statusStyle.color,
                borderRadius: '5px',
              }}
            />
          );
        },
      },
      {
        id: 'actions',
        header: 'عملیات',
        align: 'center',
        renderCell: (pool) => (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            {/*<Tooltip title="ویرایش">*/}
            {/*  <IconButton*/}
            {/*    size="small"*/}
            {/*    color="primary"*/}
            {/*    onClick={() => onEdit(pool)}*/}
            {/*  >*/}
            {/*    <MdEdit size={18} />*/}
            {/*  </IconButton>*/}
            {/*</Tooltip>*/}
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
    [isDeleteDisabled, onDelete, onEdit, onToggleSelect, selectedPools]
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
