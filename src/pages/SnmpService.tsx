import { Box, Button, Stack, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import PageContainer from '../components/PageContainer';
import SelectedSnmpDetailsPanel from '../components/snmp/SelectedSnmpDetailsPanel';
import SnmpConfigModal from '../components/snmp/SnmpConfigModal';
import SnmpInfoTable, { type SnmpInfoRow } from '../components/snmp/SnmpInfoTable';
import { useConfigureSnmp } from '../hooks/useConfigureSnmp';
import { useSnmpInfo } from '../hooks/useSnmpInfo';
import { selectDetailViewState, useDetailSplitViewStore } from '../stores/detailSplitViewStore';

const SNMP_DETAIL_VIEW_ID = 'snmp-service';

const SnmpService = () => {
  const snmpInfoQuery = useSnmpInfo();
  const configureSnmp = useConfigureSnmp();
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const { activeItemId } = useDetailSplitViewStore(
    selectDetailViewState(SNMP_DETAIL_VIEW_ID)
  );
  const setActiveItemId = useDetailSplitViewStore((state) => state.setActiveItemId);

  const rows = useMemo<SnmpInfoRow[]>(() => {
    if (!snmpInfoQuery.data) {
      return [];
    }

    const details = {
      ...snmpInfoQuery.data,
    } as Record<string, unknown>;

    return [
      {
        id: snmpInfoQuery.data.sys_name || 'snmp-service',
        ...snmpInfoQuery.data,
        details,
      },
    ];
  }, [snmpInfoQuery.data]);

  useEffect(() => {
    if (!activeItemId && rows[0]) {
      setActiveItemId(SNMP_DETAIL_VIEW_ID, rows[0].id);
    }
  }, [activeItemId, rows, setActiveItemId]);

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

  return (
    <PageContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={2}
        >
          <Typography variant="h5" sx={{ color: 'var(--color-primary)', fontWeight: 700 }}>
            سرویس SNMP
          </Typography>

          <Button
            onClick={() => setIsConfigModalOpen(true)}
            variant="contained"
            sx={{
              px: 3,
              py: 1.25,
              borderRadius: '3px',
              fontWeight: 700,
              fontSize: '0.95rem',
              background:
                'linear-gradient(135deg, var(--color-primary) 0%, rgba(31, 182, 255, 0.95) 100%)',
              color: 'var(--color-bg)',
              boxShadow: '0 16px 32px -18px rgba(31, 182, 255, 0.85)',
            }}
          >
            تنظیمات
          </Button>
        </Stack>

        <SnmpInfoTable
          detailViewId={SNMP_DETAIL_VIEW_ID}
          rows={rows}
          isLoading={snmpInfoQuery.isLoading}
          error={snmpInfoQuery.error ?? null}
        />

        <SelectedSnmpDetailsPanel items={rows} viewId={SNMP_DETAIL_VIEW_ID} />
      </Box>

      <SnmpConfigModal
        open={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        initialValues={snmpInfoQuery.data}
        onSubmit={handleSubmitConfig}
        isSubmitting={configureSnmp.isPending}
        errorMessage={configureSnmp.error?.message ?? null}
      />
    </PageContainer>
  );
};

export default SnmpService;
