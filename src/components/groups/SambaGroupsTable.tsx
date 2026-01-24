import { Box, Chip, IconButton, Tooltip, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useCallback, useMemo } from 'react';
import { MdDeleteOutline, MdManageAccounts } from 'react-icons/md';
import type { DataTableColumn } from '../../@types/dataTable';
import type { SambaGroupEntry } from '../../@types/samba';
import DataTable from '../DataTable';

interface SambaGroupsTableProps {
  groups: SambaGroupEntry[];
  isLoading: boolean;
  error: Error | null;
  pendingDeleteGroup?: string | null;
  pendingMemberGroup?: string | null;
  onManageMembers: (group: SambaGroupEntry) => void;
  onDelete: (group: SambaGroupEntry) => void;
}

const SambaGroupsTable = ({
  groups,
  isLoading,
  error,
  pendingDeleteGroup,
  pendingMemberGroup,
  onManageMembers,
  onDelete,
}: SambaGroupsTableProps) => {
  const theme = useTheme();

  const columns = useMemo<DataTableColumn<SambaGroupEntry>[]>(() => {
    return [
      {
        id: 'index',
        header: '#',
        align: 'center',
        width: 60,
        renderCell: (_group, index) => (
          <Typography sx={{ fontWeight: 600, color: 'var(--color-text)' }}>
            {index + 1}
          </Typography>
        ),
      },
      {
        id: 'name',
        header: 'نام گروه',
        align: 'left',
        renderCell: (group) => (
          <Typography sx={{ fontWeight: 700, color: 'var(--color-text)' }}>
            {group.name}
          </Typography>
        ),
      },
      {
        id: 'gid',
        header: 'شناسه گروه (GID)',
        align: 'center',
        width: 150,
        renderCell: (group) => (
          <Typography sx={{ fontWeight: 600, color: 'var(--color-text)' }}>
            {group.gid}
          </Typography>
        ),
      },
      {
        id: 'members',
        header: 'اعضای گروه',
        align: 'center',
        renderCell: (group) => (
          <Box>
            {group.members.length === 0 ? (
              <Typography sx={{ color: 'var(--color-secondary)' }}>
                —
              </Typography>
            ) : (
              group.members.map((member) => (
                <Chip
                  key={`${group.name}-${member}`}
                  label={member}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    margin: 0.25,
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    color: 'var(--color-primary)',
                  }}
                />
              ))
            )}
          </Box>
        ),
      },
      {
        id: 'actions',
        header: 'عملیات',
        align: 'center',
        width: 156,
        renderCell: (group) => {
          const isDeletePending = pendingDeleteGroup === group.name;
          const isMemberPending = pendingMemberGroup === group.name;

          return (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
              {/* <HelpTooltip
                placement="top"
                title="حذف گروه فقط زمانی مجاز است که گروه اصلی هیچ کاربری نباشد، در اشتراک‌ها استفاده نشود و عضوی نداشته باشد."
              /> */}

              <Tooltip title="حذف گروه" arrow>
                <span>
                  <IconButton
                    size="small"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDelete(group);
                    }}
                    disabled={Boolean(pendingDeleteGroup)}
                    sx={{
                      color: 'var(--color-error)',
                      '&.Mui-disabled': {
                        color: 'var(--color-secondary)',
                        opacity: isDeletePending ? 0.6 : 0.4,
                      },
                    }}
                  >
                    <MdDeleteOutline size={18} />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title="مدیریت کاربران" arrow>
                <span>
                  <IconButton
                    size="small"
                    onClick={(event) => {
                      event.stopPropagation();
                      onManageMembers(group);
                    }}
                    disabled={Boolean(pendingMemberGroup)}
                    sx={{
                      color: 'var(--color-primary)',
                      '&.Mui-disabled': {
                        color: 'var(--color-secondary)',
                        opacity: isMemberPending ? 0.7 : 0.4,
                      },
                    }}
                  >
                    <MdManageAccounts size={18} />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          );
        },
      },
    ];
  }, [
    onDelete,
    onManageMembers,
    pendingDeleteGroup,
    pendingMemberGroup,
    theme.palette.primary.main,
  ]);

  const handleRowClick = useCallback(
    (group: SambaGroupEntry) => {
      onManageMembers(group);
    },
    [onManageMembers]
  );

  const resolveRowSx = useCallback(
    () => ({
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.06),
      },
    }),
    [theme.palette.primary.main]
  );

  return (
    <DataTable
      columns={columns}
      data={groups}
      getRowId={(group) => group.name}
      isLoading={isLoading}
      error={error}
      onRowClick={handleRowClick}
      bodyRowSx={resolveRowSx}
    />
  );
};

export default SambaGroupsTable;
