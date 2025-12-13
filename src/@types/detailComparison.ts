import type { ReactNode } from 'react';

export interface NestedDetailTableColumn {
  id: string;
  title: string;
  values: Record<string, ReactNode>;
}

export interface NestedDetailTableData {
  type: 'nested-detail-table';
  attributeLabel?: string;
  emptyStateMessage?: string;
  columns: NestedDetailTableColumn[];
}

export const isNestedDetailTableData = (
  value: unknown
): value is NestedDetailTableData => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const data = value as Partial<NestedDetailTableData>;
  return (
    data.type === 'nested-detail-table' &&
    Array.isArray(data.columns) &&
    data.columns.every(
      (column) =>
        column &&
        typeof column === 'object' &&
        typeof column.id === 'string' &&
        typeof column.title === 'string' &&
        column.values &&
        typeof column.values === 'object'
    )
  );
};
