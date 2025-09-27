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

interface VolumesTableProps {
  volumes: VolumeEntry[];
  attributeKeys: string[];
  isLoading: boolean;
  error: Error | null;
  onDeleteVolume: (volume: VolumeEntry) => void;
  isDeleteDisabled: boolean;
}

const VolumesTable = ({
  volumes,
  attributeKeys,
  isLoading,
  error,
  onDeleteVolume,
  isDeleteDisabled,
}: VolumesTableProps) => {
  const poolFirstRowIndex = useMemo(() => {
    const map = new Map<string, number>();

    volumes.forEach((volume, index) => {
      if (!map.has(volume.poolName)) {
        map.set(volume.poolName, index);
      }
    });

    return map;
  }, [volumes]);

  const columns: DataTableColumn<VolumeEntry>[] = useMemo(() => {
    const baseColumns: DataTableColumn<VolumeEntry>[] = [
      {
        id: 'pool',
        header: 'نام Pool',
        align: 'left',
        width: 160,
        renderCell: (volume, index) => {
          const firstIndex = poolFirstRowIndex.get(volume.poolName);
          const isFirst = firstIndex === index;

          return (
            <Typography
              sx={{
                fontWeight: isFirst ? 700 : 500,
                color: 'var(--color-text)',
                opacity: isFirst ? 1 : 0.7,
              }}
            >
              {volume.poolName}
            </Typography>
          );
        },
      },
      {
        id: 'volume',
        header: 'نام Volume',
        align: 'left',
        width: 200,
        renderCell: (volume) => (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography sx={{ fontWeight: 700, color: 'var(--color-text)' }}>
              {volume.volumeName}
            </Typography>
            <Typography variant="caption" sx={{ color: 'var(--color-secondary)' }}>
              {volume.fullName}
            </Typography>
          </Box>
        ),
      },
    ];

    const dynamicColumns: DataTableColumn<VolumeEntry>[] = attributeKeys.map(
      (key) => ({
        id: `attr-${key}`,
        header: key,
        align: 'left',
        renderCell: (volume) => {
          const attribute = volume.attributes.find((item) => item.key === key);

          return (
            <Typography sx={{ color: 'var(--color-text)', fontWeight: 500 }}>
              {attribute?.value ?? '—'}
            </Typography>
          );
        },
      })
    );

    const actionColumn: DataTableColumn<VolumeEntry> = {
      id: 'actions',
      header: 'عملیات',
      align: 'center',
      width: 120,
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
  }, [
    attributeKeys,
    isDeleteDisabled,
    onDeleteVolume,
    poolFirstRowIndex,
  ]);

  return (
    <DataTable<VolumeEntry>
      columns={columns}
      data={volumes}
      getRowId={(volume) => volume.id}
      isLoading={isLoading}
      error={error}
      bodyRowSx={(volume, index) => {
        const firstIndex = poolFirstRowIndex.get(volume.poolName);
        const isFirst = firstIndex === index;

        if (isFirst && index !== 0) {
          return {
            '& .MuiTableCell-root': {
              borderTop: '2px solid rgba(0, 0, 0, 0.08)',
            },
          };
        }

        return {};
      }}
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
