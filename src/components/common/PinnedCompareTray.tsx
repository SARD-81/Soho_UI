import { Button, Chip, Paper, Stack, Typography } from '@mui/material';
import { MdClose } from 'react-icons/md';

interface PinnedCompareTrayProps {
  items: Array<{ id: string; label: string }>; // label kept flexible for RTL consistency
  onUnpin: (id: string) => void;
  onClear: () => void;
  onCompare: () => void;
  maxPinned?: number;
}

const PinnedCompareTray = ({
  items,
  onUnpin,
  onClear,
  onCompare,
}: PinnedCompareTrayProps) => {
  if (!items.length) {
    return null;
  }

  const compareEnabled = items.length >= 2;

  return (
    <Paper
      elevation={6}
      sx={{
        position: 'sticky',
        bottom: 0,
        insetInline: 0,
        px: 2,
        py: 1.5,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
        alignItems: 'center',
        borderTop: '1px solid rgba(0,0,0,0.08)',
        zIndex: 6,
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{ flex: 1, flexWrap: 'wrap', gap: 1, alignItems: 'center' }}
      >
        <Typography sx={{ fontWeight: 700, color: 'var(--color-primary)' }}>
          موارد پین‌شده:
        </Typography>

        {items.map((item) => (
          <Chip
            key={item.id}
            label={item.label}
            onDelete={() => onUnpin(item.id)}
            deleteIcon={<MdClose size={18} />}
            sx={{ fontWeight: 700 }}
          />
        ))}
      </Stack>

      <Stack direction="row" spacing={1}>
        <Button
          variant="contained"
          color="primary"
          disabled={!compareEnabled}
          onClick={onCompare}
          sx={{ fontWeight: 800 }}
        >
          {`مقایسه (${items.length})`}
        </Button>

        <Button variant="text" color="secondary" onClick={onClear} sx={{ fontWeight: 700 }}>
          حذف همه
        </Button>
      </Stack>
    </Paper>
  );
};

export default PinnedCompareTray;
