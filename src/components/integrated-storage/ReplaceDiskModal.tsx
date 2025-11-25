import { Box, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { Fragment, type FormEvent, useEffect, useMemo, useState } from 'react';
import type { DeviceOption } from './CreatePoolModal';
import type { ReplaceDevicePayload } from '../../hooks/useReplacePoolDisk';
import type { PoolDiskSlot } from '../../hooks/usePoolDeviceSlots';
import BlurModal from '../BlurModal';
import ModalActionButtons from '../common/ModalActionButtons';

interface ReplaceDiskModalProps {
  open: boolean;
  poolName: string | null;
  slots: PoolDiskSlot[];
  newDiskOptions: DeviceOption[];
  onClose: () => void;
  onSubmit: (payload: ReplaceDevicePayload[]) => void;
  isSubmitting?: boolean;
  slotError?: string | null;
  isNewDiskLoading?: boolean;
  apiError?: string | null;
}

interface ReplacementRow {
  id: string;
  oldDevice: string;
  newDevice: string;
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

const ensurePartitionSuffix = (device: string) => {
  const normalized = device.replace(/\s+/g, '').replace(/-part\d+$/, '');
  return `${normalized}-part1`;
};

const buildOldDeviceOptions = (slots: PoolDiskSlot[]) =>
  slots.map((slot, index) => {
    const trimmedWwn = slot.wwn?.trim();
    const basePath = trimmedWwn
      ? trimmedWwn.startsWith('/dev/')
        ? trimmedWwn
        : `/dev/disk/by-id/${trimmedWwn.startsWith('wwn-') ? trimmedWwn : `wwn-${trimmedWwn}`}`
      : `/dev/${slot.diskName}`;
    const normalizedBase = basePath.startsWith('/dev/') ? basePath : `/dev/${basePath}`;
    const value = ensurePartitionSuffix(normalizedBase);
    const label = slot.wwn
      ? `${slot.diskName} (${slot.wwn})`
      : `${slot.diskName}`;

    return {
      value,
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
  const [rows, setRows] = useState<ReplacementRow[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setRows(
        oldDeviceOptions.map((option) => ({
          id: option.key,
          oldDevice: option.value,
          newDevice: '',
        }))
      );
      setValidationError(null);
    } else {
      setRows([]);
    }
  }, [oldDeviceOptions, open]);

  const handleOldChange = (rowId: string, event: SelectChangeEvent<string>) => {
    const { value } = event.target;
    setRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, oldDevice: value } : row))
    );
  };

  const handleNewChange = (rowId: string, event: SelectChangeEvent<string>) => {
    const { value } = event.target;
    setRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, newDevice: value } : row))
    );
    setValidationError(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!poolName) {
      return;
    }

    if (rows.length === 0) {
      setValidationError('هیچ دیسکی برای جایگزینی یافت نشد.');
      return;
    }

    const hasMissingSelection = rows.some((row) => !row.newDevice || !row.oldDevice);

    if (hasMissingSelection) {
      setValidationError('لطفاً برای همه دیسک‌ها گزینه جایگزین انتخاب کنید.');
      return;
    }

    const hasDuplicateNewDevices = new Set(rows.map((row) => row.newDevice)).size !== rows.length;

    if (hasDuplicateNewDevices) {
      setValidationError('هر دیسک جدید فقط باید یک‌بار انتخاب شود.');
      return;
    }

    const payload: ReplaceDevicePayload[] = rows.map((row) => ({
      old_device: ensurePartitionSuffix(row.oldDevice),
      new_device: row.newDevice,
      save_to_db: true,
    }));

    onSubmit(payload);
  };

  return (
    <BlurModal
      open={open}
      onClose={onClose}
      title={`جایگزینی دیسک‌های ${poolName ?? ''}`}
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
          دیسک فعلی و دیسک جایگزین را برای هر اسلات انتخاب کنید. دیسک فعلی به
          صورت خودکار با پسوند -part1 ارسال می‌شود.
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
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 2,
            alignItems: 'center',
            backgroundColor: 'var(--color-card-bg)',
            border: '1px solid var(--color-divider)',
            borderRadius: 3,
            p: 2,
          }}
        >
          <Typography sx={{ fontWeight: 700, color: 'var(--color-text)' }}>
            دیسک فعلی
          </Typography>
          <Typography sx={{ fontWeight: 700, color: 'var(--color-text)' }}>
            دیسک جدید
          </Typography>

          {rows.map((row) => (
            <Fragment key={row.id}>
              <FormControl key={`${row.id}-old`} size="small" sx={{ minWidth: 200 }}>
                <InputLabel sx={{ color: 'var(--color-secondary)' }}>دیسک فعلی</InputLabel>
                <Select
                  value={row.oldDevice}
                  label="دیسک فعلی"
                  onChange={(event) => handleOldChange(row.id, event)}
                  sx={selectBaseStyles}
                  MenuProps={{ PaperProps: { sx: { maxHeight: 280 } } }}
                >
                  {oldDeviceOptions.map((option) => (
                    <MenuItem key={option.key} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl
                size="small"
                sx={{ minWidth: 220 }}
                disabled={isNewDiskLoading}
              >
                <InputLabel sx={{ color: 'var(--color-secondary)' }}>دیسک جدید</InputLabel>
                <Select
                  value={row.newDevice}
                  label="دیسک جدید"
                  onChange={(event) => handleNewChange(row.id, event)}
                  sx={selectBaseStyles}
                  MenuProps={{ PaperProps: { sx: { maxHeight: 320 } } }}
                  displayEmpty
                >
                  <MenuItem disabled value="">
                    {isNewDiskLoading ? 'در حال بارگذاری دیسک‌ها...' : 'یک دیسک بدون پارتیشن انتخاب کنید'}
                  </MenuItem>
                  {newDiskOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Fragment>
          ))}
        </Box>
      </Box>
    </BlurModal>
  );
};

export default ReplaceDiskModal;
