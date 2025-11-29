import {
  Card,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import type { ReactNode } from 'react';

export type ColumnDef<T> = {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
};

interface ArrayTableSectionProps<T> {
  title: string;
  data: T[];
  columns: ColumnDef<T>[];
}

function ArrayTableSection<T>({ title, data, columns }: ArrayTableSectionProps<T>) {
  if (!data?.length) return null;

  return (
    <Card>
      <CardHeader title={title} />
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map((c) => (
              <TableCell key={c.id}>{c.header}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, i) => (
            <TableRow key={i}>
              {columns.map((c) => (
                <TableCell key={c.id}>{c.cell(row)}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

export default ArrayTableSection;
