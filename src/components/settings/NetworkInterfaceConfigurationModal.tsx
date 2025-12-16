import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputLabel,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ConfigureNetworkPayload, NetworkMode } from '../../@types/network';

interface NetworkInterfaceConfigurationModalProps {
  open: boolean;
  interfaceName: string | null;
  initialIp?: string;
  initialNetmask?: string;
  initialGateway?: string;
  initialDns?: string[];
  initialMtu?: number;
  onClose: () => void;
  onSubmit: (payload: ConfigureNetworkPayload) => void;
  isSubmitting: boolean;
  errorMessage: string | null;
}

const STATIC_DEFAULT_MTU = 1500;
const DHCP_DEFAULT_MTU = 1400;
const MIN_MTU = 576;
const MAX_MTU = 9000;

const isValidIPv4 = (value: string): boolean => {
  const ipv4Regex = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;
  return ipv4Regex.test(value.trim());
};

const normalizeDns = (values: string[]) =>
  values
    .map((item) => item.trim())
    .filter((item, index, arr) => item && arr.indexOf(item) === index);

const buildRequestBody = (
  mode: NetworkMode,
  mtu: number,
  {
    ip,
    netmask,
    gateway,
    dns,
  }: { ip?: string; netmask?: string; gateway?: string; dns?: string[] }
) => {
  if (mode === 'static') {
    const trimmedGateway = gateway?.trim();
    const normalizedDns = normalizeDns(dns ?? []);

    return {
      mode,
      ip: ip?.trim() ?? '',
      netmask: netmask?.trim() ?? '',
      ...(trimmedGateway ? { gateway: trimmedGateway } : {}),
      ...(normalizedDns.length ? { dns: normalizedDns } : {}),
      mtu,
    };
  }

  return { mode, mtu };
};

const hasStaticFieldErrors = ({
  ip,
  netmask,
  gateway,
  dns,
}: {
  ip: string;
  netmask: string;
  gateway: string;
  dns: string[];
}) => {
  const dnsErrors = normalizeDns(dns).filter((entry) => !isValidIPv4(entry));
  const ipError = ip !== '' && !isValidIPv4(ip);
  const netmaskError = netmask !== '' && !isValidIPv4(netmask);
  const gatewayError = gateway !== '' && !isValidIPv4(gateway);

  return ipError || netmaskError || gatewayError || dnsErrors.length > 0;
};

