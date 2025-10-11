import {
  Button,
  CircularProgress,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import React, { useMemo, useState } from 'react';
// import { HiBarsArrowDown } from 'react-icons/hi2';
import { MdPowerSettingsNew, MdRestartAlt } from 'react-icons/md';
import type { PowerAction } from '../hooks/usePowerAction';
import { MdPowerOff } from "react-icons/md";
// import { BiSolidDownArrow } from "react-icons/bi";
interface QuickActionsMenuProps {
  onPowerActionRequest: (action: PowerAction) => void;
  isPowerActionDisabled: boolean;
  activePowerAction: PowerAction | null;
}

const menuItemStyles = {
  py: 1.2,
  px: 2,
  gap: 1.5,
  borderRadius: '10px',
  color: 'var(--color-text)',
  transition: 'background-color 0.2s ease, transform 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(35, 167, 213, 0.08)',
    transform: 'translateX(-4px)',
  },
} as const;

const paperStyles = {
  mt: 1.5,
  minWidth: 220,
  px: 1,
  py: 1,
  borderRadius: '14px',
  backgroundColor: 'var(--color-card-bg)',
  backdropFilter: 'blur(16px)',
  boxShadow: '0 18px 40px rgba(0, 0, 0, 0.18)',
  border: '1px solid rgba(0, 0, 0, 0.06)',
} as const;

const getPowerIconColor = (action: PowerAction) =>
  action === 'restart' ? 'var(--color-primary)' : 'var(--color-secondary)';

const QuickActionsMenu: React.FC<QuickActionsMenuProps> = ({
  onPowerActionRequest,
  isPowerActionDisabled,
  activePowerAction,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleMenuToggle = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handlePowerAction = (action: PowerAction) => {
    handleMenuClose();
    onPowerActionRequest(action);
  };

  const powerIcons = useMemo(
    () => ({
      restart: <MdRestartAlt size={22} color={getPowerIconColor('restart')} />,
      shutdown: (
        <MdPowerOff size={22} color={getPowerIconColor('shutdown')} />
      ),
    }),
    []
  );

  const renderPowerIcon = (action: PowerAction) =>
    activePowerAction === action ? (
      <CircularProgress size={18} sx={{ color: getPowerIconColor(action) }} />
    ) : (
      powerIcons[action]
    );

  return (
    <>
      <Button
        variant="contained"
        onClick={handleMenuToggle}
        // endIcon={<MdExpandMore size={20} />}
        sx={{
          // background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))',
          color: 'var(--color-primary)',
          borderRadius: '2px',
          px: 1.5,
          minWidth: 0,
          backgroundColor: 'unset',
          py: 0.5,
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.18)',
          '&:hover': {
            background:
              'linear-gradient(135deg, var(--color-primary-light), var(--color-primary))',
            boxShadow: '0 16px 34px rgba(0, 0, 0, 0.24)',
          },
        }}
      >
        <Typography
          component="span"
          sx={{
            fontFamily: 'var(--font-vazir)',
            fontWeight: 600,
            fontSize: '0.95rem',
            letterSpacing: 0.2,
          }}
        >
          {/* <BiSolidDownArrow /> */}
          {/* <CgArrowDownR size={25}/> */}
          {/* <HiBarsArrowDown size={30} /> */}
          <MdPowerSettingsNew size={28} />
        </Typography>
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: paperStyles }}
      >
        <MenuItem
          onClick={() => handlePowerAction('restart')}
          disabled={isPowerActionDisabled}
          sx={menuItemStyles}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            {renderPowerIcon('restart')}
          </ListItemIcon>
          <ListItemText primary="راه‌اندازی مجدد سیستم" />
        </MenuItem>
        <MenuItem
          onClick={() => handlePowerAction('shutdown')}
          disabled={isPowerActionDisabled}
          sx={menuItemStyles}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            {renderPowerIcon('shutdown')}
          </ListItemIcon>
          <ListItemText primary="خاموش کردن سیستم" />
        </MenuItem>
      </Menu>
    </>
  );
};

export default QuickActionsMenu;