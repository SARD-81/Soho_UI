import {
  Box,
  Checkbox,
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
} from '@mui/material';
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
  activeRowId,
  isLoading = false,
  error = null,
  renderLoadingState,
  renderErrorState,
  renderEmptyState,
  containerSx,
  tableSx,
  headRowSx,
  bodyRowSx,
  onRowClick,
  pinning,
  containerProps,
  tableProps,
  pagination,
}: DataTableProps<T>) => {
  const pinnedIds = pinning?.pinnedIds
    ? new Set(pinning.pinnedIds)
    : undefined;
  const showPinning = Boolean(pinning);

  const renderStateRow = (content: ReactNode) => (
    <TableRow>
      <TableCell
        colSpan={columns.length + (showPinning ? 1 : 0)}
        align="center"
        sx={{ py: 6 }}
      >
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
            {showPinning && (
              <TableCell
                padding="checkbox"
                sx={{ width: 52, textAlign: 'center' }}
              >
                {pinning?.pinColumnLabel}
              </TableCell>
            )}
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
            const clickableRowSx = onRowClick
              ? ({ cursor: 'pointer' } as SxProps<Theme>)
              : undefined;
            const isActive = activeRowId != null && activeRowId === rowId;
            const isPinned = pinnedIds?.has(rowId);
            const interactiveRowSx: SxProps<Theme> = {
              ...(isActive
                ? {
                    outline: '2px solid var(--color-primary)',
                    outlineOffset: -2,
                  }
                : {}),
              ...(isPinned
                ? {
                    backgroundColor: 'rgba(0, 198, 169, 0.08)',
                  }
                : {}),
            };

            return (
              <TableRow
                key={rowId}
                hover={Boolean(onRowClick)}
                onClick={
                  onRowClick
                    ? () => {
                        onRowClick(row, index);
                      }
                    : undefined
                }
                sx={mergeSx(
                  defaultBodyRowSx,
                  resolvedRowSx,
                  interactiveRowSx,
                  clickableRowSx
                )}
              >
                {showPinning && (
                  <TableCell padding="checkbox" sx={{ textAlign: 'center' }}>
                    <Checkbox
                      color="primary"
                      checked={isPinned}
                      onChange={(event) => {
                        event.stopPropagation();
                        const nextPinned = event.target.checked;
                        pinning?.onTogglePin(row, rowId, nextPinned);
                      }}
                      inputProps={{ 'aria-label': 'افزودن به مقایسه' }}
                    />
                  </TableCell>
                )}
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
              <TableCell colSpan={columns.length + (showPinning ? 1 : 0)} sx={{ py: 2 }}>
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