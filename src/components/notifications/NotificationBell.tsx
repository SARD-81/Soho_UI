import {
  Badge,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Popover,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useMemo, useState } from 'react';
import type { MouseEvent } from 'react';
import { MdClose, MdDeleteOutline, MdDone, MdNotificationsNone } from 'react-icons/md';
import type { LocalNotification, LocalNotificationSeverity } from '../../@types/notification';
import { useLocalNotifications } from '../../hooks/useLocalNotifications';

type NotificationBellProps = {
  userKey?: string;
  maxItems?: number;
};

const severityLabelByType: Record<LocalNotificationSeverity, string> = {
  info: 'اطلاع‌رسانی',
  warning: 'هشدار',
  critical: 'بحرانی',
};

const formatNotificationDate = (dateValue: string) =>
  new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(dateValue));

const NotificationBell = ({ userKey, maxItems = 10 }: NotificationBellProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification } =
    useLocalNotifications(userKey);

  const visibleNotifications = useMemo(
    () => notifications.slice(0, maxItems),
    [maxItems, notifications],
  );
  const isOpen = Boolean(anchorEl);

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getSeverityColor = (severity: LocalNotification['severity']) => {
    if (severity === 'critical') {
      return 'error';
    }

    if (severity === 'warning') {
      return 'warning';
    }

    return 'default';
  };

  return (
    <>
      <IconButton
        aria-label="اعلان‌ها"
        aria-controls={isOpen ? 'notification-popover' : undefined}
        aria-haspopup="true"
        onClick={handleOpen}
        size="small"
        sx={{ color: 'var(--color-bg-primary)' }}
      >
        <Badge badgeContent={unreadCount} color="error" max={99} overlap="circular">
          <MdNotificationsNone size={24} />
        </Badge>
      </IconButton>
      <Popover
        id="notification-popover"
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: (theme) => ({
            mt: 1.5,
            width: { xs: 'calc(100vw - 32px)', sm: 420 },
            maxWidth: '100%',
            borderRadius: 2,
            direction: 'rtl',
            border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
            backgroundColor:
              theme.palette.mode === 'dark' ? alpha('#121212', 0.96) : alpha('#ffffff', 0.98),
            backdropFilter: 'blur(12px)',
          }),
        }}
      >
        <Box sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'var(--color-text)' }}>
                اعلان‌ها
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {unreadCount > 0 ? `${unreadCount} اعلان خوانده‌نشده` : 'همه اعلان‌ها خوانده شده‌اند'}
              </Typography>
            </Box>
            <Button size="small" disabled={unreadCount === 0} onClick={markAllAsRead}>
              خواندن همه
            </Button>
          </Stack>
        </Box>
        <Divider />
        {visibleNotifications.length === 0 ? (
          <Typography sx={{ px: 2, py: 4, textAlign: 'center', color: 'text.secondary' }}>
            اعلانی برای نمایش وجود ندارد.
          </Typography>
        ) : (
          <List disablePadding sx={{ maxHeight: 460, overflowY: 'auto' }}>
            {visibleNotifications.map((notification) => {
              const isUnread = notification.readAt === null;
              const isCritical = notification.severity === 'critical';

              return (
                <ListItem
                  key={notification.id}
                  alignItems="flex-start"
                  sx={(theme) => ({
                    gap: 1,
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.55)}`,
                    backgroundColor: isUnread ? alpha(theme.palette.primary.main, 0.06) : 'transparent',
                    borderRight: `4px solid ${
                      isCritical ? theme.palette.error.main : theme.palette.warning.main
                    }`,
                  })}
                  secondaryAction={
                    <Stack direction="row" spacing={0.5}>
                      <IconButton
                        edge="end"
                        aria-label="خوانده شد"
                        disabled={!isUnread}
                        size="small"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <MdDone />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="حذف اعلان"
                        size="small"
                        onClick={() => clearNotification(notification.id)}
                      >
                        <MdDeleteOutline />
                      </IconButton>
                    </Stack>
                  }
                >
                  <ListItemText
                    sx={{ pr: 7, my: 0 }}
                    primary={
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.75 }}>
                        <Chip
                          size="small"
                          color={getSeverityColor(notification.severity)}
                          label={severityLabelByType[notification.severity]}
                          variant={isCritical ? 'filled' : 'outlined'}
                          sx={{ fontWeight: isCritical ? 800 : 600 }}
                        />
                        {isUnread ? (
                          <Chip size="small" label="جدید" color="primary" variant="outlined" />
                        ) : null}
                      </Stack>
                    }
                    secondary={
                      <Box component="span">
                        <Typography
                          component="span"
                          display="block"
                          sx={{ fontWeight: isCritical ? 800 : 700, color: 'var(--color-text)' }}
                        >
                          {notification.title}
                        </Typography>
                        <Typography component="span" display="block" variant="body2" color="text.secondary">
                          {notification.message}
                        </Typography>
                        <Typography component="span" display="block" variant="caption" color="text.secondary" sx={{ mt: 0.75 }}>
                          {formatNotificationDate(notification.updatedAt)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
          <Button size="small" startIcon={<MdClose />} onClick={handleClose}>
            بستن
          </Button>
        </Box>
      </Popover>
    </>
  );
};

export default NotificationBell;
