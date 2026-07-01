import { Box } from '@mui/material';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import type {
  SnmpTestConnectionPayload,
  SnmpTestConnectionResponse,
} from '../@types/snmp';
import PageContainer from '../components/PageContainer';
import TablePageHeader from '../components/common/TablePageHeader';
import SnmpConfigModal from '../components/snmp/SnmpConfigModal';
import SnmpOverview from '../components/snmp/SnmpOverview';
import SnmpTestConnectionModal from '../components/snmp/SnmpTestConnectionModal';
import SnmpTestResultModal, {
  type SnmpTestResultState,
} from '../components/snmp/SnmpTestResultModal';
import { useConfigureSnmp } from '../hooks/useConfigureSnmp';
import { useSnmpInfo } from '../hooks/useSnmpInfo';
import { useTestSnmpConnection } from '../hooks/useTestSnmpConnection';

const normalizeBooleanFlag = (value: unknown) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'on', 'success'].includes(normalized)) {
      return true;
    }

    if (['false', '0', 'no', 'off', 'failed', 'failure'].includes(normalized)) {
      return false;
    }
  }

  return null;
};

const resolveConnectionSuccess = (response: SnmpTestConnectionResponse) => {
  const directFlag = normalizeBooleanFlag(response.connection_success);

  if (directFlag !== null) {
    return directFlag;
  }

  const dataFlag = normalizeBooleanFlag(response.data?.connection_success);

  if (dataFlag !== null) {
    return dataFlag;
  }

  return response.ok === true;
};

const SnmpService = () => {
  const snmpInfoQuery = useSnmpInfo();
  const configureSnmp = useConfigureSnmp();
  const testSnmpConnection = useTestSnmpConnection();
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [testResult, setTestResult] = useState<SnmpTestResultState | null>(null);

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

  const openTestModal = () => {
    testSnmpConnection.reset();
    setIsTestModalOpen(true);
  };

  const showTestResult = (result: SnmpTestResultState) => {
    setIsTestModalOpen(false);
    setTestResult(result);
    setIsResultModalOpen(true);
  };

  const handleSubmitTest = (payload: SnmpTestConnectionPayload) => {
    testSnmpConnection.mutate(payload, {
      onSuccess: (response) => {
        const isSuccess = resolveConnectionSuccess(response);
        const message =
          response.message ??
          (isSuccess
            ? 'تست اتصال SNMP با موفقیت انجام شد.'
            : 'تست اتصال SNMP ناموفق بود.');

        showTestResult({
          ok: isSuccess,
          message,
          data: response.data ?? response,
          payload,
        });

        if (isSuccess) {
          toast.success(message);
          return;
        }

        toast.error(message);
      },
      onError: (error) => {
        const message = `تست اتصال SNMP با خطا مواجه شد: ${error.message}`;
        showTestResult({
          ok: false,
          message,
          payload,
        });
        toast.error(message);
      },
    });
  };

  const handleRetest = () => {
    setIsResultModalOpen(false);
    openTestModal();
  };

  return (
    <PageContainer>
      <TablePageHeader
        title="سرویس SNMP"
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
            onClick: openTestModal,
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

      <SnmpTestResultModal
        open={isResultModalOpen}
        result={testResult}
        onClose={() => setIsResultModalOpen(false)}
        onRetest={handleRetest}
      />
    </PageContainer>
  );
};

export default SnmpService;
