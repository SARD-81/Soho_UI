import { Box, CircularProgress, IconButton, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { MdClose } from 'react-icons/md';
import { isValidElement, type ReactNode } from 'react';
import {
  selectActiveItemId,
  selectPinnedItemIds,
  useDetailSelectionStore,
} from '../../hooks/useDetailSelectionStore';

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
}

const DetailComparisonPanel = ({
  title,
  attributeLabel,
  columns,
  formatValue,
  emptyStateMessage,
  attributeSort,
  attributeLabelResolver,
}: DetailComparisonPanelProps) => {
  const theme = useTheme();
  const resolveAttributeLabel = attributeLabelResolver ?? ((key: string) => key);
  const activeItemId = useDetailSelectionStore(selectActiveItemId);
  const pinnedItemIds = useDetailSelectionStore(selectPinnedItemIds);

  if (!columns.length) {
    return null;
  }

  const visibleColumns = columns;

  const normalizeValue = (value: unknown) => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

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

  const attributeDifferences = attributeKeys.reduce<Record<string, boolean>>(
    (acc, key) => {
      const normalizedValues = visibleColumns.map((column) => normalizeValue(column.values[key]));
      acc[key] = new Set(normalizedValues).size > 1;
      return acc;
    },
    {}
  );

  const hasStatuses = visibleColumns.some((column) => column.status);
  const statusSignature = (status?: DetailComparisonStatus) =>
    status ? `${status.type}-${status.message ?? ''}` : 'none';
  const statusDiffers = hasStatuses
    ? new Set(visibleColumns.map((column) => statusSignature(column.status))).size > 1
    : false;
  const hasAttributes = attributeKeys.length > 0;

  const columnCount = Math.min(Math.max(visibleColumns.length, 1), 3);
  const gridColumnsClass =
    columnCount === 1
      ? 'grid-cols-1'
      : columnCount === 2
        ? 'grid-cols-1 md:grid-cols-2'
        : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3';
  const headerGradient =
    theme.palette.mode === 'dark'
      ? `linear-gradient(135deg, ${alpha('#00c6a9', 0.3)} 0%, ${alpha('#1fb6ff', 0.2)} 100%)`
      : `linear-gradient(135deg, ${alpha('#00c6a9', 0.12)} 0%, ${alpha('#1fb6ff', 0.1)} 100%)`;
  const borderColor = alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.4 : 0.25);
  const backgroundColor = alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.9 : 1);
  const selectedRowHover = alpha(theme.palette.primary.main, 0.08);
  const differenceColor = alpha(theme.palette.error.main, 0.08);

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
        width: '100%',
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: 800,
          color: 'var(--color-primary)',
          letterSpacing: 0.5,
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          color: 'var(--color-secondary)',
          fontWeight: 600,
          mt: 0.5,
          mb: 1,
        }}
      >
        {attributeLabel}
      </Typography>

      <Box
        className={`grid gap-4 transition-all duration-300 ${gridColumnsClass}`}
        sx={{ width: '100%', alignItems: 'stretch' }}
      >
        {visibleColumns.map((column) => {
          const isActive = activeItemId === column.id;
          const isPinned = pinnedItemIds.includes(column.id);

          return (
            <Box
              key={column.id}
              sx={{
                borderRadius: 2,
                border: `1px solid ${isActive ? alpha(theme.palette.primary.main, 0.45) : borderColor}`,
                background: alpha(theme.palette.background.paper, 0.95),
                boxShadow:
                  theme.palette.mode === 'dark'
                    ? '0 18px 38px -28px rgba(0,0,0,0.9)'
                    : '0 18px 38px -28px rgba(15,73,110,0.55)',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                borderLeft: isPinned
                  ? `3px solid ${alpha(theme.palette.primary.main, 0.85)}`
                  : undefined,
              }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  background: headerGradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                }}
              >
                <Typography
                  component="p"
                  sx={{
                    fontWeight: 800,
                    color: 'var(--color-primary)',
                    fontSize: '1rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {column.title}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  {isActive && (
                    <Typography
                      sx={{
                        backgroundColor: alpha(theme.palette.primary.main, 0.15),
                        color: 'var(--color-primary)',
                        px: 1,
                        py: 0.25,
                        borderRadius: 1,
                        fontWeight: 700,
                        fontSize: '0.8rem',
                      }}
                    >
                      فعال
                    </Typography>
                  )}
                  {isPinned && (
                    <Typography
                      sx={{
                        backgroundColor: alpha(theme.palette.primary.main, 0.15),
                        color: 'var(--color-primary)',
                        px: 1,
                        py: 0.25,
                        borderRadius: 1,
                        fontWeight: 700,
                        fontSize: '0.8rem',
                      }}
                    >
                      پین‌شده
                    </Typography>
                  )}
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
                          transform: 'translateY(-1px)',
                        },
                      }}
                      aria-label={`${column.title} را از مقایسه حذف کنید`}
                    >
                      <MdClose size={18} />
                    </IconButton>
                  )}
                </Box>
              </Box>

              {hasStatuses && (
                <Box
                  sx={{
                    px: 2,
                    py: 1.25,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                    borderBottom: `1px solid ${borderColor}`,
                    backgroundColor: statusDiffers
                      ? differenceColor
                      : alpha(theme.palette.background.default, 0.08),
                  }}
                >
                  <Typography
                    sx={{
                      color: 'var(--color-secondary)',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                    }}
                  >
                    وضعیت
                  </Typography>

                  {(() => {
                    const status = column.status;
                    if (!status) {
                      return (
                        <Typography sx={{ color: 'var(--color-secondary)' }}>-</Typography>
                      );
                    }

                    if (status.type === 'loading') {
                      return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CircularProgress size={18} color="primary" />
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
                          textAlign: 'center',
                        }}
                      >
                        {status.message}
                      </Typography>
                    );
                  })()}
                </Box>
              )}

              <Box className="flex flex-col" sx={{ borderTop: hasStatuses ? 'none' : `1px solid ${borderColor}` }}>
                {(!hasAttributes && !hasStatuses) || attributeKeys.length === 0 ? (
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
                  attributeKeys.map((key, index) => {
                    const value = column.values[key];
                    const renderedValue = formatValue(value);
                    const isDifferent = attributeDifferences[key];
                    const content: ReactNode = isValidElement(renderedValue) ? (
                      renderedValue
                    ) : (
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

                    return (
                      <Box
                        key={`${column.id}-${key}`}
                        sx={{
                          px: 2,
                          py: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 1.5,
                          borderBottom:
                            index === attributeKeys.length - 1 ? 'none' : `1px solid ${borderColor}`,
                          backgroundColor: isDifferent
                            ? differenceColor
                            : index % 2 === 0
                              ? alpha(theme.palette.background.paper, 0.65)
                              : 'rgba(0, 198, 169, 0.1)',
                          '&:hover': {
                            backgroundColor: isDifferent
                              ? alpha(theme.palette.error.main, 0.12)
                              : selectedRowHover,
                          },
                        }}
                      >
                        <Typography
                          sx={{
                            color: 'var(--color-secondary)',
                            fontWeight: 700,
                            textAlign: 'left',
                            direction: 'ltr',
                            fontSize: '0.95rem',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {resolveAttributeLabel(key)}
                        </Typography>

                        <Box sx={{ maxWidth: '60%', textAlign: 'center' }}>{content}</Box>
                      </Box>
                    );
                  })
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default DetailComparisonPanel;
