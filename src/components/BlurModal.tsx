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
  minWidth?: number | string;
  maxHeight?: number | string;
  direction?: 'rtl' | 'ltr';
  closeDisabled?: boolean;
}

const BlurModal = ({
  open,
  onClose,
  title,
  actions,
  children,
  maxWidth,
  minWidth = '455px',
  maxHeight = '90vh',
  direction,
  closeDisabled = false,
}: BlurModalProps) => {
  return (
    <Modal
      open={open}
      onClose={closeDisabled ? undefined : onClose}
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
        dir={direction}
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'auto',
          ...(maxWidth && { maxWidth }),
          minWidth,
          ...(maxHeight && { maxHeight }),
          borderRadius: '5px',
          bgcolor: 'var(--color-card-bg)',
          color: 'var(--color-text)',
          boxShadow: '0 30px 60px -32px rgba(0, 0, 0, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          overflow: 'hidden',
          overflowY: 'auto',
          ...(direction && {
            direction,
            textAlign: direction === 'rtl' ? 'right' : 'left',
          }),
        }}
      >
        <Box sx={{ p: 4 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 3,
              gap: 2,
              ...(direction && { direction }),
            }}
          >
            {title ? (
              typeof title === 'string' ? (
                <Typography
                  variant="h6"
                  sx={{
                    color: 'var(--color-text)',
                    fontWeight: 700,
                    ...(direction && {
                      direction,
                      textAlign: direction === 'rtl' ? 'right' : 'left',
                    }),
                  }}
                >
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
              disabled={closeDisabled}
              aria-label="بستن مودال"
              sx={{
                flexShrink: 0,
                color: 'var(--color-secondary)',
                '&:hover': {
                  color: 'var(--color-primary)',
                },
              }}
            >
              <MdClose size={20} />
            </IconButton>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              ...(direction && { direction }),
            }}
          >
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
              ...(direction && { direction }),
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
