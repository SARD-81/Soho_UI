import { Box, CircularProgress, IconButton, Tooltip, Typography } from '@mui/material';
import { useMemo } from 'react';
import type { IconType } from 'react-icons';
import { FiPlay, FiRefreshCw, FiStopCircle } from 'react-icons/fi';
import type { DataTableColumn } from '../../@types/dataTable';
import type { ServiceActionType, ServiceValue } from '../../@types/service';
import DataTable from '../DataTable';

interface ServiceTableRow {
  name: string;
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
  { action: 'start', label: 'شروع', icon: FiPlay, color: 'var(--color-success)' },
  {
    action: 'restart',
    label: 'راه‌اندازی مجدد',
    icon: FiRefreshCw,
    color: 'var(--color-primary)',
  },
  { action: 'stop', label: 'توقف', icon: FiStopCircle, color: 'var(--color-error)' },
];

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
  const detailKeys = useMemo(() => {
    const keys = new Set<string>();

    services.forEach((service) => {
      Object.keys(service.details).forEach((key) => {
        if (key !== 'unit') {
          keys.add(key);
        }
      });
    });

    return Array.from(keys).sort((a, b) => a.localeCompare(b, 'fa'));
  }, [services]);

  const columns = useMemo<DataTableColumn<ServiceTableRow>[]>(() => {
    const baseColumn: DataTableColumn<ServiceTableRow> = {
      id: 'service-name',
      header: 'سرویس',
      renderCell: (row) => (
        <Typography component="span" sx={{ fontWeight: 600 }}>
          {row.name}
        </Typography>
      ),
    };

    const dynamicColumns = detailKeys.map<DataTableColumn<ServiceTableRow>>((key) => ({
      id: key,
      header: key,
      renderCell: (row) => formatServiceValue(row.details[key]),
    }));

    const actionColumn: DataTableColumn<ServiceTableRow> = {
      id: 'actions',
      header: 'عملیات',
      align: 'center',
      renderCell: (row) => {
        const isPending = isActionLoading && activeServiceName === row.name;

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
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

            {isPending ? <CircularProgress size={18} sx={{ color: 'var(--color-primary)' }} /> : null}
          </Box>
        );
      },
    };

    return [baseColumn, ...dynamicColumns, actionColumn];
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
