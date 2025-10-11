import { Box, Typography } from '@mui/material';
import { useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import type { ServiceActionType, ServiceValue } from '../@types/service';
import ServicesTable from '../components/services/ServicesTable';
import { getServiceLabel } from '../constants/serviceLabels';
import { useServiceAction } from '../hooks/useServiceAction';
import { useServices } from '../hooks/useServices';

const actionLabels: Record<ServiceActionType, string> = {
  start: 'شروع',
  restart: 'راه‌اندازی مجدد',
  stop: 'توقف',
};

const Services = () => {
  const servicesQuery = useServices();

  const serviceAction = useServiceAction({
    onSuccess: ({ action, service }) => {
      toast.success(
        `عملیات ${actionLabels[action]} برای ${getServiceLabel(service)} با موفقیت انجام شد.`
      );
    },
    onError: (message, { action, service }) => {
      toast.error(
        `اجرای ${actionLabels[action]} برای ${service} با خطا مواجه شد: ${message}`
      );
    },
  });

  const services = useMemo(
    () =>
      Object.entries(servicesQuery.data?.data ?? {}).map(([name, details]) => {
        const normalizedDetails: Record<string, ServiceValue> = {
          ...(details ?? {}),
        };

        const description =
          typeof details?.description === 'string'
            ? details?.description
            : undefined;

        return {
          name,
          label: getServiceLabel(name, description),
          details: normalizedDetails,
        };
      }),
    [servicesQuery.data?.data]
  );

  const handleAction = useCallback(
    (serviceName: string, action: ServiceActionType) => {
      serviceAction.mutate({ service: serviceName, action });
    },
    [serviceAction]
  );

  return (
    <Box sx={{ p: 3, fontFamily: 'var(--font-vazir)' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography
          variant="h5"
          sx={{ color: 'var(--color-primary)', fontWeight: 700 }}
        >
          سرویس ها
        </Typography>

        <ServicesTable
          services={services}
          isLoading={servicesQuery.isLoading}
          error={servicesQuery.error ?? null}
          onAction={handleAction}
          isActionLoading={serviceAction.isPending}
          activeServiceName={serviceAction.variables?.service ?? null}
        />
      </Box>
    </Box>
  );
};

export default Services;