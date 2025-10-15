import {
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';
import type { DataTableProps } from '../@types/dataTable.ts';
import {
  baseTableSx,
  defaultBodyCellSx,
  defaultBodyRowSx,
  defaultContainerSx,
  defaultHeaderCellSx,
  defaultHeadRowSx,
} from '../constants/dataTable.ts';

const mergeSx = (...styles: (SxProps<Theme> | undefined)[]): SxProps<Theme> => {
  const filtered = styles.filter((style): style is SxProps<Theme> =>
    Boolean(style)
  );

  if (filtered.length === 0) {
    return {};
  }

  if (filtered.length === 1) {
    return filtered[0];
  }

  return filtered as unknown as SxProps<Theme>;
};

const DefaultLoadingState = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      alignItems: 'center',
    }}
  >
    <CircularProgress color="primary" size={32} />
    <Typography sx={{ color: 'var(--color-secondary)' }}>
      در حال بارگذاری اطلاعات...
    </Typography>
  </Box>
);

const DefaultErrorState = ({ error }: { error: Error }) => (
  <Typography sx={{ color: 'var(--color-error)' }}>
    خطا در دریافت اطلاعات: {error.message}
  </Typography>
);

const DefaultEmptyState = () => (
  <Typography sx={{ color: 'var(--color-secondary)' }}>
    داده‌ای برای نمایش وجود ندارد.
  </Typography>
);

const DataTable = <T,>({
  columns,
  data,
  getRowId,
  isLoading = false,
  error = null,
  renderLoadingState,
  renderErrorState,
  renderEmptyState,
  containerSx,
  tableSx,
  headRowSx,
  bodyRowSx,
  containerProps,
  tableProps,
  onRowClick,
  isRowSelected,
  pagination,
}: DataTableProps<T>) => {
  const theme = useTheme();
  const hoverHighlight = alpha(
    theme.palette.primary.main,
    theme.palette.mode === 'dark' ? 0.18 : 0.08
  );
  const selectedHighlight = alpha(
    theme.palette.primary.main,
    theme.palette.mode === 'dark' ? 0.26 : 0.14
  );
  const selectedShadow = alpha(theme.palette.primary.main, 0.55);

  const renderStateRow = (content: ReactNode) => (
    <TableRow>
      <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
        {content}
      </TableCell>
    </TableRow>
  );

  const createWidthSx = (width: number | string | undefined) =>
    width !== undefined ? ({ width } as SxProps<Theme>) : undefined;

  return (
    <TableContainer
      component={Paper}
      sx={mergeSx(defaultContainerSx, containerSx)}
      {...containerProps}
    >
      <Table
        sx={mergeSx(baseTableSx, tableSx)}
        {...tableProps}
        size="small"
        aria-label="a dense table"
      >
        <TableHead>
          <TableRow sx={mergeSx(defaultHeadRowSx, headRowSx)}>
            {columns.map((column) => {
              const headerProps = column.headerProps ?? {};
              const {
                sx: headerPropsSx,
                align: headerAlign,
                padding: headerPadding,
                ...restHeaderProps
              } = headerProps;
              const widthSx = createWidthSx(column.width);

              return (
                <TableCell
                  key={column.id}
                  align={headerAlign ?? column.align}
                  padding={headerPadding ?? column.padding}
                  sx={mergeSx(
                    defaultHeaderCellSx,
                    widthSx,
                    column.headerSx,
                    headerPropsSx
                  )}
                  {...restHeaderProps}
                >
                  {column.header}
                </TableCell>
              );
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading &&
            renderStateRow(
              renderLoadingState ? (
                renderLoadingState()
              ) : (
                <DefaultLoadingState />
              )
            )}

          {error &&
            !isLoading &&
            renderStateRow(
              renderErrorState ? (
                renderErrorState(error)
              ) : (
                <DefaultErrorState error={error} />
              )
            )}

          {!isLoading &&
            !error &&
            data.length === 0 &&
            renderStateRow(
              renderEmptyState ? renderEmptyState() : <DefaultEmptyState />
            )}

          {data.map((row, index) => {
            const resolvedRowSx =
              typeof bodyRowSx === 'function'
                ? (bodyRowSx as (row: T, index: number) => SxProps<Theme>)(
                    row,
                    index
                  )
                : bodyRowSx;
            const rowId = getRowId(row, index);

            const selected = isRowSelected?.(row, index) ?? false;
            const clickable = Boolean(onRowClick);
            const rowClickHandler = clickable
              ? () => onRowClick?.(row, index)
              : undefined;

            const clickableStyles = clickable
              ? {
                  cursor: 'pointer',
                  transition: 'background-color 0.25s ease, box-shadow 0.25s ease',
                  '&:hover': {
                    backgroundColor: hoverHighlight,
                  },
                }
              : undefined;

            const selectedStyles = selected
              ? {
                  backgroundColor: selectedHighlight,
                  boxShadow: `0 18px 42px -24px ${selectedShadow}`,
                  '&:hover': clickable
                    ? {
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          theme.palette.mode === 'dark' ? 0.32 : 0.18
                        ),
                      }
                    : undefined,
                }
              : undefined;

            return (
              <TableRow
                key={rowId}
                hover={clickable}
                onClick={rowClickHandler}
                sx={mergeSx(
                  defaultBodyRowSx,
                  resolvedRowSx,
                  clickableStyles,
                  selectedStyles
                )}
              >
                {columns.map((column) => {
                  const cellProps = column.getCellProps?.(row, index) ?? {};
                  const {
                    sx: cellPropsSx,
                    align: cellAlign,
                    padding: cellPadding,
                    ...restCellProps
                  } = cellProps;
                  const widthSx = createWidthSx(column.width);

                  return (
                    <TableCell
                      key={column.id}
                      align={cellAlign ?? column.align}
                      padding={cellPadding ?? column.padding}
                      sx={mergeSx(
                        defaultBodyCellSx,
                        widthSx,
                        column.cellSx,
                        cellPropsSx
                      )}
                      {...restCellProps}
                    >
                      {column.renderCell(row, index)}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
        {pagination ? (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={columns.length} sx={{ py: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                  }}
                >
                  <Typography sx={{ color: 'var(--color-secondary)' }}>
                    {pagination.rowCountFormatter
                      ? pagination.rowCountFormatter(pagination.count)
                      : `تعداد سطرها: ${pagination.count.toLocaleString('en-US')}`}
                  </Typography>
                  <TablePagination
                    component="div"
                    count={pagination.count}
                    page={pagination.page}
                    onPageChange={pagination.onPageChange}
                    rowsPerPage={pagination.rowsPerPage}
                    onRowsPerPageChange={pagination.onRowsPerPageChange}
                    rowsPerPageOptions={pagination.rowsPerPageOptions}
                    labelRowsPerPage={pagination.labelRowsPerPage}
                    labelDisplayedRows={pagination.labelDisplayedRows}
                    sx={{
                      '& .MuiTablePagination-displayedRows': {
                        fontFamily: 'var(--font-vazir)',
                        color: 'var(--color-text)',
                      },
                      '& .MuiTablePagination-selectLabel': {
                        fontFamily: 'var(--font-vazir)',
                        color: 'var(--color-text)',
                      },
                      '& .MuiTablePagination-input': {
                        fontFamily: 'var(--font-vazir)',
                        color: 'var(--color-text)',
                      },
                    }}
                  />
                </Box>
              </TableCell>
            </TableRow>
          </TableFooter>
        ) : null}
      </Table>
    </TableContainer>
  );
};

export default DataTable;
