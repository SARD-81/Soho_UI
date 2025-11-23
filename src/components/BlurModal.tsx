import { Box, IconButton, Modal, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { MdClose } from 'react-icons/md';

interface BlurModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  maxWidth?: number | string;
  maxHeight?: number | string;
}

const BlurModal = ({
  open,
  onClose,
  title,
  actions,
  children,
  maxWidth = 560,
  maxHeight = '90vh',
}: BlurModalProps) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: 'blur(6px)',
            backgroundColor: 'rgba(9, 20, 40, 0.55)',
          },
        },
      }}
      sx={{ display: 'grid', placeItems: 'center', p: { xs: 2, sm: 3 } }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth,
          maxHeight,
          borderRadius: '5px',
          bgcolor: 'var(--color-card-bg)',
          boxShadow: '0 30px 60px -32px rgba(0, 0, 0, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            p: { xs: 3, sm: 4 },
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            overflowY: 'auto',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 3,
              gap: 2,
              position: 'sticky',
              top: 0,
              backgroundColor: 'var(--color-card-bg)',
              zIndex: 1,
            }}
          >
            {title ? (
              typeof title === 'string' ? (
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {title}
                </Typography>
              ) : (
                title
              )
            ) : (
              <span />
            )}

            <IconButton
              size="small"
              onClick={onClose}
              sx={{
                color: 'var(--color-secondary)',
                '&:hover': {
                  color: 'var(--color-primary)',
                },
              }}
            >
              <MdClose size={20} />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
            {children}
          </Box>
        </Box>

        {actions && (
          <Box
            sx={{
              px: 4,
              pb: 4,
              pt: 2,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 2,
              backgroundColor: 'rgba(9, 20, 40, 0.04)',
              borderTop: '1px solid rgba(255, 255, 255, 0.04)',
            }}
          >
            {actions}
          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default BlurModal;