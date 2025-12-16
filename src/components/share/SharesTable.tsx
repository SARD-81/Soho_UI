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
import { BiSolidUser } from 'react-icons/bi';
import { FaUserGroup } from 'react-icons/fa6';
import { MdDeleteOutline } from 'react-icons/md';
import type { DataTableColumn } from '../../@types/dataTable';
import type { SambaShareEntry } from '../../@types/samba';
import { parseDelimitedList } from '../../utils/samba';
import DataTable from '../DataTable';

interface SharesTableProps {
  shares: SambaShareEntry[];
  isLoading: boolean;
  error: Error | null;
  selectedShares: string[];
  onToggleSelect: (share: SambaShareEntry, checked: boolean) => void;
  onDelete: (share: SambaShareEntry) => void;
  onManageUsers: (share: SambaShareEntry) => void;
  onManageGroups: (share: SambaShareEntry) => void;
  pendingShareName: string | null;
  isDeleting: boolean;
}

const SharesTable = ({
  shares,
  isLoading,
  error,
  selectedShares,
  onToggleSelect,
  onDelete,
  onManageUsers,
  onManageGroups,
  pendingShareName,
  isDeleting,
}: SharesTableProps) => {
  const theme = useTheme();

  const columns = useMemo<DataTableColumn<SambaShareEntry>[]>(() => {
    const resolvePath = (share: SambaShareEntry) => {
      const { details } = share;
      const rawPath =
        (typeof details.path === 'string' && details.path.trim()) ||
        (typeof details.full_path === 'string' && details.full_path.trim());

      return rawPath ?? '-';
    };

    const resolveValidUsers = (share: SambaShareEntry) => {
      const { details } = share;
      const value =
        (typeof details.valid_users === 'string' &&
          details.valid_users.trim()) ||
        (typeof details['valid users'] === 'string' &&
          (details['valid users'] as string).trim());

      return parseDelimitedList(value);
    };

    const resolveValidGroups = (share: SambaShareEntry) => {
      const { details } = share;
      const value =
        (typeof details.valid_groups === 'string' &&
          details.valid_groups.trim()) ||
        (typeof details['valid groups'] === 'string' &&
          (details['valid groups'] as string).trim());

      return parseDelimitedList(value);
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
        id: 'name',
        header: 'نام اشتراک',
        align: 'center',
        renderCell: (share) => (
          <Typography sx={{ fontWeight: 700, color: 'var(--color-text)' }}>
            {share.name}
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
            {resolvePath(share)}
          </Typography>
        ),
      },
      {
        id: 'valid-users',
        header: 'کاربران مجاز',
        align: 'center',
        renderCell: (share) => {
          const users = resolveValidUsers(share);

          if (!users.length) {
            return (
              <Typography sx={{ color: 'var(--color-text)' }}>-</Typography>
            );
          }

          return (
            <Stack
              direction="row"
              spacing={0.5}
              justifyContent="center"
              flexWrap="wrap"
            >
              {users.map((user) => (
                <Chip
                  key={user}
                  label={user}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    margin: 0.25,
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    color: 'var(--color-primary)',
                  }}
                />
              ))}
            </Stack>
          );
        },
      },
      {
        id: 'valid-groups',
        header: 'گروه های مجاز',
        align: 'center',
        renderCell: (share) => {
          const groups = resolveValidGroups(share);

          if (!groups.length) {
            return (
              <Typography sx={{ color: 'var(--color-text)' }}>-</Typography>
            );
          }

          return (
            <Stack
              direction="row"
              spacing={0.5}
              justifyContent="center"
              flexWrap="wrap"
            >
              {groups.map((group) => (
                <Chip
                  key={group}
                  label={group}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    px: 0.75,
                    minWidth: 80,
                    backgroundColor: alpha(theme.palette.secondary.main, 0.08),
                    color: 'var(--color-secondary)',
                  }}
                />
              ))}
            </Stack>
          );
        },
      },
      {
        id: 'actions',
        header: 'عملیات',
        align: 'center',
        renderCell: (share) => {
          const isShareDeleting = isDeleting && pendingShareName === share.name;

          return (
            <Stack direction="row" spacing={0.5} justifyContent="center">
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
              <Tooltip title="مدیریت کاربران">
                <span>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={(event) => {
                      event.stopPropagation();
                      onManageUsers(share);
                    }}
                    disabled={isShareDeleting}
                  >
                    <BiSolidUser size={18} />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title="مدیریت گروه‌ها">
                <span>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={(event) => {
                      event.stopPropagation();
                      onManageGroups(share);
                    }}
                    disabled={isShareDeleting}
                  >
                    <FaUserGroup size={18} color='var(--color-secondary)' />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          );
        },
      },
    ];
  }, [isDeleting, onDelete, onManageGroups, onManageUsers, pendingShareName]);

  const handleRowClick = useCallback(
    (share: SambaShareEntry) => {
      const isSelected = selectedShares.includes(share.name);
      onToggleSelect(share, !isSelected);
    },
    [onToggleSelect, selectedShares]
  );

  const resolveRowSx = useCallback(
    (share: SambaShareEntry) => {
      const isSelected = selectedShares.includes(share.name);

      if (!isSelected) {
        return {};
      }

      return {
        backgroundColor: alpha(theme.palette.primary.main, 0.12),
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.18),
        },
      };
    },
    [selectedShares, theme]
  );

  return (
    <DataTable<SambaShareEntry>
      columns={columns}
      data={shares}
      getRowId={(share) => share.name}
      isLoading={isLoading}
      error={error}
      onRowClick={handleRowClick}
      bodyRowSx={(share: SambaShareEntry) => ({
        ...resolveRowSx(share),
        transition: 'background-color 0.2s ease',
      })}
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
            در حال دریافت اطلاعات اشتراک‌ها...
          </Typography>
        </Box>
      )}
      renderErrorState={(tableError) => (
        <Typography sx={{ color: 'var(--color-error)', py: 3 }}>
          خطا در دریافت اشتراک‌ها: {tableError.message}
        </Typography>
      )}
      renderEmptyState={() => (
        <Typography sx={{ color: 'var(--color-secondary)', py: 3 }}>
          اشتراک فعالی ثبت نشده است.
        </Typography>
      )}
    />
  );
};

export default SharesTable;
