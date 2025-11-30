import {
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { ReactNode } from 'react';
import type { DetailComparisonStatus } from './DetailComparisonPanel';
import type { DetailLayoutConfig } from '../../config/detailLayouts';
import { sortKeysWithPriority } from '../../utils/keySort';

interface SingleDetailViewProps {
  title: string;
  values: Record<string, unknown>;
  status?: DetailComparisonStatus;
  sections: DetailLayoutConfig['sections'];
  formatValue: (value: unknown) => ReactNode;
  emptyStateMessage: string;
  attributeOrder?: string[];
  attributeSort?: (a: string, b: string) => number;
}

const renderDiskTable = (
  disks: Array<Record<string, unknown>>,
  mutedColor: string,
  borderColor: string
) => (
  <Box sx={{ mt: 1 }}>
    <Table size="small" sx={{ border: `1px solid ${borderColor}` }}>
      <TableHead>
        <TableRow>
          {[
            'نام دیسک',
            'وضعیت',
            'نوع vdev',
            'Device',
            'WWN',
          ].map((label) => (
            <TableCell
              key={label}
              sx={{
                backgroundColor: alpha(mutedColor, 0.1),
                borderColor,
                fontWeight: 700,
              }}
            >
              {label}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {disks.map((disk, index) => (
          <TableRow key={`${disk.disk_name ?? disk.full_path_name}-${index}`}>
            <TableCell sx={{ borderColor }}>{disk.disk_name ?? '-'}</TableCell>
            <TableCell
              sx={{
                borderColor,
                color: String(disk.status ?? '').toUpperCase() === 'ONLINE'
                  ? 'var(--color-success)'
                  : 'var(--color-error)',
                fontWeight: 700,
              }}
            >
              {disk.status ?? '-'}
            </TableCell>
            <TableCell sx={{ borderColor }}>{disk.vdev_type ?? disk.type ?? '-'}</TableCell>
            <TableCell sx={{ borderColor }}>
              {disk.full_path_name ?? disk.full_disk_name ?? '-'}
            </TableCell>
            <TableCell sx={{ borderColor }}>
              {disk.wwn ?? disk.full_path_wwn ?? disk.full_disk_wwn ?? '-'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Box>
);

const SingleDetailView = ({
  title,
  values,
  status,
  sections,
  formatValue,
  emptyStateMessage,
  attributeOrder = [],
  attributeSort = (a: string, b: string) => a.localeCompare(b, 'fa-IR'),
}: SingleDetailViewProps) => {
  const theme = useTheme();
  const borderColor = alpha(theme.palette.divider, 0.35);
  const mutedColor = theme.palette.primary.main;

  const keys = sortKeysWithPriority(Object.keys(values ?? {}), attributeOrder, attributeSort);
  const sectionMap = new Map(
    sections.map((section) => [section.id, { ...section, keys: [] as string[] }])
  );
  const defaultSection = sections[0]?.id;

  keys.forEach((key) => {
    const targetSection = sections.find((section) => section.keys.includes(key))?.id;
    const bucketKey = targetSection ?? defaultSection;

    if (!bucketKey) {
      return;
    }

    sectionMap.get(bucketKey)?.keys.push(key);
  });

  const visibleSections = sections.filter((section) => {
    const assigned = sectionMap.get(section.id)?.keys ?? [];
    return assigned.length > 0 || !section.optional;
  });

  const renderFormattedValue = (value: unknown) => {
    if (Array.isArray(value) && value.every((item) => typeof item === 'object')) {
      return renderDiskTable(value as Array<Record<string, unknown>>, mutedColor, borderColor);
    }

    const renderedValue = formatValue(value);

    if (typeof renderedValue === 'string') {
      return (
        <Typography
          sx={{
            color: 'var(--color-text)',
            fontSize: '0.95rem',
            textAlign: 'right',
            whiteSpace: 'pre-wrap',
          }}
        >
          {renderedValue}
        </Typography>
      );
    }

    return renderedValue;
  };

  const renderStatusContent = () => {
    if (!status) return null;

    if (status.type === 'loading') {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={20} color="primary" />
          {status.message && (
            <Typography sx={{ color: 'var(--color-secondary)' }}>
              {status.message}
            </Typography>
          )}
        </Box>
      );
    }

    return (
      <Typography
        sx={{
          color:
            status.type === 'error' ? 'var(--color-error)' : 'var(--color-secondary)',
          fontWeight: status.type === 'error' ? 700 : 500,
        }}
      >
        {status.message}
      </Typography>
    );
  };

  const hasContent = keys.length > 0;

  return (
    <Box
      sx={{
        mt: 3,
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.4)}`,
        background: alpha(theme.palette.background.paper, 0.92),
        boxShadow:
          theme.palette.mode === 'dark'
            ? '0 24px 55px -32px rgba(0, 0, 0, 0.85)'
            : '0 24px 55px -32px rgba(15, 73, 110, 0.45)',
        p: 3,
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          fontWeight: 800,
          color: 'var(--color-primary)',
          letterSpacing: 0.5,
          textAlign: 'right',
        }}
      >
        {title}
      </Typography>

      {!hasContent ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            py: 2,
          }}
        >
          {renderStatusContent() ?? (
            <Typography sx={{ color: 'var(--color-secondary)' }}>
              {emptyStateMessage}
            </Typography>
          )}
        </Box>
      ) : (
        visibleSections.map((section) => {
          const assignedKeys = sectionMap.get(section.id)?.keys ?? [];

          if (section.optional && assignedKeys.length === 0) {
            return null;
          }

          return (
            <Box
              key={section.id}
              sx={{
                mb: 2,
                borderRadius: 2,
                border: `1px solid ${borderColor}`,
                backgroundColor: alpha(theme.palette.background.default, 0.4),
              }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  borderBottom: `1px solid ${borderColor}`,
                  background: alpha(mutedColor, 0.08),
                }}
              >
                <Typography
                  sx={{
                    color: 'var(--color-primary)',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    textAlign: 'right',
                  }}
                >
                  {section.title}
                </Typography>
              </Box>

              <Table size="small" sx={{ direction: 'rtl' }}>
                <TableBody>
                  {assignedKeys.map((key) => (
                    <TableRow key={key} sx={{ '&:last-of-type td': { borderBottom: 'none' } }}>
                      <TableCell
                        sx={{
                          width: '35%',
                          borderColor,
                          fontWeight: 700,
                          backgroundColor: alpha(theme.palette.background.paper, 0.6),
                        }}
                      >
                        {key}
                      </TableCell>
                      <TableCell sx={{ borderColor }}>{renderFormattedValue(values[key])}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          );
        })
      )}
    </Box>
  );
};

export default SingleDetailView;
