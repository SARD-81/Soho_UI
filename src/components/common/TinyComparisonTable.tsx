import { Box, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { ReactNode } from 'react';
import type { NestedDetailTableData } from '../../@types/detailComparison';

interface TinyComparisonTableProps {
  data: NestedDetailTableData;
  attributeSort?: (a: string, b: string) => number;
}

const TinyComparisonTable = ({ data, attributeSort }: TinyComparisonTableProps) => {
  const theme = useTheme();
  const { attributeLabel = 'ویژگی', emptyStateMessage, columns } = data;
  const visibleColumns = columns.length > 4 ? columns.slice(-4) : columns;

  const attributeKeys = Array.from(
    visibleColumns.reduce((acc, column) => {
      Object.keys(column.values ?? {}).forEach((key) => acc.add(key));
      return acc;
    }, new Set<string>())
  ).sort((a, b) => (attributeSort ? attributeSort(a, b) : a.localeCompare(b, 'fa-IR')));

  const rows: Array<{ key: string; label: string }> = attributeKeys.map((key) => ({
    key,
    label: key,
  }));

  const gridColumns = `max-content repeat(${visibleColumns.length}, minmax(140px, 1fr))`;
  const totalColumns = visibleColumns.length + 1;
  const headerGradient =
    theme.palette.mode === 'dark'
      ? `linear-gradient(135deg, ${alpha('#00c6a9', 0.28)} 0%, ${alpha('#1fb6ff', 0.18)} 100%)`
      : `linear-gradient(135deg, ${alpha('#00c6a9', 0.1)} 0%, ${alpha('#1fb6ff', 0.08)} 100%)`;
  const borderColor = alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.35 : 0.22);
  const backgroundColor = alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.9 : 1);
  const selectedRowHover = alpha(theme.palette.primary.main, 0.06);

  return (
    <Box
      sx={{
        mt: 1,
        display: 'inline-block',
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
        background: backgroundColor,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: gridColumns,
          borderColor,
          borderStyle: 'solid',
          borderWidth: 1,
          borderRadius: 2,
          '& > .tiny-comparison-cell': {
            borderRight: `1px solid ${borderColor}`,
            borderBottom: `1px solid ${borderColor}`,
            '&:last-of-type': {
              borderRight: 'none',
            },
          },
          '& > .tiny-header-cell': {
            background: headerGradient,
            borderBottom: `1px solid ${borderColor}`,
          },
        }}
      >
        <Box
          className="tiny-comparison-cell tiny-header-cell"
          sx={{
            px: 1.25,
            py: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            fontWeight: 700,
            color: 'var(--color-primary)',
            fontSize: '0.9rem',
            minHeight: 48,
            textAlign: 'right',
          }}
        >
          {attributeLabel}
        </Box>

        {visibleColumns.map((column, columnIndex) => (
          <Box
            key={column.id}
            className="tiny-comparison-cell tiny-header-cell"
            sx={{
              px: 1.25,
              py: 0.9,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 48,
              backgroundColor:
                columnIndex % 2 === 1
                  ? 'rgba(0, 198, 169, 0.15)'
                  : alpha(theme.palette.background.paper, 0.75),
            }}
          >
            <Typography
              component="p"
              sx={{
                fontWeight: 700,
                color: 'var(--color-text)',
                fontSize: '0.9rem',
                whiteSpace: 'nowrap',
              }}
            >
              {column.title}
            </Typography>
          </Box>
        ))}

        {rows.length === 0 ? (
          <Box
            className="tiny-comparison-cell"
            sx={{
              gridColumn: `1 / span ${totalColumns}`,
              px: 2,
              py: 2,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: alpha(theme.palette.background.default, 0.5),
            }}
          >
            <Typography sx={{ color: 'var(--color-secondary)', fontSize: '0.9rem' }}>
              {emptyStateMessage ?? 'اطلاعاتی برای نمایش وجود ندارد.'}
            </Typography>
          </Box>
        ) : (
          rows.map((row, rowIndex) => {
            const isLastRow = rowIndex === rows.length - 1;

            return (
              <Box key={row.key} sx={{ display: 'contents' }}>
                <Box
                  className="tiny-comparison-cell"
                  sx={{
                    px: 1.25,
                    py: 0.9,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    backgroundColor: alpha(theme.palette.background.default, 0.12),
                    color: 'var(--color-secondary)',
                    fontWeight: 700,
                    borderBottom: isLastRow ? 'none' : `1px solid ${borderColor}`,
                    direction: 'rtl',
                    minHeight: 48,
                    textAlign: 'right',
                    fontSize: '0.9rem',
                  }}
                >
                  {row.label}
                </Box>

                {visibleColumns.map((column, columnIndex) => {
                  const cellKey = `${row.key}-${column.id}`;
                  const value = column.values[row.key];
                  let content: ReactNode = value;

                  if (content == null || content === '') {
                    content = '-';
                  }

                  const isString = typeof content === 'string' || typeof content === 'number';

                  return (
                    <Box
                      key={cellKey}
                      className="tiny-comparison-cell"
                      sx={{
                        px: 1.25,
                        py: 0.9,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor:
                          columnIndex % 2 === 1
                            ? 'rgba(0, 198, 169, 0.1)'
                            : alpha(theme.palette.background.paper, 0.75),
                        borderBottom: isLastRow ? 'none' : `1px solid ${borderColor}`,
                        minHeight: 48,
                        '&:hover': {
                          backgroundColor: selectedRowHover,
                        },
                      }}
                    >
                      {isString ? (
                        <Typography
                          sx={{
                            color: 'var(--color-text)',
                            fontWeight: 500,
                            textAlign: 'center',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            direction: 'rtl',
                            unicodeBidi: 'plaintext',
                            fontSize: '0.9rem',
                          }}
                        >
                          {content}
                        </Typography>
                      ) : (
                        content
                      )}
                    </Box>
                  );
                })}
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
};

export default TinyComparisonTable;
