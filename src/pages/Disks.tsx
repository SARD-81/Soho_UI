import { Box, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import type { DiskInventoryItem } from '../@types/disk';
import PageContainer from '../components/PageContainer';
import DisksTable from '../components/disks/DisksTable';
import SelectedDisksDetailsPanel from '../components/disks/SelectedDisksDetailsPanel';
import { useDiskDetails, useDiskInventory } from '../hooks/useDiskInventory';

const MAX_SELECTED_DISKS = 4;

const Disks = () => {
  const [selectedDisks, setSelectedDisks] = useState<string[]>([]);
  const { data: disks = [], isLoading, error } = useDiskInventory();
  const detailItems = useDiskDetails(selectedDisks);

  useEffect(() => {
    setSelectedDisks((prev) =>
      prev.filter((diskName) => disks.some((disk) => disk.disk === diskName))
    );
  }, [disks]);

  const handleToggleSelect = useCallback(
    (disk: DiskInventoryItem, checked: boolean) => {
      setSelectedDisks((prev) => {
        if (checked) {
          if (prev.includes(disk.disk)) {
            return prev;
          }

          const next = [...prev, disk.disk];

          if (next.length > MAX_SELECTED_DISKS) {
            return next.slice(next.length - MAX_SELECTED_DISKS);
          }

          return next;
        }

        return prev.filter((name) => name !== disk.disk);
      });
    },
    []
  );

  const handleRemoveSelected = useCallback((diskName: string) => {
    setSelectedDisks((prev) => prev.filter((name) => name !== diskName));
  }, []);

  const handleIdentifyDisk = useCallback((disk: DiskInventoryItem) => {
    toast(`در حال شناسایی دیسک ${disk.disk}...`);
  }, []);

  return (
    <PageContainer>
      <Box>
        <Typography
          variant="h5"
          sx={{ color: 'var(--color-primary)', fontWeight: 700 }}
        >
          اطلاعات دیسک‌ها
        </Typography>
      </Box>

      <Stack direction="column" spacing={3} alignItems="flex-start">
        <Box sx={{ flex: 1, width: '100%' }}>
          <DisksTable
            disks={disks}
            isLoading={isLoading}
            error={error ?? null}
            selectedDiskNames={selectedDisks}
            onToggleSelect={handleToggleSelect}
            onIdentify={handleIdentifyDisk}
          />
        </Box>

        <Box sx={{ width: { xs: '100%', xl: 'auto' } }}>
          <SelectedDisksDetailsPanel
            items={detailItems}
            onRemove={handleRemoveSelected}
          />
        </Box>
      </Stack>
    </PageContainer>
  );
};

export default Disks;
