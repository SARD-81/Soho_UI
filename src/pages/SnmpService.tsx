import { Box } from '@mui/material';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import PageContainer from '../components/PageContainer';
import TablePageHeader from '../components/common/TablePageHeader';
import SnmpConfigModal from '../components/snmp/SnmpConfigModal';
import SnmpOverview from '../components/snmp/SnmpOverview';
import SnmpTestConnectionModal from '../components/snmp/SnmpTestConnectionModal';
import { useConfigureSnmp } from '../hooks/useConfigureSnmp';
import { useSnmpInfo } from '../hooks/useSnmpInfo';
import { useTestSnmpConnection } from '../hooks/useTestSnmpConnection';

const SnmpService = () => {
  const snmpInfoQuery = useSnmpInfo();
  const configureSnmp = useConfigureSnmp();
  const testSnmpConnection = useTestSnmpConnection();
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  const handleSubmitConfig = (payload: Parameters<typeof configureSnmp.mutate>[0]) => {
    configureSnmp.mutate(payload, {
      onSuccess: (response) => {
        toast.success(response.message ?? 'تنظیمات SNMP با موفقیت اعمال شد.');
        setIsConfigModalOpen(false);
      },
      onError: (error) => {
        toast.error(`ثبت تنظیمات SNMP با خطا مواجه شد: ${error.message}`);
      },
    });
  };

  const handleSubmitTest = (payload: Parameters<typeof testSnmpConnection.mutate>[0]) => {
    testSnmpConnection.mutate(payload, {
      onSuccess: (response) => {
        toast.success(response.message ?? 'تست اتصال SNMP با موفقیت انجام شد.');
      },
      onError: (error) => {
        toast.error(`تست اتصال SNMP با خطا مواجه شد: ${error.message}`);
      },
    });
  };

  return (
    <PageContainer>
      <TablePageHeader
        title="سرویس SNMP"
        // subtitle="مشاهده و ویرایش پیکربندی دسترسی مانیتورینگ شبکه"
        refreshAction={{
          onClick: () => void snmpInfoQuery.refetch(),
          disabled: snmpInfoQuery.isFetching,
          isLoading: snmpInfoQuery.isFetching,
          loadingLabel: 'در حال بروزرسانی...',
        }}
        primaryAction={{
          label: 'تنظیمات سرویس',
          onClick: () => setIsConfigModalOpen(true),
          disabled: configureSnmp.isPending,
        }}
        actions={[
          {
            label: 'تست اتصال SNMP',
            onClick: () => setIsTestModalOpen(true),
            disabled: snmpInfoQuery.isLoading || testSnmpConnection.isPending,
          },
        ]}
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
        <SnmpOverview
          data={snmpInfoQuery.data}
          isLoading={snmpInfoQuery.isLoading}
          error={snmpInfoQuery.error ?? null}
        />
      </Box>

      <SnmpConfigModal
        open={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        initialValues={snmpInfoQuery.data}
        onSubmit={handleSubmitConfig}
        isSubmitting={configureSnmp.isPending}
        errorMessage={configureSnmp.error?.message ?? null}
      />

      <SnmpTestConnectionModal
        open={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        snmpInfo={snmpInfoQuery.data}
        onSubmit={handleSubmitTest}
        isSubmitting={testSnmpConnection.isPending}
        errorMessage={testSnmpConnection.error?.message ?? null}
      />
    </PageContainer>
  );
};

export default SnmpService;
