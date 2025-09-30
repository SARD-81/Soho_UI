import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { FiEdit3 } from 'react-icons/fi';
import type { DataTableColumn } from '../../@types/dataTable';
import type { IPv4Info } from '../../@types/network';
import { useNetwork, type NetworkData } from '../../hooks/useNetwork';
import {
  extractIPv4Info,
  formatInterfaceSpeed,
} from '../../utils/networkDetails';
import DataTable from '../DataTable';

type NetworkSettingsTableRow = {
  id: string;
  interfaceName: string;
  ipv4Entries: IPv4Info[];
  speed: string;
};

const createSpeedFormatter = () =>
  new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 });

const createRows = (
  interfaces: NetworkData['interfaces'] | undefined,
  formatter: Intl.NumberFormat
): NetworkSettingsTableRow[] => {
  if (!interfaces) {
    return [];
  }

  return Object.entries(interfaces).map<NetworkSettingsTableRow>(
    ([interfaceName, details]) => {
      const ipv4Entries = extractIPv4Info(details);
      const speedText = formatInterfaceSpeed(details?.status, formatter);

      return {
        id: interfaceName,
        interfaceName,
        ipv4Entries,
        speed: speedText,
      };
    }
  );
};

const NetworkSettingsTable = () => {
  const { data, isLoading, error } = useNetwork();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const speedFormatter = useMemo(createSpeedFormatter, []);

  const rows = useMemo(
    () => createRows(data?.interfaces, speedFormatter),
    [data?.interfaces, speedFormatter]
  );

  useEffect(() => {
    if (page > 0 && page * rowsPerPage >= rows.length) {
      const lastPage = Math.max(Math.ceil(rows.length / rowsPerPage) - 1, 0);
      setPage(lastPage);
    }
  }, [page, rowsPerPage, rows.length]);

  const paginatedRows = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;

    return rows.slice(start, end);
  }, [page, rowsPerPage, rows]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number(event.target.value));
    setPage(0);
  };

  const columns = useMemo<DataTableColumn<NetworkSettingsTableRow>[]>(() => {
    const indexColumn: DataTableColumn<NetworkSettingsTableRow> = {
      id: 'row-index',
      header: '#',
      align: 'center',
      width: 64,
      renderCell: (_, index) => (
        <Typography component="span" sx={{ fontWeight: 500 }}>
          {(page * rowsPerPage + index + 1).toLocaleString('fa-IR')}
        </Typography>
      ),
    };

    const interfaceColumn: DataTableColumn<NetworkSettingsTableRow> = {
      id: 'interface-name',
      header: 'رابط شبکه',
      renderCell: (row) => (
        <Typography component="span" sx={{ fontWeight: 600 }}>
          {row.interfaceName}
        </Typography>
      ),
    };

    const ipv4Column: DataTableColumn<NetworkSettingsTableRow> = {
      id: 'ipv4-addresses',
      header: 'آدرس IPv4',
      renderCell: (row) => {
        if (row.ipv4Entries.length === 0) {
          return (
            <Typography component="span" sx={{ color: 'var(--color-secondary)' }}>
              آدرس IPv4 در دسترس نیست.
            </Typography>
          );
        }

        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {row.ipv4Entries.map((entry, index) => (
              <Typography component="span" key={`${row.id}-ipv4-${index}`} sx={{ fontWeight: 500 }}>
                {entry.address}
              </Typography>
            ))}
          </Box>
        );
      },
    };

    const netmaskColumn: DataTableColumn<NetworkSettingsTableRow> = {
      id: 'detail-netmask',
      header: 'نت‌ماسک',
      renderCell: (row) => {
        if (row.ipv4Entries.length === 0) {
          return '—';
        }

        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {row.ipv4Entries.map((entry, index) => (
              <Typography component="span" key={`${row.id}-netmask-${index}`}>
                {entry.netmask ?? '—'}
              </Typography>
            ))}
          </Box>
        );
      },
    };

    const speedColumn: DataTableColumn<NetworkSettingsTableRow> = {
      id: 'link-speed',
      header: 'سرعت لینک',
      renderCell: (row) => row.speed,
    };

    const actionColumn: DataTableColumn<NetworkSettingsTableRow> = {
      id: 'actions',
      header: 'عملیات',
      align: 'center',
      width: 96,
      renderCell: () => (
        <Tooltip title="ویرایش" arrow>
          <span>
            <IconButton
              size="small"
              disabled
              sx={{ color: 'var(--color-secondary)', opacity: 0.6 }}
            >
              <FiEdit3 size={18} />
            </IconButton>
          </span>
        </Tooltip>
      ),
    };

    return [
      indexColumn,
      interfaceColumn,
      ipv4Column,
      speedColumn,
      netmaskColumn,
      actionColumn,
    ];
  }, [page, rowsPerPage]);

  return (
    <Box sx={{ width: '100%' }}>
      <DataTable<NetworkSettingsTableRow>
        columns={columns}
        data={paginatedRows}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        error={error ?? null}
        pagination={{
          page,
          rowsPerPage,
          count: rows.length,
          onPageChange: handleChangePage,
          onRowsPerPageChange: handleChangeRowsPerPage,
          rowsPerPageOptions: [5, 10, 25],
          labelRowsPerPage: 'ردیف در هر صفحه',
          labelDisplayedRows: ({ from, to, count }) => {
            const localizedFrom = from.toLocaleString('fa-IR');
            const localizedTo = to.toLocaleString('fa-IR');
            const localizedCount =
              count !== -1
                ? count.toLocaleString('fa-IR')
                : `بیش از ${localizedTo}`;

            return `${localizedFrom}–${localizedTo} از ${localizedCount}`;
          },
          rowCountFormatter: (count) =>
            `تعداد کل موارد: ${count.toLocaleString('fa-IR')}`,
        }}
      />
    </Box>
  );
};

export default NetworkSettingsTable;
