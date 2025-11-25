import {
  Box,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Tooltip,
  Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { type FormEvent, useEffect, useMemo, useState } from 'react';
import type { DeviceOption } from './CreatePoolModal';
import type { ReplaceDevicePayload } from '../../hooks/useReplacePoolDisk';
import type { PoolDiskSlot } from '../../hooks/usePoolDeviceSlots';
import BlurModal from '../BlurModal';
import ModalActionButtons from '../common/ModalActionButtons';
import { MdClose } from 'react-icons/md';

interface ReplaceDiskModalProps {
  open: boolean;
  poolName: string | null;
  slots: PoolDiskSlot[];
  newDiskOptions: DeviceOption[];
  onClose: () => void;
  onSubmit: (payload: ReplaceDevicePayload) => void;
  isSubmitting?: boolean;
  slotError?: string | null;
  isNewDiskLoading?: boolean;
  apiError?: string | null;
}

const selectBaseStyles = {
  backgroundColor: 'var(--color-input-bg)',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'var(--color-input-border)',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'var(--color-input-focus-border)',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: 'var(--color-input-focus-border)',
  },
  color: 'var(--color-text)',
};

const normalizeOldDevice = (device: string) => {
  const trimmed = device.trim();

  if (/(-part\d+|p\d+)$/.test(trimmed)) {
    return trimmed;
  }

  return `${trimmed}-part1`;
};

const buildOldDeviceOptions = (slots: PoolDiskSlot[]) =>
  slots.map((slot, index) => {
    const normalizedWwn = slot.wwn?.trim();
    const wwnPath = normalizedWwn
      ? `/dev/disk/by-id/${normalizedWwn.startsWith('wwn-') ? normalizedWwn : `wwn-${normalizedWwn}`}`
      : null;

    const basePath = wwnPath || slot.path?.trim() || `/dev/${slot.diskName}`;
    const label = slot.wwn
      ? `${slot.diskName} (${slot.wwn})`
      : `${slot.diskName}`;

    return {
      value: basePath,
      label,
      key: `${slot.diskName}-${index}`,
    };
  });

const ReplaceDiskModal = ({
  open,
  poolName,
  slots,
  newDiskOptions,
  onClose,
  onSubmit,
  isSubmitting = false,
  slotError = null,
  isNewDiskLoading = false,
  apiError = null,
}: ReplaceDiskModalProps) => {
  const oldDeviceOptions = useMemo(() => buildOldDeviceOptions(slots), [slots]);
  const [oldDevice, setOldDevice] = useState('');
  const [newDevice, setNewDevice] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      const defaultOld = oldDeviceOptions[0]?.value ?? '';
      setOldDevice(defaultOld);
      setNewDevice('');
      setValidationError(null);
    } else {
      setOldDevice('');
      setNewDevice('');
    }
  }, [oldDeviceOptions, open]);

  const handleOldChange = (event: SelectChangeEvent<string>) => {
    setOldDevice(event.target.value);
  };

  const handleNewChange = (event: SelectChangeEvent<string>) => {
    setNewDevice(event.target.value);
    setValidationError(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!poolName) {
      return;
    }

    if (!oldDevice || !newDevice) {
      setValidationError('لطفاً هر دو دیسک فعلی و جدید را انتخاب کنید.');
      return;
    }

    const payload: ReplaceDevicePayload = {
      old_device: normalizeOldDevice(oldDevice),
      new_device: newDevice,
      save_to_db: true,
    };

    onSubmit(payload);
  };

  return (
    <BlurModal
      open={open}
      onClose={onClose}
      title={`جایگزینی دیسک ${poolName ?? ''}`}
      actions={
        <ModalActionButtons
          onCancel={onClose}
          confirmLabel="ثبت جایگزینی"
          loadingLabel="در حال ثبت..."
          isLoading={isSubmitting}
          disabled={isSubmitting}
          cancelProps={{ sx: { borderRadius: '3px', px: 3 } }}
          confirmProps={{ type: 'submit', form: 'replace-disk-form', sx: { borderRadius: '3px' } }}
        />
      }
    >
      <Box
        id="replace-disk-form"
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
      >
          <Typography sx={{ color: 'var(--color-text)', fontWeight: 600 }}>
          دیسک فعلی و دیسک جایگزین را انتخاب کنید. دیسک فعلی به صورت خودکار با
          پسوند -part1 ارسال می‌شود.
        </Typography>

        {slotError && (
          <Typography sx={{ color: 'var(--color-error)', fontWeight: 600 }}>
            {slotError}
          </Typography>
        )}

        {apiError && (
          <Typography sx={{ color: 'var(--color-error)', fontWeight: 600 }}>
            {apiError}
          </Typography>
        )}

        {validationError && (
          <Typography sx={{ color: 'var(--color-error)' }}>{validationError}</Typography>
        )}

        <Box
          sx={{
            backgroundColor: 'var(--color-card-bg)',
            border: '1px solid var(--color-divider)',
            borderRadius: 3,
            p: 2,
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr)) 48px',
              alignItems: 'center',
              gap: 1.5,
              pb: 1,
              borderBottom: '1px solid var(--color-divider)',
            }}
          >
            <Typography sx={{ fontWeight: 700, color: 'var(--color-text)' }}>
              دیسک فعلی
            </Typography>
            <Typography sx={{ fontWeight: 700, color: 'var(--color-text)' }}>
              دیسک جدید
            </Typography>
            <Box />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 1 }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr)) 48px',
                gap: 1.5,
                alignItems: 'center',
                p: 1,
                border: '1px solid var(--color-divider)',
                borderRadius: 2,
                backgroundColor: 'var(--color-surface)',
              }}
            >
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel sx={{ color: 'var(--color-secondary)' }}>دیسک فعلی</InputLabel>
                <Select
                  value={oldDevice}
                  label="دیسک فعلی"
                  onChange={handleOldChange}
                  sx={selectBaseStyles}
                  MenuProps={{ PaperProps: { sx: { maxHeight: 280 } } }}
                  displayEmpty
                >
                  <MenuItem disabled value="">
                    یک دیسک فعلی انتخاب کنید
                  </MenuItem>
                  {oldDeviceOptions.map((option) => (
                    <MenuItem key={option.key} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 220 }} disabled={isNewDiskLoading}>
                <InputLabel sx={{ color: 'var(--color-secondary)' }}>دیسک جدید</InputLabel>
                <Select
                  value={newDevice}
                  label="دیسک جدید"
                  onChange={handleNewChange}
                  sx={selectBaseStyles}
                  MenuProps={{ PaperProps: { sx: { maxHeight: 320 } } }}
                  displayEmpty
                >
                  <MenuItem disabled value="">
                    {isNewDiskLoading
                      ? 'در حال بارگذاری دیسک‌ها...'
                      : 'یک دیسک بدون پارتیشن انتخاب کنید'}
                  </MenuItem>
                  {newDiskOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Tooltip title="پاک کردن انتخاب">
                  <span>
                    <IconButton
                      aria-label="پاک کردن انتخاب"
                      onClick={() => {
                        setOldDevice(oldDeviceOptions[0]?.value ?? '');
                        setNewDevice('');
                      }}
                      sx={{
                        color: 'var(--color-error)',
                        border: '1px solid var(--color-divider)',
                        borderRadius: '8px',
                        backgroundColor: 'var(--color-card-bg)',
                        '&:hover': { backgroundColor: 'rgba(239, 83, 80, 0.08)' },
                      }}
                    >
                      <MdClose size={20} />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </BlurModal>
  );
};

export default ReplaceDiskModal;
