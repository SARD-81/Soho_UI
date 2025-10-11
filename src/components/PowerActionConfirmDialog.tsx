import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import { MdOutlineWarningAmber } from 'react-icons/md';
import type { PowerAction } from '../hooks/usePowerAction';

interface PowerActionConfirmDialogProps {
  open: boolean;
  action: PowerAction | null;
  onCancel: () => void;
  onConfirm: () => void;
}

const actionLabels: Record<PowerAction, { title: string; description: string }> = {
  restart: {
    title: 'آیا از راه‌اندازی مجدد سیستم مطمئن هستید؟',
    description:
      'با تایید این پیام سیستم در عرض چند ثانیه راه‌اندازی مجدد می‌شود و ممکن است تمام تغییرات ذخیره‌نشده از بین بروند.',
  },
  shutdown: {
    title: 'آیا از خاموش کردن سیستم مطمئن هستید؟',
    description:
      'با تایید این پیام سیستم خاموش می‌شود و برای ادامه کار باید آن را دوباره روشن کنید. لطفاً از ذخیره اطلاعات مهم اطمینان حاصل کنید.',
  },
};

const PowerActionConfirmDialog: React.FC<PowerActionConfirmDialogProps> = ({
  open,
  action,
  onCancel,
  onConfirm,
}) => {
  const labels = action ? actionLabels[action] : null;

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="power-action-dialog-title"
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, #1f2937, #111827)',
          color: '#f9fafb',
          borderRadius: 3,
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.45)',
          border: '1px solid rgba(248, 113, 113, 0.4)',
        },
      }}
    >
      <DialogTitle id="power-action-dialog-title">
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <MdOutlineWarningAmber size={30} color="#f97316" />
          <Typography component="span" fontSize={18} fontWeight={700}>
            {labels?.title ?? ''}
          </Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ lineHeight: 1.9 }}>
          {labels?.description ?? ''}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, display: 'flex', gap: 1.5 }}>
        <Button
          onClick={onCancel}
          variant="outlined"
          sx={{
            color: '#f3f4f6',
            borderColor: 'rgba(209, 213, 219, 0.4)',
            borderRadius: 2,
            px: 3,
            '&:hover': {
              borderColor: '#f97316',
              backgroundColor: 'rgba(249, 115, 22, 0.1)',
            },
          }}
        >
          انصراف
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          sx={{
            borderRadius: 2,
            px: 3,
            background: 'linear-gradient(135deg, #f97316, #ef4444)',
            boxShadow: '0 12px 25px rgba(249, 115, 22, 0.35)',
            '&:hover': {
              background: 'linear-gradient(135deg, #fb923c, #f87171)',
            },
          }}
        >
          تایید و ادامه
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PowerActionConfirmDialog;
