import { Box, Button, Chip, Divider, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { MdLaunch, MdStorage } from 'react-icons/md';
import { Link } from 'react-router-dom';
import {
  buildDiskDetailValues,
  formatNullableString,
} from '../../../utils/diskDetails';
import formatDetailValue from '../../../utils/formatDetailValue';
import type { ServerSlotViewModel } from './serverSlotModel';

interface DiskSlotDetailsPanelProps {
  selectedBay: ServerSlotViewModel | null;
}

const HIDDEN_DETAIL_KEYS = new Set([
  'پارتیشن‌ها',
  'مسیر دستگاه',
  'WWID',
  'UUID',
  'زمان‌بندی',
]);

const renderDetailValue = (value: unknown): ReactNode => {
  const formatted = formatDetailValue(value);

  if (typeof formatted === 'string' && formatted.includes('\n')) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {formatted.split('\n').map((line, index) => (
          <Typography
            key={`${line}-${index}`}
            sx={{
              fontSize: '0.86rem',
              textAlign: 'right',
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              overflowWrap: 'anywhere',
            }}
          >
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
      p: 1.5,
      borderRadius: '8px',
      border: (theme) =>
        `1px solid ${
          theme.palette.mode === 'dark'
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(0,0,0,0.08)'
        }`,
      background:
        'linear-gradient(145deg, rgba(255,255,255,0.035) 0%, rgba(0,198,169,0.055) 100%)',
      display: 'flex',
      flexDirection: 'column',
      gap: 0.5,
      minHeight: 78,
      minWidth: 0,
    }}
  >
    <Typography
      sx={{
        color: 'var(--color-secondary)',
        fontWeight: 700,
        fontSize: '0.82rem',
      }}
    >
      {label}
    </Typography>
    <Typography
      sx={{
        color: 'var(--color-text)',
        fontWeight: 700,
        fontSize: '0.9rem',
        whiteSpace: 'normal',
        wordBreak: 'break-word',
        overflowWrap: 'anywhere',
      }}
    >
      {renderDetailValue(value)}
    </Typography>
  </Box>
);

const EmptySelectionState = () => (
  <Box
    sx={{
      height: '100%',
      minHeight: 280,
      borderRadius: '12px',
      border: '1px dashed rgba(0,198,169,0.32)',
      background:
        'linear-gradient(145deg, rgba(0,198,169,0.055), rgba(35,167,213,0.04))',
      display: 'grid',
      placeItems: 'center',
      p: 3,
      textAlign: 'center',
    }}
  >
    <Stack spacing={1.25} alignItems="center">
      <Box
        sx={{
          width: 54,
          height: 54,
          borderRadius: '15px',
          display: 'grid',
          placeItems: 'center',
          color: 'var(--color-primary)',
          backgroundColor: 'rgba(0,198,169,0.1)',
          border: '1px solid rgba(0,198,169,0.25)',
        }}
      >
        <MdStorage size={28} />
      </Box>
      <Typography sx={{ fontWeight: 800, color: 'var(--color-text)' }}>
        یک اسلات را انتخاب کنید
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.9 }}>
        با کلیک روی هر bay در مدل سه‌بعدی، جزئیات دیسک همان اسلات در این پنل نمایش داده می‌شود.
      </Typography>
    </Stack>
  </Box>
);

const EmptyBayState = ({ selectedBay }: { selectedBay: ServerSlotViewModel }) => (
  <Box
    sx={{
      height: '100%',
      minHeight: 280,
      borderRadius: '12px',
      border: '1px solid rgba(148,163,184,0.24)',
      background:
        'linear-gradient(145deg, rgba(148,163,184,0.06), rgba(15,23,42,0.035))',
      p: 3,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 1.25,
    }}
  >
    <Chip
      label={`اسلات ${selectedBay.slotNumber}`}
      sx={{
        alignSelf: 'flex-start',
        fontWeight: 800,
        color: 'var(--color-text)',
        backgroundColor: 'rgba(148,163,184,0.12)',
        border: '1px solid rgba(148,163,184,0.25)',
      }}
    />
    <Typography sx={{ fontWeight: 800, color: 'var(--color-text)' }}>
      این اسلات خالی است
    </Typography>
    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.9 }}>
      برای این شماره اسلات هیچ دیسکی از APIهای فعلی دریافت نشده است. اگر دیسک فیزیکی نصب شده،
      مقدار `slot_number` در پاسخ `/api/disk/{'{diskName}'}/` را بررسی کنید.
    </Typography>
  </Box>
);

