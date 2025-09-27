import {
  Box,
  Checkbox,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { MdDeleteOutline, MdEdit } from 'react-icons/md';
import type { ZpoolCapacityEntry } from '../../@types/zpool';
import { clampPercent, formatCapacity, resolveStatus, STATUS_STYLES } from './status';

interface PoolsTableProps {
  pools: ZpoolCapacityEntry[];
  isLoading: boolean;
  error: Error | null;
  onEdit: (pool: ZpoolCapacityEntry) => void;
  onDelete: (pool: ZpoolCapacityEntry) => void;
  isDeleteDisabled: boolean;
  selectedPoolNames: string[];
  onTogglePoolSelection: (pool: ZpoolCapacityEntry, shouldSelect: boolean) => void;
  isSelectionLimitReached: boolean;
}

const PoolsTable = ({
  pools,
  isLoading,
  error,
  onEdit,
  onDelete,
  isDeleteDisabled,
  selectedPoolNames,
  onTogglePoolSelection,
  isSelectionLimitReached,
}: PoolsTableProps) => (
  <TableContainer
    component={Paper}
    sx={{
      mt: 4,
      borderRadius: 3,
      backgroundColor: 'var(--color-card-bg)',
      border: '1px solid var(--color-input-border)',
      boxShadow: '0 18px 40px -24px rgba(0, 0, 0, 0.35)',
      overflow: 'hidden',
    }}
  >
    <Table sx={{ minWidth: 720 }}>
      <TableHead>
        <TableRow
          sx={{
            background:
              'linear-gradient(90deg, var(--color-primary), var(--color-primary-light))',
            '& .MuiTableCell-root': {
              color: 'var(--color-bg)',
              fontWeight: 700,
              fontSize: '0.95rem',
              borderBottom: 'none',
            },
          }}
        >
          <TableCell padding="checkbox" align="center">
            انتخاب
          </TableCell>
          <TableCell align="left">نام Pool</TableCell>
          <TableCell align="left">ظرفیت کل</TableCell>
          <TableCell align="center">حجم مصرف‌شده</TableCell>
          <TableCell align="right">حجم آزاد</TableCell>
          <TableCell align="center">وضعیت</TableCell>
          <TableCell align="center">عملیات</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {isLoading && (
          <TableRow>
            <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
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
                  در حال دریافت اطلاعات Pool ها...
                </Typography>
              </Box>
            </TableCell>
          </TableRow>
        )}

        {error && !isLoading && (
          <TableRow>
            <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
              <Typography sx={{ color: 'var(--color-error)' }}>
                خطا در دریافت اطلاعات Pool ها: {error.message}
              </Typography>
            </TableCell>
          </TableRow>
        )}

        {!isLoading && !error && pools.length === 0 && (
          <TableRow>
            <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
              <Typography sx={{ color: 'var(--color-secondary)' }}>
                هیچ Pool فعالی برای نمایش وجود ندارد.
              </Typography>
            </TableCell>
          </TableRow>
        )}

        {pools.map((pool) => {
          const utilization = clampPercent(pool.capacityPercent);
          const status = resolveStatus(pool.health);
          const statusStyle = STATUS_STYLES[status.key];
          const isSelected = selectedPoolNames.includes(pool.name);

          return (
            <TableRow
              key={pool.name}
              sx={{
                '&:last-of-type .MuiTableCell-root': {
                  borderBottom: 'none',
                },
                '& .MuiTableCell-root': {
                  borderBottom: '1px solid var(--color-input-border)',
                  fontSize: '0.92rem',
                },
                '&:hover': {
                  backgroundColor: 'rgba(0, 198, 169, 0.08)',
                },
              }}
            >
              <TableCell align="center" padding="checkbox">
                <Checkbox
                  color="primary"
                  checked={isSelected}
                  onChange={(event) => onTogglePoolSelection(pool, event.target.checked)}
                  disabled={isSelectionLimitReached && !isSelected}
                  inputProps={{ 'aria-label': `انتخاب ${pool.name}` }}
                />
              </TableCell>
              <TableCell align="left">
                <Typography sx={{ fontWeight: 700, color: 'var(--color-text)' }}>
                  {pool.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'var(--color-secondary)' }}>
                  وضعیت گزارش‌شده: {pool.health ?? 'نامشخص'}
                </Typography>
              </TableCell>
              <TableCell align="left">
                <Typography sx={{ fontWeight: 600, color: 'var(--color-text)' }}>
                  {formatCapacity(pool.totalBytes)}
                </Typography>
              </TableCell>
              <TableCell align="center" sx={{ minWidth: 180 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box
                    sx={{
                      position: 'relative',
                      height: 8,
                      borderRadius: '10px',
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
                  <Typography variant="body2" sx={{ color: 'var(--color-text)' }}>
                    {formatCapacity(pool.usedBytes)}
                    <Typography component="span" sx={{ mx: 0.5, color: 'var(--color-secondary)' }}>
                      از
                    </Typography>
                    {formatCapacity(pool.totalBytes)}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell align="right">
                <Typography sx={{ color: 'var(--color-text)' }}>
                  {formatCapacity(pool.freeBytes)}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Chip
                  label={status.label}
                  sx={{
                    px: 1.5,
                    fontWeight: 600,
                    backgroundColor: statusStyle.bg,
                    color: statusStyle.color,
                    borderRadius: 2,
                  }}
                />
              </TableCell>
              <TableCell align="center">
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                  <Tooltip title="ویرایش">
                    <IconButton size="small" color="primary" onClick={() => onEdit(pool)}>
                      <MdEdit size={18} />
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
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  </TableContainer>
);

export default PoolsTable;
