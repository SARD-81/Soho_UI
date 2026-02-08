import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import PageContainer from '../components/PageContainer';
import SnmpConfigModal from '../components/snmp/SnmpConfigModal';
import SnmpOverview from '../components/snmp/SnmpOverview';
import { useConfigureSnmp } from '../hooks/useConfigureSnmp';
import { useSnmpInfo } from '../hooks/useSnmpInfo';

const SnmpService = () => {
  const snmpInfoQuery = useSnmpInfo();
  const configureSnmp = useConfigureSnmp();
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

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
      <Stack spacing={3}>
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: '1px solid var(--color-border)',
            background: 'linear-gradient(135deg, rgba(31, 182, 255, 0.12), transparent)',
          }}
        >
          <CardContent>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              alignItems={{ xs: 'flex-start', md: 'center' }}
              justifyContent="space-between"
              spacing={2}
            >
              <Box>
                <Typography
                  variant="h5"
                  sx={{ color: 'var(--color-primary)', fontWeight: 800 }}
                >
                  سرویس SNMP
                </Typography>
                <Typography
                  sx={{
                    color: 'var(--color-secondary)',
                    mt: 0.5,
                    fontSize: '0.95rem',
                  }}
                >
                  مدیریت وضعیت و تنظیمات سرویس مانیتورینگ شبکه با نمایی سازمانی.
                </Typography>
              </Box>

              <Button
                onClick={() => setIsConfigModalOpen(true)}
                variant="contained"
                sx={{
                  px: 3,
                  py: 1.25,
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  background:
                    'linear-gradient(135deg, var(--color-primary) 0%, rgba(31, 182, 255, 0.95) 100%)',
                  color: 'var(--color-bg)',
                  boxShadow: '0 16px 32px -18px rgba(31, 182, 255, 0.85)',
                }}
              >
                تنظیمات سرویس
              </Button>
            </Stack>
          </CardContent>
        </Card>

        <SnmpOverview
          data={snmpInfoQuery.data}
          isLoading={snmpInfoQuery.isLoading}
          error={snmpInfoQuery.error ?? null}
        />
      </Stack>

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
