import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FiEdit3 } from 'react-icons/fi';
import {
  MdAccessTime,
  MdAdd,
  MdComputer,
  MdDeleteOutline,
  MdMemory,
  MdPublic,
  MdRefresh,
  MdUnfoldLess,
  MdUnfoldMore,
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
import { useSystemWallClock } from '../../hooks/useSystemWallClock';
import { extractApiErrorMessage } from '../../utils/apiError';
import {
  formatManualTimeForApi,
  HOSTNAME_ALLOWED_HINT,
  toDateTimeLocalValue,
  validateHostname,
  validateNtpServer,
} from '../../utils/generalSettings';
import {
  describeClockDrift,
  extractHardwareClockTimes,
  type HardwareClockTimes,
} from '../../utils/hardwareClock';
import {
  formatJalaliWallClockLabel,
  gregorianToJalali,
  JALALI_MONTH_NAMES,
  toPersianDigits,
} from '../../utils/jalali';
import SystemSettingConfirmDialog, {
  type SystemSettingConfirmSeverity,
} from './SystemSettingConfirmDialog';
import JalaliDateTimeField from './general/JalaliDateTimeField';
import Ltr from './general/Ltr';
import SettingEditModal from './general/SettingEditModal';
import SettingsAccordionSection from './general/SettingsAccordionSection';
import SettingsRowsTable from './general/SettingsRowsTable';
import {
  settingsAlertSx as alertSx,
  settingsFieldSx as fieldSx,
  ltrBlockStyle,
  ltrInputStyle,
  settingsOutlinedButtonSx as outlinedButtonSx,
  settingsPopupSx as popupSx,
  settingsPrimaryButtonSx as primaryButtonSx,
  settingsTechnicalFieldSx as technicalFieldSx,
  settingsToolbarSx as toolbarSx,
} from './general/styles';

const NOT_AVAILABLE = 'در دسترس نیست';
const NOT_CONFIGURED = 'تنطیم نشده';

/** Section ids of the accordion list. */
const SECTIONS = {
  system: 'system',
  time: 'time',
} as const;

type SectionId = (typeof SECTIONS)[keyof typeof SECTIONS];

const ALL_SECTION_IDS: SectionId[] = [SECTIONS.system, SECTIONS.time];

type EditorKind =
  | 'hostname'
  | 'timezone'
  | 'manual-time'
  | 'time-settings'
  | null;

/** Calendar the manual-time picker is rendered with. */
type CalendarMode = 'jalali' | 'gregorian';

const pad = (value: number) => String(value).padStart(2, '0');

/** Browser clock, ticking every second. */
const useClientClock = () => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  return now;
};

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
      /** When true, automatic sync is switched off before the time is set. */
      disableNtpFirst?: boolean;
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
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('jalali');
  /** When checked, the system time is set from the client clock on submit. */
  const [useClientTime, setUseClientTime] = useState(false);

  const [hwclockTimes, setHwclockTimes] = useState<HardwareClockTimes | null>(
    null
  );
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null
  );

  /** Which row is currently opened for editing. UI-only state. */
  const [editor, setEditor] = useState<EditorKind>(null);

  /** Which sections are expanded. The time section starts open. */
  const [expandedSections, setExpandedSections] = useState<SectionId[]>([
    SECTIONS.time,
  ]);

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
        'نام میزبان بخشی از هویت شبکه‌ای سامانه است. بعد از اعمال تغییر، برخی سرویس‌ها یا کلاینت‌ها ممکن است برای شناسایی نام جدید به راه‌اندازی مجدد یا بروزرسانی تنطیمات خود نیاز داشته باشند.',
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
        'این تغییر روی نمایش زمان در گزارش‌ها، لاگ‌ها و زمان‌بندی سرویس‌ها اثر می‌گذارد. ساعت UTC تغییر نمی‌کند، اما زمان سرور بر اساس منطقه جدید نمایش داده می‌شود.',
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
      setNtpFormError('لطفاً آدرس سرورهای زمان را اصلاح کنید.');
      return;
    }

    if (ntpEnabled && uniqueServers.length === 0) {
      setNtpFormError(
        'برای فعال‌سازی همگام‌سازی خودکار حداقل یک سرور معتبر وارد کنید.'
      );
      return;
    }

    setNtpFormError(null);
    setPendingAction({
      type: 'ntp',
      payload: { enabled: ntpEnabled, servers: uniqueServers },
      title: ntpEnabled
        ? 'فعال‌سازی همگام‌سازی خودکار زمان'
        : 'غیرفعال‌سازی همگام‌سازی خودکار زمان',
      description: ntpEnabled
        ? 'پس از تایید، ساعت سیستم به‌صورت خودکار با سرورهای معرفی‌شده همگام می‌شود. صحت نام سرورها و دسترسی شبکه‌ای به آن‌ها را بررسی کنید.'
        : 'با غیرفعال کردن این قابلیت، همگام‌سازی خودکار زمان متوقف می‌شود و مس����ولیت تنطیم صحی�� ساعت سیستم بر عهده مدی�� سامانه خواهد بود.',
      confirmLabel: ntpEnabled
        ? 'فعال‌سازی همگام‌سازی'
        : 'غیرفعال‌سازی همگام‌سازی',
      severity: ntpEnabled ? 'info' : 'warning',
    });
  };

  const handleRequestManualTime = () => {
    /**
     * The user may switch the NTP toggle off inside the modal without saving it
     * first. In that case automatic sync is disabled and only then the new time
     * is written, inside a single confirmation.
     */
    const shouldDisableNtpFirst = isNtpActive && !ntpEnabled;

    if (isNtpActive && ntpEnabled) {
      setManualTimeError(
        'برای تنطیم دستی زمان، ابتدا همگام‌سازی خودکار را غیرفعال کنید.'
      );
      return;
    }

    /** The checkbox always wins, so the freshest client clock is submitted. */
    const requestedTime = useClientTime
      ? toDateTimeLocalValue(new Date())
      : manualTime;

    const validation = formatManualTimeForApi(requestedTime);
    setManualTimeError(validation.error);
    if (validation.error) return;

    setPendingAction({
      type: 'manual-time',
      payload: { time: validation.value },
      disableNtpFirst: shouldDisableNtpFirst,
      title: 'تنطیم دستی زمان سیستم',
      description: shouldDisableNtpFirst
        ? 'ابتدا همگام‌سازی خودکار زمان غیرفعال می‌شود و سپس زمان انتخابی روی سیستم تنطیم می‌گردد. تغییر ساعت سیستم می‌تواند روی اعتبار نشست‌ها، زمان لاگ‌ها، گواهی‌های TLS و اجرای وظایف زمان‌بندی‌شده اثر بگذارد.'
        : 'تغییر ساعت سیستم می‌تواند روی اعتبار نشست‌ها، زمان لاگ‌ها، گواهی‌های TLS و اجرای وظایف زمان‌بندی‌شده اثر بگذارد. قبل از ادامه از درستی تاریخ، ساعت و منطقه زمانی اطمینان حاصل کنید.',
      confirmLabel: 'تنطیم زمان سیستم',
      severity: 'error',
    });
  };

  /**
   * Writes the current system time onto the motherboard clock. Triggered
   * directly by the drift chip, without any intermediate dialog.
   */
  const handleSyncHardwareClock = async () => {
    if (isMutationPending) return;

    try {
      const result = await manageHwclockMutation.mutateAsync({
        action: 'systohc',
      });
      setHwclockTimes(extractHardwareClockTimes(result.raw));
      toast.success(result.message);
    } catch (error) {
      toast.error(
        extractApiErrorMessage(error, 'تنطیم زمان مادربرد با خطا مواجه شد.')
      );
    }
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
        if (pendingAction.disableNtpFirst) {
          await manageNtpMutation.mutateAsync({
            enabled: false,
            servers: ntpServers
              .map((server) => server.trim())
              .filter((server) => Boolean(server)),
          });
          setNtpDirty(false);
        }

        const message = await setManualTimeMutation.mutateAsync(
          pendingAction.payload
        );
        manualTimeInitializedRef.current = false;
        toast.success(message);
      } else {
        const result = await manageHwclockMutation.mutateAsync(
          pendingAction.payload
        );
        setHwclockTimes(extractHardwareClockTimes(result.raw));
        toast.success(result.message);
      }

      setPendingAction(null);
      setEditor(null);
    } catch (error) {
      toast.error(
        extractApiErrorMessage(error, 'اعمال تنطیمات سیستم با خطا مواجه شد.')
      );
    }
  };

  /* ------------------------------------------------------------------ *
   * Derived, presentation-level values
   * ------------------------------------------------------------------ */

  const currentHostname =
    hostnameQuery.data?.staticHostname ??
    hostnameQuery.data?.currentHostname ??
    NOT_AVAILABLE;

  const versionLines = versionQuery.data?.lines ?? [];
  const primaryVersionLine = versionLines[0] ?? NOT_AVAILABLE;

  const isNtpActive = timeQuery.data?.ntpEnabled === true;

  /* ---------------------------- clocks ------------------------------ */

  /** Browser clock of the machine the panel is opened on. */
  const clientNow = useClientClock();
  const clientTimeDisplay = `${clientNow.getFullYear()}-${pad(
    clientNow.getMonth() + 1
  )}-${pad(clientNow.getDate())} ${pad(clientNow.getHours())}:${pad(
    clientNow.getMinutes()
  )}:${pad(clientNow.getSeconds())}`;

  /**
   * Server clocks. Every clock is anchored on the value returned by the API and
   * then advanced locally once per second, so all rows keep counting without
   * re-fetching. The tickers stay enabled even while a section is collapsed.
   */
  const serverClock = useSystemWallClock(timeQuery.data?.localTime, {
    enabled: true,
  });
  const utcClock = useSystemWallClock(timeQuery.data?.utcTime, {
    enabled: true,
  });

  /**
   * Motherboard clock (RTC). A fresh reading wins over the cached query value;
   * the radio group only decides which reading is shown (UTC or local).
   */
  const hardwareClockSource =
    hwclockTimes?.local ?? timeQuery.data?.hardwareLocalTime ?? null;
  const hardwareClock = useSystemWallClock(hardwareClockSource, {
    enabled: true,
  });

  const serverTimeDisplay =
    serverClock.timestampLabel ?? timeQuery.data?.localTime ?? NOT_AVAILABLE;
  const utcTimeDisplay =
    utcClock.timestampLabel ?? timeQuery.data?.utcTime ?? NOT_AVAILABLE;
  const hardwareTimeDisplay =
    hardwareClock.timestampLabel ?? hardwareClockSource ?? NOT_AVAILABLE;

  /** Jalali rendering of the *server* clock, ticking with it. */
  const serverJalaliDisplay =
    (serverClock.timestampLabel
      ? formatJalaliWallClockLabel(serverClock.timestampLabel)
      : null) ?? NOT_AVAILABLE;

  /** RTC vs. system clock, compared on local time. */
  const hardwareClockDrift = describeClockDrift(
    timeQuery.data?.localTime,
    hwclockTimes?.local ?? timeQuery.data?.hardwareLocalTime
  );
  const driftDisplay =
    hardwareClockDrift.level === 'unknown'
      ? NOT_AVAILABLE
      : hardwareClockDrift.level === 'aligned'
        ? 'بدون اختلاف'
        : hardwareClockDrift.label;

  /**
   * Extra clocks that used to have their own rows. They are shown on hover of
   * the server-time value instead.
   */
  const serverTimeTooltip = (
    <Box dir="rtl" sx={{ display: 'grid', gap: 1.5, py: 0.5 }}>
      {[
        { label: 'زمان شمسی سرور: ', value: serverJalaliDisplay, ltr: false },
        { label: 'زمان جهانی (UTC): ', value: utcTimeDisplay, ltr: true },
      ].map((item) => (
        <Box
          key={item.label}
          // sx={{ display: "grid", gap: 0.25, fontSize: "0.78rem" }}
        >
          <Box component="span" sx={{ fontWeight: 700, opacity: 0.85 }}>
            {item.label}
          </Box>
          <Box component="span" sx={{ fontWeight: 700 }}>
            {item.ltr ? <Ltr>{item.value}</Ltr> : item.value}
          </Box>
        </Box>
      ))}
    </Box>
  );

  /**
   * Manual time is only offered while automatic sync is off, both on the server
   * and on the toggle inside the modal.
   */
  const isManualTimeAvailable = !ntpEnabled;

  /** The drift chip is only actionable when the two clocks really differ. */
  const isClockDrifting =
    hardwareClockDrift.level === 'minor' ||
    hardwareClockDrift.level === 'major';

  const isTimeSectionOpen = expandedSections.includes(SECTIONS.time);

  const toggleSection = (id: string) => {
    setExpandedSections((current) =>
      current.includes(id as SectionId)
        ? current.filter((sectionId) => sectionId !== id)
        : [...current, id as SectionId]
    );
  };

  const areAllExpanded = expandedSections.length === ALL_SECTION_IDS.length;

  const handleToggleAll = () =>
    setExpandedSections(areAllExpanded ? [] : [...ALL_SECTION_IDS]);

  const handleRefreshAll = () => {
    void Promise.all([
      timeQuery.refetch(),
      hostnameQuery.refetch(),
      versionQuery.refetch(),
    ]);
    toast.success('اطلاعات تنطیمات عمومی بروزرسانی شد.');
  };

  const closeEditor = () => setEditor(null);

  /**
   * Edit affordance rendered *inside the value cell*, right next to the value
   * it changes. The tables have no action column any more.
   */
  const renderEditAction = (
    label: string,
    onClick: () => void,
    disabled = false
  ) => (
    <Tooltip title={label} arrow>
      <span>
        <IconButton
          size="small"
          aria-label={label}
          onClick={onClick}
          disabled={disabled || isMutationPending}
          sx={{
            width: 28,
            height: 28,
            color: 'var(--color-primary)',
            borderRadius: '8px',
            border:
              '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)',
            backgroundColor:
              'color-mix(in srgb, var(--color-primary) 8%, transparent)',
            transition: 'background-color 0.2s ease, border-color 0.2s ease',
            '&:hover': {
              borderColor: 'var(--color-primary)',
              backgroundColor:
                'color-mix(in srgb, var(--color-primary) 18%, transparent)',
            },
            '&.Mui-disabled': {
              color: 'color-mix(in srgb, var(--color-text) 34%, transparent)',
              borderColor:
                'color-mix(in srgb, var(--color-text) 14%, transparent)',
            },
          }}
        >
          <FiEdit3 size={15} />
        </IconButton>
      </span>
    </Tooltip>
  );

  /**
   * Hostname helper text. The allowed characters are underlined so the user can
   * spot them quickly inside the error message.
   */
  const renderHostnameHelper = (message: string | null) => {
    if (!message) return undefined;

    const index = message.indexOf(HOSTNAME_ALLOWED_HINT);
    if (index === -1) return message;

    return (
      <>
        {message.slice(0, index)}
        <Box
          component="span"
          sx={{
            fontWeight: 700,
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
          }}
        >
          {HOSTNAME_ALLOWED_HINT}
        </Box>
        {message.slice(index + HOSTNAME_ALLOWED_HINT.length)}
      </>
    );
  };

  /**
   * Live client clock, shown in place of the picker while the "use client time"
   * checkbox is on. The seconds keep ticking so it is obvious that the value
   * submitted is the moment the button is pressed.
   */
  const renderLiveClientClock = () => {
    const timeLabel = toPersianDigits(
      `${pad(clientNow.getHours())}:${pad(clientNow.getMinutes())}:${pad(
        clientNow.getSeconds()
      )}`
    );
    /** Date only; the ticking time above must not be repeated. */
    const jalali = gregorianToJalali(
      clientNow.getFullYear(),
      clientNow.getMonth() + 1,
      clientNow.getDate()
    );
    const jalaliLabel = toPersianDigits(
      `${jalali.day} ${JALALI_MONTH_NAMES[jalali.month - 1]} ${jalali.year}`
    );

    return (
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="flex-end"
        gap={1.25}
        sx={{
          px: 1.75,
          py: 1.25,
          borderRadius: '12px',
          border:
            '1px solid color-mix(in srgb, var(--color-primary) 22%, transparent)',
          backgroundColor:
            'color-mix(in srgb, var(--color-primary) 6%, transparent)',
        }}
      >
        {jalaliLabel ? (
          <Typography
            sx={{
              minWidth: 0,
              fontSize: '0.8rem',
              color: 'var(--color-secondary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {jalaliLabel}
          </Typography>
        ) : null}

        <Typography
          sx={{
            fontWeight: 800,
            fontSize: '1.25rem',
            lineHeight: 1.2,
            letterSpacing: '0.02em',
            fontVariantNumeric: 'tabular-nums',
            color: 'var(--color-primary)',
          }}
        >
          {timeLabel}
        </Typography>
        <Box
          aria-hidden
          sx={{
            width: 7,
            height: 7,
            flex: '0 0 auto',
            borderRadius: '50%',
            backgroundColor: 'var(--color-success)',
            animation: 'soho-clock-pulse 1.8s ease-in-out infinite',
            '@keyframes soho-clock-pulse': {
              '0%, 100%': { opacity: 1 },
              '50%': { opacity: 0.3 },
            },
          }}
        />
      </Stack>
    );
  };

  /** Manual-time picker, shared by its own modal and the time-settings modal. */
  const renderManualTimeFields = () => (
    <Stack gap={1.5}>
      <FormControlLabel
        control={
          <Checkbox
            checked={useClientTime}
            onChange={(event) => {
              setUseClientTime(event.target.checked);
              setManualTimeError(null);

              if (event.target.checked) {
                setManualTime(toDateTimeLocalValue(new Date()));
              }
            }}
          />
        }
        label="تنطیم برابر زمان کلاینت"
      />

      {useClientTime ? (
        renderLiveClientClock()
      ) : (
        <>
          <FormControl sx={fieldSx}>
            <FormLabel sx={{ fontSize: '0.85rem', mb: 0.5 }}>
              نوع تقویم
            </FormLabel>
            <RadioGroup
              row
              value={calendarMode}
              onChange={(event) =>
                setCalendarMode(event.target.value as CalendarMode)
              }
            >
              <FormControlLabel
                value="jalali"
                control={<Radio />}
                label="شمسی (جلالی)"
              />
              <FormControlLabel
                value="gregorian"
                control={<Radio />}
                label="میلادی"
              />
            </RadioGroup>
          </FormControl>

          {calendarMode === 'jalali' ? (
            <JalaliDateTimeField
              label="تاریخ و ساعت سیستم"
              value={manualTime}
              onChange={(nextValue) => {
                setManualTime(nextValue);
                setManualTimeError(null);
              }}
              error={Boolean(manualTimeError)}
              helperText={manualTimeError}
            />
          ) : (
            <TextField
              fullWidth
              type="datetime-local"
              label="تاریخ و ساعت سیستم"
              value={manualTime}
              onChange={(event) => {
                setManualTime(event.target.value);
                setManualTimeError(null);
              }}
              error={Boolean(manualTimeError)}
              helperText={manualTimeError}
              sx={technicalFieldSx}
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: { step: 1, dir: 'ltr', style: ltrInputStyle },
              }}
            />
          )}
        </>
      )}

      {manualTimeError && useClientTime ? (
        <Alert severity="error" sx={alertSx}>
          {manualTimeError}
        </Alert>
      ) : null}
    </Stack>
  );

  /** Small heading used between the groups of the time-settings modal. */
  const renderModalSectionTitle = (title: string) => (
    <Typography
      component="h4"
      sx={{
        m: 0,
        fontWeight: 800,
        fontSize: '0.92rem',
        textAlign: 'start',
        color: 'var(--color-text)',
      }}
    >
      {title}
    </Typography>
  );

  const renderNtpFields = () => (
    <Stack gap={1.5}>
      <FormControlLabel
        control={
          <Switch
            checked={ntpEnabled}
            onChange={(event) => {
              setNtpDirty(true);
              setNtpEnabled(event.target.checked);
              setNtpFormError(null);
            }}
          />
        }
        label={ntpEnabled ? 'فعال' : 'غیرفعال'}
        sx={{ mx: 0, gap: 1 }}
      />

      {ntpEnabled
        ? ntpServers.map((server, index) => (
            <Stack
              key={`ntp-server-${index}`}
              direction="row"
              gap={1}
              sx={{ alignItems: 'flex-start' }}
            >
              <TextField
                fullWidth
                label={`سرور زمان ${index + 1}`}
                value={server}
                onChange={(event) =>
                  handleNtpServerChange(index, event.target.value)
                }
                error={Boolean(ntpErrors[index])}
                helperText={ntpErrors[index]}
                sx={technicalFieldSx}
                slotProps={{ htmlInput: { dir: 'ltr', style: ltrInputStyle } }}
              />
              <Tooltip title="حذف سرور" arrow>
                <span>
                  <IconButton
                    aria-label={`حذف سرور زمان ${index + 1}`}
                    onClick={() => handleRemoveNtpServer(index)}
                    sx={{ mt: 1, color: 'var(--color-error)' }}
                  >
                    <MdDeleteOutline size={20} />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          ))
        : null}

      <Stack direction="row" gap={1} flexWrap="wrap">
        {ntpEnabled ? (
          <Button
            onClick={handleAddNtpServer}
            startIcon={<MdAdd />}
            variant="outlined"
            sx={outlinedButtonSx}
          >
            افزودن سرور زمان
          </Button>
        ) : null}
        {ntpEnabled || isNtpActive ? (
          <Button
            onClick={handleRequestNtpChange}
            disabled={isMutationPending}
            variant="contained"
            sx={primaryButtonSx}
          >
            {ntpEnabled ? 'ثبت سرورهای زمان' : 'ثبت غیرفعال‌سازی'}
          </Button>
        ) : null}
      </Stack>

      {ntpFormError ? (
        <Alert severity="error" sx={alertSx}>
          {ntpFormError}
        </Alert>
      ) : null}
    </Stack>
  );

  return (
    <Box dir="rtl" sx={{ width: '100%', color: 'var(--color-text)' }}>
      {queryErrors.length > 0 ? (
        <Alert severity="error" sx={{ ...alertSx, mb: 2 }}>
          دریافت بخشی از اطلاعات با خطا مواجه شد.
        </Alert>
      ) : null}

      {/* ── نوار ابزار ── */}
      <Box sx={{ ...toolbarSx, justifyContent: 'flex-end' }}>
        <Button
          onClick={handleToggleAll}
          startIcon={areAllExpanded ? <MdUnfoldLess /> : <MdUnfoldMore />}
          variant="outlined"
          sx={outlinedButtonSx}
        >
          {areAllExpanded ? 'بستن همه' : 'باز کردن همه'}
        </Button>
        <Button
          onClick={handleRefreshAll}
          startIcon={<MdRefresh />}
          variant="outlined"
          sx={outlinedButtonSx}
        >
          بروزرسانی
        </Button>
      </Box>

      <Stack gap={1.75}>
        {/* ─────── بخش ۱: سامانه (نسخه + نام میزبان) ─────── */}
        <SettingsAccordionSection
          id={SECTIONS.system}
          icon={<MdComputer />}
          title="عمومی"
          summaryLabel="نام میزبان"
          summaryValue={<Ltr>{currentHostname}</Ltr>}
          isLoading={versionQuery.isLoading || hostnameQuery.isLoading}
          expanded={expandedSections.includes(SECTIONS.system)}
          onToggle={toggleSection}
        >
          <SettingsRowsTable
            isLoading={versionQuery.isLoading || hostnameQuery.isLoading}
            rows={[
              {
                id: 'system-version',
                title: 'نسخه سامانه',
                value: <Ltr>{primaryVersionLine}</Ltr>,
              },
              {
                id: 'system-hostname',
                title: 'نام میزبان',
                value: <Ltr>{currentHostname}</Ltr>,
                valueAdornment: renderEditAction('ویرایش نام میزبان', () => {
                  setHostnameError(null);
                  setEditor('hostname');
                }),
              },
            ]}
          />

          {versionQuery.data?.backendError ? (
            <Alert severity="warning" sx={alertSx}>
              {versionQuery.data.backendError}
            </Alert>
          ) : null}
        </SettingsAccordionSection>

        {/* ─────── بخش ۲: زمان ─────── */}
        <SettingsAccordionSection
          id={SECTIONS.time}
          icon={<MdAccessTime />}
          title="زمان"
          summaryLabel="زمان ��رور"
          summaryValue={
            <Stack
              direction="row"
              alignItems="center"
              gap={1}
              sx={{ minWidth: 0 }}
            >
              <Box
                aria-hidden
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  flexShrink: 0,
                  backgroundColor: serverClock.isLive
                    ? 'var(--color-success, #29b96a)'
                    : 'var(--color-secondary)',
                }}
              />
              <Ltr>{serverTimeDisplay}</Ltr>
            </Stack>
          }
          isLoading={timeQuery.isLoading}
          expanded={isTimeSectionOpen}
          onToggle={toggleSection}
        >
          <SettingsRowsTable
            isLoading={timeQuery.isLoading}
            rows={[
              {
                id: 'time-client',
                title: 'زمان کلاینت',
                value: <Ltr>{clientTimeDisplay}</Ltr>,
              },
              {
                id: 'time-server',
                title: 'زمان سرور',
                value: (
                  <Tooltip arrow title={serverTimeTooltip}>
                    <Box
                      component="span"
                      sx={{
                        cursor: 'help',
                        textDecoration: 'underline dotted',
                        textUnderlineOffset: '4px',
                      }}
                    >
                      <Ltr>{serverTimeDisplay}</Ltr>
                    </Box>
                  </Tooltip>
                ),
                valueAdornment: (
                  <>
                    {renderEditAction('تنطیمات زمان و همگام‌سازی', () => {
                      setNtpFormError(null);
                      setManualTimeError(null);
                      setEditor('time-settings');
                    })}
                    <Chip
                      size="small"
                      variant="outlined"
                      color={isNtpActive ? 'success' : 'default'}
                      label={isNtpActive ? 'NTP فعال' : 'NTP غیرفعال'}
                      sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                    />
                    <Tooltip
                      arrow
                      title={
                        isClockDrifting
                          ? 'برای تنطیم زمان مادربرد برابر زمان سیستم کلیک کنید'
                          : 'اختلاف زمانی بین RTC و سیستم برحسب زمان محلی'
                      }
                    >
                      <Chip
                        size="small"
                        variant="outlined"
                        clickable={isClockDrifting}
                        disabled={isMutationPending}
                        onClick={
                          isClockDrifting ? handleSyncHardwareClock : undefined
                        }
                        color={
                          hardwareClockDrift.level === 'aligned'
                            ? 'success'
                            : hardwareClockDrift.level === 'unknown'
                              ? 'default'
                              : 'error'
                        }
                        label={driftDisplay}
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          maxWidth: '100%',
                          cursor: isClockDrifting ? 'pointer' : 'default',
                          '& .MuiChip-label': {
                            whiteSpace: 'normal',
                            lineHeight: 1.5,
                            py: 0.25,
                          },
                        }}
                      />
                    </Tooltip>
                  </>
                ),
              },
              {
                id: 'time-rtc',
                title: 'زمان سخت افزار (RTC)',
                value: <Ltr>{hardwareTimeDisplay}</Ltr>,
              },
              {
                id: 'time-timezone',
                title: 'منطقه زمانی',
                value: <Ltr>{timeQuery.data?.timezone ?? NOT_AVAILABLE}</Ltr>,
                valueAdornment: renderEditAction('ویرایش منطقه زمانی', () => {
                  setTimezoneError(null);
                  setEditor('timezone');
                }),
              },
            ]}
          />
        </SettingsAccordionSection>
      </Stack>

      {/* ── ویرایش نام میزبان ── */}
      <SettingEditModal
        open={editor === 'hostname'}
        onClose={closeEditor}
        onSubmit={handleRequestHostnameChange}
        isSubmitting={setHostnameMutation.isPending}
        submitLabel="ثبت نام میزبان"
        icon={<MdComputer />}
        title="ویرایش نام میزبان"
      >
        <TextField
          fullWidth
          label="نام میزبان"
          value={hostname}
          onChange={(event) => {
            setHostnameDirty(true);
            setHostname(event.target.value);
            setHostnameError(null);
          }}
          error={Boolean(hostnameError)}
          helperText={renderHostnameHelper(hostnameError)}
          sx={technicalFieldSx}
          slotProps={{
            htmlInput: { maxLength: 253, dir: 'ltr', style: ltrInputStyle },
          }}
        />
      </SettingEditModal>

      {/* ── ویرایش منطقه زمانی ── */}
      <SettingEditModal
        open={editor === 'timezone'}
        onClose={closeEditor}
        onSubmit={handleRequestTimezoneChange}
        isSubmitting={setTimezoneMutation.isPending}
        submitLabel="ثبت منطقه زمانی"
        icon={<MdPublic />}
        title="ویرایش منطقه زمانی"
      >
        <Autocomplete
          options={timezoneOptions}
          value={timezone}
          loading={timezoneQuery.isLoading}
          onChange={(_event, newValue) => {
            setTimezoneDirty(true);
            setTimezone(newValue);
            setTimezoneError(null);
          }}
          slotProps={{ paper: { sx: popupSx } }}
          renderOption={(props, option) => (
            <li {...props} key={option} style={ltrBlockStyle}>
              {option}
            </li>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label="منطقه زم��نی"
              error={Boolean(timezoneError)}
              helperText={timezoneError}
              sx={technicalFieldSx}
              slotProps={{
                htmlInput: {
                  ...params.inputProps,
                  dir: 'ltr',
                  style: ltrInputStyle,
                },
              }}
            />
          )}
        />
      </SettingEditModal>

      {/* ── تغییر زمان سرور ── */}
      <SettingEditModal
        open={editor === 'manual-time'}
        onClose={closeEditor}
        onSubmit={handleRequestManualTime}
        isSubmitting={setManualTimeMutation.isPending}
        submitLabel="تنطیم زمان سیستم"
        icon={<MdMemory />}
        title="تغییر زمان سرور"
      >
        {renderManualTimeFields()}
      </SettingEditModal>

      {/* ── تمام تنطیمات زمان (از طریق آیکون ویرایش) ── */}
      <SettingEditModal
        open={editor === 'time-settings'}
        onClose={closeEditor}
        onSubmit={undefined}
        hideSubmit
        isSubmitting={isMutationPending}
        icon={<MdAccessTime />}
        title="تنطیمات زمان"
      >
        {renderModalSectionTitle('همگام‌سازی خودکار (NTP)')}
        {renderNtpFields()}

        {isManualTimeAvailable ? (
          <>
            <Divider
              sx={{
                my: 1,
                borderColor:
                  'color-mix(in srgb, var(--color-primary) 18%, transparent)',
              }}
            />

            {renderModalSectionTitle('تنطیم دستی زمان')}
            {renderManualTimeFields()}
            <Button
              onClick={handleRequestManualTime}
              disabled={isMutationPending}
              variant="contained"
              sx={{ ...primaryButtonSx, alignSelf: 'flex-start' }}
            >
              تنطیم زمان سیستم
            </Button>
          </>
        ) : null}
      </SettingEditModal>

      <SystemSettingConfirmDialog
        open={Boolean(pendingAction)}
        title={pendingAction?.title ?? ''}
        description={pendingAction?.description ?? ''}
        confirmLabel={pendingAction?.confirmLabel}
        severity={pendingAction?.severity}
        isLoading={isMutationPending}
        onCancel={() => setPendingAction(null)}
        onConfirm={handleConfirmAction}
      />
    </Box>
  );
};

export default GeneralSettingsPanel;
