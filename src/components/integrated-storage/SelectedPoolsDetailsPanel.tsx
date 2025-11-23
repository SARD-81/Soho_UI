import type { ZpoolDetailEntry } from '../../@types/zpool';
import DetailComparisonPanel, {
  type DetailComparisonColumn,
  type DetailComparisonStatus,
} from '../common/DetailComparisonPanel';
import formatDetailValue from '../../utils/formatDetailValue';
import { createLengthAwareComparatorFromRecords } from '../../utils/keySort';
import { localizeDetailEntries } from '../../utils/detailLabels';

interface PoolDetailItem {
  poolName: string;
  detail: ZpoolDetailEntry | null;
  isLoading: boolean;
  error: Error | null;
}

interface SelectedPoolsDetailsPanelProps {
  items: PoolDetailItem[];
  onRemove: (poolName: string) => void;
}

const SelectedPoolsDetailsPanel = ({
  items,
  onRemove,
}: SelectedPoolsDetailsPanelProps) => {
  const columns: DetailComparisonColumn[] = items.map(({
    poolName,
    detail,
    isLoading,
    error,
  }) => {
    let status: DetailComparisonStatus | undefined;

    if (isLoading) {
      status = { type: 'loading', message: 'در حال دریافت اطلاعات...' };
    } else if (error) {
      status = {
        type: 'error',
        message: `خطا در دریافت اطلاعات: ${error.message}`,
      };
    } else if (!detail || Object.keys(detail).length === 0) {
      status = { type: 'empty', message: 'اطلاعاتی برای نمایش وجود ندارد.' };
    }

    return {
      id: poolName,
      title: poolName,
      onRemove: () => onRemove(poolName),
      values: localizeDetailEntries(detail),
      status,
    };
  });

  return (
    <DetailComparisonPanel
      title="مقایسه جزئیات فضاهای یکپارچه"
      attributeLabel="ویژگی"
      columns={columns}
      formatValue={formatDetailValue}
      emptyStateMessage="اطلاعاتی برای نمایش وجود ندارد."
      attributeSort={createLengthAwareComparatorFromRecords(
        columns.map(({ values }) => values),
        'fa-IR'
      )}
    />
  );
};

export default SelectedPoolsDetailsPanel;