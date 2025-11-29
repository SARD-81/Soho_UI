import {
  Card,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@mui/material';
import type { ReactNode } from 'react';

export type KeyValueRow = { label: string; value: ReactNode };

interface KeyValueCardProps {
  title: string;
  rows: KeyValueRow[];
}

const KeyValueCard = ({ title, rows }: KeyValueCardProps) => {
  if (!rows.length) {
    return null;
  }

  return (
    <Card>
      <CardHeader title={title} />
      <Table size="small">
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.label}>
              <TableCell>{row.label}</TableCell>
              <TableCell>{row.value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default KeyValueCard;
