import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FiEdit3 } from 'react-icons/fi';
import type { DataTableColumn } from '../../@types/dataTable';
import type { IPv4Info } from '../../@types/network';
import { useNetwork, type NetworkData } from '../../hooks/useNetwork';
import { useUpdateInterfaceIp } from '../../hooks/useUpdateInterfaceIp';
import {
  extractIPv4Info,
  formatInterfaceSpeed,
} from '../../utils/networkDetails';
import DataTable from '../DataTable';
import NetworkInterfaceIpEditModal from './NetworkInterfaceIpEditModal';

type NetworkSettingsTableRow = {
  id: string;
  interfaceName: string;
  ipv4Entries: IPv4Info[];
  speed: string;
};

const createSpeedFormatter = () =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editModalError, setEditModalError] = useState<string | null>(null);
  const [editModalData, setEditModalData] = useState<{
    interfaceName: string;
    ip: string;
    netmask: string;
  } | null>(null);

  const speedFormatter = useMemo(createSpeedFormatter, []);

  const rows = useMemo(
    () => createRows(data?.interfaces, speedFormatter),
    [data?.interfaces, speedFormatter]
  );

  const updateInterfaceIp = useUpdateInterfaceIp({
    onSuccess: (interfaceName) => {
      toast.success(`آدرس IP رابط ${interfaceName} با موفقیت بروزرسانی شد.`);
      setIsEditModalOpen(false);
      setEditModalData(null);
      setEditModalError(null);
    },
    onError: (message) => {
      setEditModalError(message);
      toast.error(`بروزرسانی آدرس IP با خطا مواجه شد: ${message}`);
    },
  });

  const handleOpenEditModal = useCallback((row: NetworkSettingsTableRow) => {
    const primaryEntry = row.ipv4Entries[0];

    setEditModalData({
      interfaceName: row.interfaceName,
      ip: primaryEntry?.address ?? '',
      netmask: primaryEntry?.netmask ?? '',
    });
    setEditModalError(null);
    setIsEditModalOpen(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setEditModalData(null);
    setEditModalError(null);
    updateInterfaceIp.reset();
  }, [updateInterfaceIp]);

  const handleSubmitEditModal = useCallback(
    ({ ip, netmask }: { ip: string; netmask: string }) => {
      if (!editModalData) {
        return;
      }

      const trimmedIp = ip.trim();
      const trimmedNetmask = netmask.trim();

      if (!trimmedIp || !trimmedNetmask) {
        return;
      }

      updateInterfaceIp.mutate({
        interfaceName: editModalData.interfaceName,
        ip: trimmedIp,
        netmask: trimmedNetmask,
      });
    },
    [editModalData, updateInterfaceIp]
  );

  const columns = useMemo<DataTableColumn<NetworkSettingsTableRow>[]>(() => {
    const indexColumn: DataTableColumn<NetworkSettingsTableRow> = {
      id: 'row-index',
      header: '#',
      align: 'center',
      width: 64,
      renderCell: (_, index) => (
        <Typography component="span" sx={{ fontWeight: 500 }}>
          {(index + 1).toLocaleString('en-US')}
        </Typography>
      ),
    };

    const interfaceColumn: DataTableColumn<NetworkSettingsTableRow> = {
      id: 'interface-name',
      header: 'رابط شبکه',
      align: 'center',
      renderCell: (row) => (
        <Typography component="span" sx={{ fontWeight: 600 }}>
          {row.interfaceName}
        </Typography>
      ),
    };

    const ipv4Column: DataTableColumn<NetworkSettingsTableRow> = {
      id: 'ipv4-addresses',
      header: 'آدرس IPv4',
      align: 'center',
      renderCell: (row) => {
        if (row.ipv4Entries.length === 0) {
          return (
            <Typography
              component="span"
              sx={{ color: 'var(--color-secondary)' }}
            >
              آدرس IPv4 در دسترس نیست.
            </Typography>
          );
        }

        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {row.ipv4Entries.map((entry, index) => (
              <Typography
                component="span"
                key={`${row.id}-ipv4-${index}`}
                sx={{ fontWeight: 500 }}
              >
                {entry.address}
              </Typography>
            ))}
          </Box>
        );
      },
    };

    const netmaskColumn: DataTableColumn<NetworkSettingsTableRow> = {
      id: 'detail-netmask',
      header: 'Netmask',
      align: 'center',
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
      header: 'link-speed',
      align: 'center',
      renderCell: (row) => (
        <Typography
          component="span"
          sx={{
            display: 'block',
            textAlign: 'center',
            direction: 'ltr',
            fontVariantNumeric: 'tabular-nums',
            color: 'var(--color-text)',
          }}
        >
          {row.speed}
        </Typography>
      ),
    };

    const actionColumn: DataTableColumn<NetworkSettingsTableRow> = {
      id: 'actions',
      header: 'عملیات',
      align: 'center',
      width: 96,
      renderCell: (row) => (
        <Tooltip title="ویرایش" arrow>
          <span>
            <IconButton
              size="small"
              onClick={() => handleOpenEditModal(row)}
              disabled={updateInterfaceIp.isPending}
              sx={{
                color: 'var(--color-primary)',
                '&.Mui-disabled': {
                  color:
                    'color-mix(in srgb, var(--color-secondary) 45%, transparent)',
                },
              }}
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
  }, [handleOpenEditModal, updateInterfaceIp.isPending]);

  return (
    <Box sx={{ width: '100%' }}>
      <DataTable<NetworkSettingsTableRow>
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        error={error ?? null}
      />

      <NetworkInterfaceIpEditModal
        open={isEditModalOpen}
        interfaceName={editModalData?.interfaceName ?? null}
        initialIp={editModalData?.ip ?? ''}
        initialNetmask={editModalData?.netmask ?? ''}
        onClose={handleCloseEditModal}
        onSubmit={handleSubmitEditModal}
        isSubmitting={updateInterfaceIp.isPending}
        errorMessage={editModalError}
      />
    </Box>
  );
};

export default NetworkSettingsTable;