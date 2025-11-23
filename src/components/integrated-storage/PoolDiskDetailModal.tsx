import { Box, Button, Chip, Divider, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { MdArrowForward, MdLaunch, MdStorage } from 'react-icons/md';
import type { PoolDiskSlot } from '../../hooks/usePoolDeviceSlots';
import BlurModal from '../BlurModal';
import formatDetailValue from '../../utils/formatDetailValue';
import { buildDiskDetailValues, formatNullableString } from '../../utils/diskDetails';

interface PoolDiskDetailModalProps {
  open: boolean;
  onClose: () => void;
  slot: PoolDiskSlot | null;
  poolName: string | null;
}

const renderDetailValue = (value: unknown) => {
  const formatted = formatDetailValue(value);

  if (typeof formatted === 'string' && formatted.includes('\n')) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {formatted.split('\n').map((line, index) => (
          <Typography key={`${line}-${index}`} sx={{ fontSize: '0.9rem', textAlign: 'right' }}>
            {line}
          </Typography>
        ))}
      </Box>
    );
  }

  return formatted;
};

const InfoTile = ({ label, value }: { label: string; value: unknown }) => (
  <Box
    sx={{
      p: 2,
      borderRadius: '10px',
      border: '1px solid rgba(255, 255, 255, 0.06)',
      background:
        'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(15, 165, 160, 0.06) 100%)',
      boxShadow: '0 18px 48px -28px rgba(0,0,0,0.45)',
      display: 'flex',
      flexDirection: 'column',
      gap: 0.5,
      minHeight: 96,
    }}
  >
    <Typography sx={{ color: 'var(--color-secondary)', fontWeight: 600, fontSize: '0.95rem' }}>
      {label}
    </Typography>
    <Typography sx={{ color: 'var(--color-text)', fontWeight: 700 }}>
      {renderDetailValue(value)}
    </Typography>
  </Box>
);

const PoolDiskDetailModal = ({ open, onClose, slot, poolName }: PoolDiskDetailModalProps) => {
  if (!slot) {
    return null;
  }

  const slotLabel = slot.slotNumber ?? 'نامشخص';
  const detailValues = buildDiskDetailValues(slot.detail);
  const detailEntries = Object.entries(detailValues);
  const diskLink = `/disks?selected=${encodeURIComponent(slot.diskName)}`;

  return (
    <BlurModal
      open={open}
      onClose={onClose}
      title="جزئیات دیسک"
      actions={
        <>
          <Button
            component={Link}
            to={diskLink}
            variant="contained"
            startIcon={<MdLaunch />}
            sx={{
              borderRadius: '8px',
              px: 2.5,
              fontWeight: 700,
              background:
                'linear-gradient(135deg, rgba(21,196,197,0.9) 0%, rgba(25,123,255,0.95) 100%)',
              boxShadow: '0 18px 40px -22px rgba(25,123,255,0.8)',
            }}
          >
            رفتن به صفحه دیسک‌ها
          </Button>
          <Button onClick={onClose} variant="outlined" sx={{ borderRadius: '8px', px: 2.5 }}>
            بستن
          </Button>
        </>
      }
    >
      <Box
        sx={{
          background:
            'linear-gradient(135deg, rgba(14,44,88,0.95) 0%, rgba(14,174,164,0.9) 100%)',
          color: '#eaf7ff',
          borderRadius: '12px',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          boxShadow: '0 24px 48px -30px rgba(0,0,0,0.7)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              backgroundColor: 'rgba(255,255,255,0.14)',
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 14px 32px -20px rgba(0,0,0,0.4)',
            }}
          >
            <MdStorage size={24} />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#f7fbff' }}>
              دیسک {slot.diskName}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ color: 'rgba(234,247,255,0.9)' }}>
                فضای یکپارچه: {formatNullableString(poolName)}
              </Typography>
              <MdArrowForward size={18} />
              <Typography sx={{ color: 'rgba(234,247,255,0.9)' }}>
                شماره اسلات: {formatNullableString(slotLabel)}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={`اسلات ${formatNullableString(slotLabel)}`}
            sx={{
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 100%)',
              color: '#0b1d2f',
              fontWeight: 800,
              letterSpacing: '0.2px',
              px: 1,
              border: '1px solid rgba(255,255,255,0.36)',
              boxShadow: '0 12px 32px -22px rgba(0,0,0,0.6)',
            }}
          />
          <Chip
            label={slot.wwn ? `WWN: ${slot.wwn}` : 'WWN نامشخص'}
            sx={{
              backgroundColor: 'rgba(0,0,0,0.16)',
              color: '#eaf7ff',
              border: '1px solid rgba(255,255,255,0.18)',
              fontWeight: 700,
            }}
          />
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.04)' }} />

      {detailEntries.length > 0 ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
            gap: 2,
          }}
        >
          {detailEntries.map(([label, value]) => (
            <InfoTile key={label} label={label} value={value} />
          ))}
        </Box>
      ) : (
        <Box
          sx={{
            p: 3,
            borderRadius: '10px',
            backgroundColor: 'rgba(9, 20, 40, 0.04)',
            border: '1px dashed rgba(255,255,255,0.08)',
          }}
        >
          <Typography sx={{ color: 'var(--color-secondary)', fontWeight: 600 }}>
            اطلاعاتی برای نمایش وجود ندارد.
          </Typography>
        </Box>
      )}
    </BlurModal>
  );
};

export default PoolDiskDetailModal;