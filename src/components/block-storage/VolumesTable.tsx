import {
  Box,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { useMemo } from 'react';
import { MdDeleteOutline } from 'react-icons/md';
import type { VolumeEntry } from '../../@types/volume';
import type { DataTableColumn } from '../DataTable';
import DataTable from '../DataTable';

interface VolumeTableRow extends VolumeEntry {
  attributeMap: Record<string, string>;
}

interface VolumesTableProps {
  volumes: VolumeEntry[];
  isLoading: boolean;
  error: Error | null;
  onDeleteVolume: (volume: VolumeEntry) => void;
  isDeleteDisabled: boolean;
}

const VolumesTable = ({
  volumes,
  isLoading,
  error,
  onDeleteVolume,
  isDeleteDisabled,
}: VolumesTableProps) => {
  const rows = useMemo<VolumeTableRow[]>(
    () =>
      volumes.map((volume) => ({
        ...volume,
        attributeMap: volume.attributes.reduce<Record<string, string>>(
          (acc, attribute) => {
            acc[attribute.key] = attribute.value;
            return acc;
          },
          {}
        ),
      })),
    [volumes]
  );

  const attributeKeys = useMemo(() => {
    const keys = new Set<string>();

    rows.forEach((row) => {
      Object.keys(row.attributeMap).forEach((key) => {
        if (key.trim().toLowerCase() !== 'name') {
          keys.add(key);
        }
      });
    });

    return Array.from(keys).sort((a, b) => a.localeCompare(b, 'fa'));
  }, [rows]);

  const columns: DataTableColumn<VolumeTableRow>[] = useMemo(() => {
    const baseColumns: DataTableColumn<VolumeTableRow>[] = [
      {
        id: 'poolName',
        header: 'نام Pool',
        align: 'left',
        renderCell: (volume) => (
          <Typography sx={{ fontWeight: 700, color: 'var(--color-text)' }}>
            {volume.poolName}
          </Typography>
        ),
      },
      {
        id: 'volumeName',
        header: 'نام Volume',
        align: 'left',
        renderCell: (volume) => (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography sx={{ fontWeight: 600, color: 'var(--color-text)' }}>
              {volume.volumeName}
            </Typography>
            <Typography variant="caption" sx={{ color: 'var(--color-secondary)' }}>
              {volume.fullName}
            </Typography>
          </Box>
        ),
      },
    ];

    const dynamicColumns = attributeKeys.map((key) => ({
      id: `attr-${key}`,
      header: key,
      align: 'left' as const,
      renderCell: (volume: VolumeTableRow) => (
        <Typography sx={{ color: 'var(--color-text)' }}>
          {volume.attributeMap[key] ?? '—'}
        </Typography>
      ),
    }));

    const actionColumn: DataTableColumn<VolumeTableRow> = {
      id: 'actions',
      header: 'عملیات',
      align: 'center',
      renderCell: (volume) => (
        <Tooltip title="حذف Volume">
          <span>
            <IconButton
              color="error"
              size="small"
              onClick={() => onDeleteVolume(volume)}
              disabled={isDeleteDisabled}
            >
              <MdDeleteOutline size={18} />
            </IconButton>
          </span>
        </Tooltip>
      ),
    };

    return [...baseColumns, ...dynamicColumns, actionColumn];
  }, [attributeKeys, isDeleteDisabled, onDeleteVolume]);

  return (
    <DataTable<VolumeTableRow>
      columns={columns}
      data={rows}
      getRowId={(volume) => volume.id}
      isLoading={isLoading}
      error={error}
      renderLoadingState={() => (
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
            در حال دریافت اطلاعات Volume ها...
          </Typography>
        </Box>
      )}
      renderErrorState={(tableError) => (
        <Typography sx={{ color: 'var(--color-error)' }}>
          خطا در دریافت اطلاعات Volume ها: {tableError.message}
        </Typography>
      )}
      renderEmptyState={() => (
        <Typography sx={{ color: 'var(--color-secondary)' }}>
          هیچ Volumeی برای نمایش وجود ندارد.
        </Typography>
      )}
    />
  );
};

export default VolumesTable;
