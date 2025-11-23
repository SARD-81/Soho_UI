import { Box, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import type { DiskInventoryItem } from '../@types/disk';
import PageContainer from '../components/PageContainer';
import DisksTable from '../components/disks/DisksTable';
import SelectedDisksDetailsPanel from '../components/disks/SelectedDisksDetailsPanel';
import { useDiskDetails, useDiskInventory } from '../hooks/useDiskInventory';

const MAX_SELECTED_DISKS = 4;

const normalizeSelection = (values: string[]) => {
  const seen = new Set<string>();

  return values
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .filter((value) => {
      if (seen.has(value)) {
        return false;
      }

      seen.add(value);
      return true;
    });
};

const areSelectionsEqual = (first: string[], second: string[]) =>
  first.length === second.length && first.every((value, index) => value === second[index]);

const Disks = () => {
  const [selectedDisks, setSelectedDisks] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: disks = [], isLoading, error } = useDiskInventory();
  const detailItems = useDiskDetails(selectedDisks);

  const syncSelectionToQuery = useCallback(
    (next: string[]) => {
      setSearchParams((prevParams) => {
        const params = new URLSearchParams(prevParams);

        if (next.length > 0) {
          params.set('selected', next.join(','));
        } else {
          params.delete('selected');
        }

        return params;
      });
    },
    [setSearchParams]
  );

  useEffect(() => {
    const parsed = normalizeSelection((searchParams.get('selected') ?? '').split(','));
    const limited = parsed.slice(-MAX_SELECTED_DISKS);

    if (!areSelectionsEqual(limited, selectedDisks)) {
      setSelectedDisks(limited);
    }
  }, [searchParams, selectedDisks]);

  useEffect(() => {
    setSelectedDisks((prev) => {
      const filtered = prev
        .filter((diskName) => disks.some((disk) => disk.disk === diskName))
        .slice(-MAX_SELECTED_DISKS);

      if (areSelectionsEqual(filtered, prev)) {
        return prev;
      }

      syncSelectionToQuery(filtered);
      return filtered;
    });
  }, [disks, syncSelectionToQuery]);

  const updateSelection = useCallback(
    (updater: (prev: string[]) => string[]) => {
      setSelectedDisks((prev) => {
        const next = normalizeSelection(updater(prev)).slice(-MAX_SELECTED_DISKS);

        if (!areSelectionsEqual(prev, next)) {
          syncSelectionToQuery(next);
        }

        return next;
      });
    },
    [syncSelectionToQuery]
  );

  const handleToggleSelect = useCallback(
    (disk: DiskInventoryItem, checked: boolean) => {
      updateSelection((prev) => {
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
    [updateSelection]
  );

  const handleRemoveSelected = useCallback(
    (diskName: string) => {
      updateSelection((prev) => prev.filter((name) => name !== diskName));
    },
    [updateSelection]
  );

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
