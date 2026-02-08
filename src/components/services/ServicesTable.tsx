import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import type { IconType } from 'react-icons';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiPlay,
  FiPower,
  FiRefreshCw,
  FiRepeat,
  FiShieldOff,
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
}

type ServiceStatus =
  | 'running'
  | 'stopped'
  | 'transitioning'
  | 'error'
  | 'disabled'
  | 'masked';

const actionLabels: Record<ServiceActionType, string> = {
  start: 'شروع',
  restart: 'راه‌اندازی مجدد',
  stop: 'توقف',
  reload: 'بارگذاری مجدد',
  enable: 'فعال‌سازی',
  disable: 'غیرفعال‌سازی',
  mask: 'ماسک کردن',
  unmask: 'حذف ماسک',
};

const actionIcons: Record<ServiceActionType, IconType> = {
  start: FiPlay,
  stop: FiStopCircle,
  restart: FiRefreshCw,
  reload: FiRepeat,
  enable: FiPower,
  disable: FiPower,
  mask: FiSlash,
  unmask: FiShieldOff,
};

// const serviceDetailLabels: Record<string, string> = {
//   description: 'توضیحات',
//   active: 'وضعیت کلی',
//   active_state: 'وضعیت کلی',
//   sub: 'زیر وضعیت',
//   sub_state: 'زیر وضعیت',
//   load: 'وضعیت بارگذاری',
//   pid: 'شناسه پردازش',
//   enabled: 'فعال',
//   masked: 'ماسک شده',
//   status: 'وضعیت سرویس',
//   last_action: 'آخرین اقدام',
//   last_restart: 'آخرین راه‌اندازی مجدد',
// };

// const normalizedValueTranslations: Record<string, string> = {
//   active: 'فعال',
//   exited: 'خارج شده',
//   inactive: 'غیرفعال',
//   loaded: 'بارگذاری شده',
//   activating: 'در حال فعال‌سازی',
//   deactivating: 'در حال غیرفعال‌سازی',
//   running: 'در حال اجرا',
//   stopping: 'در حال توقف',
//   stopped: 'متوقف',
//   dead: 'متوقف',
//   failed: 'ناموفق',
//   enabling: 'در حال فعال‌سازی',
//   disabling: 'در حال غیرفعال‌سازی',
//   enabled: 'فعال',
//   disabled: 'غیرفعال',
//   pending: 'در انتظار',
//   masked: 'ماسک شده',
//   unmasked: 'ماسک نشده',
// };

// const directValueTranslations: Record<string, string> = {
//   'Samba SMB Daemon': 'سرویس SMB سامبا',
//   'Samba NMB Daemon': 'سرویس NMB سامبا',
//   'OpenSSH server daemon': 'سرویس سرور OpenSSH',
//   'Raise network interfaces': 'راه‌اندازی رابط‌های شبکه',
//   'A high performance web server and a reverse proxy server':
//     'وب‌سرور قدرتمند و پراکسی معکوس',
//   'stopped via mock service': 'توسط سرویس شبیه‌ساز متوقف شد',
//   'started via mock service': 'توسط سرویس شبیه‌ساز راه‌اندازی شد',
//   'restarted via mock service': 'توسط سرویس شبیه‌ساز راه‌اندازی مجدد شد',
//   'reloaded via mock service': 'توسط سرویس شبیه‌ساز بارگذاری مجدد شد',
//   'enabled via mock service': 'توسط سرویس شبیه‌ساز فعال شد',
//   'disabled via mock service': 'توسط سرویس شبیه‌ساز غیرفعال شد',
//   'masked via mock service': 'توسط سرویس شبیه‌ساز ماسک شد',
//   'unmasked via mock service': 'ماسک توسط سرویس شبیه‌ساز حذف شد',
// };

// const numberTypographySx = {
//   display: 'block',
//   textAlign: 'center' as const,
//   direction: 'ltr' as const,
//   fontVariantNumeric: 'tabular-nums',
// };

// const formatServiceValue = (value: ServiceValue) => {
//   if (value === null || value === undefined) {
//     return '—';
//   }

//   if (typeof value === 'boolean') {
//     return value ? 'بله' : 'خیر';
//   }

