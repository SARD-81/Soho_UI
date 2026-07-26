import {
  Alert,
  Autocomplete,
  Box,
  Button,
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
} from "@mui/material";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { FiEdit3 } from "react-icons/fi";
import { toast } from "react-hot-toast";
import {
  MdAccessTime,
  MdAdd,
  MdComputer,
  MdContentCopy,
  MdDeleteOutline,
  MdDns,
  MdInfoOutline,
  MdMemory,
  MdPublic,
  MdRefresh,
  MdStorage,
  MdSync,
  MdUnfoldLess,
  MdUnfoldMore,
  MdVisibility,
} from "react-icons/md";
import type {
  HwclockRequest,
  ManageNtpPayload,
  SetHostnamePayload,
  SetManualTimePayload,
  SetTimezonePayload,
} from "../../@types/generalSettings";
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
} from "../../hooks/useGeneralSystemSettings";
import { useSystemWallClock } from "../../hooks/useSystemWallClock";
import { extractApiErrorMessage } from "../../utils/apiError";
import {
  formatManualTimeForApi,
  toDateTimeLocalValue,
  validateHostname,
  validateNtpServer,
} from "../../utils/generalSettings";
import SystemSettingConfirmDialog, {
  type SystemSettingConfirmSeverity,
} from "./SystemSettingConfirmDialog";
import Ltr from "./general/Ltr";
import SettingEditModal from "./general/SettingEditModal";
import SettingsRowsTable from "./general/SettingsRowsTable";
import SettingsAccordionSection from "./general/SettingsAccordionSection";
import {
  settingsAlertSx as alertSx,
  settingsCodeBlockSx as codeBlockSx,
  settingsFieldSx as fieldSx,
  settingsOutlinedButtonSx as outlinedButtonSx,
  settingsPopupSx as popupSx,
  settingsPrimaryButtonSx as primaryButtonSx,
  settingsTechnicalFieldSx as technicalFieldSx,
  settingsToolbarSx as toolbarSx,
  ltrBlockStyle,
  ltrInputStyle,
} from "./general/styles";

const NOT_AVAILABLE = "در دسترس نیست";
const NOT_CONFIGURED = "تنظیم نشده";

/** Section ids of the accordion list. */
const SECTIONS = {
  version: "version",
  domain: "domain",
  time: "time",
} as const;

type SectionId = (typeof SECTIONS)[keyof typeof SECTIONS];

const ALL_SECTION_IDS: SectionId[] = [
  SECTIONS.version,
  SECTIONS.domain,
  SECTIONS.time,
];

type EditorKind =
  "hostname" | "timezone" | "ntp" | "manual-time" | "hwclock" | null;

