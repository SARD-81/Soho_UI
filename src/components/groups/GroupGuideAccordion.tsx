import { Accordion, AccordionDetails, AccordionSummary, Box, Divider, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { MdExpandMore, MdInfoOutline } from 'react-icons/md';

interface GroupGuideAccordionProps {
  defaultExpanded?: boolean;
  dense?: boolean;
  sx?: SxProps<Theme>;
}

const listTypographySx = { color: 'var(--color-secondary)', lineHeight: 1.8 } as const;

const GroupGuideAccordion = ({ defaultExpanded = false, dense = false, sx }: GroupGuideAccordionProps) => {
  const titleVariant = dense ? 'subtitle2' : 'subtitle1';
  const bodyVariant = dense ? 'body2' : 'body1';

  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      sx={{
        backgroundColor: 'rgba(31, 182, 255, 0.04)',
        border: '1px solid rgba(31, 182, 255, 0.2)',
        borderRadius: 2,
        boxShadow: 'none',
        '&:before': { display: 'none' },
        ...sx,
      }}
    >
      <AccordionSummary
        expandIcon={<MdExpandMore size={20} color="var(--color-primary)" />}
        sx={{
          gap: 1,
          '& .MuiAccordionSummary-content': { display: 'flex', alignItems: 'center', gap: 1 },
        }}
      >
        <MdInfoOutline size={20} color="var(--color-primary)" />
        <Typography variant={titleVariant} sx={{ fontWeight: 800, color: 'var(--color-primary)' }}>
          راهنمای گروه اصلی لینوکس و سامبا
        </Typography>
      </AccordionSummary>

      <AccordionDetails sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant={titleVariant} sx={{ fontWeight: 800, color: 'var(--color-text)' }}>
            ✅ ۱. گروه اصلی (Primary Group) چیست؟
          </Typography>
          <Typography variant={bodyVariant} sx={listTypographySx}>
            همه کاربران در لینوکس یک گروه اصلی دارند. این گروه معمولاً همنام با کاربر است و هنگام ایجاد فایل یا
            دایرکتوری توسط کاربر، گروه مالک فایل همان گروه اصلی کاربر خواهد بود.
          </Typography>
          <Box component="pre" sx={{
            backgroundColor: 'rgba(31, 182, 255, 0.06)',
            border: '1px solid rgba(31, 182, 255, 0.12)',
            borderRadius: 1.5,
            p: 1.5,
            fontFamily: 'monospace',
            color: 'var(--color-text)',
            overflowX: 'auto',
            whiteSpace: 'pre-wrap',
          }}>
{`# ایجاد کاربر
sudo useradd -m ali

# بررسی گروه اصلی
id ali
# خروجی: uid=1001(ali) gid=1001(ali) groups=1001(ali)`}
          </Box>
          <Typography variant={bodyVariant} sx={listTypographySx}>
            gid=1001(ali) یعنی گروه اصلی ali است.
          </Typography>
        </Box>

        <Divider />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant={titleVariant} sx={{ fontWeight: 800, color: 'var(--color-text)' }}>
            ✅ ۲. آیا می‌توان گروه اصلی یک کاربر را حذف کرد؟
          </Typography>
          <Typography variant={bodyVariant} sx={listTypographySx}>
            ❌ خیر. دستور groupdel در صورتی که گروه مورد نظر گروه اصلی یک کاربر فعال باشد خطای «cannot remove the primary
            group of user» می‌دهد و حذف نمی‌شود تا از خرابی دسترسی‌ها جلوگیری شود.
          </Typography>
        </Box>

        <Divider />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant={titleVariant} sx={{ fontWeight: 800, color: 'var(--color-text)' }}>
            ✅ ۳. آیا می‌توان یک کاربر را حذف کرد؟
          </Typography>
          <Typography variant={bodyVariant} sx={listTypographySx}>
            بله، به شرطی که کاربر در حال لاگین نباشد. حذف کاربر به‌صورت خودکار گروه اصلی‌اش را حذف نمی‌کند مگر اینکه
            گروه هم‌نام باشد، عضو دیگری نداشته باشد و از فلگ -r در userdel استفاده شود.
          </Typography>
          <Typography variant={bodyVariant} sx={{ ...listTypographySx, fontWeight: 700 }}>
            مثال‌ها:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant={bodyVariant} sx={listTypographySx}>
              الف) userdel ali → کاربر حذف می‌شود اما گروه ali باقی می‌ماند.
            </Typography>
            <Typography variant={bodyVariant} sx={listTypographySx}>
              ب) userdel -r ali → اگر گروه ali فقط گروه اصلی خود کاربر باشد و عضو دیگری نداشته باشد، گروه هم حذف می‌شود.
            </Typography>
            <Typography variant={bodyVariant} sx={listTypographySx}>
              ج) اگر گروه ali عضو دیگری داشته باشد، با userdel -r تنها کاربر ali حذف می‌شود و گروه باقی می‌ماند.
            </Typography>
          </Box>
        </Box>

        <Divider />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant={titleVariant} sx={{ fontWeight: 800, color: 'var(--color-text)' }}>
            ✅ ۴. چگونه می‌توان گروه اصلی را تغییر داد؟
          </Typography>
          <Typography variant={bodyVariant} sx={listTypographySx}>
            برای حذف گروهی که گروه اصلی کاربر دیگری است، ابتدا گروه اصلی کاربر را با usermod -g به گروه جدید تغییر دهید و
            سپس groupdel را روی گروه قدیمی اجرا کنید.
          </Typography>
        </Box>

        <Divider />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant={titleVariant} sx={{ fontWeight: 800, color: 'var(--color-text)' }}>
            ✅ ۵. نتیجه‌گیری برای سیستم شما (Samba + لینوکس)
          </Typography>
          <Typography variant={bodyVariant} sx={listTypographySx}>
            هنگام حذف گروه سامبا باید سه شرط را بررسی کنید: (۱) گروه نباید گروه اصلی هیچ کاربری باشد، (۲) در هیچ sharepoint
            سامبا استفاده نشده باشد، و (۳) گروه خالی باشد. در غیر این صورت حذف مجاز نیست و باید خطای مناسب (مثلاً 403)
            بازگردانده شود.
          </Typography>
        </Box>

        <Divider />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant={titleVariant} sx={{ fontWeight: 800, color: 'var(--color-text)' }}>
            ✅ ۶. چک کردن گروه اصلی (در کد)
          </Typography>
          <Typography variant={bodyVariant} sx={listTypographySx}>
            با اجرای getent passwd می‌توانید GID هر کاربر را ببینید. اگر GID یکی از کاربران برابر با GID گروه مدنظر باشد، آن
            گروه گروه اصلی آن کاربر است و نباید حذف شود.
          </Typography>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default GroupGuideAccordion;
