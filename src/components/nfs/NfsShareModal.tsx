import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Collapse,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { MdAdd, MdClose, MdExpandLess, MdExpandMore } from 'react-icons/md';
import type {
  NfsShareEntry,
  NfsShareOptionKey,
  NfsSharePayload,
} from '../../@types/nfs';
import { isCompleteIPv4Address } from '../../utils/ipAddress';
import { translateDetailKey } from '../../utils/detailLabels';
import {
  buildOptionPayload,
  NFS_OPTION_DEFAULTS,
  NFS_OPTION_KEYS,
  resolveEnabledOptionKeys,
  resolveOptionValues,
} from '../../utils/nfsShareOptions';
import BlurModal from '../BlurModal';
import ToggleBtn from '../ToggleBtn';
import IPv4AddressInput from '../common/IPv4AddressInput';
import ModalActionButtons from '../common/ModalActionButtons';

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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [enabledOptions, setEnabledOptions] = useState<NfsShareOptionKey[]>([]);
  const [optionValues, setOptionValues] = useState(NFS_OPTION_DEFAULTS);
  const [formError, setFormError] = useState<string | null>(null);

  const isEditMode = mode === 'edit';

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
      setEnabledOptions(resolveEnabledOptionKeys(initialOptions));
    } else {
      setPath('');
      setPathInput('');
      setClient('');
      setOptionValues({ ...NFS_OPTION_DEFAULTS });
      setEnabledOptions([]);
    }

    setFormError(null);
    setShowAdvanced(false);
  }, [initialShare, isEditMode, open]);

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
    setOptionValues((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleAddOption = (key: NfsShareOptionKey) => {
    setEnabledOptions((prev) => (prev.includes(key) ? prev : [...prev, key]));
  };

  const handleRemoveOption = (key: NfsShareOptionKey) => {
    setEnabledOptions((prev) => prev.filter((item) => item !== key));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!isEditMode) {
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
    }

    const optionPayload = buildOptionPayload(enabledOptions, optionValues);

    onSubmit({
      save_to_db: !isEditMode,
      path: path.trim(),
      clients: client.trim(),
      ...(optionPayload as Record<string, boolean>),
    });
  };

  const isConfirmDisabled =
    isSubmitting ||
    (!isEditMode &&
      (!path.trim() || !client.trim() || !isCompleteIPv4Address(client.trim())));

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

        {isEditMode ? (
          <TextField
            label="کلاینت"
            value={client}
            fullWidth
            size="small"
            InputLabelProps={{ sx: { color: 'var(--color-secondary)' } }}
            InputProps={{ sx: inputBaseSx }}
            disabled
          />
        ) : (
          <IPv4AddressInput
            label="آی‌پی کلاینت"
            value={client}
            onChange={setClient}
            required
          />
        )}

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
          تنظیمات پیشرفته
        </Button>

        <Collapse in={showAdvanced} unmountOnExit>
          <Stack spacing={2}>
            {NFS_OPTION_KEYS.map((optionKey) => {
              const isEnabled = enabledOptions.includes(optionKey);
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
                  {isEnabled ? (
                    <Stack direction="row" spacing={1.5} alignItems="center">
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
                      <IconButton
                        aria-label={`حذف ${label}`}
                        onClick={() => handleRemoveOption(optionKey)}
                        size="small"
                        sx={{ color: 'var(--color-error)' }}
                      >
                        <MdClose />
                      </IconButton>
                    </Stack>
                  ) : (
                    <IconButton
                      aria-label={`افزودن ${label}`}
                      onClick={() => handleAddOption(optionKey)}
                      size="small"
                      color="primary"
                    >
                      <MdAdd />
                    </IconButton>
                  )}
                </Stack>
              );
            })}
          </Stack>
        </Collapse>
      </Box>
    </BlurModal>
  );
};

export default NfsShareModal;
