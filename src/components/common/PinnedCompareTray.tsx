import {
  Box,
  Button,
  Chip,
  Divider,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { MdClose } from 'react-icons/md';
import { toast } from 'react-hot-toast';
import { useDetailCompareStore } from '../../stores/detailCompareStore';

interface PinnedCompareTrayProps {
  getLabel?: (id: string) => string;
  maxPinned?: number;
}

const PinnedCompareTray = ({ getLabel, maxPinned }: PinnedCompareTrayProps) => {
  const theme = useTheme();
  const {
    pinnedIds,
    clearPins,
    removePin,
    setViewMode,
    viewMode,
  } = useDetailCompareStore();

  if (!pinnedIds.length) {
    return null;
  }

  const effectiveMax = maxPinned ?? pinnedIds.length;
  const isOverLimit = pinnedIds.length > effectiveMax;

  if (isOverLimit) {
    toast.error('تعداد موارد مقایسه بیش از حد مجاز است.');
  }

  const handleCompareClick = () => {
    if (pinnedIds.length < 2) {
      toast('برای مقایسه حداقل دو مورد را سنجاق کنید.');
      return;
    }
    setViewMode('compare');
  };

  return (
    <Box
      sx={{
        position: 'sticky',
        bottom: 0,
        width: '100%',
        backgroundColor: theme.palette.background.paper,
        borderTop: `1px solid ${theme.palette.divider}`,
        boxShadow:
          theme.palette.mode === 'dark'
            ? '0 -12px 30px rgba(0,0,0,0.35)'
            : '0 -8px 24px rgba(0,0,0,0.18)',
        py: 1.5,
        px: { xs: 2, md: 3 },
        zIndex: 1100,
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
      >
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {pinnedIds.map((id) => (
            <Chip
              key={id}
              label={getLabel ? getLabel(id) : id}
              onDelete={() => removePin(id)}
              deleteIcon={<MdClose />}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          ))}
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Typography sx={{ color: 'var(--color-secondary)', fontWeight: 700 }}>
            موارد سنجاق شده: {pinnedIds.length}
          </Typography>
          <Divider orientation="vertical" flexItem />
          <Button
            variant="contained"
            color="primary"
            onClick={handleCompareClick}
            disabled={pinnedIds.length < 2}
          >
            مقایسه ({pinnedIds.length})
          </Button>
          <Button variant="text" color="inherit" onClick={clearPins}>
            پاک کردن همه
          </Button>
          {viewMode === 'compare' && (
            <Button variant="outlined" onClick={() => setViewMode('details')}>
              بازگشت به جزئیات
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

export default PinnedCompareTray;
