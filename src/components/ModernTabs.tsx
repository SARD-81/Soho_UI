import { type TabProps, type TabsProps, Tab, Tabs } from '@mui/material';
import { styled } from '@mui/material/styles';
import { forwardRef } from 'react';

const StyledTabs = styled((props: TabsProps) => (
  <Tabs
    {...props}
    TabIndicatorProps={{ children: <span className="MuiTabs-indicatorSpan" /> }}
  />
))(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(2),
  borderRadius: 14,
  padding: theme.spacing(0.75),
  background:
    'linear-gradient(145deg, rgba(14, 26, 45, 0.85), rgba(18, 32, 55, 0.7))',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow:
    '0 18px 30px -18px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
  '& .MuiTabs-flexContainer': {
    gap: theme.spacing(1),
    flexWrap: 'wrap',
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
  minHeight: 52,
  textTransform: 'none',
  minWidth: 180,
  color: 'rgba(255,255,255,0.75)',
  fontWeight: 700,
  letterSpacing: '0.04em',
  backgroundColor: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  backdropFilter: 'blur(6px)',
  transition: 'all 200ms ease',
  alignItems: 'center',
  justifyContent: 'center',
  paddingInline: theme.spacing(3),
  '&:hover': {
    color: 'var(--color-bg)',
    backgroundColor: 'rgba(31, 182, 255, 0.14)',
    boxShadow: '0 14px 30px -18px rgba(31, 182, 255, 0.9)',
  },
  '&.Mui-selected': {
    color: 'var(--color-bg)',
    backgroundColor: 'rgba(31, 182, 255, 0.18)',
    boxShadow: '0 14px 32px -20px rgba(31, 182, 255, 0.9)',
    borderColor: 'rgba(31, 182, 255, 0.45)',
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
