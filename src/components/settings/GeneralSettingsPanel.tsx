import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { toast } from 'react-hot-toast';
import {
  MdAccessTime,
  MdAdd,
  MdComputer,
  MdDeleteOutline,
  MdDns,
  MdInfoOutline,
  MdMemory,
  MdPublic,
  MdSave,
  MdSchedule,
  MdStorage,
  MdSync,
} from 'react-icons/md';
import type {
  HwclockRequest,
  ManageNtpPayload,
  SetHostnamePayload,
  SetManualTimePayload,
  SetTimezonePayload,
} from '../../@types/generalSettings';
import {
  useHostnameInfo,
  useManageHwclock,
  useManageNtp,
  useSetHostname,
  useSetManualTime,
  useSetTimezone,
  useSystemTimeInfo,
  useSystemVersion,
  useTimezoneList,
} from '../../hooks/useGeneralSystemSettings';
import { extractApiErrorMessage } from '../../utils/apiError';
import {
  formatManualTimeForApi,
  toDateTimeLocalValue,
  validateHostname,
  validateNtpServer,
} from '../../utils/generalSettings';
import SystemSettingConfirmDialog, {
  type SystemSettingConfirmSeverity,
} from './SystemSettingConfirmDialog';

const sectionPaperSx = {
  position: 'relative',
  minWidth: 0,
  height: '100%',
  p: { xs: 2, md: 2.5 },
  borderRadius: '16px',
  overflow: 'hidden',
  direction: 'rtl',
  textAlign: 'right',
  color: 'var(--color-text)',
  background:
    'linear-gradient(145deg, color-mix(in srgb, var(--color-card-bg) 96%, var(--color-primary) 4%) 0%, var(--color-card-bg) 100%)',
  border:
    '1px solid color-mix(in srgb, var(--color-primary) 22%, transparent)',
  boxShadow: '0 18px 48px -38px rgba(0, 0, 0, 0.72)',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    borderColor:
      'color-mix(in srgb, var(--color-primary) 34%, transparent)',
    boxShadow: '0 22px 54px -38px rgba(0, 0, 0, 0.82)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    insetInlineStart: 0,
    top: 0,
    bottom: 0,
    width: '3px',
    background:
      'linear-gradient(180deg, var(--color-primary), transparent 78%)',
    opacity: 0.72,
  },
} as const;

const commonFieldSx = {
  direction: 'rtl',
  '& .MuiInputBase-root': {
    color: 'var(--color-text)',
    backgroundColor:
      'color-mix(in srgb, var(--color-background) 62%, transparent)',
    borderRadius: '10px',
  },
  '& .MuiInputBase-input': {
    color: 'var(--color-text)',
    WebkitTextFillColor: 'var(--color-text)',
    textAlign: 'right',
  },
  '& .MuiInputBase-input.Mui-disabled': {
    color: 'var(--color-text)',
    WebkitTextFillColor: 'var(--color-text)',
    opacity: 0.68,
  },
  '& .MuiInputLabel-root': {
    color: 'var(--color-secondary)',
    right: 14,
    left: 'auto',
    transformOrigin: 'top right',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: 'var(--color-primary)',
  },
  '& .MuiFormHelperText-root': {
    mx: 0,
    mt: 0.75,
    direction: 'rtl',
    textAlign: 'right',
    color: 'var(--color-secondary)',
    lineHeight: 1.75,
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor:
      'color-mix(in srgb, var(--color-secondary) 34%, transparent)',
    textAlign: 'right',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor:
      'color-mix(in srgb, var(--color-primary) 50%, transparent)',
  },
  '& .MuiSvgIcon-root': {
    color: 'var(--color-secondary)',
  },
} as const;

const technicalFieldSx = {
  ...commonFieldSx,
  '& .MuiInputBase-input': {
    color: 'var(--color-text)',
    WebkitTextFillColor: 'var(--color-text)',
    direction: 'ltr',
    textAlign: 'right',
    fontVariantNumeric: 'tabular-nums',
  },
  '& .MuiInputBase-input.Mui-disabled': {
    color: 'var(--color-text)',
    WebkitTextFillColor: 'var(--color-text)',
    opacity: 0.68,
  },
} as const;

const primaryButtonSx = {
  minHeight: 40,
  minWidth: 168,
  px: 2.5,
  borderRadius: '9px',
  fontWeight: 900,
  color: 'var(--color-bg)',
  background:
    'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',
  boxShadow:
    '0 12px 26px -18px color-mix(in srgb, var(--color-primary) 75%, transparent)',
  '&:hover': {
    filter: 'brightness(1.05)',
  },
  '&.Mui-disabled': {
    color: 'color-mix(in srgb, var(--color-bg) 58%, transparent)',
    background:
      'color-mix(in srgb, var(--color-primary) 34%, var(--color-card-bg))',
  },
} as const;

