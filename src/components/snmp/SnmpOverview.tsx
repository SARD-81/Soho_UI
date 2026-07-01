import {
  Box,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import type { DataTableColumn } from '../../@types/dataTable';
import type { SnmpInfoData } from '../../@types/snmp';
import DataTable from '../DataTable';

interface SnmpOverviewProps {
  data?: SnmpInfoData;
  isLoading: boolean;
  error: Error | null;
}

interface SnmpTableRow {
  id: string;
  label: string;
  value: ReactNode;
  description: string;
}

const SNMP_DETAIL_VIEW_ID = 'snmp-settings';

const normalizeText = (value: unknown) => String(value ?? '').trim();

const displayText = (value: unknown) => {
  const normalized = normalizeText(value);
  return normalized.length > 0 ? normalized : '—';
};

const maskCommunity = (community?: string) => {
  const normalized = normalizeText(community);

  if (!normalized) {
    return '—';
  }

  if (normalized.length <= 3) {
    return '•••';
  }

  return `${normalized.slice(0, 2)}${'•'.repeat(Math.min(normalized.length - 2, 10))}`;
};

const createStatusChip = (enabled?: boolean) => (
  <Chip
    size="small"
    label={enabled ? 'فعال' : 'غیرفعال'}
    sx={{
      color: enabled ? 'var(--color-success)' : 'var(--color-error)',
      borderColor: enabled ? 'var(--color-success)' : 'var(--color-error)',
      backgroundColor: enabled
        ? 'rgba(16, 185, 129, 0.1)'
        : 'rgba(239, 68, 68, 0.1)',
      fontWeight: 800,
    }}
    variant="outlined"
  />
);

const createAllowedIpsValue = (allowedIps?: string[]) => {
  if (!allowedIps?.length) {
    return <Typography sx={{ color: 'var(--color-secondary)' }}>—</Typography>;
  }

  return (
    <Stack
      direction="row"
      spacing={0.75}
      useFlexGap
      flexWrap="wrap"
      justifyContent="center"
    >
      {allowedIps.map((ip) => (
        <Chip
          key={ip}
          size="small"
          label={ip}
          sx={{
            color: 'var(--color-primary)',
            borderColor: 'rgba(0, 198, 169, 0.35)',
            backgroundColor: 'rgba(0, 198, 169, 0.08)',
            direction: 'ltr',
            fontWeight: 700,
          }}
          variant="outlined"
        />
      ))}
    </Stack>
  );
};

const createMonospaceValue = (value: unknown) => (
  <Typography
    sx={{
      color: 'var(--color-text)',
      direction: 'ltr',
      fontWeight: 700,
      overflowWrap: 'anywhere',
      textAlign: 'center',
    }}
  >
    {displayText(value)}
  </Typography>
);

const buildSnmpRows = (data?: SnmpInfoData): SnmpTableRow[] => {
  if (!data) {
    return [];
  }

  return [
    {
      id: 'enabled',
      label: 'وضعیت سرویس',
      value: createStatusChip(Boolean(data.enabled)),
      description: data.enabled
        ? 'سرویس snmp فعال است'
        : 'سرویس snmp غیرفعال است',
    },
    {
      id: 'version',
      label: 'نسخه SNMP',
      value: createMonospaceValue(data.version),
      description: 'نسخه پروتکل snmp استفاده‌شده در سرویس',
    },
    {
      id: 'community',
      label: 'Community',
      value: createMonospaceValue(maskCommunity(data.community)),
      description: 'Community string',
    },
    {
      id: 'allowed_ips',
      label: 'Allowed IPs',
      value: createAllowedIpsValue(data.allowed_ips),
      description: 'لیست آدرس‌های آی‌پی که اجازه دسترسی به سرویس snmp را دارند.',
    },
    {
      id: 'bind_ip',
      label: 'Bind IP',
      value: createMonospaceValue(data.bind_ip),
      description: 'آدرسی که سرویس snmp روی آن bind شده است.',
    },
    {
      id: 'port',
      label: 'Port',
      value: createMonospaceValue(data.port),
      description: 'پورتی که سرویس snmp برای دریافت درخواست‌ها استفاده می‌کند.',
    },
    {
      id: 'sys_name',
      label: 'System Name',
      value: createMonospaceValue(data.sys_name),
      description: 'نام سیستمی که برای شناسایی تجهیز در مانیتورینگ استفاده می‌شود.',
    },
    {
      id: 'contact',
      label: 'Contact',
      value: createMonospaceValue(data.contact),
      description: 'اطلاعات تماس مسئول یا مالک سرویس',
    },
    {
      id: 'location',
      label: 'Location',
      value: createMonospaceValue(data.location),
      description: 'موقعیت فیزیکی سرور',
    },
  ];
};

const SnmpOverview = ({ data, isLoading, error }: SnmpOverviewProps) => {
  const rows = useMemo(() => buildSnmpRows(data), [data]);

  const columns = useMemo<DataTableColumn<SnmpTableRow>[]>(
    () => [
      {
        id: 'index',
        header: '#',
        align: 'center',
        width: 60,
        renderCell: (_row, index) => (
          <Typography sx={{ fontWeight: 600, color: 'var(--color-text)' }}>
            {index + 1}
          </Typography>
        ),
      },
      {
        id: 'label',
        header: 'مولفه',
        align: 'center',
        renderCell: (row) => (
          <Typography sx={{ color: 'var(--color-text)', fontWeight: 800 }}>
            {row.label}
          </Typography>
        ),
      },
      {
        id: 'value',
        header: 'مقدار',
        align: 'center',
        renderCell: (row) => row.value,
      },
      {
        id: 'description',
        header: 'توضیحات',
        align: 'left',
        renderCell: (row) => (
          <Typography
            sx={{
              color: 'var(--color-secondary)',
              lineHeight: 1.9,
            }}
          >
            {row.description}
          </Typography>
        ),
      },
    ],
    []
  );

  return (
    <DataTable<SnmpTableRow>
      detailViewId={SNMP_DETAIL_VIEW_ID}
      columns={columns}
      data={rows}
      getRowId={(row) => row.id}
      isLoading={isLoading}
      error={error}
      bodyRowSx={{ transition: 'background-color 0.2s ease' }}
      renderLoadingState={() => (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            alignItems: 'center',
            py: 4,
          }}
        >
          <CircularProgress color="primary" size={32} />
          <Typography sx={{ color: 'var(--color-secondary)' }}>
            در حال دریافت اطلاعات SNMP...
          </Typography>
        </Box>
      )}
      renderErrorState={(tableError) => (
        <Typography sx={{ color: 'var(--color-error)', py: 3 }}>
          خطا در دریافت اطلاعات SNMP: {tableError.message}
        </Typography>
      )}
      renderEmptyState={() => (
        <Typography sx={{ color: 'var(--color-secondary)', py: 3 }}>
          اطلاعاتی برای نمایش وجود ندارد.
        </Typography>
      )}
    />
  );
};

export default SnmpOverview;
