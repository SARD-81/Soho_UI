import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Divider,
  List,
  ListItem,
  Stack,
  Typography,
} from '@mui/material';

interface GroupGuideProps {
  compact?: boolean;
}

const guideSpacingPre = {
  backgroundColor: 'rgba(255, 255, 255, 0.04)',
  borderRadius: 1,
  p: 1,
  direction: 'ltr' as const,
  overflowX: 'auto',
  fontSize: 13,
};

const guideSpacing = {
  container: { pt: 0.5, pb: 1.5 },
  list: { pt: 0 },
};

const GroupGuide = ({ compact = false }: GroupGuideProps) => (
  <Accordion
    defaultExpanded={!compact}
    disableGutters
    sx={{
      backgroundColor: 'transparent',
      boxShadow: 'none',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: 2,
      '&::before': { display: 'none' },
    }}
  >
    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: compact ? 0.5 : 1.5 }}>
      <Typography fontWeight={700} color="var(--color-text)">
        راهنمای مدیریت گروه‌ها در لینوکس و سامبا
      </Typography>
    </AccordionSummary>

    <AccordionDetails sx={{ px: compact ? 1 : 2, ...guideSpacing.container }}>
      <Stack spacing={1.5}>
        <Stack spacing={1}>
          <Typography fontWeight={700}>۱. گروه اصلی (Primary Group) چیست؟</Typography>
          <Typography>
            هر کاربر در لینوکس یک گروه اصلی دارد که هنگام ساخت کاربر تعیین می‌شود و معمولاً همنام
            کاربر است. مالکیت گروهی فایل‌هایی که کاربر ایجاد می‌کند به همین گروه اصلی نسبت داده
            می‌شود.
          </Typography>
          <Box component="pre" sx={guideSpacingPre}>
            sudo useradd -m ali
id ali
# uid=1001(ali) gid=1001(ali) groups=1001(ali)
          </Box>
        </Stack>

        <Divider flexItem />

        <Stack spacing={1}>
          <Typography fontWeight={700}>۲. آیا می‌توان گروه اصلی یک کاربر را حذف کرد؟</Typography>
          <Typography>
            خیر. دستور <code>groupdel</code> اگر روی گروه اصلی کاربر اجرا شود خطا می‌دهد:
          </Typography>
          <Box component="pre" sx={guideSpacingPre}>
            groupdel: cannot remove the primary group of user 'ali'
          </Box>
          <Typography>
            هر فایل باید یک گروه مالک داشته باشد؛ حذف گروه اصلی می‌تواند مالکیت فایل‌ها و دسترسی‌ها را
            مختل کند و به سیستم آسیب بزند.
          </Typography>
        </Stack>

        <Divider flexItem />

        <Stack spacing={1}>
          <Typography fontWeight={700}>۳. حذف کاربر چه اثری روی گروه اصلی دارد؟</Typography>
          <Typography>
            حذف کاربر تنها زمانی گروه اصلی را هم حذف می‌کند که گروه همنام کاربر باشد، عضو دیگری نداشته
            باشد و دستور <code>userdel -r</code> استفاده شود. در غیر این صورت گروه باقی می‌ماند.
          </Typography>
          <List dense={compact} sx={guideSpacing.list}>
            <ListItem sx={{ display: 'list-item', pl: 2 }}>
              <Typography fontWeight={600}>حذف بدون حذف گروه:</Typography>
              <Box component="pre" sx={{ mt: 0.5, ...guideSpacingPre }}>sudo userdel ali</Box>
            </ListItem>
            <ListItem sx={{ display: 'list-item', pl: 2 }}>
              <Typography fontWeight={600}>حذف به همراه گروه (اگر مجاز باشد):</Typography>
              <Box component="pre" sx={{ mt: 0.5, ...guideSpacingPre }}>sudo userdel -r ali</Box>
            </ListItem>
          </List>
        </Stack>

        <Divider flexItem />

        <Stack spacing={1}>
          <Typography fontWeight={700}>۴. تغییر گروه اصلی پیش از حذف گروه</Typography>
          <Typography>
            اگر گروهی گروه اصلی کاربری است و باید حذف شود، ابتدا گروه اصلی کاربر را تغییر دهید و سپس گروه
            قدیمی را حذف کنید:
          </Typography>
          <Box component="pre" sx={guideSpacingPre}>
            sudo usermod -g newgroup y
sudo groupdel x
          </Box>
        </Stack>

        <Divider flexItem />

        <Stack spacing={1}>
          <Typography fontWeight={700}>۵. قواعد حذف گروه در سامبا</Typography>
          <Typography>
            در API سامبا، حذف گروه باید فقط زمانی مجاز باشد که همه شروط زیر برقرار باشد:
          </Typography>
          <List dense={compact} sx={guideSpacing.list}>
            <ListItem sx={{ display: 'list-item', pl: 2 }}>
              گروه، گروه اصلی هیچ کاربری نباشد (در غیر این صورت باید خطای 403 برگردد).
            </ListItem>
            <ListItem sx={{ display: 'list-item', pl: 2 }}>
              گروه در هیچ sharepoint سامبا استفاده نشده باشد.
            </ListItem>
            <ListItem sx={{ display: 'list-item', pl: 2 }}>
              گروه خالی باشد و عضوی نداشته باشد.
            </ListItem>
          </List>
        </Stack>

        <Divider flexItem />

        <Stack spacing={1}>
          <Typography fontWeight={700}>۶. تشخیص گروه اصلی در کد</Typography>
          <Typography>
            با اجرای <code>getent passwd</code> می‌توانید <code>GID</code> هر کاربر را ببینید. اگر GID یک
            کاربر با GID گروه مورد نظر برابر باشد، آن گروه، گروه اصلی آن کاربر است.
          </Typography>
        </Stack>
      </Stack>
    </AccordionDetails>
  </Accordion>
);

export default GroupGuide;
