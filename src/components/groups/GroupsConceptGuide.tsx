import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Stack,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const primaryGroupHighlights = [
  'هر کاربر دقیقاً یک گروه اصلی دارد (اغلب همنام کاربر) که مالکیت گروهی فایل‌ها را تعیین می‌کند.',
  'شناسه گروه اصلی در فیلد GID خروجی getent passwd دیده می‌شود.',
  'برای حذف گروهِ نقش-اصلی، ابتدا گروه اصلی اعضا را با usermod -g تغییر دهید.',
];

const styleGuidePoints = [
  'groupdel هرگز گروه اصلی یک کاربر فعال را حذف نمی‌کند.',
  'گروهی که در sharepoint سامبا استفاده شده یا عضو دیگری دارد، قبل از حذف باید آزاد شود.',
  'userdel -r فقط وقتی گروه هم‌نام را حذف می‌کند که هیچ عضو دیگری نداشته باشد.',
];

const conclusionSteps = [
  'گروه نباید گروه اصلی هیچ کاربری باشد.',
  'گروه در هیچ sharepoint سامبا استفاده نشده باشد.',
  'گروه خالی باشد (عضو ندارد).',
];

const GroupsConceptGuide = () => {
  return (
    <Accordion
      defaultExpanded
      sx={{
        backgroundColor: 'rgba(31, 182, 255, 0.05)',
        border: '1px solid rgba(31, 182, 255, 0.15)',
        borderRadius: 2,
        boxShadow: 'none',
        '&:before': { display: 'none' },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: 'var(--color-primary)' }} />}
        sx={{
          px: 2,
          py: 1.25,
          '& .MuiAccordionSummary-content': {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 1,
          },
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'var(--color-primary)' }}>
          راهنمای سریع گروه‌ها
        </Typography>
        <Typography variant="body2" sx={{ color: 'var(--color-secondary)', fontWeight: 700 }}>
          جمع‌بندی فشرده (DRY & SOC)
        </Typography>
      </AccordionSummary>

      <AccordionDetails sx={{ display: 'grid', gap: 1.5, px: 2, pb: 2 }}>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5, color: 'var(--color-text)' }}>
            گروه اصلی در یک نگاه
          </Typography>
          <Stack component="ul" sx={{ pl: 2, m: 0, color: 'var(--color-secondary)', gap: 0.5 }}>
            {primaryGroupHighlights.map((item) => (
              <Typography component="li" key={item} variant="body2" sx={{ lineHeight: 1.6 }}>
                {item}
              </Typography>
            ))}
          </Stack>
        </Box>

        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5, color: 'var(--color-text)' }}>
            سبک مدیریت ایمن
          </Typography>
          <Stack component="ul" sx={{ pl: 2, m: 0, color: 'var(--color-secondary)', gap: 0.5 }}>
            {styleGuidePoints.map((item) => (
              <Typography component="li" key={item} variant="body2" sx={{ lineHeight: 1.6 }}>
                {item}
              </Typography>
            ))}
          </Stack>
        </Box>

        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5, color: 'var(--color-text)' }}>
            چک‌لیست حذف گروه سامبا
          </Typography>
          <Stack component="ol" sx={{ pl: 2.5, m: 0, color: 'var(--color-secondary)', gap: 0.5 }}>
            {conclusionSteps.map((item) => (
              <Typography component="li" key={item} variant="body2" sx={{ lineHeight: 1.6 }}>
                {item}
              </Typography>
            ))}
          </Stack>
          <Typography
            variant="caption"
            sx={{ color: 'var(--color-secondary)', fontWeight: 700, mt: 0.5, display: 'block' }}
          >
            اگر هر شرط برقرار نباشد، حذف باید مسدود شود (کد 403).
          </Typography>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default GroupsConceptGuide;
