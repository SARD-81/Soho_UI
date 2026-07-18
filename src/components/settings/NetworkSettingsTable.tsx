import {
  Box,
  Chip,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FiEdit3 } from 'react-icons/fi';
import type { DataTableColumn } from '../../@types/dataTable';
import type {
  ConfigureInterfaceMode,
  IPv4Info,
  NetworkInterfaceConfiguration,
} from '../../@types/network';
import { useConfigureNetworkInterface } from '../../hooks/useConfigureNetworkInterface';
import { useNetwork, type NetworkData } from '../../hooks/useNetwork';
import {
  extractIPv4Info,
  formatInterfaceSpeed,
} from '../../utils/networkDetails';
import DataTable from '../DataTable';
import NetworkInterfaceConfigModal from './NetworkInterfaceConfigModal';

type NetworkSettingsTableRow = {
  id: string;
  interfaceName: string;
  ipv4Entries: IPv4Info[];
  speed: string;
  configMode: ConfigureInterfaceMode;
  configuration: NetworkInterfaceConfiguration;
};

type NetworkConfigSubmitPayload =
  | { mode: 'dhcp'; mtu?: number }
  | {
      mode: 'static';
      ip: string;
      netmask: string;
      gateway?: string;
      dns?: string[];
      mtu?: number;
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
        configMode: details.configuration.configMode,
        configuration: details.configuration,
      };
    }
  );
};

const renderNetworkValues = (
  values: string[],
  emptyLabel: string,
  maxVisibleItems = 2
) => {
  if (values.length === 0) {
    return (
      <Typography component="span" sx={{ color: 'var(--color-secondary)' }}>
        {emptyLabel}
      </Typography>
    );
  }

  const visibleValues = values.slice(0, maxVisibleItems);
  const hiddenCount = values.length - visibleValues.length;

  return (
    <Tooltip title={values.join('، ')} arrow>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.25,
          direction: 'ltr',
        }}
      >
        {visibleValues.map((value) => (
          <Typography
            component="span"
            key={value}
            sx={{
              color: 'var(--color-text)',
              fontVariantNumeric: 'tabular-nums',
              whiteSpace: 'nowrap',
            }}
          >
            {value}
          </Typography>
        ))}
        {hiddenCount > 0 ? (
          <Typography
            component="span"
            sx={{ color: 'var(--color-primary)', fontSize: '0.75rem' }}
          >
            +{hiddenCount}
          </Typography>
        ) : null}
      </Box>
    </Tooltip>
  );
};

const NetworkSettingsTable = () => {
  const { data, isLoading, error } = useNetwork();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editModalError, setEditModalError] = useState<string | null>(null);
  const [editModalData, setEditModalData] = useState<{
    interfaceName: string;
    configuration: NetworkInterfaceConfiguration;
  } | null>(null);

  const speedFormatter = useMemo(createSpeedFormatter, []);

  const rows = useMemo(
    () => createRows(data?.interfaces, speedFormatter),
    [data?.interfaces, speedFormatter]
  );

  const configureInterface = useConfigureNetworkInterface({
    onSuccess: (interfaceName) => {
      toast.success(`پیکربندی رابط ${interfaceName} با موفقیت بروزرسانی شد.`);
      setIsEditModalOpen(false);
      setEditModalData(null);
      setEditModalError(null);
    },
    onError: (message) => {
      setEditModalError(message);
      toast.error(`به‌روزرسانی پیکربندی شبکه با خطا مواجه شد: ${message}`);
    },
  });

  const handleOpenEditModal = useCallback((row: NetworkSettingsTableRow) => {
    setEditModalData({
      interfaceName: row.interfaceName,
      configuration: row.configuration,
    });
    setEditModalError(null);
    setIsEditModalOpen(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setEditModalData(null);
    setEditModalError(null);
    configureInterface.reset();
  }, [configureInterface]);

  const handleSubmitEditModal = useCallback(
    (payload: NetworkConfigSubmitPayload) => {
      if (!editModalData) {
        return;
      }

      if (payload.mode === 'dhcp') {
        configureInterface.mutate({
          interfaceName: editModalData.interfaceName,
          mode: 'dhcp',
          mtu: payload.mtu,
        });
        return;
      }

      configureInterface.mutate({
        interfaceName: editModalData.interfaceName,
        ...payload,
      });
    },
    [configureInterface, editModalData]
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

    const configModeColumn: DataTableColumn<NetworkSettingsTableRow> = {
      id: 'config-mode',
      header: 'حالت پیکربندی',
      align: 'center',
      renderCell: (row) => (
        <Chip
          size="small"
          label={row.configMode === 'static' ? 'Static' : 'DHCP'}
          color={row.configMode === 'static' ? 'primary' : 'info'}
          variant="outlined"
          sx={{ minWidth: 78, fontWeight: 700 }}
        />
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
      header: 'ماسک شبکه',
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

    const gatewayColumn: DataTableColumn<NetworkSettingsTableRow> = {
      id: 'default-gateway',
      header: 'درگاه پیش‌فرض',
      align: 'center',
      renderCell: (row) =>
        renderNetworkValues(row.configuration.gateways, 'تنظیم نشده', 1),
    };

    const dnsColumn: DataTableColumn<NetworkSettingsTableRow> = {
      id: 'configured-dns',
      header: 'DNSهای تنظیم‌شده',
      align: 'center',
      renderCell: (row) =>
        renderNetworkValues(row.configuration.dns, 'تنظیم نشده', 2),
    };

    const speedColumn: DataTableColumn<NetworkSettingsTableRow> = {
      id: 'link-speed',
      header: 'سرعت لینک',
      align: 'center',
      renderCell: (row) => (
        <Typography
          component="span"
          sx={{
            display: 'block',
            textAlign: 'center',
            direction: 'rtl',
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
              aria-label={`ویرایش رابط ${row.interfaceName}`}
              onClick={() => handleOpenEditModal(row)}
              disabled={configureInterface.isPending}
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
      configModeColumn,
      ipv4Column,
      netmaskColumn,
      gatewayColumn,
      dnsColumn,
      speedColumn,
      actionColumn,
    ];
  }, [configureInterface.isPending, handleOpenEditModal]);

  return (
    <Box sx={{ width: '100%' }}>
      <DataTable<NetworkSettingsTableRow>
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        error={error ?? null}
      />

      <NetworkInterfaceConfigModal
        open={isEditModalOpen}
        interfaceName={editModalData?.interfaceName ?? null}
        initialConfiguration={editModalData?.configuration ?? null}
        onClose={handleCloseEditModal}
        onSubmit={handleSubmitEditModal}
        isSubmitting={configureInterface.isPending}
        errorMessage={editModalError}
      />
    </Box>
  );
};

export default NetworkSettingsTable;
