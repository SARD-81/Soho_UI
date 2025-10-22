import { Box, Fade, IconButton, Tooltip } from '@mui/material';
import type { ReactNode } from 'react';
import { MdDragIndicator } from 'react-icons/md';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableWidgetProps {
  id: string;
  customizing: boolean;
  children: ReactNode;
  title?: string;
}

const SortableWidget = ({ id, customizing, children, title }: SortableWidgetProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled: !customizing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Box
      ref={setNodeRef}
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        transformOrigin: 'center',
        zIndex: isDragging ? 2 : 1,
      }}
      style={style}
    >
      <Fade in={customizing} unmountOnExit>
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            zIndex: 3,
            pointerEvents: 'auto',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.12)'
                : 'rgba(0, 0, 0, 0.08)',
            borderRadius: '12px',
            backdropFilter: 'blur(6px)',
            boxShadow: (theme) => theme.shadows[3],
          }}
        >
          <Tooltip title={title != null ? `جابجایی ${title}` : 'جابجایی ویجت'}>
            <span>
              <IconButton
                size="small"
                color="inherit"
                {...listeners}
                {...attributes}
                sx={{
                  cursor: 'grab',
                  '&:active': { cursor: 'grabbing' },
                  color: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                }}
              >
                <MdDragIndicator />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Fade>
      {children}
    </Box>
  );
};

export default SortableWidget;