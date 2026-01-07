import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useCallback, useMemo } from 'react';
import { MdCheck, MdClose, MdDeleteOutline, MdEdit } from 'react-icons/md';
import type { DataTableColumn } from '../../@types/dataTable';
import type { NfsShareEntry } from '../../@types/nfs';
import { translateDetailKey } from '../../utils/detailLabels';
import DataTable from '../DataTable';

interface NfsSharesTableProps {
  detailViewId: string;
  shares: NfsShareEntry[];
  isLoading: boolean;
  error: Error | null;
  onDelete: (share: NfsShareEntry) => void;
  onEdit: (share: NfsShareEntry) => void;
  pendingPath: string | null;
  isDeleting: boolean;
}

const MAX_VISIBLE_CLIENTS = 3;

const NfsSharesTable = ({
  detailViewId,
  shares,
  isLoading,
  error,
  onDelete,
  onEdit,
  pendingPath,
  isDeleting,
}: NfsSharesTableProps) => {
  const theme = useTheme();

  const columns = useMemo<DataTableColumn<NfsShareEntry>[]>(() => {
    const renderClients = (share: NfsShareEntry) => {
      const clients = share.clients
        .map((client) => client.client)
        .filter((client) => client.trim().length > 0);

      if (!clients.length) {
        return <Typography sx={{ color: 'var(--color-text)' }}>-</Typography>;
      }

      const visibleClients = clients.slice(0, MAX_VISIBLE_CLIENTS);
      const hiddenCount = clients.length - visibleClients.length;

      return (
        <Stack
          direction="row"
          spacing={0.5}
          justifyContent="center"
          flexWrap="wrap"
        >
          {visibleClients.map((client) => (
            <Chip
              key={client}
              label={client}
              size="small"
              sx={{
                fontWeight: 700,
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                color: 'var(--color-primary)',
              }}
            />
          ))}
          {hiddenCount > 0 ? (
            <Chip
              label={`+${hiddenCount}`}
              size="small"
              variant="outlined"
              sx={{
                fontWeight: 700,
                color: 'var(--color-secondary)',
                borderColor: alpha(theme.palette.divider, 0.6),
              }}
            />
          ) : null}
        </Stack>
      );
    };

    const renderOptions = (share: NfsShareEntry) => {
      if (!share.clients.length) {
        return <Typography sx={{ color: 'var(--color-text)' }}>-</Typography>;
      }

      return (
        <Stack spacing={1} alignItems="stretch">
          {share.clients.map((clientEntry, index) => {
            const optionEntries = Object.entries(clientEntry.options ?? {});

            if (optionEntries.length === 0) {
              return (
                <Typography
                  key={`${clientEntry.client}-${index}`}
                  sx={{ color: 'var(--color-text)', textAlign: 'center' }}
                >
                  -
                </Typography>
              );
            }

            return (
              <Stack
                key={`${clientEntry.client}-${index}`}
                spacing={0.5}
                alignItems="center"
              >
                {share.clients.length > 1 ? (
                  <Typography
                    sx={{
                      color: 'var(--color-secondary)',
                      fontSize: '0.85rem',
                      direction: 'ltr',
                    }}
                  >
                    {clientEntry.client || `کلاینت ${index + 1}`}
                  </Typography>
                ) : null}
                <Stack
                  direction="row"
                  spacing={0.5}
                  justifyContent="center"
                  flexWrap="wrap"
                >
                  {optionEntries.map(([key, value]) => {
                    const isBoolean = typeof value === 'boolean';
                    const chipColor = isBoolean
                      ? value
                        ? theme.palette.success.main
                        : theme.palette.error.main
                      : theme.palette.text.secondary;
                    const label = isBoolean
                      ? translateDetailKey(key)
                      : `${translateDetailKey(key)}: ${String(value)}`;

                    return (
                      <Chip
                        key={`${clientEntry.client}-${key}`}
                        label={label}
                        size="small"
                        icon={
                          isBoolean ? (
                            value ? (
                              <MdCheck />
                            ) : (
                              <MdClose />
                            )
                          ) : undefined
                        }
                        sx={{
                          fontWeight: 700,
                          '& .MuiChip-icon': {
                            color: chipColor,
                          },
                          color: chipColor,
                          borderColor: alpha(chipColor, 0.45),
                          backgroundColor: alpha(chipColor, 0.08),
                        }}
                        variant="outlined"
                      />
                    );
                  })}
                </Stack>
              </Stack>
            );
          })}
        </Stack>
      );
    };

    return [
      {
        id: 'index',
        header: '#',
        align: 'center',
        width: 60,
        renderCell: (_share, index) => (
          <Typography sx={{ fontWeight: 600, color: 'var(--color-text)' }}>
            {index + 1}
          </Typography>
        ),
      },
      {
        id: 'path',
        header: 'مسیر',
        align: 'center',
        renderCell: (share) => (
          <Typography
            sx={{
              color: 'var(--color-text)',
              direction: 'ltr',
              fontFamily: 'var(--font-vazir)',
              wordBreak: 'break-all',
            }}
          >
            {share.path}
          </Typography>
        ),
      },
      {
        id: 'clients',
        header: 'کلاینت',
        align: 'center',
        renderCell: (share) => renderClients(share),
      },
      {
        id: 'options',
        header: 'ویژگی‌ها',
        align: 'center',
        renderCell: (share) => renderOptions(share),
      },
      {
        id: 'actions',
        header: 'عملیات',
        align: 'center',
        renderCell: (share) => {
          const isShareDeleting = isDeleting && pendingPath === share.path;

          return (
            <Stack direction="row" spacing={0.5} justifyContent="center">
              <Tooltip title="ویرایش اشتراک">
                <span>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={(event) => {
                      event.stopPropagation();
                      onEdit(share);
                    }}
                    disabled={isShareDeleting}
                  >
                    <MdEdit size={18} />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="حذف اشتراک">
                <span>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDelete(share);
                    }}
                    disabled={isShareDeleting}
                  >
                    <MdDeleteOutline size={18} />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          );
        },
      },
    ];
  }, [isDeleting, onDelete, onEdit, pendingPath, theme]);

  const handleRowClick = useCallback((share: NfsShareEntry) => share, []);

  return (
    <DataTable<NfsShareEntry>
      detailViewId={detailViewId}
      columns={columns}
      data={shares}
      getRowId={(share) => share.path}
      isLoading={isLoading}
      error={error}
      onRowClick={handleRowClick}
      bodyRowSx={{
        transition: 'background-color 0.2s ease',
      }}
      renderLoadingState={() => (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            alignItems: 'center',
            py: 4,
          }}
        >
          <CircularProgress color="primary" size={32} />
          <Typography sx={{ color: 'var(--color-secondary)' }}>
            در حال دریافت اطلاعات اشتراک‌های NFS...
          </Typography>
        </Box>
      )}
      renderErrorState={(tableError) => (
        <Typography sx={{ color: 'var(--color-error)', py: 3 }}>
          خطا در دریافت اشتراک‌های NFS: {tableError.message}
        </Typography>
      )}
      renderEmptyState={() => (
        <Typography sx={{ color: 'var(--color-secondary)', py: 3 }}>
          اشتراک NFS فعالی ثبت نشده است.
        </Typography>
      )}
    />
  );
};

export default NfsSharesTable;