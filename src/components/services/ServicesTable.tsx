import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import type { IconType } from 'react-icons';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiPlay,
  FiRefreshCw,
  FiSlash,
  FiStopCircle,
} from 'react-icons/fi';
import type { DataTableColumn } from '../../@types/dataTable';
import type { ServiceActionType, ServiceValue } from '../../@types/service';
import BlurModal from '../BlurModal';
import DataTable from '../DataTable';
import HelpTooltip from '../common/HelpTooltip';
import ModalActionButtons from '../common/ModalActionButtons';

interface ServiceTableRow {
  name: string;
  label: string;
  details: Record<string, ServiceValue>;
}

interface ServicesTableProps {
  services: ServiceTableRow[];
  isLoading: boolean;
  error: Error | null;
  onAction: (serviceName: string, action: ServiceActionType) => void;
  isActionLoading?: boolean;
  activeServiceName?: string | null;
  activeAction?: ServiceActionType | null;
}

type ServiceStatus =
  | 'running'
  | 'stopped'
  | 'transitioning'
  | 'error'
  | 'masked';

const actionLabels: Record<ServiceActionType, string> = {
  start: 'شروع',
  restart: 'راه‌اندازی مجدد',
  stop: 'توقف',
  reload: 'بارگذاری مجدد',
  enable: 'فعال‌سازی در زمان راه‌اندازی سیستم',
  disable: 'غیرفعال‌سازی در زمان راه‌اندازی سیستم',
  mask: 'ماسک کردن',
  unmask: 'حذف ماسک',
};

const statusConfig: Record<
  ServiceStatus,
  { label: string; color: string; background: string; icon: IconType }
> = {
  running: {
    label: 'در حال اجرا',
    color: 'var(--color-success)',
    background: 'rgba(0, 170, 90, 0.12)',
    icon: FiCheckCircle,
  },
  stopped: {
    label: 'متوقف',
    color: 'var(--color-secondary)',
    background: 'rgba(130, 130, 130, 0.12)',
    icon: FiStopCircle,
  },
  transitioning: {
    label: 'در حال تغییر وضعیت',
    color: 'var(--color-primary)',
    background: 'rgba(0, 123, 255, 0.12)',
    icon: FiRefreshCw,
  },
  error: {
    label: 'خطا',
    color: 'var(--color-error)',
    background: 'rgba(220, 53, 69, 0.12)',
    icon: FiAlertCircle,
  },
  masked: {
    label: 'ماسک شده',
    color: '#b26a00',
    background: 'rgba(255, 193, 7, 0.16)',
    icon: FiSlash,
  },
};

const getNormalizedString = (value: ServiceValue) =>
  typeof value === 'string' ? value.trim().toLowerCase() : '';

const normalizeServiceFlag = (value: ServiceValue): boolean | null => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    if (value === 1) return true;
    if (value === 0) return false;
    return null;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();

    if (['true', '1', 'yes', 'on', 'enabled', 'active'].includes(normalized)) {
      return true;
    }

    if (
      ['false', '0', 'no', 'off', 'disabled', 'inactive'].includes(normalized)
    ) {
      return false;
    }
  }

  return null;
};

const getServiceStateToken = (value: string) => value.split(/\s+/, 1)[0] ?? '';

const deriveStatus = (
  row: ServiceTableRow,
  isRuntimePending: boolean
): ServiceStatus => {
  if (isRuntimePending) {
    return 'transitioning';
  }

  const activeState =
    getNormalizedString(row.details.active) ||
    getNormalizedString(row.details.active_state);
  const subState =
    getNormalizedString(row.details.sub) ||
    getNormalizedString(row.details.sub_state);
  const subStateToken = getServiceStateToken(subState);
  const statusValue = getNormalizedString(row.details.status);
  const statusToken = getServiceStateToken(statusValue);
  const masked = normalizeServiceFlag(
    row.details.masked ?? row.details.mask
  );

  if (masked === true) {
    return 'masked';
  }

  if (statusToken === 'failed' || activeState === 'failed') {
    return 'error';
  }

  if (
    activeState === 'active' &&
    ['running', 'exited', 'listening'].includes(subStateToken)
  ) {
    return 'running';
  }

  if (['running', 'active'].includes(statusToken)) {
    return 'running';
  }

  return 'stopped';
};

