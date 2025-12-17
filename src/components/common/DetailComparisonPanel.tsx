import {
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  IconButton,
  Switch,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { MdClose } from 'react-icons/md';
import { isValidElement, type ReactNode } from 'react';

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
  attributeLabelResolver?: (key: string) => string;
  onlyDifferences?: boolean;
  onToggleOnlyDifferences?: (value: boolean) => void;
  onBack?: () => void;
}

const DetailComparisonPanel = ({
  title,
  attributeLabel,
  columns,
  formatValue,
  emptyStateMessage,
  attributeSort,
  attributeLabelResolver,
  onlyDifferences = false,
  onToggleOnlyDifferences,
  onBack,
}: DetailComparisonPanelProps) => {
  const theme = useTheme();
  const resolveAttributeLabel = attributeLabelResolver ?? ((key: string) => key);

  if (!columns.length) {
    return null;
  }

  const visibleColumns =
    columns.length > 4 ? columns.slice(-4) : columns;

  const attributeKeys = Array.from(
    visibleColumns.reduce((acc, column) => {
      Object.keys(column.values ?? {}).forEach((key) => acc.add(key));
      return acc;
    }, new Set<string>())
  ).sort((a, b) => {
    if (attributeSort) {
      return attributeSort(a, b);
    }

    return a.localeCompare(b, 'fa-IR');
  });

  const hasStatuses = visibleColumns.some((column) => column.status);
  const hasAttributes = attributeKeys.length > 0;

  const rows: Array<{ type: 'status' | 'attribute'; key: string; label: string }> = [];

  if (hasStatuses) {
    rows.push({ type: 'status', key: '__status__', label: 'وضعیت' });
  }

  if (hasAttributes) {
    attributeKeys.forEach((key) => {
      rows.push({ type: 'attribute', key, label: resolveAttributeLabel(key) });
    });
  }

  const isUniformRow = (rowKey: string, rowType: 'status' | 'attribute') => {
    if (rowType === 'status') {
      const serialized = visibleColumns.map((column) => column.status?.type ?? 'none');
      return serialized.every((value) => value === serialized[0]);
    }

    const serialized = visibleColumns.map((column) => {
      const value = column.values[rowKey];
      if (value === null || value === undefined) {
        return '∅';
      }
      if (typeof value === 'object') {
        return JSON.stringify(value);
      }
      return String(value);
    });

    return serialized.every((value) => value === serialized[0]);
  };

  const gridColumns = `max-content repeat(${visibleColumns.length}, minmax(200px, 1fr))`;
  const totalColumns = visibleColumns.length + 1;
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
        width: 'fit-content',
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
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1.5,
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <FormControlLabel
          control={
            <Switch
              color="primary"
              checked={onlyDifferences}
              onChange={(event) => onToggleOnlyDifferences?.(event.target.checked)}
            />
          }
          label="فقط تفاوت‌ها"
          sx={{ direction: 'rtl' }}
        />

        {onBack && (
          <Button variant="outlined" onClick={onBack}>
            بازگشت به لیست
          </Button>
        )}
      </Box>

      <Box
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          border: `1px solid ${borderColor}`,
        }}
      >
        <Box sx={{ overflowX: 'auto' }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: gridColumns,
              gridAutoRows: 'minmax(64px, auto)',
              alignItems: 'stretch',
              minWidth: '100%',
              '& > .comparison-cell': {
                borderLeft: `1px solid ${borderColor}`,
                borderRight: `1px solid ${borderColor}`,
                alignSelf: 'stretch',
                height: '100%',
              },
              [`& > .comparison-cell:nth-of-type(${totalColumns}n + 1)`]: {
                borderLeft: 'none',
              },
              [`& > .comparison-cell:nth-of-type(${totalColumns}n)`]: {
                borderRight: 'none',
              },
              '& > .header-cell': {
                background: headerGradient,
                borderBottom: `1px solid ${borderColor}`,
                position: 'sticky',
                top: 0,
                zIndex: 2,
              },
            }}
          >
          <Box
            className="comparison-cell header-cell"
            sx={{
              px: 2,
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              fontWeight: 700,
              color: 'var(--color-primary)',
              fontSize: '0.95rem',
              minHeight: 64,
              textAlign: 'right',
            }}
          >
            {attributeLabel}
          </Box>

          {visibleColumns.map((column, columnIndex) => (
            <Box
              key={column.id}
              className="comparison-cell header-cell"
              sx={{
                px: 2,
                py: 1.25,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                pl: column.onRemove ? 4 : 0,
                minHeight: 64,
                backgroundColor:
                  columnIndex % 2 === 1
                    ? 'rgba(0, 198, 169, 0.18)'
                    : alpha(theme.palette.background.paper, 0.65),
              }}
            >
              <Typography
                component="p"
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
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
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

          {rows.length === 0 ? (
            <Box
              className="comparison-cell"
              sx={{
                gridColumn: `1 / span ${totalColumns}`,
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
            rows
              .filter((row) =>
                onlyDifferences ? !isUniformRow(row.key, row.type) : true
              )
              .map((row, rowIndex, filtered) => {
              const isLastRow = rowIndex === filtered.length - 1;

              return (
                <Box key={row.key} sx={{ display: 'contents' }}>
                  <Box
                    className="comparison-cell"
                    sx={{
                      px: 2,
                      py: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      backgroundColor: alpha(theme.palette.background.default, 0.1),
                      color: 'var(--color-secondary)',
                      fontWeight: 700,
                      borderBottom: isLastRow ? 'none' : `1px solid ${borderColor}`,
                      direction: 'rtl',
                      minHeight: 64,
                      textAlign: 'right',
                    }}
                  >
                    {row.label}
                  </Box>

                  {visibleColumns.map((column, columnIndex) => {
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
                      const renderedValue = formatValue(value);

                      if (isValidElement(renderedValue)) {
                        content = renderedValue;
                      } else {
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
                            {renderedValue}
                          </Typography>
                        );
                      }
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
                          backgroundColor:
                            columnIndex % 2 === 1
                              ? 'rgba(0, 198, 169, 0.18)'
                              : alpha(theme.palette.background.paper, 0.65),
                          borderBottom: isLastRow ? 'none' : `1px solid ${borderColor}`,
                          minHeight: 64,
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
            })
          )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DetailComparisonPanel;