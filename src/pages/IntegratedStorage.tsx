import {
  Box,
  Chip,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

type StorageRow = {
  id: number;
  name: string;
  type: string;
  capacity: string;
  used: string;
  utilization: number;
  availability: string;
  lastSync: string;
  status: 'فعال' | 'نیاز به بررسی' | 'در حال ارتقاء';
};

const storageRows: StorageRow[] = [
  {
    id: 1,
    name: 'SOHO-Primary',
    type: 'NAS',
    capacity: '320 ترابایت',
    used: '214 ترابایت',
    utilization: 67,
    availability: '99.98%',
    lastSync: '1402/09/18',
    status: 'فعال',
  },
  {
    id: 2,
    name: 'SOHO-Archive',
    type: 'Object Storage',
    capacity: '280 ترابایت',
    used: '198 ترابایت',
    utilization: 71,
    availability: '99.95%',
    lastSync: '1402/09/16',
    status: 'فعال',
  },
  {
    id: 3,
    name: 'SOHO-Analytics',
    type: 'SAN',
    capacity: '180 ترابایت',
    used: '142 ترابایت',
    utilization: 79,
    availability: '99.90%',
    lastSync: '1402/09/17',
    status: 'نیاز به بررسی',
  },
  {
    id: 4,
    name: 'SOHO-Edge',
    type: 'Hybrid Cloud',
    capacity: '120 ترابایت',
    used: '64 ترابایت',
    utilization: 53,
    availability: '99.92%',
    lastSync: '1402/09/14',
    status: 'در حال ارتقاء',
  },
];

const statusStyles: Record<StorageRow['status'], { bg: string; color: string }> = {
  فعال: {
    bg: 'rgba(0, 198, 169, 0.18)',
    color: 'var(--color-primary)',
  },
  'نیاز به بررسی': {
    bg: 'rgba(227, 160, 8, 0.18)',
    color: '#e3a008',
  },
  'در حال ارتقاء': {
    bg: 'rgba(35, 167, 213, 0.18)',
    color: 'var(--color-primary-light)',
  },
};

const IntegratedStorage = () => (
  <Box sx={{ p: 3, fontFamily: 'var(--font-vazir)' }}>
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Typography
        variant="h5"
        sx={{ color: 'var(--color-primary)', fontWeight: 700 }}
      >
        فضای یکپارچه
      </Typography>
      <Typography sx={{ color: 'var(--color-secondary)', maxWidth: 520 }}>
        وضعیت خوشه‌های ذخیره‌سازی یکپارچه را در یک نگاه مشاهده کنید و از
        هم‌ترازی منابع و سلامت کلی سامانه مطمئن شوید.
      </Typography>
    </Box>

    <TableContainer
      component={Paper}
      sx={{
        mt: 4,
        borderRadius: 3,
        backgroundColor: 'var(--color-card-bg)',
        border: '1px solid var(--color-input-border)',
        boxShadow: '0 18px 40px -24px rgba(0, 0, 0, 0.35)',
        overflow: 'hidden',
      }}
    >
      <Table sx={{ minWidth: 720 }}>
        <TableHead>
          <TableRow
            sx={{
              background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-light))',
              '& .MuiTableCell-root': {
                color: 'var(--color-bg)',
                fontWeight: 700,
                fontSize: '0.95rem',
                borderBottom: 'none',
              },
            }}
          >
            <TableCell align="right">نام خوشه</TableCell>
            <TableCell align="right">نوع</TableCell>
            <TableCell align="right">ظرفیت</TableCell>
            <TableCell align="right">مصرف فعلی</TableCell>
            <TableCell align="right">شاخص بهره‌وری</TableCell>
            <TableCell align="right">دسترس‌پذیری</TableCell>
            <TableCell align="right">آخرین همگام‌سازی</TableCell>
            <TableCell align="center">وضعیت</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {storageRows.map((row) => (
            <TableRow
              key={row.id}
              sx={{
                '&:last-of-type .MuiTableCell-root': { borderBottom: 'none' },
                '& .MuiTableCell-root': {
                  borderBottom: '1px solid var(--color-input-border)',
                  fontSize: '0.92rem',
                },
                '&:hover': {
                  backgroundColor: 'rgba(0, 198, 169, 0.08)',
                },
              }}
            >
              <TableCell align="right">
                <Typography sx={{ fontWeight: 700, color: 'var(--color-text)' }}>
                  {row.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'var(--color-secondary)' }}>
                  زیرساخت مرکزی
                </Typography>
              </TableCell>
              <TableCell align="right" sx={{ color: 'var(--color-text)' }}>
                {row.type}
              </TableCell>
              <TableCell align="right">
                <Typography sx={{ fontWeight: 600, color: 'var(--color-text)' }}>
                  {row.capacity}
                </Typography>
              </TableCell>
              <TableCell align="right" sx={{ minWidth: 180 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={row.utilization}
                    sx={{
                      height: 8,
                      borderRadius: 999,
                      backgroundColor: 'rgba(0, 198, 169, 0.12)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 999,
                        backgroundColor: 'var(--color-primary)',
                      },
                    }}
                  />
                  <Typography variant="body2" sx={{ color: 'var(--color-text)' }}>
                    {row.used}
                    <Typography component="span" sx={{ mx: 0.5, color: 'var(--color-secondary)' }}>
                      از
                    </Typography>
                    {row.capacity}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell align="right">
                <Typography sx={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                  {row.utilization}%
                </Typography>
                <Typography variant="caption" sx={{ color: 'var(--color-secondary)' }}>
                  نسبت استفاده به ظرفیت
                </Typography>
              </TableCell>
              <TableCell align="right" sx={{ color: 'var(--color-text)' }}>
                {row.availability}
              </TableCell>
              <TableCell align="right" sx={{ color: 'var(--color-text)' }}>
                {row.lastSync}
              </TableCell>
              <TableCell align="center">
                <Chip
                  label={row.status}
                  sx={{
                    px: 1.5,
                    fontWeight: 600,
                    backgroundColor: statusStyles[row.status].bg,
                    color: statusStyles[row.status].color,
                    borderRadius: 2,
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
);

export default IntegratedStorage;
