import { Box, Typography } from '@mui/material';
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
  onRemove: (diskName: string) => void;
  pinnedId?: string | null;
  onPin?: (diskName: string) => void;
  onUnpin?: () => void;
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
  onRemove,
  pinnedId,
  onPin,
  onUnpin,
}: SelectedDisksDetailsPanelProps) => {
  const columns: DetailComparisonColumn[] = items.map((item) => {
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
      onRemove: () => onRemove(item.diskName),
      values: buildDiskDetailValues(item.detail),
      status,
    };
  });

  const title =
    columns.length > 1 ? 'مقایسه جزئیات دیسک‌ها' : 'جزئیات دیسک‌ها';
  const attributeSort = createPriorityAwareComparatorFromRecords(
    columns.map(({ values }) => values),
    'fa-IR',
    DISK_DETAIL_LAYOUT.comparisonPriority
  );

  return (
    columns.length === 1 ? (
      <SingleDetailView
        title={title}
        sections={DISK_DETAIL_LAYOUT.sections}
        values={columns[0].values}
        status={columns[0].status}
        formatValue={formatDiskDetailValue}
        emptyStateMessage="اطلاعاتی برای نمایش وجود ندارد."
        attributeOrder={DISK_DETAIL_LAYOUT.comparisonPriority}
        attributeSort={attributeSort}
        isPinned={columns[0].id === pinnedId}
        onPin={onPin ? () => onPin(columns[0].id) : undefined}
        onUnpin={columns[0].id === pinnedId ? onUnpin : undefined}
      />
    ) : (
      <DetailComparisonPanel
        title={title}
        attributeLabel="ویژگی"
        columns={columns}
        formatValue={formatDiskDetailValue}
        emptyStateMessage="اطلاعاتی برای نمایش وجود ندارد."
        attributeSort={attributeSort}
      />
    )
  );
};

export default SelectedDisksDetailsPanel;