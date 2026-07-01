import {
  Alert,
  Box,
  Button,
  Collapse,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from 'react';
import { MdAdd, MdExpandLess, MdExpandMore, MdRemove } from 'react-icons/md';
import type { SnmpConfigPayload, SnmpInfoData } from '../../@types/snmp';
import { isCompleteIPv4Address } from '../../utils/ipAddress';
import BlurModal from '../BlurModal';
import IPv4AddressInput from '../common/IPv4AddressInput';
import ModalActionButtons from '../common/ModalActionButtons';
import { useServiceAction } from '../../hooks/useServiceAction';
import { toast } from 'react-hot-toast';

interface SnmpConfigModalProps {
  open: boolean;
  initialValues?: SnmpInfoData;
  onClose: () => void;
  onSubmit: (payload: SnmpConfigPayload) => void;
  isSubmitting: boolean;
  errorMessage: string | null;
}

const DEFAULT_COMMUNITY = 'public';
const DEFAULT_CONTACT = 'support@storex.com';
const DEFAULT_LOCATION = 'Storex Server Room';
const DEFAULT_SYS_NAME = 'SohoServer';
const DEFAULT_PORT = '161';
const DEFAULT_BIND_IP = '0.0.0.0';

const isValidIPv4Cidr = (value: string) => {
  const [ip, prefix, ...rest] = value.split('/');

  if (rest.length > 0 || prefix == null || prefix.trim() === '') {
    return false;
  }

  const prefixNumber = Number(prefix);
  return (
    isCompleteIPv4Address(ip.trim()) &&
    Number.isInteger(prefixNumber) &&
    prefixNumber >= 0 &&
    prefixNumber <= 32
  );
};

const isValidAllowedIp = (value: string) => {
  const normalized = value.trim();

  if (!normalized) {
    return false;
  }

  return isCompleteIPv4Address(normalized) || isValidIPv4Cidr(normalized);
};

const SnmpConfigModal = ({
  open,
  initialValues,
  onClose,
  onSubmit,
  isSubmitting,
  errorMessage,
}: SnmpConfigModalProps) => {
  const [community, setCommunity] = useState(DEFAULT_COMMUNITY);
  const [allowedIps, setAllowedIps] = useState<string[]>(['0.0.0.0/0']);
  const [contact, setContact] = useState(DEFAULT_CONTACT);
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [sysName, setSysName] = useState(DEFAULT_SYS_NAME);
  const [port, setPort] = useState(DEFAULT_PORT);
  const [bindIp, setBindIp] = useState(DEFAULT_BIND_IP);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const defaultAllowedIps = useMemo(() => {
    if (initialValues?.allowed_ips?.length) {
      return initialValues.allowed_ips;
    }

    return ['0.0.0.0/0'];
  }, [initialValues?.allowed_ips]);

  useEffect(() => {
    if (open) {
      setCommunity(initialValues?.community ?? DEFAULT_COMMUNITY);
      setAllowedIps(defaultAllowedIps);
      setContact(initialValues?.contact ?? DEFAULT_CONTACT);
      setLocation(initialValues?.location ?? DEFAULT_LOCATION);
      setSysName(initialValues?.sys_name ?? DEFAULT_SYS_NAME);
      setPort(initialValues?.port ?? DEFAULT_PORT);
      setBindIp(initialValues?.bind_ip ?? DEFAULT_BIND_IP);
      setShowAdvanced(false);
      setLocalError(null);
    }
  }, [
    defaultAllowedIps,
    initialValues?.bind_ip,
    initialValues?.community,
    initialValues?.contact,
    initialValues?.location,
    initialValues?.port,
    initialValues?.sys_name,
    open,
  ]);

  const updateAllowedIp = (index: number, value: string) => {
    setAllowedIps((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const addAllowedIp = () => {
    setAllowedIps((prev) => [...prev, '0.0.0.0/0']);
  };

  const removeAllowedIp = (index: number) => {
    setAllowedIps((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev
    );
  };

  const serviceAction = useServiceAction({
    onSuccess: () => {
      // toast.success(`سرویس ${service} با موفقیت راه‌اندازی مجدد شد.`);
    },
    onError: (message, { service }) => {
      toast.error(`راه‌اندازی مجدد ${service} با خطا مواجه شد: ${message}`);
    },
  });

  const handleRestartSNMP = useCallback(() => {
    serviceAction.mutate(
      { service: 'snmpd.service', action: 'restart' },
      {
        onSettled: () => {
          // noop
        },
      }
    );
  }, [serviceAction]);

  const cleanedAllowedIps = useMemo(
    () => allowedIps.map((ip) => ip.trim()).filter((ip) => ip !== ''),
    [allowedIps]
  );

  const invalidAllowedIp = useMemo(
    () => cleanedAllowedIps.find((ip) => !isValidAllowedIp(ip)) ?? null,
    [cleanedAllowedIps]
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedCommunity = community.trim();
    const trimmedBindIp = bindIp.trim() || DEFAULT_BIND_IP;

    if (!trimmedCommunity) {
      setLocalError('مقدار جامعه الزامی است.');
      return;
    }

    if (cleanedAllowedIps.length === 0) {
      setLocalError('حداقل یک آی‌پی مجاز وارد کنید.');
      return;
    }

    if (invalidAllowedIp) {
      setLocalError(`آی‌پی ${invalidAllowedIp} معتبر نیست.`);
      return;
    }

    if (!isCompleteIPv4Address(trimmedBindIp)) {
      setLocalError(`آی‌پی اتصال ${trimmedBindIp} معتبر نیست.`);
      return;
    }

    setLocalError(null);
    handleRestartSNMP();

    onSubmit({
      community: trimmedCommunity,
      allowed_ips: cleanedAllowedIps,
      contact: contact.trim() || DEFAULT_CONTACT,
      location: location.trim() || DEFAULT_LOCATION,
      sys_name: sysName.trim() || DEFAULT_SYS_NAME,
      port: port.trim() || DEFAULT_PORT,
      bind_ip: trimmedBindIp,
      save_to_db: true,
    });
  };

  const isConfirmDisabled =
    isSubmitting ||
    !community.trim() ||
    cleanedAllowedIps.length === 0 ||
    Boolean(invalidAllowedIp) ||
    !isCompleteIPv4Address(bindIp.trim() || DEFAULT_BIND_IP);

  return (
    <BlurModal
      open={open}
      onClose={onClose}
      title="تنظیمات SNMP"
      actions={
        <ModalActionButtons
          confirmLabel="ثبت تنظیمات"
          loadingLabel="در حال ارسال..."
          isLoading={isSubmitting}
          disabled={isConfirmDisabled}
          confirmProps={{ type: 'submit', form: 'snmp-config-form' }}
          onCancel={onClose}
        />
      }
    >
      <Box
        id="snmp-config-form"
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
      >
        <Typography sx={{ color: 'var(--color-secondary)' }}>
          مقادیر زیر را برای پیکربندی سرویس SNMP وارد کنید.
        </Typography>

        {localError || errorMessage ? (
          <Alert severity="error">{localError ?? errorMessage}</Alert>
        ) : null}

        <TextField
          label="جامعه"
          value={community}
          onChange={(event) => setCommunity(event.target.value)}
          required
          fullWidth
          size="small"
          InputLabelProps={{ sx: { color: 'var(--color-secondary)' } }}
          InputProps={{
            sx: {
              backgroundColor: 'var(--color-input-bg)',
              '& .MuiInputBase-input': { color: 'var(--color-text)' },
            },
          }}
        />

        <Stack spacing={2}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography sx={{ color: 'var(--color-primary)', fontWeight: 700 }}>
              آی‌پی‌های مجاز
            </Typography>
            <Button
              startIcon={<MdAdd />}
              onClick={addAllowedIp}
              variant="outlined"
              size="small"
              sx={{ borderRadius: 2 }}
            >
              افزودن آی‌پی
            </Button>
          </Stack>

          <Stack spacing={2}>
            {allowedIps.map((ip, index) => {
              const trimmedIp = ip.trim();
              const hasError = trimmedIp.length > 0 && !isValidAllowedIp(trimmedIp);

              return (
                <Stack
                  key={`allowed-ip-${index}`}
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  <TextField
                    label={`آی‌پی مجاز ${index + 1}`}
                    value={ip}
                    onChange={(event) => updateAllowedIp(index, event.target.value)}
                    required
                    fullWidth
                    size="small"
                    error={hasError}
                    helperText="مثال: 192.168.1.10 یا 192.168.1.0/24"
                    InputLabelProps={{ sx: { color: 'var(--color-secondary)' } }}
                    InputProps={{
                      sx: {
                        backgroundColor: 'var(--color-input-bg)',
                        '& .MuiInputBase-input': {
                          color: 'var(--color-text)',
                          direction: 'ltr',
                          textAlign: 'left',
                        },
                      },
                    }}
                  />
                  {allowedIps.length > 1 ? (
                    <IconButton
                      aria-label="حذف آی‌پی"
                      onClick={() => removeAllowedIp(index)}
                      sx={{ color: 'var(--color-error)' }}
                    >
                      <MdRemove />
                    </IconButton>
                  ) : null}
                </Stack>
              );
            })}
          </Stack>
        </Stack>

        <Divider />

        <Button
          onClick={() => setShowAdvanced((prev) => !prev)}
          endIcon={showAdvanced ? <MdExpandLess /> : <MdExpandMore />}
          variant="text"
          sx={{
            alignSelf: 'flex-start',
            color: 'var(--color-primary)',
            fontWeight: 700,
          }}
        >
          تنظیمات بیشتر
        </Button>

        <Collapse in={showAdvanced} unmountOnExit>
          <Stack spacing={2}>
            <TextField
              label="اطلاعات تماس"
              value={contact}
              onChange={(event) => setContact(event.target.value)}
              fullWidth
              size="small"
              InputLabelProps={{ sx: { color: 'var(--color-secondary)' } }}
              InputProps={{
                sx: {
                  backgroundColor: 'var(--color-input-bg)',
                  '& .MuiInputBase-input': { color: 'var(--color-text)' },
                },
              }}
            />

            <TextField
              label="مکان"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              fullWidth
              size="small"
              InputLabelProps={{ sx: { color: 'var(--color-secondary)' } }}
              InputProps={{
                sx: {
                  backgroundColor: 'var(--color-input-bg)',
                  '& .MuiInputBase-input': { color: 'var(--color-text)' },
                },
              }}
            />

            <TextField
              label="نام سیستم"
              value={sysName}
              onChange={(event) => setSysName(event.target.value)}
              fullWidth
              size="small"
              InputLabelProps={{ sx: { color: 'var(--color-secondary)' } }}
              InputProps={{
                sx: {
                  backgroundColor: 'var(--color-input-bg)',
                  '& .MuiInputBase-input': { color: 'var(--color-text)' },
                },
              }}
            />

            <Stack direction="row" spacing={2}>
              <TextField
                label="پورت"
                value={port}
                onChange={(event) => setPort(event.target.value)}
                fullWidth
                size="small"
                InputLabelProps={{ sx: { color: 'var(--color-secondary)' } }}
                InputProps={{
                  sx: {
                    backgroundColor: 'var(--color-input-bg)',
                    '& .MuiInputBase-input': { color: 'var(--color-text)' },
                  },
                }}
              />

              <IPv4AddressInput
                label="آی‌پی اتصال"
                value={bindIp}
                onChange={setBindIp}
                helperText="آدرس اتصال سرویس"
              />
            </Stack>
          </Stack>
        </Collapse>
      </Box>
    </BlurModal>
  );
};

export default SnmpConfigModal;
