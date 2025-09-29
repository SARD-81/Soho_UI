import {
  Box,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { useMemo } from 'react';
import { MdDeleteOutline } from 'react-icons/md';
import type { DataTableColumn } from '../../@types/dataTable.ts';
import type { VolumeEntry } from '../../@types/volume';
import DataTable from '../DataTable';

interface VolumesTableProps {
  volumes: VolumeEntry[];
  attributeKeys: string[];
  isLoading: boolean;
  error: Error | null;
  onDeleteVolume: (volume: VolumeEntry) => void;
  isDeleteDisabled: boolean;
}

const valueTypographySx = {
  fontWeight: 600,
  color: 'var(--color-text)',
};

const VolumesTable = ({
  volumes,
  attributeKeys,
  isLoading,
  error,
  onDeleteVolume,
  isDeleteDisabled,
}: VolumesTableProps) => {
  const columns = useMemo<DataTableColumn<VolumeEntry>[]>(() => {
    const baseColumns: DataTableColumn<VolumeEntry>[] = [
      {
        id: 'pool',
        header: 'نام Pool',
        align: 'left',
        renderCell: (volume) => (
          <Typography sx={{ fontWeight: 700, color: 'var(--color-text)' }}>
            {volume.poolName}
          </Typography>
        ),
      },
      {
        id: 'volume',
        header: 'نام Volume',
        align: 'left',
        renderCell: (volume) => (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            <Typography sx={{ fontWeight: 700, color: 'var(--color-text)' }}>
              {volume.volumeName}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'var(--color-secondary)' }}
            >
              {volume.fullName}
            </Typography>
          </Box>
        ),
      },
    ];

    const dynamicColumns = attributeKeys.map<DataTableColumn<VolumeEntry>>(
      (key) => ({
        id: `attribute-${key}`,
        header: key,
        align: 'left',
        renderCell: (volume) => (
          <Typography sx={valueTypographySx}>
            {volume.attributeMap[key] ?? '—'}
          </Typography>
        ),
      })
    );

    const actionColumn: DataTableColumn<VolumeEntry> = {
      id: 'actions',
      header: 'عملیات',
      align: 'center',
      renderCell: (volume) => (
        <Tooltip title="حذف Volume">
          <span>
            <IconButton
              size="small"
              color="error"
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
    <DataTable<VolumeEntry>
      columns={columns}
      data={volumes}
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
