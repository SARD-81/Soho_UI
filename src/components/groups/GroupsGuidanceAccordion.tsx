import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import { useMemo } from 'react';

const accordionSx = {
  backgroundColor: 'var(--color-bg)',
  border: '1px solid var(--color-border)',
  boxShadow: '0 12px 32px -18px rgba(0, 0, 0, 0.15)',
  borderRadius: '8px !important',
};

const primaryGroupConclusion = [
  'گروه اصلی هر کاربر مالک گروهی فایل‌های او است و حذفش باعث از بین رفتن مرجع مالکیت می‌شود.',
  'برای حذف یک گروه، باید مطمئن شوید در هیچ اشتراک سامبا استفاده نشده و هیچ کاربری آن را به‌عنوان گروه اصلی یا عضو فعال ندارد.',
  'اگر گروهی گروه اصلی کاربری بود، پیش از حذف باید گروه اصلی کاربر را با دستوراتی مثل "usermod -g" تغییر دهید.',
];

const documentationStyleGuide = [
  'تعاریف کلیدی (گروه اصلی، گروه هم‌نام) را کوتاه و همراه با نمونه خروجی دستورات مانند "id username" بنویسید.',
  'قوانین منع حذف گروه (خطای groupdel برای گروه اصلی) را به‌صورت بولت و با پیام خطا یا شرط لازم شفاف کنید.',
  'مراحل اجرایی را شماره‌گذاری کنید: تغییر گروه اصلی کاربر، اطمینان از خالی بودن گروه، سپس حذف گروه.',
];

const GroupsGuidanceAccordion = () => {
  const sections = useMemo(
    () => [
      { title: 'نتیجه‌گیری', items: primaryGroupConclusion },
      { title: 'راهنمای سبک مستندات', items: documentationStyleGuide },
    ],
    []
  );

  return (
    <Accordion disableGutters sx={accordionSx}>
      <AccordionSummary
        expandIcon={
          <Box
            component="span"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-bg)',
              fontWeight: 700,
              fontSize: '1rem',
            }}
          >
            +
          </Box>
        }
        sx={{ px: 2, py: 1.5 }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
          <Typography sx={{ color: 'var(--color-primary)', fontWeight: 700 }}>
            راهنمای مفاهیم گروه‌های سامبا و لینوکس
          </Typography>
          <Typography sx={{ color: 'var(--color-secondary)', fontSize: '0.95rem' }}>
            نکات کلیدی درباره گروه اصلی، شرایط حذف و سبک مستندسازی را مرور کنید.
          </Typography>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ borderTop: '1px solid var(--color-border)', px: 2.5 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {sections.map(({ title, items }) => (
            <Box key={title}>
              <Typography
                variant="subtitle1"
                sx={{ color: 'var(--color-primary)', fontWeight: 700, mb: 0.5 }}
              >
                {title}
              </Typography>
              <List sx={{ listStyleType: 'disc', pl: 3, m: 0 }}>
                {items.map((item) => (
                  <ListItem key={item} disablePadding sx={{ display: 'list-item' }}>
                    <ListItemText
                      primaryTypographyProps={{
                        sx: { color: 'var(--color-secondary)', fontSize: '0.95rem' },
                      }}
                      primary={item}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          ))}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default GroupsGuidanceAccordion;
