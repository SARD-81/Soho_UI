import { Alert, AlertTitle } from '@mui/material';
import { useMemo } from 'react';
import { useServices } from '../../hooks/useServices';
import { deriveServiceRuntimeStatus } from '../../utils/serviceRuntime';

interface ServiceStoppedAlertProps {
  unitName: string;
  serviceLabel: string;
}

const STATUS_LABELS = {
  stopped: 'متوقف',
  error: 'دارای خطا',
  masked: 'ماسک‌شده',
} as const;

const ServiceStoppedAlert = ({
  unitName,
  serviceLabel,
}: ServiceStoppedAlertProps) => {
  const servicesQuery = useServices();

  const service = useMemo(
    () =>
      (servicesQuery.data?.data ?? []).find(
        (item) => item.unit.trim() === unitName
      ) ?? null,
    [servicesQuery.data?.data, unitName]
  );

  if (!service) {
    return null;
  }

  const runtimeStatus = deriveServiceRuntimeStatus(service);

  if (runtimeStatus === 'running') {
    return null;
  }

  return (
    <Alert
      dir="rtl"
      severity="error"
      variant="outlined"
      sx={{
        mb: 2,
        direction: 'rtl',
        textAlign: 'left',
        alignItems: 'flex-start',
        borderRadius: '10px',
        borderColor: 'rgba(244, 67, 54, 0.5)',
        backgroundColor: 'rgba(244, 67, 54, 0.08)',
        '& .MuiAlert-icon': {
          ml: 1,
          mr: 0,
        },
        '& .MuiAlert-message': {
          width: '100%',
          direction: 'rtl',
          textAlign: 'left',
        },
        '& .MuiAlertTitle-root': {
          direction: 'rtl',
          textAlign: 'left',
        },
      }}
    >
      <AlertTitle
        sx={{
          fontWeight: 900,
          mb: 0.5,
          direction: 'rtl',
          textAlign: 'right',
        }}
      >
        {serviceLabel} در حال اجرا نیست
      </AlertTitle>
      وضعیت فعلی سرویس «{STATUS_LABELS[runtimeStatus]}» است. تا زمانی که سرویس
      دوباره راه‌اندازی نشود، ممکن است عملیات این صفحه به‌درستی انجام نشود.
    </Alert>
  );
};

export default ServiceStoppedAlert;
