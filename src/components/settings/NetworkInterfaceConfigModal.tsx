import {
  Alert,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { type FormEvent, useEffect, useMemo, useState } from 'react';
import type { ConfigureInterfaceMode } from '../../@types/network';
import { isCompleteIPv4Address } from '../../utils/ipAddress';
import BlurModal from '../BlurModal';
import IPv4AddressInput from '../common/IPv4AddressInput';
import ModalActionButtons from '../common/ModalActionButtons';

interface NetworkInterfaceConfigModalProps {
  open: boolean;
  interfaceName: string | null;
  initialIp?: string;
  initialNetmask?: string;
  onClose: () => void;
  onSubmit: (
    payload:
      | { mode: 'dhcp' }
      | {
          mode: 'static';
          ip: string;
          netmask: string;
          gateway: string;
          dns: string[];
        }
  ) => void;
  isSubmitting: boolean;
  errorMessage: string | null;
}

const NetworkInterfaceConfigModal = ({
  open,
  interfaceName,
  initialIp = '',
  initialNetmask = '',
  onClose,
  onSubmit,
  isSubmitting,
  errorMessage,
}: NetworkInterfaceConfigModalProps) => {
  const defaultMode = useMemo<ConfigureInterfaceMode>(
    () => (initialIp ? 'static' : 'dhcp'),
    [initialIp]
  );

  const [mode, setMode] = useState<ConfigureInterfaceMode>(defaultMode);
  const [ip, setIp] = useState(initialIp);
  const [netmask, setNetmask] = useState(initialNetmask);
  const [gateway, setGateway] = useState('');
  const [primaryDns, setPrimaryDns] = useState('');
  const [secondaryDns, setSecondaryDns] = useState('');

  useEffect(() => {
    if (open) {
      setMode(defaultMode);
      setIp(initialIp);
      setNetmask(initialNetmask);
      setGateway('');
      setPrimaryDns('');
      setSecondaryDns('');
    }
  }, [defaultMode, initialIp, initialNetmask, open]);

  const isStaticMode = mode === 'static';

  const isStaticFormValid =
    isCompleteIPv4Address(ip) &&
    isCompleteIPv4Address(netmask) &&
    isCompleteIPv4Address(gateway) &&
    isCompleteIPv4Address(primaryDns) &&
    (secondaryDns === '' || isCompleteIPv4Address(secondaryDns));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!interfaceName) {
      return;
    }

    if (mode === 'dhcp') {
      onSubmit({ mode: 'dhcp' });
      return;
    }

    if (!isStaticFormValid) {
      return;
    }

    const trimmedDns = [primaryDns.trim(), secondaryDns.trim()].filter(
      (value) => value !== ''
    );

    onSubmit({
      mode: 'static',
      ip: ip.trim(),
      netmask: netmask.trim(),
      gateway: gateway.trim(),
      dns: trimmedDns,
    });
  };

  const isConfirmDisabled =
    isSubmitting ||
    !interfaceName ||
    (isStaticMode ? !isStaticFormValid : false);

  return (
    <BlurModal
      open={open}
      onClose={onClose}
      title="پیکربندی رابط شبکه"
      actions={
        <ModalActionButtons
          confirmLabel="ثبت تنظیمات"
          loadingLabel="در حال ارسال..."
          isLoading={isSubmitting}
          disabled={isConfirmDisabled}
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
              '&.Mui-disabled': {
                backgroundColor: 'color-mix(in srgb, var(--color-secondary) 25%, transparent)',
                color: 'var(--color-secondary)',
              },
            },
          }}
        />
      }
    >
      <Box
        component="form"
        id="network-interface-config-form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
      >
        {/* <Typography sx={{ color: 'var(--color-secondary)' }}>
          حالت پیکربندی رابط شبکه را انتخاب کرده و مقادیر مورد نیاز را وارد کنید.
        </Typography> */}

        <TextField
          label="رابط شبکه"
          value={interfaceName ?? ''}
          disabled
          fullWidth
          size="small"
          InputLabelProps={{ sx: { color: 'var(--color-secondary)' } }}
          InputProps={{
            sx: {
              backgroundColor: 'var(--color-input-bg)',
              borderRadius: '5px',
              '& .MuiInputBase-input': { color: 'var(--color-secondary)' },
            },
          }}
        />

        <FormControl fullWidth>
          <InputLabel id="network-mode-label" sx={{ color: 'var(--color-secondary)' }}>
            حالت پیکربندی
          </InputLabel>
          <Select
            labelId="network-mode-label"
            value={mode}
            label="حالت پیکربندی"
            onChange={(event) => setMode(event.target.value as ConfigureInterfaceMode)}
            size="small"
            sx={{
              backgroundColor: 'var(--color-input-bg)',
              '& .MuiSelect-select': { color: 'var(--color-text)' },
            }}
            MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: 'var(--color-card-bg)',
                    color: 'var(--color-text)',
                  },
                },
              }}
          >
            <MenuItem value="dhcp">DHCP</MenuItem>
            <MenuItem value="static">Static</MenuItem>
          </Select>
        </FormControl>

        {isStaticMode ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <IPv4AddressInput
              label="آدرس IP"
              value={ip}
              onChange={setIp}
              required
            //   helperText="آدرس IPv4 را به‌صورت چهار بخش عددی وارد کنید."
              error={ip !== '' && !isCompleteIPv4Address(ip)}
            />
            <IPv4AddressInput
              label="ماسک شبکه"
              value={netmask}
              onChange={setNetmask}
              required
            //   helperText="ماسک شبکه را مشابه کنترل‌های IPv4 در ویندوز وارد کنید."
              error={netmask !== '' && !isCompleteIPv4Address(netmask)}
            />
            <IPv4AddressInput
              label=" Default Gateway"
              value={gateway}
              onChange={setGateway}
              required
            //   helperText="آدرس دروازه پیش‌فرض را وارد کنید."
              error={gateway !== '' && !isCompleteIPv4Address(gateway)}
            />
            <Typography sx={{ color: 'var(--color-secondary)', fontWeight: 600 }}>
              تنظیمات DNS
            </Typography>
            <IPv4AddressInput
              label="DNS اصلی"
              value={primaryDns}
              onChange={setPrimaryDns}
              required
            //   helperText="DNS اصلی را به‌صورت چهار بخش عددی مشخص کنید."
              error={primaryDns !== '' && !isCompleteIPv4Address(primaryDns)}
            />
            <IPv4AddressInput
              label="DNS ثانویه"
              value={secondaryDns}
              onChange={setSecondaryDns}
            //   helperText="(اختیاری) DNS ثانویه را وارد کنید."
              error={secondaryDns !== '' && !isCompleteIPv4Address(secondaryDns)}
            />
          </Box>
        ) : null}

        {errorMessage ? (
          <Alert severity="error" sx={{ mt: 1 }}>
            {errorMessage}
          </Alert>
        ) : null}
      </Box>
    </BlurModal>
  );
};

export default NetworkInterfaceConfigModal;