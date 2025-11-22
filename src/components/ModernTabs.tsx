import { type TabProps, type TabsProps, Tab, Tabs } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import { forwardRef } from 'react';

const StyledTabs = styled((props: TabsProps) => (
  <Tabs
    {...props}
    TabIndicatorProps={{ children: <span className="MuiTabs-indicatorSpan" /> }}
  />
))(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(1),
  background: `linear-gradient(140deg, ${alpha(
    theme.palette.background.paper,
    0.95
  )}, ${alpha(theme.palette.background.default, 0.92)})`,
  border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
  boxShadow: theme.shadows[3],
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
    borderRadius: theme.shape.borderRadius * 1.5,
    background: `linear-gradient(115deg, ${theme.palette.primary.main}, ${alpha(
      theme.palette.primary.light,
      0.9
    )})`,
    boxShadow: `0 10px 20px -12px ${alpha(theme.palette.primary.light, 0.8)}`,
  },
}));

const StyledTabRoot = styled(Tab)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.75,
  minHeight: 52,
  textTransform: 'none',
  minWidth: 180,
  color: theme.palette.text.primary,
  fontWeight: 700,
  letterSpacing: '0.04em',
  backgroundColor: alpha(theme.palette.background.paper, 0.7),
  border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
  backdropFilter: 'blur(10px)',
  transition: 'all 200ms ease',
  alignItems: 'center',
  justifyContent: 'center',
  paddingInline: theme.spacing(3),
  '&:hover': {
    color: theme.palette.background.default,
    backgroundColor: alpha(theme.palette.primary.main, 0.14),
    boxShadow: `0 14px 28px -18px ${alpha(theme.palette.primary.light, 0.8)}`,
  },
  '&.Mui-selected': {
    color: theme.palette.background.default,
    backgroundColor: alpha(theme.palette.primary.main, 0.18),
    boxShadow: `0 14px 30px -18px ${alpha(theme.palette.primary.light, 0.85)}`,
    borderColor: alpha(theme.palette.primary.main, 0.45),
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
