import { Box, Divider, Stack, Typography } from '@mui/material';

const primaryGroupHighlights = [
  'هر کاربر یک گروه اصلی دارد که معمولاً همنام خودش است و مالکیت گروهی فایل‌هایش را تعیین می‌کند.',
  'شناسه گروه اصلی (GID) در خروجی getent passwd برای هر کاربر دیده می‌شود.',
  'برای حذف یک گروه، باید ابتدا گروه اصلی اعضا را تغییر دهید (usermod -g).',
];

const styleGuidePoints = [
  'حذف گروه اصلی کاربر فعال مجاز نیست و groupdel خطا می‌دهد.',
  'اگر گروهی در حال استفاده در اشتراک‌های سامبا یا عضو دیگری دارد، قبل از حذف باید وابستگی‌ها را برطرف کنید.',
  'استفاده از userdel -r فقط زمانی گروه هم‌نام را حذف می‌کند که گروه عضو دیگری نداشته باشد.',
];

const conclusionSteps = [
  'گروه نباید گروه اصلی هیچ کاربری باشد.',
  'گروه نباید در هیچ sharepoint سامبا استفاده شده باشد.',
  'گروه باید خالی باشد و عضوی نداشته باشد.',
];

const GroupsConceptGuide = () => {
  return (
    <Box
      sx={{
        backgroundColor: 'rgba(31, 182, 255, 0.05)',
        border: '1px solid rgba(31, 182, 255, 0.15)',
        borderRadius: 2,
        p: 2,
        display: 'grid',
        gap: 1.5,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'var(--color-primary)' }}>
          راهنمای سریع گروه‌ها
        </Typography>
        <Typography variant="body2" sx={{ color: 'var(--color-secondary)', fontWeight: 700 }}>
          (DRY &amp; SOC)
        </Typography>
      </Box>

      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5, color: 'var(--color-text)' }}>
          گروه اصلی چیست؟
        </Typography>
        <Stack component="ul" sx={{ pl: 2, m: 0, color: 'var(--color-secondary)', gap: 0.5 }}>
          {primaryGroupHighlights.map((item) => (
            <Typography component="li" key={item} variant="body2" sx={{ lineHeight: 1.6 }}>
              {item}
            </Typography>
          ))}
        </Stack>
      </Box>

      <Divider sx={{ borderColor: 'rgba(31, 182, 255, 0.2)' }} />

      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5, color: 'var(--color-text)' }}>
          راهنمای سبک مدیریت گروه‌ها
        </Typography>
        <Stack component="ul" sx={{ pl: 2, m: 0, color: 'var(--color-secondary)', gap: 0.5 }}>
          {styleGuidePoints.map((item) => (
            <Typography component="li" key={item} variant="body2" sx={{ lineHeight: 1.6 }}>
              {item}
            </Typography>
          ))}
        </Stack>
      </Box>

      <Divider sx={{ borderColor: 'rgba(31, 182, 255, 0.2)' }} />

      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5, color: 'var(--color-text)' }}>
          نتیجه‌گیری عملی برای حذف گروه سامبا
        </Typography>
        <Stack component="ol" sx={{ pl: 2.5, m: 0, color: 'var(--color-secondary)', gap: 0.5 }}>
          {conclusionSteps.map((item) => (
            <Typography component="li" key={item} variant="body2" sx={{ lineHeight: 1.6 }}>
              {item}
            </Typography>
          ))}
        </Stack>
        <Typography variant="caption" sx={{ color: 'var(--color-secondary)', fontWeight: 700, mt: 0.5, display: 'block' }}>
          اگر هر یک از شروط بالا برقرار نباشد، حذف گروه باید مسدود شود (کد 403).
        </Typography>
      </Box>
    </Box>
  );
};

export default GroupsConceptGuide;