const DiskSlotDetailsPanel = ({ selectedBay }: DiskSlotDetailsPanelProps) => {
  if (!selectedBay) {
    return <EmptySelectionState />;
  }

  if (!selectedBay.disk) {
    return <EmptyBayState selectedBay={selectedBay} />;
  }

  const slot = selectedBay.disk;
  const slotLabel = slot.slotNumber ?? selectedBay.slotNumber;
  const diskLink = `/disks?selected=${encodeURIComponent(slot.diskName)}`;
  const detailValues = buildDiskDetailValues(slot.detail);

  const detailEntries = Object.entries(detailValues)
    .filter(([label]) => !HIDDEN_DETAIL_KEYS.has(label))
    .slice(0, 8);

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 320,
        borderRadius: '12px',
        border: (theme) =>
          `1px solid ${
            theme.palette.mode === 'dark'
              ? 'rgba(255,255,255,0.08)'
              : 'rgba(0,0,0,0.08)'
          }`,
        background:
          'linear-gradient(145deg, rgba(0,198,169,0.08), rgba(35,167,213,0.055))',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        minWidth: 0,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
        <Stack direction="row" alignItems="center" gap={1.25} minWidth={0}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: '12px',
              display: 'grid',
              placeItems: 'center',
              color: 'var(--color-primary)',
              backgroundColor: 'rgba(0,198,169,0.12)',
              border: '1px solid rgba(0,198,169,0.28)',
              flex: '0 0 auto',
            }}
          >
            <MdStorage size={23} />
          </Box>
          <Box minWidth={0}>
            <Typography
              sx={{
                fontWeight: 900,
                color: 'var(--color-text)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              دیسک {slot.diskName}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              اسلات {formatNullableString(slotLabel)}
            </Typography>
          </Box>
        </Stack>

        <Button
          component={Link}
          to={diskLink}
          size="small"
          variant="contained"
          startIcon={<MdLaunch />}
          sx={{
            borderRadius: '8px',
            fontWeight: 800,
            color: 'var(--color-bg)',
            background:
              'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',
            boxShadow: '0 16px 32px -22px rgba(0,198,169,0.9)',
            flex: '0 0 auto',
          }}
        >
          صفحه دیسک
        </Button>
      </Stack>

      <Stack direction="row" gap={1} flexWrap="wrap">
        <Chip
          label={`Pool: ${formatNullableString(selectedBay.poolName)}`}
          size="small"
          sx={{
            color: 'var(--color-text)',
            fontWeight: 700,
            border: '1px solid rgba(0,198,169,0.24)',
            backgroundColor: 'rgba(0,198,169,0.08)',
          }}
        />
        <Chip
          label={slot.wwn ? `WWN: ${slot.wwn}` : 'WWN نامشخص'}
          size="small"
          sx={{
            color: 'var(--color-text)',
            fontWeight: 700,
            border: '1px solid rgba(148,163,184,0.25)',
            backgroundColor: 'rgba(148,163,184,0.1)',
            maxWidth: '100%',
            '& .MuiChip-label': {
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            },
          }}
        />
      </Stack>

      <Divider />

      {detailEntries.length > 0 ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: '1fr',
              xl: 'repeat(2, minmax(0, 1fr))',
            },
            gap: 1.25,
            overflowY: 'auto',
            pr: 0.5,
          }}
        >
          {detailEntries.map(([label, value]) => (
            <InfoTile key={label} label={label} value={value} />
          ))}
        </Box>
      ) : (
        <Typography sx={{ color: 'var(--color-secondary)', fontWeight: 700 }}>
          اطلاعاتی برای این دیسک دریافت نشده است.
        </Typography>
      )}
    </Box>
  );
};

export default DiskSlotDetailsPanel;