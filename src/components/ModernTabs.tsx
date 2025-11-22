import { type TabProps, type TabsProps, Tab, Tabs } from '@mui/material';
import { styled } from '@mui/material/styles';
import { forwardRef } from 'react';

const StyledTabs = styled((props: TabsProps) => (
  <Tabs
    {...props}
    TabIndicatorProps={{ children: <span className="MuiTabs-indicatorSpan" /> }}
  />
))(({ theme }) => ({
  marginTop: theme.spacing(2),
  borderRadius: 14,
  padding: theme.spacing(0.5),
  background: 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.03))',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 18px 30px -22px rgba(0,0,0,0.6)',
  '& .MuiTabs-flexContainer': {
    gap: theme.spacing(1),
  },
  '& .MuiTabs-indicator': {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  '& .MuiTabs-indicatorSpan': {
    width: '100%',
    borderRadius: 12,
    background:
      'linear-gradient(120deg, var(--color-primary) 0%, rgba(31, 182, 255, 0.9) 100%)',
    boxShadow: '0 10px 22px -12px rgba(31,182,255,0.9)',
  },
}));

const StyledTabRoot = styled(Tab)(({ theme }) => ({
  borderRadius: 10,
  minHeight: 48,
  textTransform: 'none',
  minWidth: 140,
  color: 'var(--color-secondary)',
  fontWeight: 700,
  letterSpacing: '0.04em',
  backgroundColor: 'rgba(255,255,255,0.04)',
  transition: 'all 200ms ease',
  alignItems: 'center',
  justifyContent: 'center',
  paddingInline: theme.spacing(2.5),
  '&:hover': {
    color: 'var(--color-primary)',
    backgroundColor: 'rgba(31, 182, 255, 0.08)',
  },
  '&.Mui-selected': {
    color: 'var(--color-bg)',
    backgroundColor: 'rgba(31, 182, 255, 0.12)',
    boxShadow: '0 12px 24px -16px rgba(31, 182, 255, 0.75)',
  },
  '& .MuiTab-wrapper': {
    flexDirection: 'row',
    gap: theme.spacing(1),
  },
}));

const ModernTab = forwardRef<HTMLButtonElement, TabProps>((props, ref) => (
  <StyledTabRoot disableRipple ref={ref} {...props} />
));
ModernTab.displayName = 'ModernTab';

const ModernTabs = (props: TabsProps) => <StyledTabs {...props} />;

export { ModernTab, ModernTabs };
