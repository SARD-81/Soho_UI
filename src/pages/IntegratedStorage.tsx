import {
  Box,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { createCardSx } from '../components/cardStyles';
import { formatBytes } from '../utils/formatters';

type StorageStatus = 'healthy' | 'warning' | 'offline';

type StorageRow = {
  id: string;
  name: string;
  location: string;
  type: string;
  total: number;
  used: number;
  status: StorageStatus;
};

const storageRows: StorageRow[] = [
  {
    id: 'primary-nas',
    name: 'NAS مرکزی',
    location: 'دیتاسنتر تهران',
    type: 'SSD + HDD',
    total: 48 * 1024 ** 4,
    used: 33.2 * 1024 ** 4,
    status: 'healthy',
  },
  {
    id: 'analytics-tier',
    name: 'پلتفرم تحلیلی',
    location: 'کلاستر شیراز',
    type: 'NVMe',
    total: 12 * 1024 ** 4,
    used: 7.6 * 1024 ** 4,
    status: 'warning',
  },
  {
    id: 'archive',
    name: 'آرشیو بلندمدت',
    location: 'مرکز پشتیبان تبریز',
    type: 'SAS HDD',
    total: 80 * 1024 ** 4,
    used: 51.4 * 1024 ** 4,
    status: 'healthy',
  },
  {
    id: 'edge',
    name: 'فضای لبه‌ای',
    location: 'سایت اصفهان',
    type: 'Hybrid Flash',
    total: 6 * 1024 ** 4,
    used: 5.1 * 1024 ** 4,
    status: 'offline',
  },
];

const statusLabels: Record<StorageStatus, string> = {
  healthy: 'فعال',
  warning: 'نیاز به بررسی',
  offline: 'آفلاین',
};

const IntegratedStorage = () => {
  const theme = useTheme();
  const cardSx = createCardSx(theme);

  const borderColor =
    theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.12)'
      : 'rgba(0, 0, 0, 0.08)';
  const headerBackground = alpha(theme.palette.primary.main, 0.12);
  const headerBorder = alpha(theme.palette.primary.main, 0.35);
  const rowHoverBackground =
    theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(0, 0, 0, 0.03)';

  const resolveStatusColor = (status: StorageStatus) => {
    switch (status) {
      case 'healthy':
        return theme.palette.primary.main;
      case 'warning':
        return 'var(--color-secondary)';
      case 'offline':
        return 'var(--color-error)';
      default:
        return theme.palette.text.primary;
    }
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        fontFamily: 'var(--font-vazir)',
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      <Typography variant="h5" sx={{ color: 'var(--color-primary)', fontWeight: 700 }}>
        فضای یکپارچه
      </Typography>

      <Box sx={cardSx}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
        >
          <Typography
            variant="h6"
            sx={{
              color: 'var(--color-bg-primary)',
              fontWeight: 700,
            }}
          >
            وضعیت ذخیره‌سازهای یکپارچه
          </Typography>
          <Chip
            label="به‌روزرسانی لحظه‌ای"
            variant="outlined"
            sx={{
              borderColor: 'var(--color-primary)',
              color: 'var(--color-primary)',
              fontWeight: 500,
            }}
          />
        </Stack>

        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            background: 'transparent',
            borderRadius: 3,
            border: `1px solid ${borderColor}`,
            overflow: 'hidden',
          }}
        >
          <Table sx={{ minWidth: 720 }}>
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: headerBackground,
                  '& th': {
                    borderBottom: `1px solid ${headerBorder}`,
                    color: 'var(--color-bg-primary)',
                    fontWeight: 600,
                    fontSize: { xs: '0.85rem', sm: '0.9rem' },
                    py: 2,
                  },
                }}
              >
                <TableCell>فضای ذخیره‌سازی</TableCell>
                <TableCell>ظرفیت کل</TableCell>
                <TableCell>مصرف‌شده</TableCell>
                <TableCell>فضای آزاد</TableCell>
                <TableCell>درصد استفاده</TableCell>
                <TableCell align="center">وضعیت</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {storageRows.map((row) => {
                const usedPercentRaw =
                  row.total > 0 ? (row.used / row.total) * 100 : 0;
                const usedPercent = Math.max(0, Math.min(usedPercentRaw, 100));
                const freeSpace = Math.max(row.total - row.used, 0);

                return (
                  <TableRow
                    key={row.id}
                    hover
                    sx={{
                      transition: 'background-color 0.2s ease',
                      '&:hover': {
                        backgroundColor: rowHoverBackground,
                      },
                      '& td': {
                        borderBottom: `1px solid ${borderColor}`,
                        fontSize: '0.9rem',
                        py: 2,
                      },
                    }}
                  >
                    <TableCell scope="row" sx={{ minWidth: 200 }}>
                      <Stack spacing={0.5}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {row.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: 'var(--color-secondary)', fontWeight: 500 }}
                        >
                          {row.location}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary' }}
                        >
                          نوع رسانه: {row.type}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{formatBytes(row.total, { locale: 'fa-IR' })}</TableCell>
                    <TableCell>
                      <Stack spacing={1}>
                        <Typography>{formatBytes(row.used, { locale: 'fa-IR' })}</Typography>
                        <LinearProgress
                          variant="determinate"
                          value={usedPercent}
                          sx={{
                            height: 8,
                            borderRadius: 999,
                            bgcolor: alpha(theme.palette.primary.main, 0.12),
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 999,
                              backgroundColor: resolveStatusColor(row.status),
                            },
                          }}
                        />
                      </Stack>
                    </TableCell>
                    <TableCell>{formatBytes(freeSpace, { locale: 'fa-IR' })}</TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600 }}>
                        {new Intl.NumberFormat('fa-IR', {
                          maximumFractionDigits: 0,
                        }).format(usedPercent)}
                        ٪
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={statusLabels[row.status]}
                        sx={{
                          bgcolor: alpha(resolveStatusColor(row.status), 0.12),
                          color: resolveStatusColor(row.status),
                          fontWeight: 600,
                          borderRadius: 2,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default IntegratedStorage;
