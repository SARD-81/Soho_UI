import { Box, Typography } from '@mui/material';
import DetailComparisonPanel, {
  type DetailComparisonColumn,
  type DetailComparisonStatus,
} from '../common/DetailComparisonPanel';
import type { DiskDetailItemState } from '../../hooks/useDiskInventory';
import formatDetailValue from '../../utils/formatDetailValue';
import { buildDiskDetailValues } from '../../utils/diskDetails';
import { createLengthAwareComparatorFromRecords } from '../../utils/keySort';

interface SelectedDisksDetailsPanelProps {
  items: DiskDetailItemState[];
  onRemove: (diskName: string) => void;
}


const formatDiskDetailValue = (value: unknown) => {
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

const SelectedDisksDetailsPanel = ({ items, onRemove }: SelectedDisksDetailsPanelProps) => {
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
  const attributeSort = createLengthAwareComparatorFromRecords(
    columns.map(({ values }) => values),
    'fa-IR'
  );

  return (
    <DetailComparisonPanel
      title={title}
      attributeLabel="ویژگی"
      columns={columns}
      formatValue={formatDiskDetailValue}
      emptyStateMessage="اطلاعاتی برای نمایش وجود ندارد."
      attributeSort={attributeSort}
    />
  );
};

export default SelectedDisksDetailsPanel;