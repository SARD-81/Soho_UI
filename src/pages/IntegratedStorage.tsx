import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type FormEvent, useCallback, useMemo, useState } from 'react';
import { MdDeleteOutline, MdEdit } from 'react-icons/md';
import type { ZpoolCapacityEntry } from '../@types/zpool';
import { useZpool } from '../hooks/useZpool';
import { formatBytes } from '../utils/formatters';
import axiosInstance from '../lib/axiosInstance';

const STATUS_STYLES: Record<
  'active' | 'warning' | 'maintenance' | 'unknown',
  { bg: string; color: string; label: string }
> = {
  active: {
    bg: 'rgba(0, 198, 169, 0.18)',
    color: 'var(--color-primary)',
    label: 'فعال',
  },
  warning: {
    bg: 'rgba(227, 160, 8, 0.18)',
    color: '#e3a008',
    label: 'نیاز به بررسی',
  },
  maintenance: {
    bg: 'rgba(35, 167, 213, 0.18)',
    color: 'var(--color-primary-light)',
    label: 'در حال ارتقاء',
  },
  unknown: {
    bg: 'rgba(120, 120, 120, 0.18)',
    color: 'var(--color-secondary)',
    label: 'نامشخص',
  },
};

const clampPercent = (value: number | null | undefined) => {
  if (value == null || !Number.isFinite(value)) {
    return null;
  }

  if (value < 0) {
    return 0;
  }

  if (value > 100) {
    return 100;
  }

  return value;
};

const resolveStatus = (health?: string) => {
  if (!health) {
    return { key: 'unknown' as const, label: STATUS_STYLES.unknown.label };
  }

  const normalized = health.toLowerCase();

  if (normalized.includes('online') || normalized.includes('healthy')) {
    return { key: 'active' as const, label: STATUS_STYLES.active.label };
  }

  if (
    normalized.includes('degraded') ||
    normalized.includes('fault') ||
    normalized.includes('offline') ||
    normalized.includes('error')
  ) {
    return { key: 'warning' as const, label: STATUS_STYLES.warning.label };
  }

  if (
    normalized.includes('resilver') ||
    normalized.includes('rebuild') ||
    normalized.includes('replace') ||
    normalized.includes('sync')
  ) {
    return {
      key: 'maintenance' as const,
      label: STATUS_STYLES.maintenance.label,
    };
  }

  return { key: 'unknown' as const, label: health };
};

const formatCapacity = (value: number | null | undefined) =>
  formatBytes(value, {
    locale: 'fa-IR',
    maximumFractionDigits: 1,
    fallback: '-',
  });

