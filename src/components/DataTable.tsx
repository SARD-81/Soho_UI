import {
    Box,
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import type { TableCellProps, TableContainerProps, TableProps } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';

export interface DataTableColumn<T> {
    id: string;
    header: ReactNode;
    align?: TableCellProps['align'];
    width?: number | string;
    padding?: TableCellProps['padding'];
    headerSx?: SxProps<Theme>;
    headerProps?: Partial<TableCellProps>;
    cellSx?: SxProps<Theme>;
    getCellProps?: (row: T, index: number) => Partial<TableCellProps>;
    renderCell: (row: T, index: number) => ReactNode;
}

export interface DataTableProps<T> {
    columns: DataTableColumn<T>[];
    data: T[];
    getRowId: (row: T, index: number) => string;
    isLoading?: boolean;
    error?: Error | null;
    renderLoadingState?: () => ReactNode;
    renderErrorState?: (error: Error) => ReactNode;
    renderEmptyState?: () => ReactNode;
    containerSx?: SxProps<Theme>;
    tableSx?: SxProps<Theme>;
    headRowSx?: SxProps<Theme>;
    bodyRowSx?: SxProps<Theme> | ((row: T, index: number) => SxProps<Theme>);
    containerProps?: TableContainerProps;
    tableProps?: TableProps;
}

const defaultContainerSx: SxProps<Theme> = {
    mt: 4,
    borderRadius: 3,
    backgroundColor: 'var(--color-card-bg)',
    border: '1px solid var(--color-input-border)',
    boxShadow: '0 18px 40px -24px rgba(0, 0, 0, 0.35)',
    overflow: 'hidden',
};

const defaultHeadRowSx: SxProps<Theme> = {
    background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-light))',
    '& .MuiTableCell-root': {
        color: 'var(--color-bg)',
        fontWeight: 700,
        fontSize: '0.95rem',
        borderBottom: 'none',
    },
};

const defaultBodyRowSx: SxProps<Theme> = {
    '&:last-of-type .MuiTableCell-root': {
        borderBottom: 'none',
    },
    '& .MuiTableCell-root': {
        borderBottom: '1px solid var(--color-input-border)',
        fontSize: '0.92rem',
    },
    '&:hover': {
        backgroundColor: 'rgba(0, 198, 169, 0.08)',
    },
};

const defaultHeaderCellSx: SxProps<Theme> = {
    fontWeight: 700,
    fontSize: '0.95rem',
};

const defaultBodyCellSx: SxProps<Theme> = {
    color: 'var(--color-text)',
};

const baseTableSx: SxProps<Theme> = { minWidth: 720 };

const mergeSx = (
    ...styles: (SxProps<Theme> | undefined)[]
): SxProps<Theme> => {
    const filtered = styles.filter(
        (style): style is SxProps<Theme> => Boolean(style)
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
                       }: DataTableProps<T>) => {
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
            <Table sx={mergeSx(baseTableSx, tableSx)} {...tableProps}>
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
                                    sx={mergeSx(defaultHeaderCellSx, widthSx, column.headerSx, headerPropsSx)}
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
                            renderLoadingState ? renderLoadingState() : <DefaultLoadingState />
                        )}

                    {error && !isLoading &&
                        renderStateRow(
                            renderErrorState ? (
                                renderErrorState(error)
                            ) : (
                                <DefaultErrorState error={error} />
                            )
                        )}

                    {!isLoading && !error && data.length === 0 &&
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

                        return (
                            <TableRow key={rowId} sx={mergeSx(defaultBodyRowSx, resolvedRowSx)}>
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
                                            sx={mergeSx(defaultBodyCellSx, widthSx, column.cellSx, cellPropsSx)}
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
            </Table>
        </TableContainer>
    );
};

export default DataTable;