//   if (Array.isArray(value)) {
//     return value.map((item) => (item ?? '—').toString()).join(', ');
//   }

//   if (typeof value === 'number' && Number.isFinite(value)) {
//     return value;
//   }

//   if (typeof value === 'string') {
//     const directTranslation = directValueTranslations[value];
//     if (directTranslation) {
//       return directTranslation;
//     }

//     const normalized = value.trim().toLowerCase();
//     const normalizedTranslation = normalizedValueTranslations[normalized];

//     if (normalizedTranslation) {
//       return normalizedTranslation;
//     }
//   }

//   return value?.toString?.() ?? '—';
// };

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
  disabled: {
    label: 'غیرفعال',
    color: 'var(--color-secondary)',
    background: 'rgba(130, 130, 130, 0.12)',
    icon: FiPower,
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

const deriveStatus = (
  row: ServiceTableRow,
  isPending: boolean
): { status: ServiceStatus; enabled: boolean; masked: boolean } => {
  if (isPending) {
    return { status: 'transitioning', enabled: true, masked: false };
  }

  const activeState =
    getNormalizedString(row.details.active) ||
    getNormalizedString(row.details.active_state);
  const subState =
    getNormalizedString(row.details.sub) ||
    getNormalizedString(row.details.sub_state);
  const statusValue = getNormalizedString(row.details.status);
  const enabled =
    row.details.enabled === undefined || row.details.enabled === null
      ? true
      : Boolean(row.details.enabled);
  const masked = Boolean(row.details.masked ?? row.details.mask);

  if (masked) {
    return { status: 'masked', enabled, masked };
  }

  if (enabled === false) {
    return { status: 'disabled', enabled, masked };
  }

  if (statusValue === 'failed' || activeState === 'failed') {
    return { status: 'error', enabled, masked };
  }

  if (activeState === 'active' && ['running', 'exited'].includes(subState)) {
    return { status: 'running', enabled, masked };
  }

  if (statusValue === 'running' || statusValue === 'active') {
    return { status: 'running', enabled, masked };
  }

  return { status: 'stopped', enabled, masked };
};

const getPrimaryAction = (status: ServiceStatus): ServiceActionType =>
  status === 'running' ? 'stop' : 'start';

const getOverflowActions = (
  status: ServiceStatus,
  enabled: boolean,
  masked: boolean
): ServiceActionType[] => {
  const actions: ServiceActionType[] = [];
  const isRunning = status === 'running';

  if (isRunning) {
    actions.push('restart', 'reload');
  } else {
    actions.push('restart');
  }

  if (masked) {
    actions.push('unmask');
  } else {
    actions.push('mask');
  }

  if (enabled) {
    actions.push('disable');
  } else {
    actions.push('enable');
  }

  return actions;
};

const ServicesTable = ({
  services,
  isLoading,
  error,
  onAction,
  isActionLoading = false,
  activeServiceName = null,
}: ServicesTableProps) => {
  const [menuState, setMenuState] = useState<{
    anchorEl: HTMLElement | null;
    service: string | null;
  }>({ anchorEl: null, service: null });

  const [confirmState, setConfirmState] = useState<{
    service: string;
    action: ServiceActionType;
  } | null>(null);

  const detailKeys = useMemo(() => {
    const keys = new Set<string>();

    services.forEach((service) => {
      Object.keys(service.details).forEach((key) => {
        if (
          !['unit', 'description', 'enabled', 'masked', 'status'].includes(key)
        ) {
          keys.add(key);
        }
      });
    });

    return Array.from(keys).sort((a, b) => a.localeCompare(b, 'fa'));
  }, [services]);

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
      header: 'وضعیت',
      align: 'center',
      // width: 150,
      renderCell: (row) => {
        const isPending = isActionLoading && activeServiceName === row.name;
        const { status } = deriveStatus(row, isPending);
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

    // const dynamicColumns = detailKeys.map<DataTableColumn<ServiceTableRow>>(
    //   (key) => ({
    //     id: key,
    //     header: serviceDetailLabels[key] ?? key,
    //     align: 'center',
    //     renderCell: (row) => {
    //       const rawValue = row.details[key];
    //       const formatted = formatServiceValue(rawValue);
    //       const isNumeric = typeof rawValue === 'number' && Number.isFinite(rawValue);

    //       return (
    //         <Typography
    //           component="span"
    //           sx={isNumeric ? numberTypographySx : undefined}
    //         >
    //           {formatted}
    //         </Typography>
    //       );
    //     },
    //   })
    // );

    const actionColumn: DataTableColumn<ServiceTableRow> = {
      id: 'actions',
      header: 'عملیات',
      align: 'right',
      // width: 240,
      renderCell: (row) => {
        const isPending = isActionLoading && activeServiceName === row.name;
        const { status, enabled, masked } = deriveStatus(row, isPending);
        const primaryAction = getPrimaryAction(status);
        const primaryDisabled =
          isPending || (primaryAction === 'start' && masked);
        const overflowActions = getOverflowActions(status, enabled, masked);
        const toggleAction: ServiceActionType = enabled ? 'disable' : 'enable';
        const ToggleIcon = actionIcons[toggleAction];
        const toggleLabel = actionLabels[toggleAction];
        const toggleColor = toggleAction === 'enable' ? 'primary' : 'warning';

        const handlePrimaryClick = () => {
          if (['stop', 'restart'].includes(primaryAction)) {
            setConfirmState({ service: row.name, action: primaryAction });
            return;
          }

          onAction(row.name, primaryAction);
        };

        // const handleMenuClick = (event: MouseEvent<HTMLButtonElement>) => {
        //   setMenuState({ anchorEl: event.currentTarget, service: row.name });
        // };

        const pendingLabel =
          primaryAction === 'stop' ? 'در حال توقف...' : 'در حال شروع...';
        const PrimaryIcon =
          primaryAction === 'start' ? actionIcons.start : actionIcons.stop;

        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 1,
              // minWidth: 20,
            }}
          >
            <Tooltip
              title={
                primaryDisabled && masked
                  ? 'ابتدا باید ماسک سرویس برداشته شود.'
                  : ''
              }
              arrow
            >
              <span>
                <Button
                  size="small"
                  variant="contained"
                  color={primaryAction === 'start' ? 'success' : 'error'}
                  onClick={handlePrimaryClick}
                  disabled={primaryDisabled}
                  startIcon={
                    isPending ? (
                      <CircularProgress color="inherit" size={14} />
                    ) : (
                      <PrimaryIcon size={16} />
                    )
                  }
                  sx={{
                    // minWidth: 110,
                    fontWeight: 700,
                    '&.Mui-disabled': {
                      opacity: 0.6,
                    },
                  }}
                >
                  {isPending ? pendingLabel : actionLabels[primaryAction]}
                </Button>
              </span>
            </Tooltip>
            <Button
              size="small"
              variant="outlined"
              color={toggleColor}
              onClick={() => onAction(row.name, toggleAction)}
              disabled={isPending}
              startIcon={
                isPending ? (
                  <CircularProgress color="inherit" size={14} />
                ) : (
                  <ToggleIcon size={16} />
                )
              }
              sx={{
                fontWeight: 700,
                '&.Mui-disabled': {
                  opacity: 0.6,
                },
              }}
            >
              {toggleLabel}
            </Button>

            {/* <IconButton
              aria-label={`اقدامات بیشتر برای ${row.label}`}
              onClick={handleMenuClick}
              disabled={isPending}
              size="small"
              sx={{
                border: '1px solid var(--color-border)',
                color: 'var(--color-primary)',
              }}
            >
              <HiDotsVertical />
            </IconButton> */}

            <Menu
              anchorEl={menuState.anchorEl}
              open={menuState.service === row.name}
              onClose={() => setMenuState({ anchorEl: null, service: null })}
              MenuListProps={{ autoFocusItem: true }}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <Box sx={{ px: 1, py: 1, minWidth: 240 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ color: 'var(--color-secondary)', mb: 0.5 }}
                >
                  چرخه حیات
                </Typography>
                {overflowActions
                  .filter((action) => ['restart', 'reload'].includes(action))
                  .map((action) => {
                    const Icon = actionIcons[action];
                    const isDisabled =
                      isPending ||
                      (action === 'reload' && status !== 'running');

                    const content = (
                      <MenuItem
                        key={action}
                        onClick={() => {
                          if (['stop', 'restart'].includes(action)) {
                            setConfirmState({ service: row.name, action });
                          } else {
                            onAction(row.name, action);
                          }
                          setMenuState({ anchorEl: null, service: null });
                        }}
                        disabled={isDisabled}
                      >
                        <Stack
                          direction="row"
                          spacing={1.25}
                          alignItems="center"
                          color="var(--color-text)"
                        >
                          <Icon size={16} />
                          <span>{actionLabels[action]}</span>
                        </Stack>
                      </MenuItem>
                    );

                    return isDisabled ? (
                      <Tooltip
                        key={action}
                        title={
                          status !== 'running'
                            ? 'این عملیات تنها در حالت اجرا در دسترس است.'
                            : ''
                        }
                        placement="left"
                        arrow
                      >
                        <span>{content}</span>
                      </Tooltip>
                    ) : (
                      content
                    );
                  })}

                <Divider sx={{ my: 1 }} />

                <Typography
                  variant="subtitle2"
                  sx={{ color: 'var(--color-secondary)', mb: 0.5 }}
                >
                  راه‌اندازی خودکار
                </Typography>
                {overflowActions
                  .filter((action) => ['enable', 'disable'].includes(action))
                  .map((action) => {
                    const Icon = actionIcons[action];
                    const isDisabled = isPending;
                    return (
                      <MenuItem
                        key={action}
                        onClick={() => {
                          onAction(row.name, action);
                          setMenuState({ anchorEl: null, service: null });
                        }}
                        disabled={isDisabled}
                      >
                        <Stack
                          direction="row"
                          spacing={1.25}
                          alignItems="center"
                          color="var(--color-text)"
                        >
                          <Icon size={16} />
                          <span>{actionLabels[action]}</span>
                        </Stack>
                      </MenuItem>
                    );
                  })}

                <Divider sx={{ my: 1 }} />

                <Typography
                  variant="subtitle2"
                  sx={{ color: 'var(--color-secondary)', mb: 0.5 }}
                >
                  ماسک کردن
                </Typography>
                {overflowActions
                  .filter((action) => ['mask', 'unmask'].includes(action))
                  .map((action) => {
                    const Icon = actionIcons[action];
                    const isDisabled = isPending;
                    return (
                      <MenuItem
                        key={action}
                        onClick={() => {
                          onAction(row.name, action);
                          setMenuState({ anchorEl: null, service: null });
                        }}
                        disabled={isDisabled}
                      >
                        <Stack
                          direction="row"
                          spacing={1.25}
                          alignItems="center"
                          color="var(--color-text)"
                        >
                          <Icon size={16} />
                          <span>{actionLabels[action]}</span>
                        </Stack>
                      </MenuItem>
                    );
                  })}
              </Box>
            </Menu>
          </Box>
        );
      },
    };

    return [indexColumn, baseColumn, statusColumn, actionColumn];
  }, [
    activeServiceName,
    detailKeys,
    isActionLoading,
    menuState.anchorEl,
    menuState.service,
    onAction,
    services,
  ]);

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
              {confirmState.action === 'stop'
                ? 'توقف سرویس؟'
                : 'راه‌اندازی مجدد سرویس؟'}
            </Typography>
          }
          actions={
            <ModalActionButtons
              onCancel={() => setConfirmState(null)}
              onConfirm={() => {
                onAction(confirmState.service, confirmState.action);
                setConfirmState(null);
              }}
              confirmLabel={
                confirmState.action === 'stop'
                  ? 'توقف سرویس'
                  : 'راه‌اندازی مجدد'
              }
              cancelLabel="انصراف"
              confirmProps={{ color: 'error', disableElevation: true }}
              disableConfirmGradient
            />
          }
          minWidth={420}
        >
          <Typography sx={{ color: 'var(--color-secondary)', lineHeight: 1.7 }}>
            این عملیات ممکن است باعث اختلال در دسترسی کاربران شود. آیا مطمئن
            هستید؟
          </Typography>
        </BlurModal>
      ) : null}
    </>
  );
};

export type { ServiceTableRow };
export default ServicesTable;
