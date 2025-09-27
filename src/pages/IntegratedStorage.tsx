import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
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
import type { SelectChangeEvent } from '@mui/material/Select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { FormEvent } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { MdDeleteOutline, MdEdit } from 'react-icons/md';
import type { ZpoolCapacityEntry } from '../@types/zpool';
import BlurModal from '../components/BlurModal';
import { useDisk } from '../hooks/useDisk';
import { useZpool } from '../hooks/useZpool';
import axiosInstance from '../lib/axiosInstance';
import { formatBytes } from '../utils/formatters';

interface ApiErrorResponse {
  detail?: string;
  message?: string;
  errors?: string | string[];
  [key: string]: unknown;
}

interface CreatePoolPayload {
  pool_name: string;
  devices: string[];
  vdev_type: string;
}

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
  const queryClient = useQueryClient();
  const {
    data,
    isLoading: isPoolsLoading,
    error: zpoolError,
  } = useZpool({
    refetchInterval: 15000,
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [poolName, setPoolName] = useState('');
  const [vdevType, setVdevType] = useState('disk');
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [poolNameError, setPoolNameError] = useState<string | null>(null);
  const [devicesError, setDevicesError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const resetCreateForm = useCallback(() => {
    setPoolName('');
    setVdevType('disk');
    setSelectedDevices([]);
    setPoolNameError(null);
    setDevicesError(null);
    setApiError(null);
  }, []);

  const handleOpenCreate = useCallback(() => {
    resetCreateForm();
    setIsCreateModalOpen(true);
  }, [resetCreateForm]);

  const {
    data: diskData,
    isLoading: isDiskLoading,
    error: diskError,
  } = useDisk({
    enabled: isCreateModalOpen,
    refetchInterval: isCreateModalOpen ? 5000 : undefined,
  });

  const deviceOptions = useMemo(() => {
    const summary = diskData?.summary.disk_io_summary;
    if (!summary) {
      return [] as string[];
    }

    return Object.keys(summary).sort((a, b) => a.localeCompare(b, 'en'));
  }, [diskData?.summary.disk_io_summary]);

  const pools = useMemo(() => data?.pools ?? [], [data?.pools]);

  const extractApiMessage = useCallback(
    (error: AxiosError<ApiErrorResponse>) => {
      const payload = error.response?.data;

      if (!payload) {
        return error.message;
      }

      if (typeof payload === 'string') {
        return payload;
      }

      if (payload.detail && typeof payload.detail === 'string') {
        return payload.detail;
      }

      if (payload.message && typeof payload.message === 'string') {
        return payload.message;
      }

      if (payload.errors) {
        if (Array.isArray(payload.errors)) {
          return payload.errors.join('، ');
        }

        if (typeof payload.errors === 'string') {
          return payload.errors;
        }
      }

      return error.message;
    },
    []
  );

  const createPoolMutation = useMutation<
    unknown,
    AxiosError<ApiErrorResponse>,
    CreatePoolPayload
  >({
    mutationFn: async (payload) => {
      await axiosInstance.post('/api/zpool/create', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zpool'] });
      resetCreateForm();
      setIsCreateModalOpen(false);
      if (typeof window !== 'undefined') {
        window.alert('Pool جدید با موفقیت ایجاد شد.');
      }
    },
    onError: (error) => {
      setApiError(extractApiMessage(error));
    },
  });

  const handleCloseCreate = useCallback(() => {
    resetCreateForm();
    setIsCreateModalOpen(false);
    createPoolMutation.reset();
  }, [createPoolMutation, resetCreateForm]);

  const handleDeviceToggle = useCallback((device: string) => {
    setSelectedDevices((prev) => {
      if (prev.includes(device)) {
        return prev.filter((item) => item !== device);
      }

      return [...prev, device];
    });
  }, []);

  const handleVdevTypeChange = useCallback(
    (event: SelectChangeEvent<string>) => {
      setVdevType(event.target.value);
    },
    []
  );

  const handleCreateSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setPoolNameError(null);
      setDevicesError(null);
      setApiError(null);

      const trimmedName = poolName.trim();
      let hasError = false;

      if (!trimmedName) {
        setPoolNameError('لطفاً نام Pool را وارد کنید.');
        hasError = true;
      }

      if (selectedDevices.length === 0) {
        setDevicesError('حداقل یک دیسک را انتخاب کنید.');
        hasError = true;
      }

      if (hasError) {
        return;
      }

      createPoolMutation.mutate({
        pool_name: trimmedName,
        devices: selectedDevices,
        vdev_type: vdevType,
      });
    },
    [createPoolMutation, poolName, selectedDevices, vdevType]
  );

  const handleEdit = useCallback((pool: ZpoolCapacityEntry) => {
    if (typeof window !== 'undefined') {
      window.alert(`ویرایش Pool ${pool.name}`);
    }
  }, []);

  const deletePoolMutation = useMutation<
    unknown,
    AxiosError<ApiErrorResponse>,
    string
  >({
    mutationFn: async (poolNameParam) => {
      await axiosInstance.post('/api/zpool/delete', {
        pool_name: poolNameParam,
      });
    },
    onSuccess: (_, poolNameParam) => {
      queryClient.invalidateQueries({ queryKey: ['zpool'] });
      if (typeof window !== 'undefined') {
        window.alert(`Pool ${poolNameParam} با موفقیت حذف شد.`);
      }
    },
    onError: (error, poolNameParam) => {
      if (typeof window !== 'undefined') {
        window.alert(
          `خطا در حذف Pool ${poolNameParam}: ${extractApiMessage(error)}`
        );
      }
    },
  });

  const handleDelete = useCallback(
    (pool: ZpoolCapacityEntry) => {
      if (deletePoolMutation.isPending) {
        return;
      }

      if (
        typeof window !== 'undefined' &&
        window.confirm(`آیا از حذف Pool ${pool.name} مطمئن هستید؟`)
      ) {
        deletePoolMutation.mutate(pool.name);
      }
    },
    [deletePoolMutation]
  );

  return (
    <Box sx={{ p: 3, fontFamily: 'var(--font-vazir)' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
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
            variant="contained"
            sx={{
              px: 3,
              py: 1.25,
              borderRadius: 999,
              fontWeight: 700,
              fontSize: '0.95rem',
              background:
                'linear-gradient(135deg, var(--color-primary) 0%, rgba(31, 182, 255, 0.95) 100%)',
              color: 'var(--color-bg)',
              boxShadow: '0 16px 32px -18px rgba(31, 182, 255, 0.85)',
              '&:hover': {
                background:
                  'linear-gradient(135deg, rgba(0, 198, 169, 0.95) 0%, rgba(18, 140, 200, 0.95) 100%)',
                boxShadow: '0 18px 36px -18px rgba(0, 198, 169, 0.75)',
              },
            }}
          >
            ایجاد
          </Button>
        </Box>
      </Box>

      <BlurModal
        open={isCreateModalOpen}
        onClose={handleCloseCreate}
        title="ایجاد Pool جدید"
        actions={
          <>
            <Button
              onClick={handleCloseCreate}
              variant="outlined"
              color="inherit"
              disabled={createPoolMutation.isPending}
              sx={{ borderRadius: 999, px: 3, fontWeight: 600 }}
            >
              انصراف
            </Button>
            <Button
              type="submit"
              form="create-pool-form"
              variant="contained"
              disabled={createPoolMutation.isPending}
              sx={{
                borderRadius: 999,
                px: 4,
                fontWeight: 700,
                background:
                  'linear-gradient(135deg, var(--color-primary) 0%, rgba(31, 182, 255, 0.95) 100%)',
                boxShadow: '0 14px 28px -18px rgba(0, 198, 169, 0.8)',
                '&:hover': {
                  background:
                    'linear-gradient(135deg, rgba(0, 198, 169, 0.95) 0%, rgba(18, 140, 200, 0.95) 100%)',
                },
              }}
            >
              {createPoolMutation.isPending ? 'در حال ایجاد…' : 'ایجاد'}
            </Button>
          </>
        }
      >
        <Box
          component="form"
          id="create-pool-form"
          onSubmit={handleCreateSubmit}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="نام Pool"
              value={poolName}
              onChange={(event) => setPoolName(event.target.value)}
              autoFocus
              fullWidth
              error={Boolean(poolNameError)}
              helperText={poolNameError ?? 'نام یکتا برای Pool جدید وارد کنید.'}
              InputLabelProps={{ shrink: true }}
            />

            <FormControl fullWidth>
              <InputLabel id="vdev-type-label">نوع VDEV</InputLabel>
              <Select
                labelId="vdev-type-label"
                label="نوع VDEV"
                value={vdevType}
                onChange={handleVdevTypeChange}
              >
                <MenuItem value="disk">disk</MenuItem>
              </Select>
            </FormControl>

            <FormControl component="fieldset" error={Boolean(devicesError)}>
              <Typography sx={{ fontWeight: 600, mb: 1 }}>
                انتخاب دیسک‌ها
              </Typography>

              {isDiskLoading && (
                <LinearProgress sx={{ borderRadius: 999, height: 6 }} />
              )}

              {diskError && !isDiskLoading && (
                <Typography sx={{ color: 'var(--color-error)' }}>
                  خطا در دریافت اطلاعات دیسک‌ها: {diskError.message}
                </Typography>
              )}

              {!isDiskLoading && !diskError && deviceOptions.length === 0 && (
                <Typography sx={{ color: 'var(--color-secondary)' }}>
                  دیسکی برای انتخاب موجود نیست.
                </Typography>
              )}

              {!isDiskLoading && !diskError && deviceOptions.length > 0 && (
                <FormGroup
                  sx={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fill, minmax(160px, 1fr))',
                    gap: 1,
                    mt: 1,
                  }}
                >
                  {deviceOptions.map((device) => (
                    <FormControlLabel
                      key={device}
                      control={
                        <Checkbox
                          checked={selectedDevices.includes(device)}
                          onChange={() => handleDeviceToggle(device)}
                        />
                      }
                      label={device}
                    />
                  ))}
                </FormGroup>
              )}

              {devicesError && <FormHelperText>{devicesError}</FormHelperText>}
            </FormControl>

            {apiError && (
              <Typography sx={{ color: 'var(--color-error)', fontWeight: 600 }}>
                {apiError}
              </Typography>
            )}
          </Box>
        </Box>
      </BlurModal>

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
            {isPoolsLoading && (
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

            {zpoolError && !isPoolsLoading && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography sx={{ color: 'var(--color-error)' }}>
                    خطا در دریافت اطلاعات استخرها: {zpoolError.message}
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {!isPoolsLoading && !zpoolError && pools.length === 0 && (
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
    </Box>
  );
};

export default IntegratedStorage;
