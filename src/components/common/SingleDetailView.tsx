import {
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { ReactNode } from 'react';
import type { DetailLayoutConfig } from '../../config/detailLayouts';
import TinyComparisonTable from './TinyComparisonTable';
import { isNestedDetailTableData } from '../../@types/detailComparison';
import { sortPoolDiskAttributes } from '../../utils/poolDetailTables';
import { sortKeysWithPriority } from '../../utils/keySort';
import type { DetailComparisonStatus } from './DetailComparisonPanel';

interface SingleDetailViewProps {
  title: string;
  values: Record<string, unknown>;
  status?: DetailComparisonStatus;
  sections: DetailLayoutConfig['sections'];
  formatValue: (value: unknown) => ReactNode;
  emptyStateMessage: string;
  attributeOrder?: string[];
  attributeSort?: (a: string, b: string) => number;
  attributeLabelResolver?: (key: string) => string;
}

const SingleDetailView = ({
  title,
  values,
  status,
  sections,
  formatValue,
  emptyStateMessage,
  attributeOrder = [],
  attributeSort = (a: string, b: string) => a.localeCompare(b, 'fa-IR'),
  attributeLabelResolver,
}: SingleDetailViewProps) => {
  const theme = useTheme();
  const resolveAttributeLabel =
    attributeLabelResolver ?? ((key: string) => key);
  const borderColor = alpha(
    theme.palette.divider,
    theme.palette.mode === 'dark' ? 0.4 : 0.25
  );
  const backgroundColor = alpha(
    theme.palette.background.paper,
    theme.palette.mode === 'dark' ? 0.9 : 1
  );
  const headerGradient =
    theme.palette.mode === 'dark'
      ? `linear-gradient(135deg, ${alpha('#00c6a9', 0.3)} 0%, ${alpha('#1fb6ff', 0.2)} 100%)`
      : `linear-gradient(135deg, ${alpha('#00c6a9', 0.12)} 0%, ${alpha('#1fb6ff', 0.1)} 100%)`;
  const alternatingCellBg = [
    alpha(theme.palette.background.paper, 0.65),
    'rgba(0, 198, 169, 0.18)',
  ];
  const selectedRowHover = alpha(theme.palette.primary.main, 0.08);

  const keys = sortKeysWithPriority(
    Object.keys(values ?? {}),
    attributeOrder,
    attributeSort
  );
  const sectionMap = new Map(
    sections.map((section) => [
      section.id,
      { ...section, keys: [] as string[] },
    ])
  );
  const defaultSection = sections[0]?.id;

  keys.forEach((key) => {
    const targetSection = sections.find((section) =>
      section.keys.includes(key)
    )?.id;
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
    if (isNestedDetailTableData(value)) {
      return (
        <TinyComparisonTable
          data={value}
          attributeSort={sortPoolDiskAttributes}
        />
      );
    }

    const renderedValue = formatValue(value);

    if (typeof renderedValue === 'string') {
      return (
        <Typography
          sx={{
            color: 'var(--color-text)',
            fontSize: '0.95rem',
            textAlign: 'center',
            // whiteSpace: 'pre-wrap',
            // wordBreak: 'break-word',
            direction: 'rtl',
            // unicodeBidi: 'plaintext',
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
            status.type === 'error'
              ? 'var(--color-error)'
              : 'var(--color-secondary)',
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
        display: 'inline-block',
        alignSelf: 'flex-start',
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.35)}`,
        background: backgroundColor,
        boxShadow:
          theme.palette.mode === 'dark'
            ? '0 24px 55px -32px rgba(0, 0, 0, 0.85)'
            : '0 24px 55px -32px rgba(15, 73, 110, 0.45)',
        px: 3,
        py: 3,
        minWidth: '550px',
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 2.5,
          fontWeight: 800,
          color: 'var(--color-primary)',
          letterSpacing: 0.5,
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
                backgroundColor: alpha(
                  theme.palette.background.paper,
                  theme.palette.mode === 'dark' ? 0.9 : 0.65
                ),
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 1.25,
                  borderBottom: `1px solid ${borderColor}`,
                  background: headerGradient,
                }}
              >
                <Typography
                  sx={{
                    color: 'var(--color-primary)',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    textAlign: 'center',
                  }}
                >
                  {section.title}
                </Typography>
              </Box>

              <Table size="small" sx={{ direction: 'rtl' }}>
                <TableBody>
                  {assignedKeys.map((key, index) => (
                    <TableRow
                      key={key}
                      sx={{
                        '&:last-of-type td': { borderBottom: 'none' },
                        '&:hover td': { backgroundColor: selectedRowHover },
                        backgroundColor: alternatingCellBg[index % 2],
                      }}
                    >
                      <TableCell
                        sx={{
                          borderColor,
                          px: 2,
                          py: 1.5,
                          textAlign: 'center',
                          color: 'var(--color-text)',
                          fontWeight: 500,
                          minHeight: 64,
                        }}
                      >
                        {renderFormattedValue(values[key])}
                      </TableCell>
                      <TableCell
                        sx={{
                          width: '35%',
                          borderColor,
                          fontWeight: 700,
                          backgroundColor: alpha(
                            theme.palette.background.default,
                            0.1
                          ),
                          color: 'var(--color-secondary)',
                          textAlign: 'left',
                          direction: 'rtl',
                          fontSize: '0.95rem',
                          letterSpacing: 0.2,
                          minHeight: 64,
                        }}
                      >
                        {resolveAttributeLabel(key)}
                      </TableCell>
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
