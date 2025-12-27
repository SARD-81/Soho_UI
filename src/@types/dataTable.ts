import type {
  TableCellProps,
  TableContainerProps,
  TableProps,
} from '@mui/material';
import type { TablePaginationProps } from '@mui/material/TablePagination';
import type { SxProps, Theme } from '@mui/material/styles';
import type { ChangeEvent, ReactNode } from 'react';

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
  activeRowId?: string | null;
  isLoading?: boolean;
  error?: Error | null;
  renderLoadingState?: () => ReactNode;
  renderErrorState?: (error: Error) => ReactNode;
  renderEmptyState?: () => ReactNode;
  containerSx?: SxProps<Theme>;
  tableSx?: SxProps<Theme>;
  headRowSx?: SxProps<Theme>;
  bodyRowSx?: SxProps<Theme> | ((row: T, index: number) => SxProps<Theme>);
  onRowClick?: (row: T, index: number) => void;
  /**
   * Enables pushing row clicks into the shared detail selection store to power
   * the split-view monitoring layout.
   * Defaults to true so existing tables automatically light up the detail pane
   * when rows are clicked.
   */
  enableRowActivation?: boolean;
  containerProps?: TableContainerProps;
  tableProps?: TableProps;
  pagination?: {
    page: number;
    rowsPerPage: number;
    count: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: ChangeEvent<HTMLInputElement>) => void;
    rowsPerPageOptions?: number[];
    labelRowsPerPage?: ReactNode;
    labelDisplayedRows?: TablePaginationProps['labelDisplayedRows'];
    rowCountFormatter?: (count: number) => ReactNode;
  };
}