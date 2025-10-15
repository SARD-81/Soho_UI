import { Box, CircularProgress, IconButton, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { MdClose } from 'react-icons/md';
import type { ReactNode } from 'react';

export type DetailComparisonStatus =
  | { type: 'loading'; message?: string }
  | { type: 'error'; message: string }
  | { type: 'empty'; message: string }
  | { type: 'info'; message: string };

export interface DetailComparisonColumn {
  id: string;
  title: string;
  onRemove?: () => void;
  values: Record<string, unknown>;
  status?: DetailComparisonStatus;
}

interface DetailComparisonPanelProps {
  title: string;
  attributeLabel: string;
  columns: DetailComparisonColumn[];
  formatValue: (value: unknown) => ReactNode;
  emptyStateMessage: string;
  attributeSort?: (a: string, b: string) => number;
}

const DetailComparisonPanel = ({
  title,
  attributeLabel,
  columns,
  formatValue,
  emptyStateMessage,
  attributeSort,
}: DetailComparisonPanelProps) => {
  const theme = useTheme();

  if (!columns.length) {
    return null;
  }

  const attributeKeys = Array.from(
    columns.reduce((acc, column) => {
      Object.keys(column.values ?? {}).forEach((key) => acc.add(key));
      return acc;
    }, new Set<string>())
  ).sort((a, b) => {
    if (attributeSort) {
      return attributeSort(a, b);
    }

    return a.localeCompare(b, 'fa-IR');
  });

  const hasStatuses = columns.some((column) => column.status);
  const hasAttributes = attributeKeys.length > 0;

  const rows: Array<{ type: 'status' | 'attribute'; key: string; label: string }> = [];

  if (hasStatuses) {
    rows.push({ type: 'status', key: '__status__', label: 'وضعیت' });
  }

  if (hasAttributes) {
    attributeKeys.forEach((key) => {
      rows.push({ type: 'attribute', key, label: key });
    });
  }

  const gridColumns = `minmax(160px, auto) repeat(${columns.length}, minmax(200px, 1fr))`;
  const headerGradient =
    theme.palette.mode === 'dark'
      ? `linear-gradient(135deg, ${alpha('#00c6a9', 0.3)} 0%, ${alpha('#1fb6ff', 0.2)} 100%)`
      : `linear-gradient(135deg, ${alpha('#00c6a9', 0.12)} 0%, ${alpha('#1fb6ff', 0.1)} 100%)`;
  const borderColor = alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.4 : 0.25);
  const backgroundColor = alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.9 : 1);
  const selectedRowHover = alpha(theme.palette.primary.main, 0.08);

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
        maxWidth: '100%',
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

      <Box
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          border: `1px solid ${borderColor}`,
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: gridColumns,
            background: headerGradient,
            '& > .comparison-cell': {
              borderLeft: `1px solid ${borderColor}`,
              '&:first-of-type': {
                borderLeft: 'none',
              },
            },
          }}
        >
          <Box
            className="comparison-cell"
            sx={{
              px: 2,
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              fontWeight: 700,
              color: 'var(--color-primary)',
              fontSize: '0.95rem',
            }}
          >
            {attributeLabel}
          </Box>

          {columns.map((column) => (
            <Box
              key={column.id}
              className="comparison-cell"
              sx={{
                px: 2,
                py: 1.25,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
              }}
            >
              <Typography
                component="span"
                sx={{
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  fontSize: '1rem',
                  whiteSpace: 'nowrap',
                }}
              >
                {column.title}
              </Typography>

              {column.onRemove && (
                <IconButton
                  size="small"
                  onClick={(event) => {
                    event.stopPropagation();
                    column.onRemove?.();
                  }}
                  sx={{
                    color: 'var(--color-secondary)',
                    '&:hover': {
                      color: 'var(--color-error)',
                    },
                  }}
                  aria-label={`${column.title} را از مقایسه حذف کنید`}
                >
                  <MdClose size={18} />
                </IconButton>
              )}
            </Box>
          ))}
        </Box>

        {rows.length === 0 ? (
          <Box
            sx={{
              px: 2,
              py: 3,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: alpha(theme.palette.background.default, 0.55),
            }}
          >
            <Typography sx={{ color: 'var(--color-secondary)' }}>
              {emptyStateMessage}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: gridColumns,
              '& > .comparison-cell': {
                borderLeft: `1px solid ${borderColor}`,
                '&:first-of-type': {
                  borderLeft: 'none',
                },
              },
            }}
          >
            {rows.map((row, rowIndex) => {
              const isLastRow = rowIndex === rows.length - 1;

              return (
                <Box key={row.key} sx={{ display: 'contents' }}>
                  <Box
                    className="comparison-cell"
                    sx={{
                      px: 2,
                      py: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      backgroundColor: alpha(theme.palette.background.default, 0.45),
                      color: 'var(--color-secondary)',
                      fontWeight: 700,
                      borderBottom: isLastRow ? 'none' : `1px solid ${borderColor}`,
                      direction: 'rtl',
                    }}
                  >
                    {row.label}
                  </Box>

                  {columns.map((column) => {
                    const cellKey = `${row.key}-${column.id}`;
                    const status = column.status;
                    let content: ReactNode = null;

                    if (row.type === 'status') {
                      if (!status) {
                        content = (
                          <Typography sx={{ color: 'var(--color-secondary)' }}>
                            -
                          </Typography>
                        );
                      } else if (status.type === 'loading') {
                        content = (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 1,
                            }}
                          >
                            <CircularProgress size={18} color="primary" />
                            {status.message && (
                              <Typography sx={{ color: 'var(--color-secondary)' }}>
                                {status.message}
                              </Typography>
                            )}
                          </Box>
                        );
                      } else {
                        content = (
                          <Typography
                            sx={{
                              color:
                                status.type === 'error'
                                  ? 'var(--color-error)'
                                  : 'var(--color-secondary)',
                              fontWeight: status.type === 'error' ? 700 : 500,
                              textAlign: 'center',
                            }}
                          >
                            {status.message}
                          </Typography>
                        );
                      }
                    } else {
                      const value = column.values[row.key];
                      content = (
                        <Typography
                          sx={{
                            color: 'var(--color-text)',
                            fontWeight: 500,
                            textAlign: 'center',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            direction: 'rtl',
                            unicodeBidi: 'plaintext',
                          }}
                        >
                          {formatValue(value)}
                        </Typography>
                      );
                    }

                    return (
                      <Box
                        key={cellKey}
                        className="comparison-cell"
                        sx={{
                          px: 2,
                          py: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: alpha(theme.palette.background.paper, 0.65),
                          borderBottom: isLastRow ? 'none' : `1px solid ${borderColor}`,
                          '&:hover': {
                            backgroundColor: selectedRowHover,
                          },
                        }}
                      >
                        {content}
                      </Box>
                    );
                  })}
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default DetailComparisonPanel;
