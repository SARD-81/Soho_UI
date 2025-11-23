import {
  Box,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { useMemo } from 'react';
import type { IconType } from 'react-icons';
import { FiPlay, FiRefreshCw, FiStopCircle } from 'react-icons/fi';
import type { DataTableColumn } from '../../@types/dataTable';
import type { ServiceActionType, ServiceValue } from '../../@types/service';
import DataTable from '../DataTable';
import {
  buildKeyLengthMap,
  createLengthAwareComparator,
} from '../../utils/keySort';

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
}

const actionConfigs: Array<{
  action: ServiceActionType;
  label: string;
  icon: IconType;
  color: string;
}> = [
  {
    action: 'start',
    label: 'شروع',
    icon: FiPlay,
    color: 'var(--color-success)',
  },
  {
    action: 'restart',
    label: 'راه‌اندازی مجدد',
    icon: FiRefreshCw,
    color: 'var(--color-primary)',
  },
  {
    action: 'stop',
    label: 'توقف',
    icon: FiStopCircle,
    color: 'var(--color-error)',
  },
];

const numberTypographySx = {
  display: 'block',
  textAlign: 'center' as const,
  direction: 'ltr' as const,
  fontVariantNumeric: 'tabular-nums',
};

const serviceDetailLabels: Record<string, string> = {
  description: 'توضیحات',
  active: 'وضعیت کلی',
  sub: 'زیر وضعیت',
  load: 'وضعیت بارگذاری',
  pid: 'شناسه پردازش',
  enabled: 'فعال',
  status: 'وضعیت سرویس',
  last_action: 'آخرین اقدام',
  last_restart: 'آخرین راه‌اندازی مجدد',
};

const normalizedValueTranslations: Record<string, string> = {
  active: 'فعال',
  exited : 'خارج شده',
  inactive: 'غیرفعال',
  loaded: 'بارگذاری شده',
  activating: 'در حال فعال‌سازی',
  deactivating: 'در حال غیرفعال‌سازی',
  running: 'در حال اجرا',
  stopping: 'در حال توقف',
  stopped: 'متوقف',
  dead: 'متوقف',
  failed: 'ناموفق',
  enabling: 'در حال فعال‌سازی',
  disabling: 'در حال غیرفعال‌سازی',
  enabled: 'فعال',
  disabled: 'غیرفعال',
  pending: 'در انتظار',
};

const directValueTranslations: Record<string, string> = {
  'Samba SMB Daemon': 'سرویس SMB سامبا',
  'Samba NMB Daemon': 'سرویس NMB سامبا',
  'OpenSSH server daemon': 'سرویس سرور OpenSSH',
  'stopped via mock service': 'توسط سرویس شبیه‌ساز متوقف شد',
  'started via mock service': 'توسط سرویس شبیه‌ساز راه‌اندازی شد',
  'restarted via mock service': 'توسط سرویس شبیه‌ساز راه‌اندازی مجدد شد',
};

const formatServiceValue = (value: ServiceValue) => {
  if (value === null || value === undefined) {
    return '—';
  }

  if (typeof value === 'boolean') {
    return value ? 'بله' : 'خیر';
  }

  if (Array.isArray(value)) {
    return value.map((item) => (item ?? '—').toString()).join(', ');
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return new Intl.NumberFormat('en-US').format(value);
  }

  if (typeof value === 'string') {
    const directTranslation = directValueTranslations[value];
    if (directTranslation) {
      return directTranslation;
    }

    const normalizedValue = value.trim().toLowerCase();
    const normalizedTranslation = normalizedValueTranslations[normalizedValue];
    if (normalizedTranslation) {
      return normalizedTranslation;
    }
  }

  return String(value);
};

const ServicesTable = ({
  services,
  isLoading,
  error,
  onAction,
  isActionLoading = false,
  activeServiceName = null,
}: ServicesTableProps) => {
  const detailLengthMap = useMemo(
    () => buildKeyLengthMap(services.map((service) => service.details ?? {})),
    [services]
  );

  const detailKeys = useMemo(() => {
    const keys = new Set<string>();

    services.forEach((service) => {
      Object.keys(service.details).forEach((key) => {
        if (key !== 'unit') {
          keys.add(key);
        }
      });
    });

    return Array.from(keys).sort(
      createLengthAwareComparator(detailLengthMap, 'fa')
    );
  }, [detailLengthMap, services]);

  const columns = useMemo<DataTableColumn<ServiceTableRow>[]>(() => {
    const indexColumn: DataTableColumn<ServiceTableRow> = {
      id: 'service-index',
      header: 'ردیف',
      align: 'center',
      width: 64,
      renderCell: (_, index) => (
        <Typography component="span" sx={{ fontWeight: 500 }}>
          {(index + 1).toLocaleString('en-US')}
        </Typography>
      ),
    };

    const baseColumn: DataTableColumn<ServiceTableRow> = {
      id: 'service-name',
      header: 'نام سرویس',
      align: 'center',
      renderCell: (row) => (
        <Typography component="span" sx={{ fontWeight: 600 }}>
          {row.label}
        </Typography>
      ),
    };

    const dynamicColumns = detailKeys.map<DataTableColumn<ServiceTableRow>>(
      (key) => ({
        id: key,
        header: serviceDetailLabels[key] ?? key,
        align: 'center',
        renderCell: (row) => {
          const rawValue = row.details[key];
          const formatted = formatServiceValue(rawValue);
          const isNumeric =
            typeof rawValue === 'number' && Number.isFinite(rawValue);

          return (
            <Typography
              component="span"
              sx={isNumeric ? numberTypographySx : undefined}
            >
              {formatted}
            </Typography>
          );
        },
      })
    );

    const actionColumn: DataTableColumn<ServiceTableRow> = {
      id: 'actions',
      header: 'عملیات',
      align: 'center',
      renderCell: (row) => {
        const isPending = isActionLoading && activeServiceName === row.name;

        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
            }}
          >
            {actionConfigs.map(({ action, label, icon: Icon, color }) => (
              <Tooltip key={action} title={label} arrow>
                <span>
                  <IconButton
                    size="small"
                    onClick={() => onAction(row.name, action)}
                    disabled={isPending}
                    sx={{
                      color,
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      },
                      '&.Mui-disabled': {
                        color: 'var(--color-secondary)',
                        opacity: 0.5,
                      },
                    }}
                  >
                    <Icon size={18} />
                  </IconButton>
                </span>
              </Tooltip>
            ))}

            {isPending ? (
              <CircularProgress
                size={18}
                sx={{ color: 'var(--color-primary)' }}
              />
            ) : null}
          </Box>
        );
      },
    };

    return [indexColumn, baseColumn, ...dynamicColumns, actionColumn];
  }, [activeServiceName, detailKeys, isActionLoading, onAction]);

  return (
    <DataTable<ServiceTableRow>
      columns={columns}
      data={services}
      getRowId={(row) => row.name}
      isLoading={isLoading}
      error={error}
    />
  );
};

export type { ServiceTableRow };
export default ServicesTable;
