import {
  Alert,
  Box,
  Button,
  Collapse,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { MdAdd, MdExpandLess, MdExpandMore, MdRemove } from 'react-icons/md';
import type { SnmpConfigPayload, SnmpInfoData } from '../../@types/snmp';
import { isCompleteIPv4Address } from '../../utils/ipAddress';
import BlurModal from '../BlurModal';
import IPv4AddressInput from '../common/IPv4AddressInput';
import ModalActionButtons from '../common/ModalActionButtons';

interface SnmpConfigModalProps {
  open: boolean;
  initialValues?: SnmpInfoData;
  onClose: () => void;
  onSubmit: (payload: SnmpConfigPayload) => void;
  isSubmitting: boolean;
  errorMessage: string | null;
}

const DEFAULT_CONTACT = 'support@storex.com';
const DEFAULT_LOCATION = 'Storex Server Room';
const DEFAULT_SYS_NAME = 'SohoServer';
const DEFAULT_PORT = '161';
const DEFAULT_BIND_IP = '0.0.0.0';

const SnmpConfigModal = ({
  open,
  initialValues,
  onClose,
  onSubmit,
  isSubmitting,
  errorMessage,
}: SnmpConfigModalProps) => {
  const [community, setCommunity] = useState('');
  const [allowedIps, setAllowedIps] = useState<string[]>(['0.0.0.0']);
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

    return ['0.0.0.0'];
  }, [initialValues?.allowed_ips]);

  useEffect(() => {
    if (open) {
      setCommunity(initialValues?.community ?? '');
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
    setAllowedIps((prev) => [...prev, '0.0.0.0']);
  };

  const removeAllowedIp = (index: number) => {
    setAllowedIps((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedCommunity = community.trim();
    const cleanedIps = allowedIps.map((ip) => ip.trim()).filter((ip) => ip !== '');

    if (!trimmedCommunity) {
      setLocalError('مقدار جامعه الزامی است.');
      return;
    }

    const invalidIp = cleanedIps.find((ip) => !isCompleteIPv4Address(ip));
    if (invalidIp) {
      setLocalError(`آی‌پی ${invalidIp} معتبر نیست.`);
      return;
    }

    setLocalError(null);

    onSubmit({
      community: trimmedCommunity,
      allowed_ips: cleanedIps,
      contact: contact.trim() || DEFAULT_CONTACT,
      location: location.trim() || DEFAULT_LOCATION,
      sys_name: sysName.trim() || DEFAULT_SYS_NAME,
      port: port.trim() || DEFAULT_PORT,
      bind_ip: bindIp.trim() || DEFAULT_BIND_IP,
    });
  };

  const isConfirmDisabled =
    isSubmitting || !community.trim() || allowedIps.some((ip) => !isCompleteIPv4Address(ip.trim()));

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
          <Alert severity="error">
            {localError ?? errorMessage}
          </Alert>
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
          <Stack direction="row" alignItems="center" justifyContent="space-between">
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
            {allowedIps.map((ip, index) => (
              <Stack key={`allowed-ip-${index}`} direction="row" spacing={1} alignItems="center">
                <IPv4AddressInput
                  label={`آی‌پی مجاز ${index + 1}`}
                  value={ip}
                  onChange={(value) => updateAllowedIp(index, value)}
                  required
                  helperText="مثال: 192.168.1.10"
                />
                {allowedIps.length > 1 ? (
                  <IconButton
                    aria-label="حذف آی‌پی"
                    onClick={() => removeAllowedIp(index)}
                    sx={{ mt: 3.5, color: 'var(--color-error)' }}
                  >
                    <MdRemove />
                  </IconButton>
                ) : null}
              </Stack>
            ))}
          </Stack>
        </Stack>

        <Divider />

        <Button
          onClick={() => setShowAdvanced((prev) => !prev)}
          endIcon={showAdvanced ? <MdExpandLess /> : <MdExpandMore />}
          variant="text"
          sx={{ alignSelf: 'flex-start', color: 'var(--color-primary)', fontWeight: 700 }}
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
                  endAdornment: <InputAdornment position="end">UDP</InputAdornment>,
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
