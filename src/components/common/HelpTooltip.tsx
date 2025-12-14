import { IconButton, Tooltip, type TooltipProps } from '@mui/material';
import { MdHelpOutline } from 'react-icons/md';

interface HelpTooltipProps {
  title: TooltipProps['title'];
  placement?: TooltipProps['placement'];
  iconSize?: number;
  color?: string;
}

const HelpTooltip = ({
  title,
  placement = 'top',
  iconSize = 18,
  color = 'var(--color-primary)',
}: HelpTooltipProps) => (
  <Tooltip title={title} placement={placement} arrow>
    <IconButton
      size="small"
      aria-label="راهنما"
      sx={{ color, padding: 0.5 }}
      disableRipple
    >
      <MdHelpOutline size={iconSize} />
    </IconButton>
  </Tooltip>
);

export default HelpTooltip;
