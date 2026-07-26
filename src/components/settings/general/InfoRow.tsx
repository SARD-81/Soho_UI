import { Divider, Stack, Typography } from '@mui/material';
import { Fragment, type ReactNode } from 'react';
import Ltr from './Ltr';

export interface InfoRowProps {
  label: string;
  value: ReactNode;
  /** Isolate the value as an LTR technical token (hostname, timestamp, IP). */
  ltr?: boolean;
}

/**
 * Single read-only label/value line used by the settings overview cards.
 * Layout relies on the document RTL direction plus logical properties, so the
 * RTL stylis plugin cannot mirror it back to LTR.
 */
export const InfoRow = ({ label, value, ltr = false }: InfoRowProps) => (
  <Stack
    direction="row"
    alignItems="center"
    gap={1.5}
    sx={{ py: 0.85, minWidth: 0 }}
  >
    <Typography
      variant="body2"
      component="span"
      sx={{
        width: { xs: 104, md: 122 },
        flexShrink: 0,
        color: 'var(--color-secondary)',
        fontSize: '0.78rem',
        textAlign: 'start',
      }}
    >
      {label}
    </Typography>
    <Typography
      component="div"
      variant="body2"
      sx={{
        minWidth: 0,
        flex: 1,
        color: 'var(--color-text)',
        fontWeight: 700,
        fontSize: '0.82rem',
        textAlign: 'start',
        overflowWrap: 'anywhere',
      }}
    >
      {ltr ? <Ltr>{value}</Ltr> : value}
    </Typography>
  </Stack>
);

export interface InfoRowListProps {
  rows: Array<InfoRowProps & { key?: string }>;
}

/**
 * Renders a list of `InfoRow`s with dividers in between, so cards no longer
 * have to interleave `<Divider />` manually.
 */
export const InfoRowList = ({ rows }: InfoRowListProps) => (
  <>
    {rows.map((row, index) => (
      <Fragment key={row.key ?? row.label}>
        {index > 0 ? (
          <Divider
            sx={{
              borderColor:
                'color-mix(in srgb, var(--color-secondary) 16%, transparent)',
            }}
          />
        ) : null}
        <InfoRow label={row.label} value={row.value} ltr={row.ltr} />
      </Fragment>
    ))}
  </>
);

export default InfoRow;
