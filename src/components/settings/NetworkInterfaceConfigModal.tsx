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
          gateway?: string;
          dns?: string[];
        }
  ) => void;
  isSubmitting: boolean;
  errorMessage: string | null;
}

const DEFAULT_IP = '0.0.0.0';
const DEFAULT_NETMASK = '255.255.255.0';

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

  const initialStaticIp = initialIp.trim() || DEFAULT_IP;
  const initialStaticNetmask = initialNetmask.trim() || DEFAULT_NETMASK;

  const [mode, setMode] = useState<ConfigureInterfaceMode>(defaultMode);
  const [ip, setIp] = useState(initialStaticIp);
  const [netmask, setNetmask] = useState(initialStaticNetmask);
  const [gateway, setGateway] = useState('');
  const [primaryDns, setPrimaryDns] = useState('');
  const [secondaryDns, setSecondaryDns] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setMode(defaultMode);
    setIp(initialStaticIp);
    setNetmask(initialStaticNetmask);
    setGateway('');
    setPrimaryDns('');
    setSecondaryDns('');
    setLocalError(null);
  }, [defaultMode, initialStaticIp, initialStaticNetmask, open]);

  const handleRequiredIpChange = (
    value: string,
    setter: (nextValue: string) => void
  ) => {
    if (value.trim() === '') {
      return;
    }

    setter(value);
    setLocalError(null);
  };

  const validateStaticForm = () => {
    if (!ip.trim() || !isCompleteIPv4Address(ip.trim())) {
      return 'آدرس IP الزامی است و باید یک IPv4 معتبر باشد.';
    }

    if (!netmask.trim() || !isCompleteIPv4Address(netmask.trim())) {
      return 'ماسک شبکه الزامی است و باید یک IPv4 معتبر باشد.';
    }

    if (gateway.trim() && !isCompleteIPv4Address(gateway.trim())) {
      return 'Default Gateway واردشده معتبر نیست.';
    }

    if (primaryDns.trim() && !isCompleteIPv4Address(primaryDns.trim())) {
      return 'DNS اصلی واردشده معتبر نیست.';
    }

    if (secondaryDns.trim() && !isCompleteIPv4Address(secondaryDns.trim())) {
      return 'DNS ثانویه واردشده معتبر نیست.';
    }

    return null;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!interfaceName) {
      setLocalError('رابط شبکه مشخص نشده است.');
      return;
    }

    if (mode === 'dhcp') {
      setLocalError(null);
      onSubmit({ mode: 'dhcp' });
      return;
    }

    const validationError = validateStaticForm();
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    const dns = [primaryDns.trim(), secondaryDns.trim()].filter(Boolean);
    const trimmedGateway = gateway.trim();

    setLocalError(null);
    onSubmit({
      mode: 'static',
      ip: ip.trim(),
      netmask: netmask.trim(),
      ...(trimmedGateway ? { gateway: trimmedGateway } : {}),
      ...(dns.length > 0 ? { dns } : {}),
    });
  };

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
          onCancel={onClose}
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
          <InputLabel
            id="network-mode-label"
            sx={{ color: 'var(--color-secondary)' }}
          >
            حالت پیکربندی
          </InputLabel>
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

        {mode === 'static' ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <IPv4AddressInput
              label="آدرس IP"
              value={ip}
              onChange={(value) => handleRequiredIpChange(value, setIp)}
              required
              error={!isCompleteIPv4Address(ip.trim())}
            />

            <IPv4AddressInput
              label="ماسک شبکه"
              value={netmask}
              onChange={(value) => handleRequiredIpChange(value, setNetmask)}
              required
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
            />

            <Typography
              sx={{ color: 'var(--color-secondary)', fontWeight: 600 }}
            >
              تنظیمات DNS
            </Typography>

            <IPv4AddressInput
              label="DNS اصلی"
              value={primaryDns}
              onChange={(value) => {
                setPrimaryDns(value);
                setLocalError(null);
              }}
              error={
                primaryDns.trim() !== '' &&
                !isCompleteIPv4Address(primaryDns.trim())
              }
            />

            <IPv4AddressInput
              label="DNS ثانویه"
              value={secondaryDns}
              onChange={(value) => {
                setSecondaryDns(value);
                setLocalError(null);
              }}
              error={
                secondaryDns.trim() !== '' &&
                !isCompleteIPv4Address(secondaryDns.trim())
              }
            />
          </Box>
        ) : null}

        {localError || errorMessage ? (
          <Alert severity="error" sx={{ mt: 1 }}>
            {localError ?? errorMessage}
          </Alert>
        ) : null}
      </Box>
    </BlurModal>
  );
};

export default NetworkInterfaceConfigModal;
