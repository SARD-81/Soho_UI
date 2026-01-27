import {
  Alert,
  Autocomplete,
  Box,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  NfsShareEntry,
  NfsShareOptionKey,
  NfsSharePayload,
} from '../../@types/nfs';
import { isCompleteIPv4Address } from '../../utils/ipAddress';
import { translateDetailKey } from '../../utils/detailLabels';
import {
  NFS_OPTION_DEFAULTS,
  NFS_OPTION_KEYS,
  resolveOptionValues,
} from '../../utils/nfsShareOptions';
import BlurModal from '../BlurModal';
import ToggleBtn from '../ToggleBtn';
import IPv4AddressInput from '../common/IPv4AddressInput';
import ModalActionButtons from '../common/ModalActionButtons';
import { useServiceAction } from '../../hooks/useServiceAction';
import { toast } from 'react-hot-toast';
import { useNfsShareDetails } from '../../hooks/useNfsShareDetails';

interface NfsShareModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  mountpointOptions: string[];
  mountpointLoading?: boolean;
  initialShare?: NfsShareEntry | null;
  isSubmitting: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onSubmit: (payload: NfsSharePayload) => void;
}

const inputBaseSx = {
  backgroundColor: 'var(--color-input-bg)',
  borderRadius: '5px',
  '& .MuiInputBase-input': { color: 'var(--color-text)' },
  '& fieldset': { borderColor: 'var(--color-input-border)' },
  '&:hover fieldset': { borderColor: 'var(--color-input-focus-border)' },
  '&.Mui-focused fieldset': { borderColor: 'var(--color-input-focus-border)' },
};

const autocompletePaperSlotProps = {
  paper: {
    sx: {
      bgcolor: 'var(--color-input-bg)',
      '& .MuiAutocomplete-option': {
        color: 'var(--color-text)',
        '&.Mui-focused': {
          bgcolor: 'var(--color-input-focus-border)',
          color: '#fff',
        },
        '&[aria-selected="true"]': {
          bgcolor: 'var(--color-primary)',
          color: '#fff',
        },
      },
    },
  },
} as const;

const deriveClientValue = (share: NfsShareEntry | null | undefined) =>
  share?.clients
    .map((client) => client.client)
    .filter((value) => value.trim().length > 0)
    .join(', ')
    .trim() ?? '';

const deriveOptions = (share: NfsShareEntry | null | undefined) =>
  share?.clients?.[0]?.options ?? null;

