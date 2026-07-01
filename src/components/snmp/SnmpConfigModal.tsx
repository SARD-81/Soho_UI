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
import { type FormEvent, useEffect, useMemo, useState } from 'react';
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

const normalizeString = (value: unknown, fallback = '') =>
  String(value ?? fallback).trim();

const normalizeAllowedIps = (allowedIps?: string[]) => {
  const normalizedIps = (allowedIps ?? [])
    .map((ip) => String(ip).trim())
    .filter((ip) => ip.length > 0);

  return normalizedIps.length > 0 ? normalizedIps : ['0.0.0.0'];
};

const isValidPlainIPv4 = (value: string) => {
  const normalized = value.trim();

  if (!normalized || normalized.includes('/')) {
    return false;
  }

  return isCompleteIPv4Address(normalized);
};

const areStringArraysEqual = (left: string[], right: string[]) => {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
};

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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const initialSnapshot = useMemo(
    () => ({
      community: normalizeString(initialValues?.community),
      allowedIps: normalizeAllowedIps(initialValues?.allowed_ips),
      contact: normalizeString(initialValues?.contact, DEFAULT_CONTACT),
      location: normalizeString(initialValues?.location, DEFAULT_LOCATION),
      sysName: normalizeString(initialValues?.sys_name, DEFAULT_SYS_NAME),
      port: normalizeString(initialValues?.port, DEFAULT_PORT),
      bindIp: normalizeString(initialValues?.bind_ip, DEFAULT_BIND_IP),
    }),
    [
      initialValues?.allowed_ips,
      initialValues?.bind_ip,
      initialValues?.community,
      initialValues?.contact,
      initialValues?.location,
      initialValues?.port,
      initialValues?.sys_name,
    ]
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    setCommunity(initialSnapshot.community);
    setAllowedIps(initialSnapshot.allowedIps);
    setContact(initialSnapshot.contact);
    setLocation(initialSnapshot.location);
    setSysName(initialSnapshot.sysName);
    setPort(initialSnapshot.port);
    setShowAdvanced(false);
    setLocalError(null);
  }, [initialSnapshot, open]);

  const cleanedAllowedIps = useMemo(
    () => allowedIps.map((ip) => ip.trim()).filter((ip) => ip !== ''),
    [allowedIps]
  );

  const invalidAllowedIp = useMemo(
    () => cleanedAllowedIps.find((ip) => !isValidPlainIPv4(ip)) ?? null,
    [cleanedAllowedIps]
  );

  const hasChanges = useMemo(() => {
    return (
      community.trim() !== initialSnapshot.community ||
      !areStringArraysEqual(cleanedAllowedIps, initialSnapshot.allowedIps) ||
      contact.trim() !== initialSnapshot.contact ||
      location.trim() !== initialSnapshot.location ||
      sysName.trim() !== initialSnapshot.sysName ||
      port.trim() !== initialSnapshot.port
    );
  }, [
    cleanedAllowedIps,
    community,
    contact,
    initialSnapshot,
    location,
    port,
    sysName,
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
    setAllowedIps((prev) =>
      prev.length > 1
        ? prev.filter((_, currentIndex) => currentIndex !== index)
        : prev
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedCommunity = community.trim();
    const trimmedContact = contact.trim() || DEFAULT_CONTACT;
    const trimmedLocation = location.trim() || DEFAULT_LOCATION;
    const trimmedSysName = sysName.trim() || DEFAULT_SYS_NAME;
    const trimmedPort = port.trim() || DEFAULT_PORT;

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

    setLocalError(null);

    onSubmit({
      community: trimmedCommunity,
      allowed_ips: cleanedAllowedIps,
      contact: trimmedContact,
      location: trimmedLocation,
      sys_name: trimmedSysName,
      port: trimmedPort,
      bind_ip: initialSnapshot.bindIp || DEFAULT_BIND_IP,
      save_to_db: true,
    });
  };

  const isConfirmDisabled =
    isSubmitting ||
    !hasChanges ||
    !community.trim() ||
    cleanedAllowedIps.length === 0 ||
    Boolean(invalidAllowedIp);

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
              const hasError =
                trimmedIp.length > 0 && !isValidPlainIPv4(trimmedIp);

              return (
                <Stack
                  key={`allowed-ip-${index}`}
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  <IPv4AddressInput
                    label={`آی‌پی مجاز ${index + 1}`}
                    value={ip}
                    onChange={(value) => updateAllowedIp(index, value)}
                    required
                    error={hasError}
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
                  '& .MuiInputBase-input': {
                    color: 'var(--color-text)',
                    direction: 'ltr',
                    textAlign: 'left',
                  },
                },
              }}
            />
          </Stack>
        </Collapse>
      </Box>
    </BlurModal>
  );
};

export default SnmpConfigModal;