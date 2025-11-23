import type { ZpoolDetailEntry } from '../../@types/zpool';
import DetailComparisonPanel, {
  type DetailComparisonColumn,
  type DetailComparisonStatus,
} from '../common/DetailComparisonPanel';
import formatDetailValue from '../../utils/formatDetailValue';
import { useMemo } from 'react';
import {
  buildKeyLengthMap,
  createLengthAwareComparator,
} from '../../utils/keySort';

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
  const columns: DetailComparisonColumn[] = useMemo(
    () =>
      items.map(({ poolName, detail, isLoading, error }) => {
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
          values: detail ?? {},
          status,
        };
      }),
    [items, onRemove]
  );

  const attributeLengthMap = useMemo(
    () => buildKeyLengthMap(columns.map((column) => column.values ?? {})),
    [columns]
  );

  const attributeSort = useMemo(
    () => createLengthAwareComparator(attributeLengthMap, 'fa-IR'),
    [attributeLengthMap]
  );

  return (
    <DetailComparisonPanel
      title="مقایسه جزئیات فضاهای یکپارچه"
      attributeLabel="ویژگی"
      columns={columns}
      formatValue={formatDetailValue}
      emptyStateMessage="اطلاعاتی برای نمایش وجود ندارد."
      attributeSort={attributeSort}
    />
  );
};

export default SelectedPoolsDetailsPanel;