const ServicesTable = ({
  services,
  isLoading,
  error,
  onAction,
  isActionLoading = false,
  activeServiceName = null,
  activeAction = null,
}: ServicesTableProps) => {
  const [confirmState, setConfirmState] = useState<{
    service: string;
    action: 'stop';
  } | null>(null);

  const columns = useMemo<DataTableColumn<ServiceTableRow>[]>(() => {
    const indexColumn: DataTableColumn<ServiceTableRow> = {
      id: 'service-index',
      header: 'ردیف',
      align: 'center',
      width: 64,
      renderCell: (_row, index) => (
        <Typography component="span" sx={{ fontWeight: 500 }}>
          {(index + 1).toLocaleString('en-US')}
        </Typography>
      ),
    };

    const nameColumn: DataTableColumn<ServiceTableRow> = {
      id: 'service-name',
      header: 'نام سرویس',
      align: 'left',
      renderCell: (row) => {
        const description =
          typeof row.details.description === 'string'
            ? row.details.description
            : undefined;

        return (
          <Stack spacing={0.5} alignItems="flex-start">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Typography component="span" sx={{ fontWeight: 700 }}>
                {row.label}
              </Typography>
              {description ? (
                <HelpTooltip title={description} placement="top" />
              ) : null}
            </Box>
            <Typography
              component="span"
              sx={{
                color: 'var(--color-secondary)',
                fontSize: '0.85rem',
                direction: 'ltr',
              }}
            >
              {row.name}
            </Typography>
          </Stack>
        );
      },
    };

    const statusColumn: DataTableColumn<ServiceTableRow> = {
      id: 'service-status',
      header: 'وضعیت اجرا',
      align: 'center',
      renderCell: (row) => {
        const isPending = isActionLoading && activeServiceName === row.name;
        const isRuntimePending =
          isPending && !['enable', 'disable'].includes(activeAction ?? '');
        const status = deriveStatus(row, isRuntimePending);
        const config = statusConfig[status];
        const Icon = config.icon;

        return (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 0.75,
              borderRadius: 99,
              backgroundColor: config.background,
              color: config.color,
              minWidth: 140,
              justifyContent: 'center',
              fontWeight: 600,
            }}
          >
            <Icon size={16} />
            <span>{config.label}</span>
          </Box>
        );
      },
    };

    const bootColumn: DataTableColumn<ServiceTableRow> = {
      id: 'service-boot-state',
      header: 'راه‌اندازی خودکار',
      align: 'center',
      renderCell: (row) => {
        const enabled = normalizeServiceFlag(row.details.enabled);
        const isPending =
          isActionLoading &&
          activeServiceName === row.name &&
          ['enable', 'disable'].includes(activeAction ?? '');
        const nextAction: ServiceActionType = enabled === true ? 'disable' : 'enable';
        const tooltip =
          enabled === true
            ? 'غیرفعال‌سازی در زمان راه‌اندازی سیستم'
            : 'فعال‌سازی در زمان راه‌اندازی سیستم';

        if (enabled === null) {
          return (
            <Tooltip title="وضعیت راه‌اندازی خودکار از API دریافت نشده است." arrow>
              <span>
                <Switch disabled checked={false} />
              </span>
            </Tooltip>
          );
        }

        return (
          <Stack direction="row" alignItems="center" justifyContent="center" gap={0.75}>
            {isPending ? <CircularProgress size={16} /> : null}
            <Tooltip title={tooltip} arrow>
              <span>
                <Switch
                  checked={enabled}
                  onChange={() => onAction(row.name, nextAction)}
                  disabled={isPending}
                  inputProps={{
                    'aria-label': tooltip,
                  }}
                  color="primary"
                />
              </span>
            </Tooltip>
            <Typography
              variant="caption"
              sx={{
                color: enabled
                  ? 'var(--color-success)'
                  : 'var(--color-secondary)',
                fontWeight: 700,
                minWidth: 48,
              }}
            >
              {enabled ? 'فعال' : 'غیرفعال'}
            </Typography>
          </Stack>
        );
      },
    };

    const actionColumn: DataTableColumn<ServiceTableRow> = {
      id: 'actions',
      header: 'عملیات',
      align: 'right',
      renderCell: (row) => {
        const isPending = isActionLoading && activeServiceName === row.name;
        const isRuntimePending =
          isPending && !['enable', 'disable'].includes(activeAction ?? '');
        const status = deriveStatus(row, isRuntimePending);
        const isRunning = status === 'running';
        const isMasked = status === 'masked';
        const action: ServiceActionType = isRunning ? 'stop' : 'start';
        const PrimaryIcon = isRunning ? FiStopCircle : FiPlay;

        const handleClick = () => {
          if (action === 'stop') {
            setConfirmState({ service: row.name, action: 'stop' });
            return;
          }

          onAction(row.name, action);
        };

        return (
          <Tooltip
            title={isMasked && action === 'start' ? 'ابتدا باید ماسک سرویس برداشته شود.' : ''}
            arrow
          >
            <span>
              <Button
                size="small"
                variant="contained"
                color={isRunning ? 'error' : 'success'}
                onClick={handleClick}
                disabled={isRuntimePending || (action === 'start' && isMasked)}
                startIcon={
                  isRuntimePending ? (
                    <CircularProgress color="inherit" size={14} />
                  ) : (
                    <PrimaryIcon size={16} />
                  )
                }
                sx={{
                  fontWeight: 700,
                  '&.Mui-disabled': { opacity: 0.6 },
                }}
              >
                {isRuntimePending
                  ? action === 'stop'
                    ? 'در حال توقف...'
                    : 'در حال شروع...'
                  : actionLabels[action]}
              </Button>
            </span>
          </Tooltip>
        );
      },
    };

    return [indexColumn, nameColumn, statusColumn, bootColumn, actionColumn];
  }, [activeAction, activeServiceName, isActionLoading, onAction]);

  return (
    <>
      <DataTable<ServiceTableRow>
        columns={columns}
        data={services}
        getRowId={(row) => row.name}
        isLoading={isLoading}
        error={error}
      />

      {confirmState ? (
        <BlurModal
          open
          onClose={() => setConfirmState(null)}
          title={
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              توقف سرویس؟
            </Typography>
          }
          actions={
            <ModalActionButtons
              onCancel={() => setConfirmState(null)}
              onConfirm={() => {
                onAction(confirmState.service, confirmState.action);
                setConfirmState(null);
              }}
              confirmLabel="توقف سرویس"
              cancelLabel="انصراف"
              confirmProps={{ color: 'error', disableElevation: true }}
              disableConfirmGradient
            />
          }
          minWidth={420}
        >
          <Typography sx={{ color: 'var(--color-secondary)', lineHeight: 1.7 }}>
            توقف این سرویس ممکن است باعث اختلال در دسترسی کاربران شود. آیا مطمئن
            هستید؟
          </Typography>
        </BlurModal>
      ) : null}
    </>
  );
};

export type { ServiceTableRow };
export default ServicesTable;