const NetworkInterfaceConfigurationModal = ({
  open,
  interfaceName,
  initialIp = '',
  initialNetmask = '',
  initialGateway = '',
  initialDns = [],
  initialMtu,
  onClose,
  onSubmit,
  isSubmitting,
  errorMessage,
}: NetworkInterfaceConfigurationModalProps) => {
  const [mode, setMode] = useState<NetworkMode>('static');
  const [ip, setIp] = useState(initialIp);
  const [netmask, setNetmask] = useState(initialNetmask);
  const [gateway, setGateway] = useState(initialGateway);
  const [dns, setDns] = useState<string[]>(initialDns);
  const [mtu, setMtu] = useState<string>('');
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);

  const initialStateRef = useRef<{
    mode: NetworkMode;
    ip: string;
    netmask: string;
    gateway: string;
    dns: string[];
    mtu: string;
  } | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const inferredMode: NetworkMode = initialIp || initialNetmask ? 'static' : 'dhcp';
    const normalizedDns = normalizeDns(initialDns);
    const defaultMtu = initialMtu ?? (inferredMode === 'static' ? STATIC_DEFAULT_MTU : DHCP_DEFAULT_MTU);

    setMode(inferredMode);
    setIp(initialIp);
    setNetmask(initialNetmask);
    setGateway(initialGateway);
    setDns(normalizedDns);
    setMtu(String(defaultMtu));

    initialStateRef.current = {
      mode: inferredMode,
      ip: initialIp,
      netmask: initialNetmask,
      gateway: initialGateway,
      dns: normalizedDns,
      mtu: String(defaultMtu),
    };
  }, [initialDns, initialGateway, initialIp, initialMtu, initialNetmask, open]);

  const mtuValue = Number.parseInt(mtu, 10);
  const isMtuValid = !Number.isNaN(mtuValue) && mtuValue >= MIN_MTU && mtuValue <= MAX_MTU;

  const staticFieldErrors = useMemo(() => {
    if (mode !== 'static') {
      return null;
    }

    const dnsErrors = normalizeDns(dns).filter((entry) => !isValidIPv4(entry));
    return {
      ip: ip !== '' && !isValidIPv4(ip) ? 'Enter a valid IPv4 address.' : '',
      netmask: netmask !== '' && !isValidIPv4(netmask) ? 'Enter a valid netmask.' : '',
      gateway: gateway !== '' && !isValidIPv4(gateway) ? 'Enter a valid gateway.' : '',
      dns: dnsErrors,
    };
  }, [dns, gateway, ip, mode, netmask]);

  const hasValidationErrors = useMemo(() => {
    if (!isMtuValid) {
      return true;
    }

    if (mode === 'dhcp') {
      return false;
    }

    return (
      !ip.trim() ||
      !netmask.trim() ||
      hasStaticFieldErrors({ ip: ip.trim(), netmask: netmask.trim(), gateway: gateway.trim(), dns })
    );
  }, [dns, gateway, ip, isMtuValid, mode, netmask]);

  const hasUnsavedChanges = useMemo(() => {
    const initialState = initialStateRef.current;

    if (!initialState) {
      return false;
    }

    const normalizedCurrent = {
      mode,
      ip: ip.trim(),
      netmask: netmask.trim(),
      gateway: gateway.trim(),
      dns: normalizeDns(dns),
      mtu: mtu.trim(),
    };

    return JSON.stringify(normalizedCurrent) !== JSON.stringify(initialState);
  }, [dns, gateway, ip, mode, mtu, netmask]);

  const requestBodyPreview = useMemo(() => {
    const resolvedMtu = isMtuValid
      ? mtuValue
      : mode === 'static'
        ? STATIC_DEFAULT_MTU
        : DHCP_DEFAULT_MTU;

    return buildRequestBody(mode, resolvedMtu, {
      ip,
      netmask,
      gateway,
      dns,
    });
  }, [dns, gateway, ip, isMtuValid, mode, mtuValue, netmask]);

  const handleModeChange = (nextMode: NetworkMode) => {
    setMode(nextMode);
    if (nextMode === 'dhcp' && mtu === '') {
      setMtu(String(DHCP_DEFAULT_MTU));
    }
    if (nextMode === 'static' && mtu === '') {
      setMtu(String(STATIC_DEFAULT_MTU));
    }
  };

  const handleCloseRequest = () => {
    if (hasUnsavedChanges && !isSubmitting) {
      setIsDiscardDialogOpen(true);
      return;
    }

    onClose();
  };

  const handleSubmit = () => {
    if (!interfaceName || hasValidationErrors || isSubmitting) {
      return;
    }

    const payload: ConfigureNetworkPayload = {
      interfaceName,
      ...requestBodyPreview,
    };

    onSubmit(payload);
  };

  const handleDiscard = () => {
    setIsDiscardDialogOpen(false);
    onClose();
  };

  const staticFieldsVisible = mode === 'static';

  const helperTextColor = 'text.secondary';

  return (
    <>
      <Dialog
        open={open}
        onClose={(_, reason) => {
          if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
            handleCloseRequest();
          }
        }}
        fullWidth
        maxWidth="sm"
        aria-labelledby="network-config-dialog-title"
        aria-describedby="network-config-dialog-description"
      >
        <DialogTitle id="network-config-dialog-title">Network configuration</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <Typography id="network-config-dialog-description" color="text.secondary">
              Choose how this device obtains network settings.
            </Typography>

            {errorMessage ? (
              <Alert severity="error" variant="outlined">
                {errorMessage}
              </Alert>
            ) : null}

            <FormControl component="fieldset">
              <InputLabel shrink>Mode</InputLabel>
              <RadioGroup
                row
                value={mode}
                onChange={(event) => handleModeChange(event.target.value as NetworkMode)}
                aria-label="Network mode"
              >
                <FormControlLabel value="static" control={<Radio />} label="Static" />
                <FormControlLabel value="dhcp" control={<Radio />} label="DHCP" />
              </RadioGroup>
            </FormControl>

            {staticFieldsVisible ? (
              <Stack spacing={2}>
                <TextField
                  label="IP address"
                  value={ip}
                  onChange={(event) => setIp(event.target.value)}
                  placeholder="192.168.1.10"
                  error={Boolean(staticFieldErrors?.ip)}
                  helperText={staticFieldErrors?.ip || 'Enter IPv4 address (e.g., 192.168.1.10).'}
                  fullWidth
                  size="small"
                  disabled={isSubmitting}
                />
                <TextField
                  label="Netmask"
                  value={netmask}
                  onChange={(event) => setNetmask(event.target.value)}
                  placeholder="255.255.255.0"
                  error={Boolean(staticFieldErrors?.netmask)}
                  helperText={staticFieldErrors?.netmask || 'Enter subnet mask (e.g., 255.255.255.0).'}
                  fullWidth
                  size="small"
                  disabled={isSubmitting}
                />
                <TextField
                  label="Gateway"
                  value={gateway}
                  onChange={(event) => setGateway(event.target.value)}
                  placeholder="192.168.1.1"
                  error={Boolean(staticFieldErrors?.gateway)}
                  helperText={staticFieldErrors?.gateway || 'Default gateway (optional).'}
                  fullWidth
                  size="small"
                  disabled={isSubmitting}
                />
                <FormControl error={Boolean(staticFieldErrors?.dns?.length)}>
                  <Autocomplete
                    multiple
                    freeSolo
                    value={dns}
                    onChange={(_, value) => setDns(normalizeDns(value))}
                    options={[]}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="DNS servers"
                        placeholder="8.8.8.8"
                        size="small"
                        disabled={isSubmitting}
                        helperText={
                          staticFieldErrors?.dns?.length
                            ? `Invalid DNS entries: ${staticFieldErrors.dns.join(', ')}`
                            : 'Add IPv4 DNS servers. Press Enter to add.'
                        }
                        error={Boolean(staticFieldErrors?.dns?.length)}
                      />
                    )}
                  />
                </FormControl>
              </Stack>
            ) : null}

            <TextField
              label="MTU"
              value={mtu}
              onChange={(event) => setMtu(event.target.value)}
              placeholder={mode === 'static' ? String(STATIC_DEFAULT_MTU) : String(DHCP_DEFAULT_MTU)}
              type="number"
              inputProps={{ min: MIN_MTU, max: MAX_MTU }}
              error={!isMtuValid}
              helperText={`Enter a value between ${MIN_MTU} and ${MAX_MTU}.`}
              fullWidth
              size="small"
              disabled={isSubmitting}
            />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Resulting request body preview
              </Typography>
              <Typography variant="body2" color={helperTextColor} sx={{ mb: 1 }}>
                This payload will be sent to the API. The field save_to_db is intentionally
                excluded.
              </Typography>
              <Box
                component="pre"
                sx={{
                  p: 2,
                  backgroundColor: 'background.default',
                  borderRadius: 1,
                  border: 1,
                  borderColor: 'divider',
                  fontSize: 13,
                  overflow: 'auto',
                }}
              >
                {JSON.stringify(requestBodyPreview, null, 2)}
              </Box>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseRequest} disabled={isSubmitting} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!isMtuValid) {
                return;
              }
              setMtu(String(mtuValue));
              handleSubmit();
            }}
            variant="contained"
            disabled={!interfaceName || hasValidationErrors || isSubmitting}
          >
            {isSubmitting ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isDiscardDialogOpen}
        onClose={() => setIsDiscardDialogOpen(false)}
        aria-labelledby="discard-changes-title"
      >
        <DialogTitle id="discard-changes-title">Discard changes?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            You have unsaved changes. Do you want to discard them?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDiscardDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDiscard} color="error" variant="contained">
            Discard
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NetworkInterfaceConfigurationModal;
