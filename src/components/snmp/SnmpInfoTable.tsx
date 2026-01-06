import { Box, Chip, Typography } from '@mui/material';
import type { SnmpInfoData } from '../../@types/snmp';
import DataTable from '../DataTable';
import type { DataTableColumn } from '../../@types/dataTable';

export interface SnmpInfoRow extends SnmpInfoData {
  id: string;
  details: Record<string, unknown>;
}

interface SnmpInfoTableProps {
  rows: SnmpInfoRow[];
  isLoading?: boolean;
  error?: Error | null;
  detailViewId: string;
}

const formatAllowedIps = (ips: string[] = []) => {
  if (!ips.length) {
    return <Typography sx={{ color: 'var(--color-secondary)' }}>-</Typography>;
  }

  const visibleIps = ips.slice(0, 2);
  const remainingCount = ips.length - visibleIps.length;

  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-start' }}>
      {visibleIps.map((ip) => (
        <Chip
          key={ip}
          label={ip}
          size="small"
          sx={{
            backgroundColor: 'rgba(0, 198, 169, 0.12)',
            color: 'var(--color-primary)',
            fontWeight: 700,
          }}
        />
      ))}
      {remainingCount > 0 ? (
        <Chip
          label={`+${remainingCount}`}
          size="small"
          sx={{
            backgroundColor: 'rgba(31, 182, 255, 0.12)',
            color: 'var(--color-secondary)',
            fontWeight: 700,
          }}
        />
      ) : null}
    </Box>
  );
};

const buildColumns = (): DataTableColumn<SnmpInfoRow>[] => [
  {
    id: 'community',
    header: 'جامعه',
    width: '30%',
    renderCell: (row) => row.community ?? '-',
  },
  {
    id: 'allowed_ips',
    header: 'آی‌پی‌های مجاز',
    width: '40%',
    renderCell: (row) => formatAllowedIps(row.allowed_ips ?? []),
  },
  {
    id: 'version',
    header: 'نسخه',
    width: '20%',
    renderCell: (row) => row.version ?? '-',
  },
];

const SnmpInfoTable = ({ rows, isLoading, error, detailViewId }: SnmpInfoTableProps) => {
  const columns = buildColumns();

  return (
    <DataTable<SnmpInfoRow>
      columns={columns}
      data={rows}
      getRowId={(row) => row.id}
      isLoading={isLoading}
      error={error}
      detailViewId={detailViewId}
      onRowClick={() => undefined}
      renderLoadingState={() => (
        <Typography sx={{ color: 'var(--color-secondary)', py: 3 }}>
          در حال دریافت تنظیمات SNMP...
        </Typography>
      )}
      renderErrorState={(tableError) => (
        <Typography sx={{ color: 'var(--color-error)', py: 3 }}>
          خطا در دریافت اطلاعات SNMP: {tableError.message}
        </Typography>
      )}
      renderEmptyState={() => (
        <Typography sx={{ color: 'var(--color-secondary)', py: 3 }}>
          تنظیماتی برای نمایش وجود ندارد.
        </Typography>
      )}
    />
  );
};

export default SnmpInfoTable;
