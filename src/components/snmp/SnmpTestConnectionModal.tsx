import {
  Alert,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  type SelectChangeEvent,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import type { SnmpInfoData, SnmpTestConnectionPayload } from '../../@types/snmp';
import { isCompleteIPv4Address } from '../../utils/ipAddress';
import BlurModal from '../BlurModal';
import ModalActionButtons from '../common/ModalActionButtons';

interface SnmpTestConnectionModalProps {
  open: boolean;
  snmpInfo?: SnmpInfoData;
  onClose: () => void;
  onSubmit: (payload: SnmpTestConnectionPayload) => void;
  isSubmitting: boolean;
  errorMessage: string | null;
}

const DEFAULT_PORT = '161';

const disabledTextFieldSx = {
  '& .MuiInputBase-input.Mui-disabled': {
    WebkitTextFillColor: 'var(--color-text)',
    color: 'var(--color-text)',
    opacity: 1,
  },
  '& .MuiInputBase-root.Mui-disabled': {
    backgroundColor: 'rgba(148, 163, 184, 0.08)',
  },
};

const SnmpTestConnectionModal = ({
  open,
  snmpInfo,
  onClose,
  onSubmit,
  isSubmitting,
  errorMessage,
}: SnmpTestConnectionModalProps) => {
  const [selectedHost, setSelectedHost] = useState('');

  const community = String(snmpInfo?.community ?? '');
  const port = String(snmpInfo?.port ?? DEFAULT_PORT);
  const testableHosts = useMemo(
    () =>
      (snmpInfo?.allowed_ips ?? [])
        .map((ip) => String(ip).trim())
        .filter((ip) => ip.length > 0 && !ip.includes('/') && isCompleteIPv4Address(ip)),
    [snmpInfo?.allowed_ips]
  );

  useEffect(() => {
    if (open) {
      setSelectedHost(testableHosts[0] ?? '');
    }
  }, [open, testableHosts]);

  const handleHostChange = (event: SelectChangeEvent) => {
    setSelectedHost(event.target.value);
  };

  const handleSubmit = () => {
    if (!community || !selectedHost || !port) {
      return;
    }

    onSubmit({
      community,
      host: selectedHost,
      port,
    });
  };

  const isDisabled = isSubmitting || !community || !selectedHost || !port;

  return (
    <BlurModal
      open={open}
      onClose={onClose}
      title="تست اتصال SNMP"
      maxWidth="520px"
      actions={
        <ModalActionButtons
          onCancel={onClose}
          onConfirm={handleSubmit}
          confirmLabel="تست اتصال"
          loadingLabel="در حال تست..."
          disabled={isDisabled}
          isLoading={isSubmitting}
        />
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography sx={{ color: 'var(--color-secondary)' }}>
          یکی از آی‌پی‌های مجاز را انتخاب کنید تا اتصال سرویس تست شود.
        </Typography>

        {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

        <Stack spacing={2}>
          <TextField
            label="community"
            value={community}
            disabled
            fullWidth
            size="small"
            sx={disabledTextFieldSx}
          />

          <FormControl
            fullWidth
            size="small"
            disabled={testableHosts.length === 0}
            sx={{
              '& .MuiInputLabel-root': { color: 'var(--color-secondary)' },
              '& .MuiSelect-select': {
                color: 'var(--color-text)',
                direction: 'ltr',
                textAlign: 'left',
                fontWeight: 700,
              },
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'var(--color-input-bg)',
              },
            }}
          >
            <InputLabel id="snmp-test-host-label">آی‌پی قابل تست</InputLabel>
            <Select
              labelId="snmp-test-host-label"
              label="آی‌پی قابل تست"
              value={selectedHost}
              onChange={handleHostChange}
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: 'var(--color-input-bg)',
                    color: 'var(--color-text)',
                    border: '1px solid rgba(0,198,169,0.22)',
                    '& .MuiMenuItem-root': {
                      direction: 'ltr',
                      justifyContent: 'flex-start',
                      color: 'var(--color-text)',
                      fontWeight: 700,
                    },
                    '& .MuiMenuItem-root.Mui-selected': {
                      backgroundColor: 'rgba(0,198,169,0.18)',
                      color: 'var(--color-text)',
                    },
                    '& .MuiMenuItem-root:hover': {
                      backgroundColor: 'rgba(0,198,169,0.12)',
                    },
                  },
                },
              }}
            >
              {testableHosts.map((host) => (
                <MenuItem key={host} value={host}>
                  {host}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="port"
            value={port}
            disabled
            fullWidth
            size="small"
            sx={disabledTextFieldSx}
          />
        </Stack>

        {testableHosts.length === 0 ? (
          <Alert severity="warning">
            هیچ آی‌پی قابل تستی در allowed_ips وجود ندارد. فقط آی‌پی کامل قابل تست است.
          </Alert>
        ) : null}
      </Box>
    </BlurModal>
  );
};

export default SnmpTestConnectionModal;