const outlinedButtonSx = {
  minHeight: 40,
  borderRadius: '9px',
  fontWeight: 800,
  color: 'var(--color-primary)',
  borderColor:
    'color-mix(in srgb, var(--color-primary) 58%, transparent)',
  '&:hover': {
    borderColor: 'var(--color-primary)',
    backgroundColor:
      'color-mix(in srgb, var(--color-primary) 9%, transparent)',
  },
} as const;

const alertSx = {
  direction: 'rtl',
  textAlign: 'right',
  borderRadius: '10px',
  '& .MuiAlert-icon': {
    marginInlineStart: 0,
    marginInlineEnd: 1,
  },
  '& .MuiAlert-message': {
    width: '100%',
    direction: 'rtl',
    textAlign: 'right',
    lineHeight: 1.9,
  },
} as const;

interface SectionHeaderProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

const SectionHeader = ({
  icon,
  title,
  description,
  action,
}: SectionHeaderProps) => (
  <Stack
    direction={{ xs: 'column', sm: 'row' }}
    alignItems={{ xs: 'stretch', sm: 'flex-start' }}
    justifyContent="space-between"
    gap={1.5}
    sx={{ mb: 2.25, direction: 'rtl' }}
  >
    <Stack
      direction="row"
      alignItems="flex-start"
      gap={1.2}
      sx={{ minWidth: 0, flex: 1, direction: 'rtl' }}
    >
      <Box
        sx={{
          width: 42,
          height: 42,
          borderRadius: '12px',
          display: 'grid',
          placeItems: 'center',
          color: 'var(--color-primary)',
          backgroundColor:
            'color-mix(in srgb, var(--color-primary) 11%, transparent)',
          border:
            '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1, textAlign: 'right' }}>
        <Typography
          sx={{
            color: 'var(--color-text)',
            fontWeight: 900,
            textAlign: 'right',
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'var(--color-secondary)',
            mt: 0.25,
            lineHeight: 1.8,
            textAlign: 'right',
          }}
        >
          {description}
        </Typography>
      </Box>
    </Stack>
    {action ? (
      <Box
        sx={{
          flexShrink: 0,
          alignSelf: { xs: 'flex-start', sm: 'center' },
          direction: 'rtl',
        }}
      >
        {action}
      </Box>
    ) : null}
  </Stack>
);

interface InfoRowProps {
  label: string;
  value: ReactNode;
  ltr?: boolean;
}

const InfoRow = ({ label, value, ltr = false }: InfoRowProps) => (
  <Stack
    direction="row"
    alignItems="center"
    gap={1.5}
    sx={{ py: 0.8, minWidth: 0, direction: 'rtl' }}
  >
    <Typography
      variant="body2"
      sx={{
        width: { xs: 112, md: 126 },
        flexShrink: 0,
        color: 'var(--color-secondary)',
        textAlign: 'right',
      }}
    >
      {label}
    </Typography>
    <Typography
      component="div"
      variant="body2"
      dir={ltr ? 'ltr' : 'rtl'}
      sx={{
        minWidth: 0,
        flex: 1,
        color: 'var(--color-text)',
        fontWeight: 800,
        textAlign: 'right',
        overflowWrap: 'anywhere',
        fontVariantNumeric: ltr ? 'tabular-nums' : undefined,
      }}
    >
      {value}
    </Typography>
  </Stack>
);

type PendingAction =
  | {
      type: 'hostname';
      payload: SetHostnamePayload;
      title: string;
      description: string;
      confirmLabel: string;
      severity: SystemSettingConfirmSeverity;
    }
  | {
      type: 'timezone';
      payload: SetTimezonePayload;
      title: string;
      description: string;
      confirmLabel: string;
      severity: SystemSettingConfirmSeverity;
    }
  | {
      type: 'ntp';
      payload: ManageNtpPayload;
      title: string;
      description: string;
      confirmLabel: string;
      severity: SystemSettingConfirmSeverity;
    }
  | {
      type: 'manual-time';
      payload: SetManualTimePayload;
      title: string;
      description: string;
      confirmLabel: string;
      severity: SystemSettingConfirmSeverity;
    }
  | {
      type: 'hwclock';
      payload: HwclockRequest;
      title: string;
      description: string;
      confirmLabel: string;
      severity: SystemSettingConfirmSeverity;
    };

const GeneralSettingsPanel = () => {
  const timeQuery = useSystemTimeInfo();
  const timezoneQuery = useTimezoneList();
  const hostnameQuery = useHostnameInfo();
  const versionQuery = useSystemVersion();

  const setHostnameMutation = useSetHostname();
  const setTimezoneMutation = useSetTimezone();
  const manageNtpMutation = useManageNtp();
  const setManualTimeMutation = useSetManualTime();
  const manageHwclockMutation = useManageHwclock();

  const [hostname, setHostname] = useState('');
  const [hostnameError, setHostnameError] = useState<string | null>(null);
  const [hostnameDirty, setHostnameDirty] = useState(false);

  const [timezone, setTimezone] = useState<string | null>(null);
  const [timezoneError, setTimezoneError] = useState<string | null>(null);
  const [timezoneDirty, setTimezoneDirty] = useState(false);

  const [ntpEnabled, setNtpEnabled] = useState(false);
  const [ntpServers, setNtpServers] = useState<string[]>([]);
  const [ntpErrors, setNtpErrors] = useState<Record<number, string>>({});
  const [ntpFormError, setNtpFormError] = useState<string | null>(null);
  const [ntpDirty, setNtpDirty] = useState(false);

  const [manualTime, setManualTime] = useState(() =>
    toDateTimeLocalValue(new Date())
  );
  const [manualTimeError, setManualTimeError] = useState<string | null>(null);
  const manualTimeInitializedRef = useRef(false);

  const [rtcMode, setRtcMode] = useState<'utc' | 'local'>('utc');
  const [hwclockDisplay, setHwclockDisplay] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  useEffect(() => {
    if (!hostnameDirty && hostnameQuery.data) {
      setHostname(
        hostnameQuery.data.staticHostname ??
          hostnameQuery.data.currentHostname ??
          ''
      );
    }
  }, [hostnameDirty, hostnameQuery.data]);

  useEffect(() => {
    if (!timezoneDirty && timeQuery.data?.timezone) {
      setTimezone(timeQuery.data.timezone);
    }
  }, [timeQuery.data?.timezone, timezoneDirty]);

  useEffect(() => {
    if (!ntpDirty && timeQuery.data) {
      setNtpEnabled(timeQuery.data.ntpEnabled ?? false);
      setNtpServers(timeQuery.data.ntpServers);
    }
  }, [ntpDirty, timeQuery.data]);

  useEffect(() => {
    if (manualTimeInitializedRef.current || !timeQuery.data?.localTime) {
      return;
    }

    manualTimeInitializedRef.current = true;
    setManualTime(toDateTimeLocalValue(timeQuery.data.localTime));
  }, [timeQuery.data?.localTime]);

  useEffect(() => {
    if (timeQuery.data?.rtcInLocalTimezone == null) {
      return;
    }

    setRtcMode(timeQuery.data.rtcInLocalTimezone ? 'local' : 'utc');
  }, [timeQuery.data?.rtcInLocalTimezone]);

  const timezoneOptions = useMemo(() => {
    const values = new Set(timezoneQuery.data ?? []);
    if (timeQuery.data?.timezone) values.add(timeQuery.data.timezone);
    if (timezone) values.add(timezone);
    return Array.from(values).sort((left, right) =>
      left.localeCompare(right, 'en')
    );
  }, [timeQuery.data?.timezone, timezone, timezoneQuery.data]);

  const queryErrors = [
    timeQuery.error,
    timezoneQuery.error,
    hostnameQuery.error,
    versionQuery.error,
  ].filter((error): error is Error => Boolean(error));

  const isMutationPending =
    setHostnameMutation.isPending ||
    setTimezoneMutation.isPending ||
    manageNtpMutation.isPending ||
    setManualTimeMutation.isPending ||
    manageHwclockMutation.isPending;

  const handleRequestHostnameChange = () => {
    const validation = validateHostname(hostname);
    setHostnameError(validation.error);
    if (validation.error) return;

    if (
      validation.value === hostnameQuery.data?.staticHostname?.toLowerCase()
    ) {
      toast('نام میزبان تغییری نکرده است.');
      return;
    }

    setPendingAction({
      type: 'hostname',
      payload: { hostname: validation.value },
      title: 'تغییر نام میزبان سامانه',
      description:
        'نام میزبان بخشی از هویت شبکه‌ای سامانه است. بعد از اعمال تغییر، برخی سرویس‌ها یا کلاینت‌ها ممکن است برای شناسایی نام جدید به راه‌اندازی مجدد یا بروزرسانی تنظیمات خود نیاز داشته باشند.',
      confirmLabel: 'تغییر نام میزبان',
      severity: 'warning',
    });
  };

  const handleRequestTimezoneChange = () => {
    const normalizedTimezone = timezone?.trim() ?? '';
    if (!normalizedTimezone) {
      setTimezoneError('انتخاب منطقه زمانی الزامی است.');
      return;
    }

    setTimezoneError(null);
    if (normalizedTimezone === timeQuery.data?.timezone) {
      toast('منطقه زمانی تغییری نکرده است.');
      return;
    }

    setPendingAction({
      type: 'timezone',
      payload: { timezone: normalizedTimezone },
      title: 'تغییر منطقه زمانی سیستم',
      description:
        'این تغییر روی نمایش زمان در گزارش‌ها، لاگ‌ها و زمان‌بندی سرویس‌ها اثر می‌گذارد. ساعت UTC تغییر نمی‌کند، اما زمان محلی سامانه بر اساس منطقه جدید نمایش داده می‌شود.',
      confirmLabel: 'اعمال منطقه زمانی',
      severity: 'warning',
    });
  };

  const handleNtpServerChange = (index: number, value: string) => {
    setNtpDirty(true);
    setNtpServers((current) =>
      current.map((server, serverIndex) =>
        serverIndex === index ? value : server
      )
    );
    setNtpErrors((current) => {
      const next = { ...current };
      delete next[index];
      return next;
    });
    setNtpFormError(null);
  };

  const handleAddNtpServer = () => {
    setNtpDirty(true);
    setNtpServers((current) => [...current, '']);
  };

  const handleRemoveNtpServer = (index: number) => {
    setNtpDirty(true);
    setNtpServers((current) =>
      current.filter((_, serverIndex) => serverIndex !== index)
    );
    setNtpErrors({});
    setNtpFormError(null);
  };

  const handleRequestNtpChange = () => {
    const nextErrors: Record<number, string> = {};
    const cleanedServers = ntpServers
      .map((server, index) => {
        const trimmed = server.trim();
        if (!trimmed) {
          if (ntpEnabled) {
            nextErrors[index] = 'این فیلد نمی‌تواند خالی باشد.';
          }
          return null;
        }

        const validation = validateNtpServer(trimmed);
        if (validation.error) {
          nextErrors[index] = validation.error;
          return null;
        }

        return validation.value;
      })
      .filter((server): server is string => Boolean(server));

    const uniqueServers = Array.from(new Set(cleanedServers));
    setNtpErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setNtpFormError('لطفاً آدرس سرورهای NTP را اصلاح کنید.');
      return;
    }

    if (ntpEnabled && uniqueServers.length === 0) {
      setNtpFormError('برای فعال‌سازی NTP حداقل یک سرور معتبر وارد کنید.');
      return;
    }

    setNtpFormError(null);
    setPendingAction({
      type: 'ntp',
      payload: { enabled: ntpEnabled, servers: uniqueServers },
      title: ntpEnabled
        ? 'فعال‌سازی همگام‌سازی NTP'
        : 'غیرفعال‌سازی همگام‌سازی NTP',
      description: ntpEnabled
        ? 'پس از تایید، ساعت سیستم به‌صورت خودکار با سرورهای معرفی‌شده همگام می‌شود. صحت نام سرورها و دسترسی شبکه‌ای به آن‌ها را بررسی کنید.'
        : 'با غیرفعال کردن NTP، همگام‌سازی خودکار زمان متوقف می‌شود و مسئولیت تنظیم صحیح ساعت سیستم بر عهده مدیر سامانه خواهد بود.',
      confirmLabel: ntpEnabled ? 'فعال‌سازی NTP' : 'غیرفعال‌سازی NTP',
      severity: ntpEnabled ? 'info' : 'warning',
    });
  };

  const handleRequestManualTime = () => {
    if (timeQuery.data?.ntpEnabled === true) {
      setManualTimeError(
        'برای تنظیم دستی زمان، ابتدا NTP را غیرفعال و تنظیمات آن را ثبت کنید.'
      );
      return;
    }

    const validation = formatManualTimeForApi(manualTime);
    setManualTimeError(validation.error);
    if (validation.error) return;

    setPendingAction({
      type: 'manual-time',
      payload: { time: validation.value },
      title: 'تنظیم دستی زمان سیستم',
      description:
        'تغییر ساعت سیستم می‌تواند روی اعتبار نشست‌ها، زمان لاگ‌ها، گواهی‌های TLS و اجرای وظایف زمان‌بندی‌شده اثر بگذارد. قبل از ادامه از درستی تاریخ، ساعت و منطقه زمانی اطمینان حاصل کنید.',
      confirmLabel: 'تنظیم زمان سیستم',
      severity: 'error',
    });
  };

  const handleShowHwclock = async () => {
    try {
      const result = await manageHwclockMutation.mutateAsync({ action: 'show' });
      setHwclockDisplay(result.displayValue);
      toast.success(result.message);
    } catch (error) {
      toast.error(
        extractApiErrorMessage(
          error,
          'دریافت ساعت سخت‌افزاری با خطا مواجه شد.'
        )
      );
    }
  };

  const handleRequestHwclockSync = (action: 'hctosys' | 'systohc') => {
    const isHardwareToSystem = action === 'hctosys';
    setPendingAction({
      type: 'hwclock',
      payload: isHardwareToSystem
        ? { action, localtime: rtcMode === 'local' }
        : { action },
      title: isHardwareToSystem
        ? 'تنظیم ساعت سیستم از RTC'
        : 'نوشتن ساعت سیستم روی RTC',
      description: isHardwareToSystem
        ? 'زمان سیستم‌عامل با مقدار ساعت سخت‌افزاری جایگزین می‌شود. انتخاب UTC یا Local Time تعیین می‌کند مقدار خام RTC چگونه تفسیر شود؛ انتخاب اشتباه می‌تواند باعث اختلاف چندساعته شود.'
        : 'زمان فعلی سیستم‌عامل روی ساعت سخت‌افزاری مادربرد نوشته می‌شود. این عملیات مقدار قبلی RTC را جایگزین می‌کند.',
      confirmLabel: isHardwareToSystem
        ? 'همگام‌سازی سیستم از RTC'
        : 'همگام‌سازی RTC از سیستم',
      severity: 'error',
    });
  };

  const handleConfirmAction = async () => {
    if (!pendingAction || isMutationPending) return;

    try {
      if (pendingAction.type === 'hostname') {
        const message = await setHostnameMutation.mutateAsync(
          pendingAction.payload
        );
        setHostnameDirty(false);
        toast.success(message);
      } else if (pendingAction.type === 'timezone') {
        const message = await setTimezoneMutation.mutateAsync(
          pendingAction.payload
        );
        setTimezoneDirty(false);
        toast.success(message);
      } else if (pendingAction.type === 'ntp') {
        const message = await manageNtpMutation.mutateAsync(
          pendingAction.payload
        );
        setNtpDirty(false);
        toast.success(message);
      } else if (pendingAction.type === 'manual-time') {
        const message = await setManualTimeMutation.mutateAsync(
          pendingAction.payload
        );
        manualTimeInitializedRef.current = false;
        toast.success(message);
      } else {
        const result = await manageHwclockMutation.mutateAsync(
          pendingAction.payload
        );
        setHwclockDisplay(result.displayValue);
        toast.success(result.message);
      }

      setPendingAction(null);
    } catch (error) {
      toast.error(
        extractApiErrorMessage(error, 'اعمال تنظیمات سیستم با خطا مواجه شد.')
      );
    }
  };

  const currentHostname =
    hostnameQuery.data?.staticHostname ??
    hostnameQuery.data?.currentHostname ??
    'در دسترس نیست';
  const systemVersion = versionQuery.data?.lines.length
    ? versionQuery.data.lines.join(' • ')
    : 'در دسترس نیست';

  return (
    <Box
      dir="rtl"
      sx={{
        direction: 'rtl',
        textAlign: 'right',
        color: 'var(--color-text)',
        '& *': { boxSizing: 'border-box' },
      }}
    >
      <Stack spacing={2.25}>
        {queryErrors.length > 0 ? (
          <Alert severity="warning" variant="outlined" sx={alertSx}>
            بخشی از اطلاعات عمومی سامانه دریافت نشد. سایر بخش‌های در دسترس
            همچنان قابل استفاده هستند.
          </Alert>
        ) : null}

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ direction: 'rtl', alignItems: 'stretch' }}
        >
          <Paper sx={{ ...sectionPaperSx, flex: 1 }}>
            <SectionHeader
              icon={<MdComputer size={23} />}
              title="هویت سامانه"
              description="نام میزبان و نسخه نصب‌شده"
            />
            <InfoRow label="نام میزبان" value={currentHostname} ltr />
            <Divider />
            <InfoRow label="نسخه سیستم" value={systemVersion} ltr />
          </Paper>

          <Paper sx={{ ...sectionPaperSx, flex: 1 }}>
            <SectionHeader
              icon={<MdAccessTime size={23} />}
              title="وضعیت زمان سیستم"
              description="زمان سیستم‌عامل و منطقه زمانی فعال"
            />
            <InfoRow
              label="زمان محلی"
              value={timeQuery.data?.localTime ?? 'در دسترس نیست'}
              ltr
            />
            <Divider />
            <InfoRow
              label="زمان UTC"
              value={timeQuery.data?.utcTime ?? 'در دسترس نیست'}
              ltr
            />
            <Divider />
            <InfoRow
              label="منطقه زمانی"
              value={timeQuery.data?.timezone ?? 'در دسترس نیست'}
              ltr
            />
          </Paper>

          <Paper sx={{ ...sectionPaperSx, flex: 1 }}>
            <SectionHeader
              icon={<MdSync size={23} />}
              title="همگام‌سازی و ساعت سخت‌افزاری"
              description="وضعیت NTP و زمان RTC مادربرد"
            />
            <InfoRow
              label="وضعیت NTP"
              value={
                <Chip
                  size="small"
                  label={timeQuery.data?.ntpEnabled ? 'فعال' : 'غیرفعال'}
                  color={timeQuery.data?.ntpEnabled ? 'success' : 'default'}
                  variant="outlined"
                  sx={{ color: 'var(--color-text)', fontWeight: 800 }}
                />
              }
            />
            <Divider />
            <InfoRow
              label="همگام‌شده"
              value={
                timeQuery.data?.ntpSynchronized == null
                  ? 'نامشخص'
                  : timeQuery.data.ntpSynchronized
                    ? 'بله'
                    : 'خیر'
              }
            />
            <Divider />
            <InfoRow
              label="RTC محلی"
              value={
                timeQuery.data?.hardwareLocalTime ??
                timeQuery.data?.rtcTime ??
                'در دسترس نیست'
              }
              ltr
            />
            <Divider />
            <InfoRow
              label="RTC به وقت UTC"
              value={timeQuery.data?.hardwareUtcTime ?? 'در دسترس نیست'}
              ltr
            />
          </Paper>
        </Stack>

        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={2}
          sx={{ direction: 'rtl', alignItems: 'stretch' }}
        >
          <Paper sx={{ ...sectionPaperSx, flex: 1 }}>
            <SectionHeader
              icon={<MdComputer size={23} />}
              title="نام میزبان"
              description="تغییر نام پایدار سیستم مطابق استاندارد RFC 1123"
            />
            <Stack spacing={1.5} alignItems="stretch">
              <TextField
                label="نام میزبان"
                value={hostname}
                onChange={(event) => {
                  setHostname(event.target.value);
                  setHostnameDirty(true);
                  setHostnameError(null);
                }}
                error={Boolean(hostnameError)}
                helperText={
                  hostnameError ??
                  'نمونه معتبر: soho یا storage-node-01.example.local'
                }
                fullWidth
                sx={technicalFieldSx}
                slotProps={{ htmlInput: { maxLength: 253 } }}
              />
              <Button
                variant="contained"
                startIcon={<MdSave />}
                onClick={handleRequestHostnameChange}
                disabled={isMutationPending || hostnameQuery.isLoading}
                sx={{
                  ...primaryButtonSx,
                  alignSelf: { xs: 'stretch', sm: 'flex-start' },
                }}
              >
                ثبت نام میزبان
              </Button>
            </Stack>
          </Paper>

          <Paper sx={{ ...sectionPaperSx, flex: 1 }}>
            <SectionHeader
              icon={<MdPublic size={23} />}
              title="منطقه زمانی"
              description="انتخاب منطقه معتبر برای محاسبه زمان محلی سامانه"
            />
            <Stack spacing={1.5} alignItems="stretch">
              <Autocomplete
                options={timezoneOptions}
                value={timezone}
                onChange={(_, value) => {
                  setTimezone(value);
                  setTimezoneDirty(true);
                  setTimezoneError(null);
                }}
                loading={timezoneQuery.isLoading}
                noOptionsText="منطقه زمانی پیدا نشد"
                loadingText="در حال دریافت منطقه‌های زمانی..."
                renderOption={(props, option) => (
                  <Box
                    component="li"
                    {...props}
                    dir="ltr"
                    sx={{
                      color: 'var(--color-text)',
                      direction: 'ltr',
                      textAlign: 'right',
                      justifyContent: 'flex-end',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {option}
                  </Box>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="منطقه زمانی"
                    error={Boolean(timezoneError)}
                    helperText={
                      timezoneError ??
                      'منطقه زمانی روی محاسبه و نمایش زمان محلی اثر می‌گذارد.'
                    }
                    sx={technicalFieldSx}
                    slotProps={{
                      input: {
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {timezoneQuery.isLoading ? (
                              <CircularProgress size={18} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      },
                    }}
                  />
                )}
                slotProps={{
                  paper: {
                    sx: {
                      direction: 'rtl',
                      textAlign: 'right',
                      color: 'var(--color-text)',
                      backgroundColor: 'var(--color-card-bg)',
                      border:
                        '1px solid color-mix(in srgb, var(--color-primary) 22%, transparent)',
                      '& .MuiAutocomplete-noOptions, & .MuiAutocomplete-loading': {
                        color: 'var(--color-text)',
                        direction: 'rtl',
                        textAlign: 'right',
                      },
                    },
                  },
                  listbox: {
                    sx: {
                      color: 'var(--color-text)',
                      backgroundColor: 'var(--color-card-bg)',
                    },
                  },
                }}
              />
              <Button
                variant="contained"
                startIcon={<MdSave />}
                onClick={handleRequestTimezoneChange}
                disabled={isMutationPending || timezoneQuery.isLoading}
                sx={{
                  ...primaryButtonSx,
                  alignSelf: { xs: 'stretch', sm: 'flex-start' },
                }}
              >
                ثبت منطقه زمانی
              </Button>
            </Stack>
          </Paper>
        </Stack>

        <Paper sx={sectionPaperSx}>
          <SectionHeader
            icon={<MdDns size={23} />}
            title="همگام‌سازی NTP"
            description="مدیریت همگام‌سازی خودکار ساعت با یک یا چند سرور زمان"
            action={
              <Stack direction="row" gap={0.75} alignItems="center" sx={{ direction: 'rtl' }}>
                <Typography
                  variant="body2"
                  sx={{ color: 'var(--color-text)', fontWeight: 800 }}
                >
                  {ntpEnabled ? 'فعال' : 'غیرفعال'}
                </Typography>
                <Switch
                  checked={ntpEnabled}
                  onChange={(event) => {
                    setNtpEnabled(event.target.checked);
                    setNtpDirty(true);
                    setNtpFormError(null);
                  }}
                  inputProps={{ 'aria-label': 'فعال یا غیرفعال کردن NTP' }}
                />
              </Stack>
            }
          />

          {ntpServers.length === 0 ? (
            <Alert severity="info" variant="outlined" sx={{ ...alertSx, mb: 1.5 }}>
              هنوز هیچ سرور NTP ثبت نشده است. برای افزودن سرور از دکمه زیر استفاده کنید.
            </Alert>
          ) : null}

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1.25,
              direction: 'rtl',
            }}
          >
            {ntpServers.map((server, index) => (
              <Stack
                key={`ntp-server-${index}`}
                direction="row"
                gap={0.75}
                alignItems="flex-start"
                sx={{
                  direction: 'rtl',
                  minWidth: 0,
                  width: { xs: '100%', md: 'calc(50% - 5px)' },
                }}
              >
                <TextField
                  label={`سرور NTP ${index + 1}`}
                  value={server}
                  onChange={(event) =>
                    handleNtpServerChange(index, event.target.value)
                  }
                  error={Boolean(ntpErrors[index])}
                  helperText={
                    ntpErrors[index] ?? 'نام دامنه یا آدرس IP سرور زمان'
                  }
                  fullWidth
                  sx={technicalFieldSx}
                />
                <Tooltip title="حذف سرور">
                  <IconButton
                    aria-label={`حذف سرور NTP شماره ${index + 1}`}
                    onClick={() => handleRemoveNtpServer(index)}
                    sx={{
                      mt: 0.75,
                      flexShrink: 0,
                      color: 'var(--color-error)',
                      border:
                        '1px solid color-mix(in srgb, var(--color-error) 40%, transparent)',
                    }}
                  >
                    <MdDeleteOutline />
                  </IconButton>
                </Tooltip>
              </Stack>
            ))}
          </Box>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            gap={1}
            sx={{ mt: 1.5, direction: 'rtl' }}
          >
            <Button
              variant="contained"
              startIcon={<MdSave />}
              onClick={handleRequestNtpChange}
              disabled={isMutationPending}
              sx={primaryButtonSx}
            >
              ثبت تنظیمات NTP
            </Button>
            <Button
              variant="outlined"
              startIcon={<MdAdd />}
              onClick={handleAddNtpServer}
              sx={outlinedButtonSx}
            >
              افزودن سرور NTP
            </Button>
          </Stack>

          {ntpFormError ? (
            <Alert severity="error" sx={{ ...alertSx, mt: 1.5 }}>
              {ntpFormError}
            </Alert>
          ) : null}
        </Paper>

        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={2}
          sx={{ direction: 'rtl', alignItems: 'stretch' }}
        >
          <Paper sx={{ ...sectionPaperSx, flex: 1 }}>
            <SectionHeader
              icon={<MdSchedule size={23} />}
              title="تنظیم دستی زمان"
              description="تنظیم تاریخ و ساعت سیستم در زمانی که NTP غیرفعال است"
            />
            <Stack spacing={1.5}>
              {timeQuery.data?.ntpEnabled ? (
                <Alert severity="warning" sx={alertSx}>
                  NTP در حال حاضر فعال است. برای تنظیم دستی زمان ابتدا آن را
                  غیرفعال کنید.
                </Alert>
              ) : null}
              <TextField
                type="datetime-local"
                label="تاریخ و ساعت سیستم"
                value={manualTime}
                onChange={(event) => {
                  setManualTime(event.target.value);
                  setManualTimeError(null);
                }}
                error={Boolean(manualTimeError)}
                helperText={
                  manualTimeError ??
                  'زمان با قالب محلی انتخاب می‌شود و با منطقه زمانی فعال تفسیر خواهد شد.'
                }
                fullWidth
                sx={technicalFieldSx}
                slotProps={{
                  inputLabel: { shrink: true },
                  htmlInput: { step: 1 },
                }}
              />
              <Button
                variant="contained"
                startIcon={<MdAccessTime />}
                onClick={handleRequestManualTime}
                disabled={
                  isMutationPending || timeQuery.data?.ntpEnabled === true
                }
                sx={{
                  ...primaryButtonSx,
                  alignSelf: { xs: 'stretch', sm: 'flex-start' },
                }}
              >
                تنظیم زمان سیستم
              </Button>
            </Stack>
          </Paper>

          <Paper sx={{ ...sectionPaperSx, flex: 1 }}>
            <SectionHeader
              icon={<MdMemory size={23} />}
              title="ساعت سخت‌افزاری RTC"
              description="مشاهده و همگام‌سازی ساعت سخت‌افزاری با سیستم‌عامل"
            />
            <Stack spacing={1.5}>
              <FormControl sx={{ direction: 'rtl', textAlign: 'right' }}>
                <FormLabel
                  sx={{
                    color: 'var(--color-text)',
                    fontWeight: 800,
                    textAlign: 'right',
                  }}
                >
                  نحوه تفسیر مقدار RTC هنگام انتقال به سیستم
                </FormLabel>
                <RadioGroup
                  row
                  value={rtcMode}
                  onChange={(event) =>
                    setRtcMode(event.target.value as 'utc' | 'local')
                  }
                  sx={{ mt: 0.5, direction: 'rtl' }}
                >
                  <FormControlLabel value="utc" control={<Radio />} label="UTC" />
                  <FormControlLabel
                    value="local"
                    control={<Radio />}
                    label="Local Time"
                  />
                </RadioGroup>
              </FormControl>

              <Alert
                icon={<MdInfoOutline />}
                severity="info"
                variant="outlined"
                sx={alertSx}
              >
                در بیشتر سرورهای لینوکسی نگهداری RTC بر مبنای UTC توصیه می‌شود؛
                حالت Local Time معمولاً برای سازگاری با سیستم‌عامل‌های دیگر
                استفاده می‌شود.
              </Alert>

              {hwclockDisplay ? (
                <Box
                  component="pre"
                  dir="ltr"
                  sx={{
                    m: 0,
                    p: 1.5,
                    maxHeight: 150,
                    overflow: 'auto',
                    borderRadius: '10px',
                    color: 'var(--color-text)',
                    backgroundColor:
                      'color-mix(in srgb, var(--color-background) 72%, transparent)',
                    border:
                      '1px solid color-mix(in srgb, var(--color-primary) 14%, transparent)',
                    fontFamily: 'monospace',
                    fontSize: '0.82rem',
                    textAlign: 'right',
                  }}
                >
                  {hwclockDisplay}
                </Box>
              ) : null}

              <Stack
                direction={{ xs: 'column', md: 'row' }}
                gap={1}
                flexWrap="wrap"
                sx={{ direction: 'rtl' }}
              >
                <Button
                  variant="contained"
                  startIcon={<MdSync />}
                  onClick={() => handleRequestHwclockSync('hctosys')}
                  disabled={isMutationPending}
                  sx={primaryButtonSx}
                >
                  همگام‌سازی سیستم از RTC
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<MdSync />}
                  onClick={() => handleRequestHwclockSync('systohc')}
                  disabled={isMutationPending}
                  sx={outlinedButtonSx}
                >
                  همگام‌سازی RTC از سیستم
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<MdStorage />}
                  onClick={() => void handleShowHwclock()}
                  disabled={isMutationPending}
                  sx={outlinedButtonSx}
                >
                  نمایش ساعت RTC
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Stack>
      </Stack>

      <SystemSettingConfirmDialog
        open={Boolean(pendingAction)}
        title={pendingAction?.title ?? ''}
        description={pendingAction?.description ?? ''}
        confirmLabel={pendingAction?.confirmLabel}
        severity={pendingAction?.severity}
        isLoading={isMutationPending}
        onCancel={() => {
          if (!isMutationPending) setPendingAction(null);
        }}
        onConfirm={() => void handleConfirmAction()}
      />
    </Box>
  );
};

export default GeneralSettingsPanel;
