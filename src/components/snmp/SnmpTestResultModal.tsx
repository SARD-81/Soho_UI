import {
  Alert,
  Box,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import { MdCheckCircle, MdErrorOutline, MdReplay } from 'react-icons/md';
import type { SnmpTestConnectionPayload } from '../../@types/snmp';
import BlurModal from '../BlurModal';
import ModalActionButtons from '../common/ModalActionButtons';

export interface SnmpTestResultState {
  ok: boolean;
  message: string;
  payload: SnmpTestConnectionPayload;
  data?: unknown;
}

interface SnmpTestResultModalProps {
  open: boolean;
  result: SnmpTestResultState | null;
  onClose: () => void;
  onRetest: () => void;
}

const stringifyData = (value: unknown) => {
  if (value == null) {
    return null;
  }

  if (typeof value === 'string') {
    return value;
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

const SnmpTestResultModal = ({
  open,
  result,
  onClose,
  onRetest,
}: SnmpTestResultModalProps) => {
  const dataPreview = stringifyData(result?.data);
  const isSuccess = Boolean(result?.ok);
  const icon = isSuccess ? <MdCheckCircle size={28} /> : <MdErrorOutline size={28} />;

  return (
    <BlurModal
      open={open}
      onClose={onClose}
      title="نتیجه تست اتصال SNMP"
      maxWidth="520px"
      actions={
        <ModalActionButtons
          onCancel={onClose}
          onConfirm={onRetest}
          cancelLabel="بستن"
          confirmLabel="تست مجدد"
          confirmProps={{ startIcon: <MdReplay /> }}
        />
      }
    >
      {result ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
          <Alert
            severity={isSuccess ? 'success' : 'error'}
            icon={icon}
            sx={{
              borderRadius: '12px',
              alignItems: 'center',
              '& .MuiAlert-message': { width: '100%' },
            }}
          >
            <Typography sx={{ fontWeight: 850 }}>
              {isSuccess ? 'اتصال موفق بود' : 'اتصال ناموفق بود'}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.4 }}>
              {result.message}
            </Typography>
          </Alert>

          <Stack direction="row" gap={1} flexWrap="wrap">
            <Chip label={`IP: ${result.payload.host}`} size="small" />
            <Chip label={`Port: ${result.payload.port}`} size="small" />
            <Chip label={`Community: ${result.payload.community}`} size="small" />
          </Stack>

          {dataPreview ? (
            <Box
              component="pre"
              sx={{
                m: 0,
                p: 1.5,
                maxHeight: 180,
                overflow: 'auto',
                direction: 'ltr',
                textAlign: 'left',
                borderRadius: '10px',
                color: 'var(--color-text)',
                backgroundColor: 'rgba(15, 23, 42, 0.38)',
                border: '1px solid rgba(148, 163, 184, 0.18)',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
              }}
            >
              {dataPreview}
            </Box>
          ) : null}
        </Box>
      ) : null}
    </BlurModal>
  );
};

export default SnmpTestResultModal;
