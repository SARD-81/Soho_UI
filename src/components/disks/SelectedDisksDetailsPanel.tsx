import { Box, Stack, Typography } from '@mui/material';
import DetailComparisonPanel, {
  type DetailComparisonColumn,
  type DetailComparisonStatus,
} from '../common/DetailComparisonPanel';
import SingleDetailView from '../common/SingleDetailView';
import TinyComparisonTable from '../common/TinyComparisonTable';
import { isNestedDetailTableData } from '../../@types/detailComparison';
import type { DiskDetailItemState } from '../../hooks/useDiskInventory';
import formatDetailValue from '../../utils/formatDetailValue';
import { buildDiskDetailValues } from '../../utils/diskDetails';
import { createPriorityAwareComparatorFromRecords } from '../../utils/keySort';
import { DISK_DETAIL_LAYOUT } from '../../config/detailLayouts';

interface SelectedDisksDetailsPanelProps {
  items: DiskDetailItemState[];
  activeItemId: string | null;
  pinnedItemIds: string[];
  onUnpin: (diskName: string) => void;
}


const formatDiskDetailValue = (value: unknown) => {
  if (isNestedDetailTableData(value)) {
    return <TinyComparisonTable data={value} />;
  }

  const formatted = formatDetailValue(value);

  if (typeof formatted === 'string' && formatted.includes('\n')) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {formatted.split('\n').map((line, index) => (
          <Typography key={`${line}-${index}`} sx={{ fontSize: '0.85rem', textAlign: 'right' }}>
            {line}
          </Typography>
        ))}
      </Box>
    );
  }

  return formatted;
};

const SelectedDisksDetailsPanel = ({
  items,
  activeItemId,
  pinnedItemIds,
  onUnpin,
}: SelectedDisksDetailsPanelProps) => {
  const activeItem = items.find((item) => item.diskName === activeItemId);
  const pinnedColumns: DetailComparisonColumn[] = pinnedItemIds
    .map((diskName) => items.find((item) => item.diskName === diskName))
    .filter((item): item is DiskDetailItemState => Boolean(item))
    .map((item) => {
      let status: DetailComparisonStatus | undefined;

      if (item.isLoading || item.isFetching) {
        status = { type: 'loading', message: 'در حال دریافت جزئیات...' };
      } else if (item.error) {
        status = { type: 'error', message: item.error.message };
      } else if (!item.detail) {
        status = { type: 'info', message: 'اطلاعاتی در دسترس نیست.' };
      }

      return {
        id: item.diskName,
        title: item.diskName,
        onRemove: () => onUnpin(item.diskName),
        values: buildDiskDetailValues(item.detail),
        status,
      };
    });

  const title =
    pinnedColumns.length > 1 ? 'مقایسه جزئیات دیسک‌ها' : 'جزئیات دیسک‌ها';
  const attributeSort = createPriorityAwareComparatorFromRecords(
    pinnedColumns.map(({ values }) => values),
    'fa-IR',
    DISK_DETAIL_LAYOUT.comparisonPriority
  );

  let status: DetailComparisonStatus | undefined;

  if (activeItem?.isLoading || activeItem?.isFetching) {
    status = { type: 'loading', message: 'در حال دریافت جزئیات...' };
  } else if (activeItem?.error) {
    status = { type: 'error', message: activeItem.error.message };
  } else if (activeItemId && activeItem && !activeItem.detail) {
    status = { type: 'info', message: 'اطلاعاتی در دسترس نیست.' };
  }

  const activeDetail =
    activeItemId && activeItem ? (
      <SingleDetailView
        title={title}
        sections={DISK_DETAIL_LAYOUT.sections}
        values={buildDiskDetailValues(activeItem.detail)}
        status={status}
        formatValue={formatDiskDetailValue}
        emptyStateMessage="اطلاعاتی برای نمایش وجود ندارد."
        attributeOrder={DISK_DETAIL_LAYOUT.comparisonPriority}
        attributeSort={attributeSort}
        itemId={activeItem.diskName}
      />
    ) : null;

  if (!activeDetail && pinnedColumns.length === 0) {
    return null;
  }

  return (
    <Stack spacing={2.5} alignItems="flex-start">
      {activeDetail}

      {pinnedColumns.length > 0 && (
        <DetailComparisonPanel
          title={title}
          attributeLabel="ویژگی"
          columns={pinnedColumns}
          formatValue={formatDiskDetailValue}
          emptyStateMessage="اطلاعاتی برای نمایش وجود ندارد."
          attributeSort={attributeSort}
        />
      )}
    </Stack>
  );
};

export default SelectedDisksDetailsPanel;