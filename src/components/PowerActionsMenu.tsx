import {
  Box,
  Button,
  CircularProgress,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material';
import React, { useMemo, useState } from 'react';
import { MdOutlineSettings, MdPowerSettingsNew, MdRestartAlt } from 'react-icons/md';
import { LuMoon, LuSun } from 'react-icons/lu';
import type { PowerAction } from '../hooks/usePowerAction';
import { useTheme as useAppTheme } from '../contexts/ThemeContext';

type PowerActionsMenuProps = {
  onPowerActionRequest: (action: PowerAction) => void;
  isPowerActionPending: boolean;
  activePowerAction: PowerAction | null;
  countdownAction: PowerAction | null;
};

const buttonSx = {
  background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))',
  color: 'var(--color-bg-primary)',
  borderRadius: '10px',
  textTransform: 'none' as const,
  fontWeight: 600,
  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.18)',
  px: 2.5,
  py: 1.25,
  '&:hover': {
    background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary))',
    boxShadow: '0 16px 36px rgba(0, 0, 0, 0.2)',
  },
};

const menuPaperSx = {
  backgroundColor: 'var(--color-card-bg)',
  borderRadius: '16px',
  boxShadow: '0 24px 48px rgba(0, 0, 0, 0.2)',
  mt: 1.5,
  minWidth: 260,
  py: 1,
  border: '1px solid rgba(255, 255, 255, 0.08)',
};

const listItemSx = {
  borderRadius: '10px',
  mx: 1,
  my: 0.5,
  '&:hover': {
    backgroundColor: 'var(--color-input-bg)',
  },
  '&.Mui-disabled': {
    opacity: 0.6,
  },
};

const iconContainerSx = {
  alignItems: 'center',
  background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))',
  borderRadius: '12px',
  boxShadow: '0 10px 24px rgba(35, 167, 213, 0.25)',
  color: '#fff',
  display: 'flex',
  height: 36,
  justifyContent: 'center',
  width: 36,
};

const highlightIconContainerSx = {
  ...iconContainerSx,
  background: 'linear-gradient(135deg, #f97316, var(--color-secondary))',
  boxShadow: '0 10px 24px rgba(249, 115, 22, 0.35)',
};

const PowerActionsMenu: React.FC<PowerActionsMenuProps> = ({
  onPowerActionRequest,
  isPowerActionPending,
  activePowerAction,
  countdownAction,
}) => {
  const { isDark, toggleTheme } = useAppTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const isPowerActionDisabled = isPowerActionPending || Boolean(countdownAction);

  const actionItems = useMemo(
    () => [
      {
        action: 'restart' as const,
        label: 'راه‌اندازی مجدد سیستم',
        icon: <MdRestartAlt size={20} />,
        iconSx: iconContainerSx,
      },
      {
        action: 'shutdown' as const,
        label: 'خاموش کردن سیستم',
        icon: <MdPowerSettingsNew size={20} />,
        iconSx: highlightIconContainerSx,
      },
    ],
    []
  );

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleActionSelect = (action: PowerAction) => {
    handleClose();
    if (isPowerActionDisabled) {
      return;
    }
    onPowerActionRequest(action);
  };

  const handleThemeToggle = () => {
    toggleTheme();
    handleClose();
  };

  return (
    <>
      <Button onClick={handleOpen} endIcon={<MdOutlineSettings size={20} />} sx={buttonSx}>
        گزینه‌های سیستم
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: menuPaperSx }}
      >
        {actionItems.map(({ action, label, icon, iconSx }) => {
          const isLoading = isPowerActionPending && activePowerAction === action;

          return (
            <MenuItem
              key={action}
              onClick={() => handleActionSelect(action)}
              disabled={isPowerActionDisabled}
              sx={listItemSx}
            >
              <ListItemIcon sx={{ minWidth: 48 }}>
                <Box sx={iconSx}>
                  {isLoading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : icon}
                </Box>
              </ListItemIcon>
              <ListItemText
                primary={label}
                primaryTypographyProps={{
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  fontSize: '0.95rem',
                  fontFamily: 'var(--font-vazir)',
                }}
              />
            </MenuItem>
          );
        })}
        <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.08)' }} />
        <MenuItem onClick={handleThemeToggle} sx={listItemSx}>
          <ListItemIcon sx={{ minWidth: 48 }}>
            <Box sx={iconContainerSx}>
              {isDark ? <LuSun size={20} color="#fff" /> : <LuMoon size={20} color="#fff" />}
            </Box>
          </ListItemIcon>
          <ListItemText
            primary={isDark ? 'حالت روشن' : 'حالت تاریک'}
            secondary={isDark ? 'برای تغییر به حالت روشن کلیک کنید' : 'برای تغییر به حالت تاریک کلیک کنید'}
            primaryTypographyProps={{
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              fontSize: '0.95rem',
              fontFamily: 'var(--font-vazir)',
            }}
            secondaryTypographyProps={{
              color: 'var(--color-text-secondary)',
              fontSize: '0.75rem',
              mt: 0.25,
            }}
          />
        </MenuItem>
      </Menu>
    </>
  );
};

export default PowerActionsMenu;
