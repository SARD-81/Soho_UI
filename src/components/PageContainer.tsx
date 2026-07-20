import { Box, type SxProps, type Theme } from '@mui/material';
import type { PropsWithChildren } from 'react';
import { useLocation } from 'react-router-dom';
import ServiceStoppedAlert from './services/ServiceStoppedAlert';

interface PageContainerProps extends PropsWithChildren {
  sx?: SxProps<Theme>;
}

const SERVICE_ROUTE_CONFIG: Record<
  string,
  { unitName: string; serviceLabel: string }
> = {
  '/share': {
    unitName: 'smbd.service',
    serviceLabel: 'سرویس اشتراک فایل SMB',
  },
  '/share-nfs': {
    unitName: 'nfs-server.service',
    serviceLabel: 'سرویس NFS',
  },
  '/snmp-service': {
    unitName: 'snmpd.service',
    serviceLabel: 'سرویس SNMP',
  },
};

const PageContainer = ({ children, sx }: PageContainerProps) => {
  const location = useLocation();
  const serviceConfig =
    SERVICE_ROUTE_CONFIG[location.pathname.toLowerCase()] ?? null;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        width: '100%',
        ...sx,
      }}
    >
      {serviceConfig ? (
        <ServiceStoppedAlert
          unitName={serviceConfig.unitName}
          serviceLabel={serviceConfig.serviceLabel}
        />
      ) : null}
      {children}
    </Box>
  );
};

export default PageContainer;
