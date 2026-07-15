import {
  Alert,
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { MdAdd, MdDeleteOutline, MdWarningAmber } from 'react-icons/md';
import type {
  ConfigureInterfaceMode,
  NetworkInterfaceConfiguration,
} from '../../@types/network';
import { isCompleteIPv4Address } from '../../utils/ipAddress';
import BlurModal from '../BlurModal';
import IPv4AddressInput from '../common/IPv4AddressInput';
import ModalActionButtons from '../common/ModalActionButtons';

interface NetworkInterfaceConfigModalProps {
  open: boolean;
  interfaceName: string | null;
  initialConfiguration?: NetworkInterfaceConfiguration | null;
  onClose: () => void;
  onSubmit: (
    payload:
      | { mode: 'dhcp'; mtu?: number }
      | {
          mode: 'static';
          ip: string;
          netmask: string;
          gateway?: string;
          dns?: string[];
          mtu?: number;
        }
  ) => void;
  isSubmitting: boolean;
  errorMessage: string | null;
}

const DEFAULT_IP = '0.0.0.0';
const DEFAULT_NETMASK = '255.255.255.0';
const DEFAULT_MTU = 1500;
const EMPTY_DNS_ENTRY = '';

type PendingNetworkPayload =
  | { mode: 'dhcp'; mtu?: number }
  | {
      mode: 'static';
      ip: string;
      netmask: string;
      gateway?: string;
      dns?: string[];
      mtu?: number;
    };

const NetworkInterfaceConfigModal = ({
  open,
  interfaceName,
  initialConfiguration,
  onClose,
  onSubmit,
  isSubmitting,
  errorMessage,
}: NetworkInterfaceConfigModalProps) => {
  const initialMode = initialConfiguration?.configMode ?? 'dhcp';
  const initialStaticIp = initialConfiguration?.ip?.trim() || DEFAULT_IP;
  const initialStaticNetmask =
    initialConfiguration?.netmask?.trim() || DEFAULT_NETMASK;
  const initialGateway = initialConfiguration?.gateways?.[0]?.trim() ?? '';
  const initialMtu = String(initialConfiguration?.mtu ?? DEFAULT_MTU);
  const initialDns = useMemo(() => {
    const values = (initialConfiguration?.dns ?? [])
      .map((entry) => entry.trim())
      .filter(Boolean);
    return values.length > 0 ? values : [EMPTY_DNS_ENTRY];
  }, [initialConfiguration?.dns]);

  const [mode, setMode] = useState<ConfigureInterfaceMode>(initialMode);
  const [ip, setIp] = useState(initialStaticIp);
  const [netmask, setNetmask] = useState(initialStaticNetmask);
  const [gateway, setGateway] = useState(initialGateway);
  const [mtu, setMtu] = useState(initialMtu);
  const [dnsEntries, setDnsEntries] = useState<string[]>(initialDns);
  const [localError, setLocalError] = useState<string | null>(null);
  const [pendingPayload, setPendingPayload] =
    useState<PendingNetworkPayload | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setMode(initialMode);
    setIp(initialStaticIp);
    setNetmask(initialStaticNetmask);
    setGateway(initialGateway);
    setMtu(initialMtu);
    setDnsEntries(initialDns);
    setLocalError(null);
    setPendingPayload(null);
  }, [
    initialDns,
    initialGateway,
    initialMode,
    initialMtu,
    initialStaticIp,
    initialStaticNetmask,
    open,
  ]);

  const updateDnsEntry = (index: number, value: string) => {
    setDnsEntries((previous) =>
      previous.map((entry, currentIndex) =>
        currentIndex === index ? value : entry
      )
    );
    setLocalError(null);
  };

  const addDnsEntry = () => {
    setDnsEntries((previous) => [...previous, EMPTY_DNS_ENTRY]);
  };

  const removeDnsEntry = (index: number) => {
    setDnsEntries((previous) => {
      const next = previous.filter((_, currentIndex) => currentIndex !== index);
      return next.length > 0 ? next : [EMPTY_DNS_ENTRY];
    });
    setLocalError(null);
  };

  const validateMtu = () => {
    const numericMtu = Number(mtu);
    return Number.isInteger(numericMtu) && numericMtu > 0
      ? null
      : 'مقدار MTU باید یک عدد صحیح مثبت باشد.';
  };

  const validateStaticForm = () => {
    const mtuError = validateMtu();
    if (mtuError) {
      return mtuError;
    }

    if (!ip.trim() || !isCompleteIPv4Address(ip.trim())) {
      return 'آدرس IP الزامی است و باید یک IPv4 معتبر باشد.';
    }

    if (!netmask.trim() || !isCompleteIPv4Address(netmask.trim())) {
      return 'ماسک شبکه الزامی است و باید یک IPv4 معتبر باشد.';
    }

    if (gateway.trim() && !isCompleteIPv4Address(gateway.trim())) {
      return 'Default Gateway واردشده معتبر نیست.';
    }

    const invalidDns = dnsEntries
      .map((entry) => entry.trim())
      .filter(Boolean)
      .find((entry) => !isCompleteIPv4Address(entry));

    if (invalidDns) {
      return `آدرس DNS ${invalidDns} معتبر نیست.`;
    }

    return null;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!interfaceName) {
      setLocalError('رابط شبکه مشخص نشده است.');
      return;
    }

    const mtuError = validateMtu();
    if (mtuError) {
      setLocalError(mtuError);
      return;
    }

    const numericMtu = Number(mtu);

    if (mode === 'dhcp') {
      setLocalError(null);
      setPendingPayload({ mode: 'dhcp', mtu: numericMtu });
      return;
    }

    const validationError = validateStaticForm();
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    const dns = dnsEntries.map((entry) => entry.trim()).filter(Boolean);
    const trimmedGateway = gateway.trim();

    setLocalError(null);
    setPendingPayload({
      mode: 'static',
      ip: ip.trim(),
      netmask: netmask.trim(),
      ...(trimmedGateway ? { gateway: trimmedGateway } : {}),
      ...(dns.length > 0 ? { dns } : {}),
      mtu: numericMtu,
    });
  };

  const handleConfirmSubmit = () => {
    if (!pendingPayload || isSubmitting) {
      return;
    }

    onSubmit(pendingPayload);
    setPendingPayload(null);
  };

  const closeAll = () => {
    setPendingPayload(null);
    onClose();
  };

  return (
    <>
      <BlurModal
        open={open}
        onClose={closeAll}
        title="پیکربندی رابط شبکه"
        actions={
          <ModalActionButtons
            confirmLabel="ثبت تنظیمات"
            loadingLabel="در حال ارسال..."
            isLoading={isSubmitting}
            disabled={isSubmitting || !interfaceName}
            disableConfirmGradient
            confirmProps={{
              type: 'submit',
              form: 'network-interface-config-form',
              sx: {
                px: 3,
                py: 1,
                fontWeight: 600,
                background:
                  'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',
                color: 'var(--color-bg)',
                '&:hover': {
                  background:
                    'linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary) 100%)',
                },
              },
            }}
            onCancel={closeAll}
          />
        }
      >
        <Box
          component="form"
          id="network-interface-config-form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
        >
          <TextField
            label="رابط شبکه"
            value={interfaceName ?? ''}
            disabled
            fullWidth
            size="small"
          />

          <FormControl fullWidth>
            <InputLabel id="network-mode-label">حالت پیکربندی</InputLabel>
            <Select
              labelId="network-mode-label"
              value={mode}
              label="حالت پیکربندی"
              onChange={(event) => {
                setMode(event.target.value as ConfigureInterfaceMode);
                setLocalError(null);
              }}
              size="small"
              sx={{
                backgroundColor: 'var(--color-input-bg)',
                '& .MuiSelect-select': { color: 'var(--color-text)' },
              }}
            >
              <MenuItem value="dhcp" sx={{ color: 'var(--color-text)' }}>DHCP</MenuItem>
              <MenuItem value="static" sx={{ color: 'var(--color-text)' }}>Static</MenuItem>
            </Select>
          </FormControl>

          {/* <TextField
            label="MTU"
            value={mtu}
            onChange={(event) => {
              setMtu(event.target.value.replace(/[^0-9]/g, ''));
              setLocalError(null);
            }}
            inputProps={{ inputMode: 'numeric' }}
            error={Boolean(validateMtu())}
            helperText="مقدار فعلی دریافت‌شده از API"
            fullWidth
            size="small"
            sx={{
                '& .MuiOutlinedInput-input': {
                  color: 'var(--color-text)',
                },
              }}
          /> */}

          {mode === 'dhcp' ? (
            <Alert severity="info">
              این رابط بر اساس مقدار config_mode در حالت DHCP قرار دارد. با ثبت
              تنظیمات، دریافت آدرس شبکه به‌صورت خودکار انجام می‌شود.
            </Alert>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
              <IPv4AddressInput
                label="آدرس IP"
                value={ip}
                onChange={(value) => {
                  setIp(value);
                  setLocalError(null);
                }}
                required
                preventEmpty
                error={!isCompleteIPv4Address(ip.trim())}
              />

              <IPv4AddressInput
                label="ماسک شبکه"
                value={netmask}
                onChange={(value) => {
                  setNetmask(value);
                  setLocalError(null);
                }}
                required
                preventEmpty
                error={!isCompleteIPv4Address(netmask.trim())}
              />

              <IPv4AddressInput
                label="Default Gateway"
                value={gateway}
                onChange={(value) => {
                  setGateway(value);
                  setLocalError(null);
                }}
                error={
                  gateway.trim() !== '' &&
                  !isCompleteIPv4Address(gateway.trim())
                }
                helperText="اختیاری"
              />

              <Stack spacing={1.25}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography
                    sx={{ color: 'var(--color-secondary)', fontWeight: 700 }}
                  >
                    سرورهای DNS
                  </Typography>
                  <Button
                    type="button"
                    size="small"
                    variant="outlined"
                    startIcon={<MdAdd />}
                    onClick={addDnsEntry}
                  >
                    افزودن DNS
                  </Button>
                </Stack>

                {dnsEntries.map((dnsEntry, index) => (
                  <Stack
                    key={`dns-${index}`}
                    direction="row"
                    spacing={1}
                    alignItems="center"
                  >
                    <Box sx={{ flex: 1 }}>
                      <IPv4AddressInput
                        label={index === 0 ? 'DNS اصلی' : `DNS ثانویه ${index}`}
                        value={dnsEntry}
                        onChange={(value) => updateDnsEntry(index, value)}
                        error={
                          dnsEntry.trim() !== '' &&
                          !isCompleteIPv4Address(dnsEntry.trim())
                        }
                        helperText="اختیاری"
                      />
                    </Box>
                    <IconButton
                      type="button"
                      aria-label={`حذف DNS ${index + 1}`}
                      onClick={() => removeDnsEntry(index)}
                      sx={{ color: 'var(--color-error)', mt: 3.5 }}
                    >
                      <MdDeleteOutline />
                    </IconButton>
                  </Stack>
                ))}
              </Stack>
            </Box>
          )}

          {localError || errorMessage ? (
            <Alert severity="error" sx={{ mt: 1 }}>
              {localError ?? errorMessage}
            </Alert>
          ) : null}
        </Box>
      </BlurModal>

      <BlurModal
        open={Boolean(pendingPayload)}
        onClose={() => setPendingPayload(null)}
        title="تأیید تغییر تنظیمات شبکه"
        maxWidth="520px"
        actions={
          <ModalActionButtons
            onCancel={() => setPendingPayload(null)}
            onConfirm={handleConfirmSubmit}
            confirmLabel="بله، اعمال شود"
            cancelLabel="بازگشت"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          />
        }
      >
        <Alert
          severity="warning"
          icon={<MdWarningAmber size={24} />}
          sx={{ mb: 2 }}
        >
          تغییر پیکربندی شبکه ممکن است باعث تغییر آدرس IP سامانه و قطع ارتباط
          فعلی شما شود.
        </Alert>
        <Typography sx={{ color: 'var(--color-text)', lineHeight: 2 }}>
          پس از اعمال تنظیمات ممکن است دیگر از طریق آدرس فعلی به این صفحه دسترسی
          نداشته باشید. قبل از ادامه مطمئن شوید اطلاعات شبکه جدید را در اختیار
          دارید. در صورت از دست رفتن دسترسی، با پشتیبانی یا مدیر شبکه تماس بگیرید.
        </Typography>
      </BlurModal>
    </>
  );
};

export default NetworkInterfaceConfigModal;