type PendingAction =
  | {
      type: "hostname";
      payload: SetHostnamePayload;
      title: string;
      description: string;
      confirmLabel: string;
      severity: SystemSettingConfirmSeverity;
    }
  | {
      type: "timezone";
      payload: SetTimezonePayload;
      title: string;
      description: string;
      confirmLabel: string;
      severity: SystemSettingConfirmSeverity;
    }
  | {
      type: "ntp";
      payload: ManageNtpPayload;
      title: string;
      description: string;
      confirmLabel: string;
      severity: SystemSettingConfirmSeverity;
    }
  | {
      type: "manual-time";
      payload: SetManualTimePayload;
      title: string;
      description: string;
      confirmLabel: string;
      severity: SystemSettingConfirmSeverity;
    }
  | {
      type: "hwclock";
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

  const [hostname, setHostname] = useState("");
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
    toDateTimeLocalValue(new Date()),
  );
  const [manualTimeError, setManualTimeError] = useState<string | null>(null);
  const manualTimeInitializedRef = useRef(false);

  const [rtcMode, setRtcMode] = useState<"utc" | "local">("utc");
  const [hwclockDisplay, setHwclockDisplay] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
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
          "",
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

    setRtcMode(timeQuery.data.rtcInLocalTimezone ? "local" : "utc");
  }, [timeQuery.data?.rtcInLocalTimezone]);

  const timezoneOptions = useMemo(() => {
    const values = new Set(timezoneQuery.data ?? []);
    if (timeQuery.data?.timezone) values.add(timeQuery.data.timezone);
    if (timezone) values.add(timezone);
    return Array.from(values).sort((left, right) =>
      left.localeCompare(right, "en"),
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
      toast("نام میزبان تغییری نکرده است.");
      return;
    }

    setPendingAction({
      type: "hostname",
      payload: { hostname: validation.value },
      title: "تغییر نام میزبان سامانه",
      description:
        "نام میزبان بخشی از هویت شبکه‌ای سامانه است. بعد از اعمال تغییر، برخی سرویس‌ها یا کلاینت‌ها ممکن است برای شناسایی نام جدید به راه‌اندازی مجدد یا بروزرسانی تنظیمات خود نیاز داشته باشند.",
      confirmLabel: "تغییر نام میزبان",
      severity: "warning",
    });
  };

  const handleRequestTimezoneChange = () => {
    const normalizedTimezone = timezone?.trim() ?? "";
    if (!normalizedTimezone) {
      setTimezoneError("انتخاب منطقه زمانی الزامی است.");
      return;
    }

    setTimezoneError(null);
    if (normalizedTimezone === timeQuery.data?.timezone) {
      toast("منطقه زمانی تغییری نکرده است.");
      return;
    }

    setPendingAction({
      type: "timezone",
      payload: { timezone: normalizedTimezone },
      title: "تغییر منطقه زمانی سیستم",
      description:
        "این تغییر روی نمایش زمان در گزارش‌ها، لاگ‌ها و زمان‌بندی سرویس‌ها اثر می‌گذارد. ساعت UTC تغییر نمی‌کند، اما زمان محلی سامانه بر اساس منطقه جدید نمایش داده می‌شود.",
      confirmLabel: "اعمال منطقه زمانی",
      severity: "warning",
    });
  };

  const handleNtpServerChange = (index: number, value: string) => {
    setNtpDirty(true);
    setNtpServers((current) =>
      current.map((server, serverIndex) =>
        serverIndex === index ? value : server,
      ),
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
    setNtpServers((current) => [...current, ""]);
  };

  const handleRemoveNtpServer = (index: number) => {
    setNtpDirty(true);
    setNtpServers((current) =>
      current.filter((_, serverIndex) => serverIndex !== index),
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
            nextErrors[index] = "این فیلد نمی‌تواند خالی باشد.";
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
      setNtpFormError("لطفاً آدرس سرورهای زمان را اصلاح کنید.");
      return;
    }

    if (ntpEnabled && uniqueServers.length === 0) {
      setNtpFormError(
        "برای فعال‌سازی همگام‌سازی خودکار حداقل یک سرور معتبر وارد کنید.",
      );
      return;
    }

    setNtpFormError(null);
    setPendingAction({
      type: "ntp",
      payload: { enabled: ntpEnabled, servers: uniqueServers },
      title: ntpEnabled
        ? "فعال‌سازی همگام‌سازی خودکار زمان"
        : "غیرفعال‌سازی همگام‌سازی خودکار زمان",
      description: ntpEnabled
        ? "پس از تایید، ساعت سیستم به‌صورت خودکار با سرورهای معرفی‌شده همگام می‌شود. صحت نام سرورها و دسترسی شبکه‌ای به آن‌ها را بررسی کنید."
        : "با غیرفعال کردن این قابلیت، همگام‌سازی خودکار زمان متوقف می‌شود و مسئولیت تنظیم صحیح ساعت سیستم بر عهده مدیر سامانه خواهد بود.",
      confirmLabel: ntpEnabled
        ? "فعال‌سازی همگام‌سازی"
        : "غیرفعال‌سازی همگام‌سازی",
      severity: ntpEnabled ? "info" : "warning",
    });
  };

  const handleRequestManualTime = () => {
    if (timeQuery.data?.ntpEnabled === true) {
      setManualTimeError(
        "برای تنظیم دستی زمان، ابتدا همگام‌سازی خودکار را غیرفعال و تنظیمات آن را ثبت کنید.",
      );
      return;
    }

    const validation = formatManualTimeForApi(manualTime);
    setManualTimeError(validation.error);
    if (validation.error) return;

    setPendingAction({
      type: "manual-time",
      payload: { time: validation.value },
      title: "تنظیم دستی زمان سیستم",
      description:
        "تغییر ساعت سیستم می‌تواند روی اعتبار نشست‌ها، زمان لاگ‌ها، گواهی‌های TLS و اجرای وظایف زمان‌بندی‌شده اثر بگذارد. قبل از ادامه از درستی تاریخ، ساعت و منطقه زمانی اطمینان حاصل کنید.",
      confirmLabel: "تنظیم زمان سیستم",
      severity: "error",
    });
  };

  const handleShowHwclock = async () => {
    try {
      const result = await manageHwclockMutation.mutateAsync({
        action: "show",
      });
      setHwclockDisplay(result.displayValue);
      toast.success(result.message);
    } catch (error) {
      toast.error(
        extractApiErrorMessage(
          error,
          "دریافت ساعت سخت‌افزاری با خطا مواجه شد.",
        ),
      );
    }
  };

  const handleRequestHwclockSync = (action: "hctosys" | "systohc") => {
    const isHardwareToSystem = action === "hctosys";
    setPendingAction({
      type: "hwclock",
      payload: isHardwareToSystem
        ? { action, localtime: rtcMode === "local" }
        : { action },
      title: isHardwareToSystem
        ? "خواندن زمان از ساعت مادربرد"
        : "نوشتن زمان سیستم روی مادربرد",
      description: isHardwareToSystem
        ? "زمان سیستم‌عامل با مقدار ساعت سخت‌افزاری جایگزین می‌شود. انتخاب وقت جهانی یا وقت محلی تعیین می‌کند مقدار خام ساعت مادربرد چگونه تفسیر شود؛ انتخاب اشتباه می‌تواند باعث اختلاف چندساعته شود."
        : "زمان فعلی سیستم‌عامل روی ساعت سخت‌افزاری مادربرد نوشته می‌شود. این عملیات مقدار قبلی ساعت مادربرد را جایگزین می‌کند.",
      confirmLabel: isHardwareToSystem
        ? "خواندن زمان از مادربرد"
        : "نوشتن زمان روی مادربرد",
      severity: "error",
    });
  };

  const handleConfirmAction = async () => {
    if (!pendingAction || isMutationPending) return;

    try {
      if (pendingAction.type === "hostname") {
        const message = await setHostnameMutation.mutateAsync(
          pendingAction.payload,
        );
        setHostnameDirty(false);
        toast.success(message);
      } else if (pendingAction.type === "timezone") {
        const message = await setTimezoneMutation.mutateAsync(
          pendingAction.payload,
        );
        setTimezoneDirty(false);
        toast.success(message);
      } else if (pendingAction.type === "ntp") {
        const message = await manageNtpMutation.mutateAsync(
          pendingAction.payload,
        );
        setNtpDirty(false);
        toast.success(message);
      } else if (pendingAction.type === "manual-time") {
        const message = await setManualTimeMutation.mutateAsync(
          pendingAction.payload,
        );
        manualTimeInitializedRef.current = false;
        toast.success(message);
      } else {
        const result = await manageHwclockMutation.mutateAsync(
          pendingAction.payload,
        );
        setHwclockDisplay(result.displayValue);
        toast.success(result.message);
      }

      setPendingAction(null);
      setEditor(null);
    } catch (error) {
      toast.error(
        extractApiErrorMessage(error, "اعمال تنظیمات سیستم با خطا مواجه شد."),
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
  const staticHostname = hostnameQuery.data?.staticHostname ?? NOT_AVAILABLE;
  const transientHostname =
    hostnameQuery.data?.currentHostname ?? NOT_AVAILABLE;
  const hostnameLabels = (hostnameQuery.data?.staticHostname ?? "").split(".");
  const domainSuffix =
    hostnameLabels.length > 1 ? hostnameLabels.slice(1).join(".") : null;
  const isHostnameConsistent =
    Boolean(hostnameQuery.data?.staticHostname) &&
    hostnameQuery.data?.staticHostname === hostnameQuery.data?.currentHostname;

  const versionLines = versionQuery.data?.lines ?? [];
  const primaryVersionLine = versionLines[0] ?? NOT_AVAILABLE;
  const versionText = versionQuery.data?.text ?? "";

  const isNtpActive = timeQuery.data?.ntpEnabled === true;
  const configuredServers = (timeQuery.data?.ntpServers ?? []).filter(Boolean);

  /** The time section keeps a live 1s ticker while it is expanded. */
  const isTimeSectionOpen = expandedSections.includes(SECTIONS.time);
  const localClock = useSystemWallClock(timeQuery.data?.localTime, {
    enabled: true,
  });
  const utcClock = useSystemWallClock(timeQuery.data?.utcTime, {
    enabled: isTimeSectionOpen,
  });

  const localTimeDisplay =
    localClock.timestampLabel ?? timeQuery.data?.localTime ?? NOT_AVAILABLE;
  const utcTimeDisplay =
    utcClock.timestampLabel ?? timeQuery.data?.utcTime ?? NOT_AVAILABLE;

  const toggleSection = (id: string) => {
    setExpandedSections((current) =>
      current.includes(id as SectionId)
        ? current.filter((sectionId) => sectionId !== id)
        : [...current, id as SectionId],
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
    toast.success("اطلاعات تنظیمات عمومی بروزرسانی شد.");
  };

  const handleCopy = async (value: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(successMessage);
    } catch {
      toast.error("کپی کردن مقدار در این مرورگر ممکن نیست.");
    }
  };

  const closeEditor = () => setEditor(null);

  /** Compact icon button used inside a tile header. */
  const renderIconAction = (
    label: string,
    icon: ReactNode,
    onClick: () => void,
    disabled = false,
  ) => (
    <Tooltip title={label} arrow>
      <span>
        <IconButton
          size="small"
          aria-label={label}
          onClick={onClick}
          disabled={disabled || isMutationPending}
          sx={{
            color: "var(--color-primary)",
            backgroundColor:
              "color-mix(in srgb, var(--color-primary) 8%, transparent)",
            "&:hover": {
              backgroundColor:
                "color-mix(in srgb, var(--color-primary) 18%, transparent)",
            },
            "&.Mui-disabled": {
              color:
                "color-mix(in srgb, var(--color-secondary) 45%, transparent)",
            },
          }}
        >
          {icon}
        </IconButton>
      </span>
    </Tooltip>
  );

  const renderEditAction = (
    label: string,
    onClick: () => void,
    disabled = false,
  ) => renderIconAction(label, <FiEdit3 size={17} />, onClick, disabled);

  return (
    <Box dir="rtl" sx={{ width: "100%", color: "var(--color-text)" }}>
      {queryErrors.length > 0 ? (
        <Alert severity="error" sx={{ ...alertSx, mb: 2 }}>
          دریافت بخشی از اطلاعات با خطا مواجه شد.
        </Alert>
      ) : null}

      {/* ── نوار ابزار ── */}
      <Box sx={{ ...toolbarSx, justifyContent: "flex-end" }}>
        <Button
          onClick={handleToggleAll}
          startIcon={areAllExpanded ? <MdUnfoldLess /> : <MdUnfoldMore />}
          sx={outlinedButtonSx}
        >
          {areAllExpanded ? "بستن همه" : "باز کردن همه"}
        </Button>
        <Button
          onClick={handleRefreshAll}
          startIcon={<MdRefresh />}
          sx={outlinedButtonSx}
        >
          بروزرسانی
        </Button>
      </Box>

      <Stack gap={1.75}>
        {/* ─────── بخش ۱: ورژن ─────── */}
        <SettingsAccordionSection
          id={SECTIONS.version}
          icon={<MdStorage />}
          title="ورژن"
          summaryLabel="نسخه فعلی"
          summaryValue={<Ltr>{primaryVersionLine}</Ltr>}
          badges={
            versionQuery.data?.backendError
              ? [{ label: "خطای خواندن نسخه", color: "warning" as const }]
              : []
          }
          isLoading={versionQuery.isLoading}
          expanded={expandedSections.includes(SECTIONS.version)}
          onToggle={toggleSection}
        >
          <SettingsRowsTable
            isLoading={versionQuery.isLoading}
            showStatus={false}
            rows={[
              {
                id: "version-current",
                title: "نسخه سامانه",
                value: <Ltr>{primaryVersionLine}</Ltr>,
                action: renderIconAction(
                  "کپی نسخه",
                  <MdContentCopy size={17} />,
                  () =>
                    handleCopy(
                      versionText || primaryVersionLine,
                      "نسخه سامانه کپی شد.",
                    ),
                ),
              },
              {
                id: "version-path",
                title: "مسیر فایل نسخه",
                value: (
                  <Ltr>{versionQuery.data?.filePath ?? NOT_AVAILABLE}</Ltr>
                ),
              },
              ...(versionLines.length > 1
                ? [
                    {
                      id: "version-extra",
                      title: "جزئیات نسخه",
                      value: (
                        <Stack gap={0.25} sx={{ minWidth: 0 }}>
                          {versionLines.slice(1).map((line) => (
                            <Ltr key={line}>{line}</Ltr>
                          ))}
                        </Stack>
                      ),
                    },
                  ]
                : []),
            ]}
          />

          {versionQuery.data?.backendError ? (
            <Alert severity="warning" sx={alertSx}>
              {versionQuery.data.backendError}
            </Alert>
          ) : null}
        </SettingsAccordionSection>

        {/* ─────── بخش ۲: نام دامنه ─────── */}
        <SettingsAccordionSection
          id={SECTIONS.domain}
          icon={<MdComputer />}
          title="نام دامنه"
          summaryLabel="نام میزبان"
          summaryValue={<Ltr>{currentHostname}</Ltr>}
          badges={
            isHostnameConsistent
              ? []
              : [{ label: "ناهمسانی نام میزبان", color: "warning" as const }]
          }
          isLoading={hostnameQuery.isLoading}
          expanded={expandedSections.includes(SECTIONS.domain)}
          onToggle={toggleSection}
        >
          <SettingsRowsTable
            isLoading={hostnameQuery.isLoading}
            rows={[
              {
                id: "hostname-static",
                title: "نام میزبان پایدار",
                value: <Ltr>{staticHostname}</Ltr>,
                status: { label: "قابل ویرایش", color: "info" },
                action: renderEditAction("ویرایش نام میزبان", () => {
                  setHostnameError(null);
                  setEditor("hostname");
                }),
              },
              {
                id: "hostname-current",
                title: "نام میزبان جاری",
                value: <Ltr>{transientHostname}</Ltr>,
                status: isHostnameConsistent
                  ? { label: "همسان", color: "success" }
                  : { label: "ناهمسان", color: "warning" },
              },
              {
                id: "hostname-domain",
                title: "بخش دامنه",
                value: domainSuffix ? (
                  <Ltr>{domainSuffix}</Ltr>
                ) : (
                  NOT_CONFIGURED
                ),
                action: domainSuffix
                  ? renderIconAction(
                      "کپی نام دامنه",
                      <MdContentCopy size={17} />,
                      () => handleCopy(domainSuffix, "نام دامنه کپی شد."),
                    )
                  : undefined,
              },
            ]}
          />
        </SettingsAccordionSection>

        {/* ─────── بخش ۳: زمان ─────── */}
        <SettingsAccordionSection
          id={SECTIONS.time}
          icon={<MdAccessTime />}
          title="زمان"
          summaryLabel="زمان سیستم"
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
                  borderRadius: "50%",
                  flexShrink: 0,
                  backgroundColor: localClock.isLive
                    ? "var(--color-success, #29b96a)"
                    : "var(--color-secondary)",
                }}
              />
              <Ltr>{localTimeDisplay}</Ltr>
            </Stack>
          }
          badges={[
            isNtpActive
              ? { label: "NTP فعال", color: "success" as const }
              : { label: "NTP غیرفعال", color: "default" as const },
          ]}
          isLoading={timeQuery.isLoading}
          expanded={isTimeSectionOpen}
          onToggle={toggleSection}
        >
          <SettingsRowsTable
            isLoading={timeQuery.isLoading}
            rows={[
              {
                id: "time-local",
                title: "زمان محلی",
                value: <Ltr>{localTimeDisplay}</Ltr>,
                status: localClock.isLive
                  ? { label: "زنده", color: "success" }
                  : { label: "ثابت", color: "default" },
                action: renderIconAction(
                  "کپی زمان محلی",
                  <MdContentCopy size={17} />,
                  () => handleCopy(localTimeDisplay, "زمان محلی کپی شد."),
                ),
              },
              {
                id: "time-jalali",
                title: "تاریخ شمسی",
                value: localClock.jalaliDateLabel ?? NOT_AVAILABLE,
              },
              {
                id: "time-utc",
                title: "زمان جهانی (UTC)",
                value: <Ltr>{utcTimeDisplay}</Ltr>,
              },
              {
                id: "time-timezone",
                title: "منطقه زمانی",
                value: <Ltr>{timeQuery.data?.timezone ?? NOT_AVAILABLE}</Ltr>,
                status: { label: "قابل ویرایش", color: "info" },
                action: renderEditAction("ویرایش منطقه زمانی", () => {
                  setTimezoneError(null);
                  setEditor("timezone");
                }),
              },
              {
                id: "time-ntp",
                title: "سرورهای همگام‌سازی (NTP)",
                value:
                  configuredServers.length > 0 ? (
                    <Stack gap={0.25} sx={{ minWidth: 0 }}>
                      {configuredServers.map((server) => (
                        <Ltr key={server}>{server}</Ltr>
                      ))}
                    </Stack>
                  ) : (
                    NOT_CONFIGURED
                  ),
                status: isNtpActive
                  ? { label: "فعال", color: "success" }
                  : { label: "غیرفعال", color: "default" },
                action: renderEditAction("ویرایش همگام‌سازی", () => {
                  setNtpFormError(null);
                  setEditor("ntp");
                }),
              },
              {
                id: "time-sync",
                title: "وضعیت همگامی",
                value:
                  timeQuery.data?.ntpSynchronized == null
                    ? NOT_AVAILABLE
                    : timeQuery.data.ntpSynchronized
                      ? "همگام است"
                      : "هنوز همگام نشده است",
                status: timeQuery.data?.ntpSynchronized
                  ? { label: "همگام", color: "success" }
                  : { label: "ناهمگام", color: "warning" },
              },
              {
                id: "time-manual",
                title: "تنطیم دستی زمان",
                value: <Ltr>{manualTime || NOT_CONFIGURED}</Ltr>,
                status: isNtpActive
                  ? { label: "غیرفعال", color: "default" }
                  : { label: "قابل تنطیم", color: "info" },
                action: renderEditAction(
                  isNtpActive
                    ? "ابتدا همگام‌سازی خودکار را غیرفعال کنید"
                    : "تنطیم دستی زمان",
                  () => {
                    setManualTimeError(null);
                    setEditor("manual-time");
                  },
                  isNtpActive,
                ),
              },
              {
                id: "time-hwclock",
                title: "ساعت مادربرد",
                value: (
                  <Ltr>
                    {hwclockDisplay ??
                      (rtcMode === "local"
                        ? (timeQuery.data?.hardwareLocalTime ?? NOT_AVAILABLE)
                        : (timeQuery.data?.hardwareUtcTime ?? NOT_AVAILABLE))}
                  </Ltr>
                ),
                status: {
                  label: rtcMode === "local" ? "وقت محلی" : "وقت جهانی",
                  color: "info",
                },
                action: (
                  <>
                    {renderIconAction(
                      "نمایش ساعت مادربرد",
                      <MdVisibility size={17} />,
                      handleShowHwclock,
                    )}
                    {renderEditAction("مدیریت ساعت مادربرد", () =>
                      setEditor("hwclock"),
                    )}
                  </>
                ),
              },
            ]}
          />
        </SettingsAccordionSection>
      </Stack>

      {/* ── ویرایش نام میزبان ── */}
      <SettingEditModal
        open={editor === "hostname"}
        onClose={closeEditor}
        onSubmit={handleRequestHostnameChange}
        isSubmitting={setHostnameMutation.isPending}
        submitLabel="ثبت نام میزبان"
        icon={<MdComputer />}
        title="ویرایش نام میزبان"
        description="تغییر نام پایدار سامانه در شبکه"
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
          helperText={
            hostnameError ??
            "نمونه‌های معتبر: soho یا storage-node-01.example.local"
          }
          sx={technicalFieldSx}
          slotProps={{
            htmlInput: { maxLength: 253, dir: "ltr", style: ltrInputStyle },
          }}
        />
      </SettingEditModal>

      {/* ── ویرایش منطقه زمانی ── */}
      <SettingEditModal
        open={editor === "timezone"}
        onClose={closeEditor}
        onSubmit={handleRequestTimezoneChange}
        isSubmitting={setTimezoneMutation.isPending}
        submitLabel="ثبت منطقه زمانی"
        icon={<MdPublic />}
        title="ویرایش منطقه زمانی"
        description="انتخاب منطقه معتبر برای محاسبه زمان محلی سامانه"
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
              label="منطقه زمانی"
              error={Boolean(timezoneError)}
              helperText={
                timezoneError ??
                "منطقه زمانی روی محاسبه و نمایش زمان محلی اثر می‌گذارد."
              }
              sx={technicalFieldSx}
              slotProps={{
                htmlInput: {
                  ...params.inputProps,
                  dir: "ltr",
                  style: ltrInputStyle,
                },
              }}
            />
          )}
        />
      </SettingEditModal>

      {/* ── ویرایش همگام‌سازی خودکار ── */}
      <SettingEditModal
        open={editor === "ntp"}
        onClose={closeEditor}
        onSubmit={handleRequestNtpChange}
        isSubmitting={manageNtpMutation.isPending}
        submitLabel="ثبت سرورهای زمان"
        errorMessage={ntpFormError}
        icon={<MdDns />}
        title="همگام‌سازی خودکار زمان"
        description="تنظیم سرورهای زمان برای همگام‌سازی خودکار ساعت سامانه"
      >
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
          label={ntpEnabled ? "فعال" : "غیرفعال"}
          sx={{ mx: 0, gap: 1 }}
        />

        <Stack gap={1.5}>
          {ntpServers.map((server, index) => (
            <Stack
              key={`ntp-server-${index}`}
              direction="row"
              gap={1}
              sx={{ alignItems: "flex-start" }}
            >
              <TextField
                fullWidth
                label={`سرور زمان ${index + 1}`}
                value={server}
                onChange={(event) =>
                  handleNtpServerChange(index, event.target.value)
                }
                error={Boolean(ntpErrors[index])}
                helperText={
                  ntpErrors[index] ?? "نام دامنه یا نشانی آی‌پی سرور زمان"
                }
                sx={technicalFieldSx}
                slotProps={{
                  htmlInput: { dir: "ltr", style: ltrInputStyle },
                }}
              />
              <Tooltip title="حذف سرور" arrow>
                <span>
                  <IconButton
                    aria-label={`حذف سرور زمان ${index + 1}`}
                    onClick={() => handleRemoveNtpServer(index)}
                    sx={{ mt: 1, color: "var(--color-error)" }}
                  >
                    <MdDeleteOutline size={20} />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          ))}

          <Button
            onClick={handleAddNtpServer}
            startIcon={<MdAdd />}
            sx={{ ...outlinedButtonSx, alignSelf: "flex-start" }}
          >
            افزودن سرور زمان
          </Button>
        </Stack>
      </SettingEditModal>

      {/* ── تنظیم دستی زمان ── */}
      <SettingEditModal
        open={editor === "manual-time"}
        onClose={closeEditor}
        onSubmit={handleRequestManualTime}
        isSubmitting={setManualTimeMutation.isPending}
        submitLabel="تنظیم زمان سیستم"
        icon={<MdMemory />}
        title="تنظیم دستی زمان"
        description="تنظیم تاریخ و ساعت سیستم در زمانی که همگام‌سازی خودکار خاموش است"
      >
        {isNtpActive ? (
          <Alert severity="warning" sx={alertSx}>
            همگام‌سازی خودکار زمان فعال است؛ برای تنظیم دستی، ابتدا آن را
            غیرفعال کنید.
          </Alert>
        ) : null}

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
          helperText={
            manualTimeError ??
            "زمان در قالب محلی انتخاب می‌شود و با منطقه زمانی فعال تفسیر خواهد شد."
          }
          sx={technicalFieldSx}
          slotProps={{
            inputLabel: { shrink: true },
            htmlInput: { step: 1, dir: "ltr", style: ltrInputStyle },
          }}
        />
      </SettingEditModal>

      {/* ── ساعت سخت‌افزاری مادربرد ── */}
      <SettingEditModal
        open={editor === "hwclock"}
        onClose={closeEditor}
        onSubmit={undefined}
        hideSubmit
        isSubmitting={manageHwclockMutation.isPending}
        icon={<MdInfoOutline />}
        title="ساعت سخت‌افزاری مادربرد"
        description="مشاهده و همگام‌سازی ساعت مادربرد با سیستم‌عامل"
      >
        <FormControl sx={fieldSx}>
          <FormLabel sx={{ fontSize: "0.85rem", mb: 0.5 }}>
            مقدار ساعت سخت‌افزاری چگونه تفسیر شود؟
          </FormLabel>
          <RadioGroup
            row
            value={rtcMode}
            onChange={(event) =>
              setRtcMode(event.target.value as "utc" | "local")
            }
          >
            <FormControlLabel
              value="utc"
              control={<Radio />}
              label="وقت جهانی UTC"
            />
            <FormControlLabel
              value="local"
              control={<Radio />}
              label="وقت محلی"
            />
          </RadioGroup>
        </FormControl>

        <Alert severity="info" sx={alertSx}>
          در بیشتر سرورهای لینوکسی توصیه می‌شود ساعت مادربرد بر مبنای وقت جهانی
          نگهداری شود؛ وقت محلی بیشتر برای سازگاری با سیستم‌عامل‌های دیگر کاربرد
          دارد.
        </Alert>

        {hwclockDisplay ? (
          <Box component="pre" sx={codeBlockSx} style={ltrBlockStyle}>
            {hwclockDisplay}
          </Box>
        ) : null}

        <Stack direction={{ xs: "column", sm: "row" }} gap={1} flexWrap="wrap">
          <Button
            onClick={handleShowHwclock}
            disabled={isMutationPending}
            startIcon={<MdVisibility />}
            sx={outlinedButtonSx}
          >
            نمایش ساعت مادربرد
          </Button>
          <Button
            onClick={() => handleRequestHwclockSync("hctosys")}
            disabled={isMutationPending}
            startIcon={<MdSync />}
            sx={outlinedButtonSx}
          >
            خواندن زمان از مادربرد
          </Button>
          <Button
            onClick={() => handleRequestHwclockSync("systohc")}
            disabled={isMutationPending}
            startIcon={<MdSync />}
            sx={primaryButtonSx}
          >
            نوشتن زمان روی مادربرد
          </Button>
        </Stack>
      </SettingEditModal>

      <SystemSettingConfirmDialog
        open={Boolean(pendingAction)}
        title={pendingAction?.title ?? ""}
        description={pendingAction?.description ?? ""}
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
