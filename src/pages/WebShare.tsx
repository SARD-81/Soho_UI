import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import type { FileSystemEntry } from '../@types/filesystem';
import type { WebShareEntry } from '../@types/webshare';
import PageContainer from '../components/PageContainer';
import { useFileSystems } from '../hooks/useFileSystems';
import {
  extractWebShareErrorMessage,
  useCreateWebShare,
  useDeleteWebShare,
  useSetWebSharePermission,
  useWebShares,
} from '../hooks/useWebShares';

const permissionPattern = /^[0-7]{3,4}$/;

const createFilesystemKey = (poolName: string, fsName: string) =>
  `${poolName}_${fsName}`;

const WebShare = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedFilesystemKey, setSelectedFilesystemKey] = useState('');
  const [permissionShare, setPermissionShare] = useState<WebShareEntry | null>(
    null
  );
  const [permissionValue, setPermissionValue] = useState('755');
  const [deleteShare, setDeleteShare] = useState<WebShareEntry | null>(null);

  const {
    data: webShares = [],
    isLoading: isWebSharesLoading,
    isFetching: isWebSharesFetching,
    error: webSharesError,
    refetch: refetchWebShares,
  } = useWebShares();
  const {
    data: filesystemData,
    isLoading: isFilesystemsLoading,
    error: filesystemsError,
  } = useFileSystems();

  const existingWebShareKeys = useMemo(
    () =>
      new Set(
        webShares.map((share) => createFilesystemKey(share.poolName, share.fsName))
      ),
    [webShares]
  );

  const availableFilesystems = useMemo(
    () =>
      (filesystemData?.filesystems ?? []).filter(
        (filesystem) =>
          !existingWebShareKeys.has(
            createFilesystemKey(filesystem.poolName, filesystem.filesystemName)
          )
      ),
    [existingWebShareKeys, filesystemData?.filesystems]
  );

  const selectedFilesystem = useMemo(
    () =>
      availableFilesystems.find(
        (filesystem) =>
          createFilesystemKey(filesystem.poolName, filesystem.filesystemName) ===
          selectedFilesystemKey
      ) ?? null,
    [availableFilesystems, selectedFilesystemKey]
  );

  const createWebShare = useCreateWebShare();
  const setWebSharePermission = useSetWebSharePermission();
  const deleteWebShare = useDeleteWebShare();

  const closeCreateDialog = () => {
    if (createWebShare.isPending) {
      return;
    }
    setIsCreateOpen(false);
    setSelectedFilesystemKey('');
  };

  const handleCreateSubmit = () => {
    if (!selectedFilesystem) {
      toast.error('لطفاً یک فایل‌سیستم را انتخاب کنید.');
      return;
    }

    createWebShare.mutate(
      {
        pool_name: selectedFilesystem.poolName,
        fs_name: selectedFilesystem.filesystemName,
        save_to_db: false,
      },
      {
        onSuccess: () => {
          setIsCreateOpen(false);
          setSelectedFilesystemKey('');
          toast.success('Web Share با موفقیت ایجاد شد.');
        },
        onError: (error) => {
          toast.error(`ایجاد Web Share با خطا مواجه شد: ${extractWebShareErrorMessage(error)}`);
        },
      }
    );
  };

  const openPermissionDialog = (share: WebShareEntry) => {
    setPermissionShare(share);
    setPermissionValue(share.permission ?? '755');
  };

  const closePermissionDialog = () => {
    if (setWebSharePermission.isPending) {
      return;
    }
    setPermissionShare(null);
    setPermissionValue('755');
  };

  const handlePermissionSubmit = () => {
    if (!permissionShare) {
      return;
    }

    if (!permissionPattern.test(permissionValue)) {
      toast.error('Permission باید یک عدد سه یا چهار رقمی در مبنای هشت باشد.');
      return;
    }

    setWebSharePermission.mutate(
      {
        pool_name: permissionShare.poolName,
        fs_name: permissionShare.fsName,
        permission: permissionValue,
      },
      {
        onSuccess: () => {
          setPermissionShare(null);
          setPermissionValue('755');
          toast.success('Permission با موفقیت به‌روزرسانی شد.');
        },
        onError: (error) => {
          toast.error(`تغییر Permission با خطا مواجه شد: ${extractWebShareErrorMessage(error)}`);
        },
      }
    );
  };

  const closeDeleteDialog = () => {
    if (deleteWebShare.isPending) {
      return;
    }
    setDeleteShare(null);
  };

  const handleDeleteSubmit = () => {
    if (!deleteShare) {
      return;
    }

    deleteWebShare.mutate(
      {
        pool_name: deleteShare.poolName,
        fs_name: deleteShare.fsName,
        save_to_db: false,
      },
      {
        onSuccess: () => {
          setDeleteShare(null);
          toast.success('Web Share با موفقیت حذف شد.');
        },
        onError: (error) => {
          toast.error(`حذف Web Share با خطا مواجه شد: ${extractWebShareErrorMessage(error)}`);
        },
      }
    );
  };

  const renderFilesystemLabel = (filesystem: FileSystemEntry) =>
    `${filesystem.poolName}/${filesystem.filesystemName}`;

  const isPermissionInvalid =
    permissionValue.length > 0 && !permissionPattern.test(permissionValue);

  return (
    <PageContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography
              variant="h5"
              sx={{ color: 'var(--color-primary)', fontWeight: 700 }}
            >
              اشتراک‌های Web Share
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--color-text)' }}>
              مدیریت Location Blockهای NGINX برای فایل‌سیستم‌ها و مسیرهای قابل
              ارائه از طریق وب.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap">
            <Button
              onClick={() => void refetchWebShares()}
              variant="outlined"
              disabled={isWebSharesFetching}
              sx={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
            >
              به‌روزرسانی لیست
            </Button>
            <Button
              onClick={() => setIsCreateOpen(true)}
              variant="contained"
              disabled={createWebShare.isPending}
              sx={{
                px: 3,
                py: 1.25,
                borderRadius: '3px',
                fontWeight: 700,
                background:
                  'linear-gradient(135deg, var(--color-primary) 0%, rgba(31, 182, 255, 0.95) 100%)',
                color: 'var(--color-bg)',
              }}
            >
              ایجاد Web Share
            </Button>
          </Stack>
        </Box>

        <Card sx={{ backgroundColor: 'var(--color-card-bg)', color: 'var(--color-text)' }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="overline" sx={{ color: 'var(--color-primary)' }}>
              خلاصه
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {webShares.length}
            </Typography>
            <Typography variant="body2">
              API این صفحه Web Shareها را به‌صورت Location Blockهای NGINX برای
              فایل‌سیستم‌ها مدیریت می‌کند و ایجاد/حذف این رکوردها با
              save_to_db=false ارسال می‌شود.
            </Typography>
          </CardContent>
        </Card>

        {webSharesError ? (
          <Alert severity="error">دریافت لیست Web Shareها با خطا مواجه شد.</Alert>
        ) : null}

        {filesystemsError ? (
          <Alert severity="warning">
            دریافت لیست فایل‌سیستم‌ها با خطا مواجه شد؛ ایجاد Web Share ممکن است
            در دسترس نباشد.
          </Alert>
        ) : null}

        <TableContainer
          sx={{
            backgroundColor: 'var(--color-card-bg)',
            borderRadius: 2,
            border: '1px solid rgba(148, 163, 184, 0.18)',
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>نام Web Share</TableCell>
                <TableCell>Pool</TableCell>
                <TableCell>FileSystem</TableCell>
                <TableCell>مسیر/Location</TableCell>
                <TableCell>Permission</TableCell>
                <TableCell align="center">عملیات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isWebSharesLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : webShares.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    هیچ Web Shareای وجود ندارد.
                  </TableCell>
                </TableRow>
              ) : (
                webShares.map((share) => (
                  <TableRow key={share.id} hover>
                    <TableCell>{share.targetName}</TableCell>
                    <TableCell>{share.poolName}</TableCell>
                    <TableCell>{share.fsName}</TableCell>
                    <TableCell sx={{ direction: 'ltr', textAlign: 'left' }}>
                      {share.path}
                    </TableCell>
                    <TableCell>{share.permission ?? '—'}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => openPermissionDialog(share)}
                          disabled={setWebSharePermission.isPending}
                        >
                          Permission
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          onClick={() => setDeleteShare(share)}
                          disabled={deleteWebShare.isPending}
                        >
                          حذف
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Dialog open={isCreateOpen} onClose={closeCreateDialog} fullWidth maxWidth="sm">
        <DialogTitle>ایجاد Web Share</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <FormControl fullWidth disabled={isFilesystemsLoading || createWebShare.isPending}>
            <InputLabel id="webshare-filesystem-label">FileSystem</InputLabel>
            <Select
              labelId="webshare-filesystem-label"
              label="FileSystem"
              value={selectedFilesystemKey}
              onChange={(event: SelectChangeEvent) =>
                setSelectedFilesystemKey(event.target.value)
              }
            >
              {availableFilesystems.map((filesystem) => {
                const key = createFilesystemKey(
                  filesystem.poolName,
                  filesystem.filesystemName
                );
                return (
                  <MenuItem key={key} value={key}>
                    {renderFilesystemLabel(filesystem)}
                  </MenuItem>
                );
              })}
            </Select>
            <FormHelperText>
              {availableFilesystems.length === 0
                ? 'همه فایل‌سیستم‌های موجود Web Share دارند یا لیست در دسترس نیست.'
                : 'فایل‌سیستم‌های دارای Web Share تکراری نمایش داده نمی‌شوند.'}
            </FormHelperText>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCreateDialog} disabled={createWebShare.isPending}>
            انصراف
          </Button>
          <Button
            onClick={handleCreateSubmit}
            variant="contained"
            disabled={!selectedFilesystem || createWebShare.isPending}
          >
            ایجاد
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(permissionShare)}
        onClose={closePermissionDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>تغییر Permission</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Permission"
            value={permissionValue}
            error={isPermissionInvalid}
            helperText="نمونه معتبر: 755 یا 0755"
            onChange={(event) => setPermissionValue(event.target.value.trim())}
            disabled={setWebSharePermission.isPending}
            inputProps={{ inputMode: 'numeric', dir: 'ltr' }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={closePermissionDialog}
            disabled={setWebSharePermission.isPending}
          >
            انصراف
          </Button>
          <Button
            onClick={handlePermissionSubmit}
            variant="contained"
            disabled={
              !permissionPattern.test(permissionValue) ||
              setWebSharePermission.isPending
            }
          >
            ذخیره
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteShare)} onClose={closeDeleteDialog} fullWidth maxWidth="xs">
        <DialogTitle>حذف Web Share</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'var(--color-text)' }}>
            آیا از حذف Web Share برای {deleteShare?.poolName}/{deleteShare?.fsName}
            مطمئن هستید؟
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} disabled={deleteWebShare.isPending}>
            انصراف
          </Button>
          <Button
            onClick={handleDeleteSubmit}
            color="error"
            variant="contained"
            disabled={deleteWebShare.isPending}
          >
            حذف
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default WebShare;