const NfsShareModal = ({
  open,
  mode,
  mountpointOptions,
  mountpointLoading = false,
  initialShare,
  isSubmitting,
  errorMessage,
  onClose,
  onSubmit,
}: NfsShareModalProps) => {
  const [path, setPath] = useState('');
  const [pathInput, setPathInput] = useState('');
  const [client, setClient] = useState('');
  const [optionValues, setOptionValues] = useState(NFS_OPTION_DEFAULTS);
  const [formError, setFormError] = useState<string | null>(null);
  const [hasAdjustedOptions, setHasAdjustedOptions] = useState(false);

  const isEditMode = mode === 'edit';
  const { data: remoteShare } = useNfsShareDetails({
    path,
    enabled: isEditMode && open,
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    if (isEditMode && initialShare) {
      const initialPath = initialShare.path ?? '';
      const initialClient = deriveClientValue(initialShare);
      const initialOptions = deriveOptions(initialShare);

      setPath(initialPath);
      setPathInput(initialPath);
      setClient(initialClient);
      setOptionValues(resolveOptionValues(initialOptions));
    } else {
      setPath('');
      setPathInput('');
      setClient('');
      setOptionValues({ ...NFS_OPTION_DEFAULTS });
    }

    setHasAdjustedOptions(false);
    setFormError(null);
  }, [initialShare, isEditMode, open]);

  useEffect(() => {
    if (!isEditMode || !open || hasAdjustedOptions) {
      return;
    }

    const remoteOptions = remoteShare?.clients?.[0]?.options;

    if (remoteOptions) {
      setOptionValues(resolveOptionValues(remoteOptions));
    }
  }, [hasAdjustedOptions, isEditMode, open, remoteShare]);

  const selectableMountpoints = useMemo(
    () => mountpointOptions.filter(Boolean),
    [mountpointOptions]
  );

  const handlePathInputChange = (_: unknown, value: string) => {
    setPathInput(value);

    if (selectableMountpoints.includes(value)) {
      setPath(value);
    } else {
      setPath('');
    }
  };

  const handlePathChange = (_: unknown, value: string | null) => {
    const nextValue = value ?? '';
    setPath(nextValue);
    setPathInput(nextValue);
  };

  const handleToggleOption = (key: NfsShareOptionKey) => {
    setHasAdjustedOptions(true);
    setOptionValues((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const serviceAction = useServiceAction({
        onSuccess: () => {
          // toast.success(`سرویس ${service} با موفقیت راه‌اندازی مجدد شد.`);
        },
        onError: (message, { service }) => {
          toast.error(`راه‌اندازی مجدد ${service} با خطا مواجه شد: ${message}`);
        },
      });
  
      const handleRestartNFS = useCallback(() => {
          // if (serviceAction.isPending) {
          //   toast(
          //     'راه‌اندازی مجدد سرویس smbd.service در حال انجام است. لطفاً صبر کنید.'
          //   );
          //   return;
          // }
          //
          // const toastId = toast.loading(
          //   'در حال راه‌اندازی مجدد سرویس smbd.service...'
          // );
      
          serviceAction.mutate(
            { service: 'nfs-server.service', action: 'restart' },
            {
              onSettled: () => {
                // toast.dismiss(toastId);
              },
            }
          );
        }, [serviceAction]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!path.trim()) {
      setFormError('لطفاً مسیر اشتراک را انتخاب کنید.');
      return;
    }

    if (!client.trim()) {
      setFormError('لطفاً آی‌پی کلاینت را وارد کنید.');
      return;
    }

    if (!isCompleteIPv4Address(client.trim())) {
      setFormError('آی‌پی وارد شده معتبر نیست.');
      return;
    }

    if (!isEditMode) {
      handleRestartNFS()
    }


    onSubmit({
      save_to_db: !isEditMode,
      path: path.trim(),
      clients: client.trim(),
      ...(optionValues as Record<string, boolean>),
    });
  };

  const isConfirmDisabled =
    isSubmitting ||
    !path.trim() ||
    !client.trim() ||
    !isCompleteIPv4Address(client.trim());

  return (
    <BlurModal
      open={open}
      onClose={onClose}
      title={isEditMode ? 'ویرایش اشتراک NFS' : 'ایجاد اشتراک NFS'}
      actions={
        <ModalActionButtons
          confirmLabel={isEditMode ? 'ثبت تغییرات' : 'ایجاد اشتراک'}
          loadingLabel="در حال ارسال..."
          isLoading={isSubmitting}
          disabled={isConfirmDisabled}
          confirmProps={{ type: 'submit', form: 'nfs-share-form' }}
          onCancel={onClose}
        />
      }
    >
      <Box
        id="nfs-share-form"
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
      >
        <Typography sx={{ color: 'var(--color-secondary)' }}>
          {isEditMode
            ? 'مقادیر دلخواه را برای ویرایش اشتراک NFS وارد کنید.'
            : 'برای ایجاد اشتراک جدید NFS اطلاعات زیر را تکمیل کنید.'}
        </Typography>

        {formError || errorMessage ? (
          <Alert severity="error">{formError ?? errorMessage}</Alert>
        ) : null}

        {isEditMode ? (
          <TextField
            label="مسیر"
            value={path}
            fullWidth
            size="small"
            InputLabelProps={{ sx: { color: 'var(--color-secondary)' } }}
            InputProps={{ sx: inputBaseSx }}
            disabled
          />
        ) : (
          <Autocomplete
            options={selectableMountpoints}
            value={path}
            inputValue={pathInput}
            onInputChange={handlePathInputChange}
            onChange={handlePathChange}
            loading={mountpointLoading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="مسیر"
                required
                size="small"
                InputLabelProps={{ sx: { color: 'var(--color-secondary)' } }}
                InputProps={{
                  ...params.InputProps,
                  sx: inputBaseSx,
                }}
              />
            )}
            noOptionsText="مسیر قابل انتخابی وجود ندارد."
            slotProps={autocompletePaperSlotProps}
          />
        )}

        <IPv4AddressInput
          label="آی‌پی کلاینت"
          value={client}
          onChange={setClient}
          required
        />

        <Divider />

        <Stack spacing={1.5}>
          <Typography sx={{ color: 'var(--color-secondary)', fontWeight: 700 }}>
            گزینه‌های پیش‌فرض اشتراک NFS
          </Typography>
          {NFS_OPTION_KEYS.map((optionKey) => {
            const label = translateDetailKey(optionKey);
            const valueLabel = optionValues[optionKey] ? 'فعال' : 'غیرفعال';

            return (
              <Stack
                key={optionKey}
                direction="row"
                spacing={2}
                alignItems="center"
              >
                <Typography
                  sx={{
                    flex: 1,
                    color: 'var(--color-text)',
                    fontWeight: 600,
                  }}
                >
                  {label}
                </Typography>
                <Stack spacing={0.25} alignItems="center">
                  <ToggleBtn
                    id={`nfs-option-${optionKey}`}
                    checked={optionValues[optionKey]}
                    onChange={() => handleToggleOption(optionKey)}
                  />
                  <Typography
                  variant="caption"
                    sx={{
                      color: optionValues[optionKey]
                        ? 'var(--color-success)'
                        : 'var(--color-error)',
                      fontWeight: 700,
                    }}
                  >
                    {valueLabel}
                  </Typography>
                  
                </Stack>
              </Stack>
            );
          })}
        </Stack>
      </Box>
    </BlurModal>
  );
};

export default NfsShareModal;
