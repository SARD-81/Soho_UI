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
}

const BlurModal = ({
  open,
  onClose,
  title,
  actions,
  children,
  maxWidth = 560,
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
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          maxWidth,
          borderRadius: '5px',
          bgcolor: 'var(--color-card-bg)',
          boxShadow: '0 30px 60px -32px rgba(0, 0, 0, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 4 }}>
          {(title || onClose) && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 3,
                gap: 2,
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
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
