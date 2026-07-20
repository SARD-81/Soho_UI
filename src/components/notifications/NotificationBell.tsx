import {
  Badge,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  List,
  ListItem,
  Popover,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha, type Theme } from '@mui/material/styles';
import { useMemo, useState } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import {
  MdClose,
  MdDeleteOutline,
  MdDone,
  MdDoneAll,
  MdErrorOutline,
  MdInfoOutline,
  MdNotificationsNone,
  MdWarningAmber,
} from 'react-icons/md';
import type { LocalNotificationSeverity } from '../../@types/notification';
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

const severityIconByType: Record<LocalNotificationSeverity, ReactNode> = {
  info: <MdInfoOutline size={21} />,
  warning: <MdWarningAmber size={21} />,
  critical: <MdErrorOutline size={21} />,
};

const formatNotificationDate = (dateValue: string) =>
  new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(dateValue));

const getSeverityPalette = (
  severity: LocalNotificationSeverity,
  theme: Theme
) => {
  const main =
    severity === 'critical'
      ? theme.palette.error.main
      : severity === 'warning'
        ? theme.palette.warning.main
        : theme.palette.info.main;

  return {
    main,
    soft: alpha(main, severity === 'critical' ? 0.12 : 0.09),
    border: alpha(main, 0.3),
  };
};