const IntegratedStorage = () => {
  const { data, isLoading, error } = useZpool({ refetchInterval: 15000 });
  const queryClient = useQueryClient();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [poolName, setPoolName] = useState('');
  const [devicesInput, setDevicesInput] = useState('');
  const [vdevType, setVdevType] = useState('disk');
  const [formError, setFormError] = useState<string | null>(null);

  const pools = useMemo(() => data?.pools ?? [], [data?.pools]);

  const resetForm = useCallback(() => {
    setPoolName('');
    setDevicesInput('');
    setVdevType('disk');
    setFormError(null);
  }, []);

  type CreatePoolPayload = {
    pool_name: string;
    devices: string[];
    vdev_type: string;
  };

  const createPoolMutation = useMutation<unknown, Error, CreatePoolPayload>({
    mutationFn: async (payload) => {
      await axiosInstance.post('/api/zpool/create', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zpool'] });
      setIsCreateOpen(false);
      resetForm();
      if (typeof window !== 'undefined') {
        window.alert('استخر با موفقیت ایجاد شد.');
      }
    },
    onError: (mutationError) => {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : 'خطا در ایجاد استخر. لطفاً دوباره تلاش کنید.';
      setFormError(message);
    },
  });

  const deletePoolMutation = useMutation<unknown, Error, string>({
    mutationFn: async (name) => {
      await axiosInstance.post('/api/zpool/delete', { pool_name: name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zpool'] });
      if (typeof window !== 'undefined') {
        window.alert('استخر با موفقیت حذف شد.');
      }
    },
    onError: (mutationError) => {
      if (typeof window !== 'undefined') {
        const message =
          mutationError instanceof Error
            ? mutationError.message
            : 'خطا در حذف استخر. لطفاً دوباره تلاش کنید.';
        window.alert(message);
      }
    },
  });

  const handleEdit = useCallback((pool: ZpoolCapacityEntry) => {
    if (typeof window !== 'undefined') {
      window.alert(`ویرایش استخر ${pool.name}`);
    }
  }, []);

  const handleDelete = useCallback((pool: ZpoolCapacityEntry) => {
    if (typeof window === 'undefined' || deletePoolMutation.isPending) {
      return;
    }

    const confirmed = window.confirm(`آیا از حذف استخر ${pool.name} اطمینان دارید؟`);
    if (!confirmed) {
      return;
    }

    deletePoolMutation.mutate(pool.name);
  }, [deletePoolMutation]);

  const handleOpenCreate = useCallback(() => {
    resetForm();
    setIsCreateOpen(true);
  }, [resetForm]);

  const handleCloseCreate = useCallback(() => {
    if (createPoolMutation.isPending) {
      return;
    }

    setIsCreateOpen(false);
  }, [createPoolMutation.isPending]);

  const handleCreateSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setFormError(null);

      const trimmedPoolName = poolName.trim();
      const devices = devicesInput
        .split(/[\n,]+/)
        .map((item) => item.trim())
        .filter(Boolean);

      if (!trimmedPoolName) {
        setFormError('لطفاً نام استخر را وارد کنید.');
        return;
      }

      if (devices.length === 0) {
        setFormError('حداقل یک دستگاه باید معرفی شود.');
        return;
      }

      createPoolMutation.mutate({
        pool_name: trimmedPoolName,
        devices,
        vdev_type: vdevType,
      });
    },
    [createPoolMutation, devicesInput, poolName, vdevType]
  );

  return (
    <Box sx={{ p: 3, fontFamily: 'var(--font-vazir)' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography
            variant="h5"
            sx={{ color: 'var(--color-primary)', fontWeight: 700 }}
          >
            فضای یکپارچه
          </Typography>

          <Button
            onClick={handleOpenCreate}
            sx={{
              px: 3.5,
              py: 1.2,
              borderRadius: 2.5,
              fontWeight: 700,
              fontSize: '0.95rem',
              color: 'var(--color-bg)',
              background:
                'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))',
              boxShadow: '0 10px 25px -12px rgba(0, 198, 169, 0.7)',
              '&:hover': {
                background:
                  'linear-gradient(135deg, var(--color-primary-light), var(--color-primary))',
                boxShadow: '0 12px 32px -12px rgba(0, 198, 169, 0.8)',
              },
            }}
          >
            ایجاد
          </Button>
        </Box>
      </Box>

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
                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
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
                      در حال دریافت اطلاعات استخرها...
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}

            {error && !isLoading && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography sx={{ color: 'var(--color-error)' }}>
                    خطا در دریافت اطلاعات استخرها: {error.message}
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !error && pools.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography sx={{ color: 'var(--color-secondary)' }}>
                    هیچ استخر فعالی برای نمایش وجود ندارد.
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {pools.map((pool) => {
              const utilization = clampPercent(pool.capacityPercent);
              const status = resolveStatus(pool.health);
              const statusStyle = STATUS_STYLES[status.key];

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
                  <TableCell align="left">
                    <Typography
                      sx={{ fontWeight: 700, color: 'var(--color-text)' }}
                    >
                      {pool.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: 'var(--color-secondary)' }}
                    >
                      وضعیت گزارش‌شده: {pool.health ?? 'نامشخص'}
                    </Typography>
                  </TableCell>
                  <TableCell align="left">
                    <Typography
                      sx={{ fontWeight: 600, color: 'var(--color-text)' }}
                    >
                      {formatCapacity(pool.totalBytes)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ minWidth: 180 }}>
                    <Box
                      sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
                    >
                      <LinearProgress
                        variant="determinate"
                        value={utilization ?? 0}
                        sx={{
                          height: 8,
                          borderRadius: 999,
                          backgroundColor: 'rgba(0, 198, 169, 0.12)',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 999,
                            backgroundColor: 'var(--color-primary)',
                          },
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ color: 'var(--color-text)' }}
                      >
                        {formatCapacity(pool.usedBytes)}
                        <Typography
                          component="span"
                          sx={{ mx: 0.5, color: 'var(--color-secondary)' }}
                        >
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
                    <Box
                      sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}
                    >
                      <Tooltip title="ویرایش">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEdit(pool)}
                        >
                          <MdEdit size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="حذف">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(pool)}
                          disabled={deletePoolMutation.isPending}
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

      <Dialog
        open={isCreateOpen}
        onClose={handleCloseCreate}
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
            minWidth: { xs: 'auto', sm: 420 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: 'var(--color-primary)' }}>
          ایجاد استخر جدید
        </DialogTitle>
        <Box component="form" onSubmit={handleCreateSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="نام استخر"
              value={poolName}
              onChange={(event) => setPoolName(event.target.value)}
              fullWidth
              required
            />
            <TextField
              label="دستگاه‌ها"
              value={devicesInput}
              onChange={(event) => setDevicesInput(event.target.value)}
              placeholder="هر دستگاه را با ویرگول یا خط جدید جدا کنید"
              multiline
              minRows={3}
              fullWidth
              required
            />
            <TextField
              label="نوع VDEV"
              select
              value={vdevType}
              onChange={(event) => setVdevType(event.target.value)}
              fullWidth
            >
              <MenuItem value="disk">Disk</MenuItem>
              <MenuItem value="mirror">Mirror</MenuItem>
              <MenuItem value="raidz">RAID-Z</MenuItem>
              <MenuItem value="raidz2">RAID-Z2</MenuItem>
              <MenuItem value="raidz3">RAID-Z3</MenuItem>
            </TextField>

            {formError && (
              <Typography color="error" variant="body2">
                {formError}
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
            <Button
              onClick={handleCloseCreate}
              disabled={createPoolMutation.isPending}
              sx={{ fontWeight: 600 }}
            >
              انصراف
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createPoolMutation.isPending}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                fontWeight: 700,
                px: 3,
                borderRadius: 2,
                background:
                  'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))',
                '&:hover': {
                  background:
                    'linear-gradient(135deg, var(--color-primary-light), var(--color-primary))',
                },
              }}
            >
              {createPoolMutation.isPending && (
                <CircularProgress size={18} thickness={5} sx={{ color: 'inherit' }} />
              )}
              ایجاد استخر
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default IntegratedStorage;
