import {
  Box,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { MdDeleteOutline } from 'react-icons/md';
import type { VolumeEntry, VolumeGroup } from '../../@types/volume';
import type { DataTableColumn } from '../DataTable';
import DataTable from '../DataTable';

interface VolumesTableProps {
  groups: VolumeGroup[];
  isLoading: boolean;
  error: Error | null;
  onDeleteVolume: (volume: VolumeEntry) => void;
  isDeleteDisabled: boolean;
}

const attributeKeyStyles = {
  color: 'var(--color-secondary)',
  fontSize: '0.85rem',
};

const attributeValueStyles = {
  color: 'var(--color-text)',
  fontWeight: 600,
};

const cardStyles = {
  border: '1px solid var(--color-input-border)',
  borderRadius: '12px',
  padding: 2,
  backgroundColor: 'rgba(0, 198, 169, 0.05)',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 1.5,
};

const VolumesTable = ({
  groups,
  isLoading,
  error,
  onDeleteVolume,
  isDeleteDisabled,
}: VolumesTableProps) => {
  const columns: DataTableColumn<VolumeGroup>[] = [
    {
      id: 'pool',
      header: 'نام Pool',
      align: 'left',
      width: '25%',
      renderCell: (group) => (
        <Typography sx={{ fontWeight: 700, color: 'var(--color-text)' }}>
          {group.poolName}
        </Typography>
      ),
    },
    {
      id: 'volumes',
      header: 'Volume ها',
      align: 'left',
      renderCell: (group) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {group.volumes.length === 0 && (
            <Typography sx={{ color: 'var(--color-secondary)' }}>
              برای این Pool حجمی ثبت نشده است.
            </Typography>
          )}

          {group.volumes.map((volume) => (
            <Box key={volume.id} sx={cardStyles}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 1,
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography sx={{ fontWeight: 700, color: 'var(--color-text)' }}>
                    {volume.volumeName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'var(--color-secondary)' }}>
                    {volume.fullName}
                  </Typography>
                </Box>
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
              </Box>

              {volume.attributes.length > 0 ? (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: 'repeat(1, minmax(0, 1fr))',
                      md: 'repeat(auto-fit, minmax(180px, 1fr))',
                    },
                    gap: 1.5,
                  }}
                >
                  {volume.attributes.map((attribute) => (
                    <Box key={`${volume.id}-${attribute.key}`} sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                      <Typography sx={attributeKeyStyles}>{attribute.key}</Typography>
                      <Typography sx={attributeValueStyles}>{attribute.value}</Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography sx={{ color: 'var(--color-secondary)' }}>
                  اطلاعاتی برای این Volume ثبت نشده است.
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      ),
    },
  ];

  return (
    <DataTable<VolumeGroup>
      columns={columns}
      data={groups}
      getRowId={(group) => group.poolName}
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