const NotificationBell = ({
  userKey,
  maxItems = 10,
}: NotificationBellProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
  } = useLocalNotifications(userKey);

  const visibleNotifications = useMemo(
    () => notifications.slice(0, maxItems),
    [maxItems, notifications]
  );
  const isOpen = Boolean(anchorEl);

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip title="اعلان‌ها">
        <IconButton
          aria-label="اعلان‌ها"
          aria-controls={isOpen ? 'notification-popover' : undefined}
          aria-haspopup="true"
          onClick={handleOpen}
          size="small"
          sx={{ color: 'var(--color-text)' }}
        >
          <Badge
            badgeContent={unreadCount}
            color="error"
            max={99}
            overlap="circular"
          >
            <MdNotificationsNone size={24} />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        id="notification-popover"
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          dir: 'rtl',
          sx: (theme) => ({
            mt: 1.5,
            width: { xs: 'calc(100vw - 24px)', sm: 440 },
            maxWidth: '100%',
            borderRadius: '16px',
            overflow: 'hidden',
            direction: 'rtl',
            textAlign: 'right',
            border: `1px solid ${alpha(theme.palette.divider, 0.66)}`,
            background:
              theme.palette.mode === 'dark'
                ? `linear-gradient(160deg, ${alpha('#111827', 0.985)}, ${alpha('#0b1220', 0.97)})`
                : `linear-gradient(160deg, ${alpha('#ffffff', 0.99)}, ${alpha('#f8fafc', 0.98)})`,
            backdropFilter: 'blur(16px)',
            boxShadow: `0 24px 60px ${alpha(
              theme.palette.common.black,
              0.28
            )}`,
          }),
        }}
      >
        <Box
          dir="rtl"
          sx={(theme) => ({
            p: 2,
            direction: 'rtl',
            textAlign: 'right',
            background: `linear-gradient(135deg, ${alpha(
              theme.palette.primary.main,
              0.12
            )}, transparent 70%)`,
          })}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            gap={1}
            sx={{ direction: 'rtl', textAlign: 'right' }}
          >
            <Box sx={{ minWidth: 0, textAlign: 'right' }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 900,
                  color: 'var(--color-text)',
                  direction: 'rtl',
                  textAlign: 'right',
                }}
              >
                اعلان‌ها
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  direction: 'rtl',
                  textAlign: 'right',
                  display: 'block',
                  mt: 0.25,
                }}
              >
                {unreadCount > 0
                  ? `${unreadCount.toLocaleString('fa-IR')} اعلان خوانده‌نشده`
                  : 'همه اعلان‌ها خوانده شده‌اند'}
              </Typography>
            </Box>

            <Button
              size="small"
              disabled={unreadCount === 0}
              onClick={markAllAsRead}
              startIcon={<MdDoneAll />}
              sx={{
                fontWeight: 800,
                flexShrink: 0,
                direction: 'rtl',
                textAlign: 'right',
              }}
            >
              خواندن همه
            </Button>
          </Stack>
        </Box>

        <Divider />

        {visibleNotifications.length === 0 ? (
          <Box
            dir="rtl"
            sx={{
              px: 2,
              py: 5,
              display: 'grid',
              gap: 1,
              direction: 'rtl',
              textAlign: 'right',
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '14px',
                display: 'grid',
                placeItems: 'center',
                justifySelf: 'center',
                color: 'var(--color-primary)',
                backgroundColor:
                  'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                border:
                  '1px solid color-mix(in srgb, var(--color-primary) 24%, transparent)',
              }}
            >
              <MdNotificationsNone size={25} />
            </Box>
            <Typography
              sx={{
                color: 'text.secondary',
                direction: 'rtl',
                textAlign: 'right',
              }}
            >
              اعلانی برای نمایش وجود ندارد.
            </Typography>
          </Box>
        ) : (
          <List
            disablePadding
            dir="rtl"
            sx={{
              maxHeight: 470,
              overflowY: 'auto',
              p: 1.25,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              direction: 'rtl',
              textAlign: 'right',
            }}
          >
            {visibleNotifications.map((notification) => {
              const isUnread = notification.readAt === null;

              return (
                <ListItem
                  key={notification.id}
                  disableGutters
                  dir="rtl"
                  sx={(theme) => {
                    const palette = getSeverityPalette(
                      notification.severity,
                      theme
                    );

                    return {
                      display: 'block',
                      p: 1.35,
                      direction: 'rtl',
                      textAlign: 'right',
                      borderRadius: '12px',
                      border: `1px solid ${palette.border}`,
                      borderInlineStart: `4px solid ${palette.main}`,
                      backgroundColor: isUnread
                        ? palette.soft
                        : alpha(theme.palette.background.paper, 0.34),
                      transition:
                        'transform 0.18s ease, background-color 0.18s ease',
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        backgroundColor: alpha(palette.main, 0.12),
                      },
                    };
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="flex-start"
                    gap={1.1}
                    sx={{ direction: 'rtl', textAlign: 'right' }}
                  >
                    <Box
                      sx={(theme) => {
                        const palette = getSeverityPalette(
                          notification.severity,
                          theme
                        );

                        return {
                          width: 36,
                          height: 36,
                          borderRadius: '10px',
                          flex: '0 0 auto',
                          display: 'grid',
                          placeItems: 'center',
                          color: palette.main,
                          backgroundColor: palette.soft,
                          border: `1px solid ${palette.border}`,
                        };
                      }}
                    >
                      {severityIconByType[notification.severity]}
                    </Box>

                    <Box
                      dir="rtl"
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        direction: 'rtl',
                        textAlign: 'right',
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        gap={0.75}
                        flexWrap="wrap"
                        sx={{
                          mb: 0.65,
                          direction: 'rtl',
                          justifyContent: 'flex-start',
                        }}
                      >
                        <Chip
                          size="small"
                          label={severityLabelByType[notification.severity]}
                          color={
                            notification.severity === 'critical'
                              ? 'error'
                              : notification.severity === 'warning'
                                ? 'warning'
                                : 'info'
                          }
                          variant={
                            notification.severity === 'critical'
                              ? 'filled'
                              : 'outlined'
                          }
                          sx={{ fontWeight: 800, direction: 'rtl' }}
                        />
                        {isUnread ? (
                          <Chip
                            size="small"
                            label="جدید"
                            color="primary"
                            variant="outlined"
                            sx={{ direction: 'rtl' }}
                          />
                        ) : null}
                      </Stack>

                      <Typography
                        sx={{
                          fontWeight:
                            notification.severity === 'critical' ? 900 : 800,
                          color: 'var(--color-text)',
                          direction: 'rtl',
                          textAlign: 'right',
                          unicodeBidi: 'plaintext',
                          lineHeight: 1.75,
                          overflowWrap: 'anywhere',
                        }}
                      >
                        {notification.title}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          mt: 0.35,
                          direction: 'rtl',
                          textAlign: 'right',
                          unicodeBidi: 'plaintext',
                          lineHeight: 1.9,
                          overflowWrap: 'anywhere',
                        }}
                      >
                        {notification.message}
                      </Typography>

                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        gap={1}
                        sx={{ mt: 0.9, direction: 'rtl' }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                            direction: 'rtl',
                            textAlign: 'right',
                          }}
                        >
                          {formatNotificationDate(notification.updatedAt)}
                        </Typography>

                        <Stack
                          direction="row"
                          spacing={0.35}
                          sx={{ direction: 'rtl' }}
                        >
                          <Tooltip title="خوانده شد">
                            <span>
                              <IconButton
                                aria-label="علامت‌گذاری اعلان به‌عنوان خوانده‌شده"
                                disabled={!isUnread}
                                size="small"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <MdDone />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="حذف اعلان">
                            <IconButton
                              aria-label="حذف اعلان"
                              size="small"
                              onClick={() => clearNotification(notification.id)}
                            >
                              <MdDeleteOutline />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Stack>
                    </Box>
                  </Stack>
                </ListItem>
              );
            })}
          </List>
        )}

        <Divider />
        <Box
          dir="rtl"
          sx={{
            display: 'flex',
            justifyContent: 'flex-start',
            p: 1,
            direction: 'rtl',
            textAlign: 'right',
          }}
        >
          <Button
            size="small"
            startIcon={<MdClose />}
            onClick={handleClose}
            sx={{ direction: 'rtl', textAlign: 'right' }}
          >
            بستن
          </Button>
        </Box>
      </Popover>
    </>
  );
};

export default NotificationBell;
