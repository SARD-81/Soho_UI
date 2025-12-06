import type { ZpoolDetailEntry } from '../../@types/zpool';
import DetailComparisonPanel, {
  type DetailComparisonColumn,
  type DetailComparisonStatus,
} from '../common/DetailComparisonPanel';
import SingleDetailView from '../common/SingleDetailView';
import formatDetailValue from '../../utils/formatDetailValue';
import { createPriorityAwareComparatorFromRecords } from '../../utils/keySort';
import { isValidElement, useMemo } from 'react';
import { POOL_DETAIL_LAYOUT } from '../../config/detailLayouts';

const normalizePoolDetailValues = (
  detail: ZpoolDetailEntry | null
): Record<string, unknown> => {
  if (!detail) {
    return {};
  }

  const allowedKeys = new Set(
    POOL_DETAIL_LAYOUT.sections.flatMap((section) => section.keys)
  );

  return Object.entries(detail).reduce<Record<string, unknown>>((acc, [key, value]) => {
    if (!allowedKeys.has(key) || value == null) {
      return acc;
    }

    acc[key] = value;
    return acc;
  }, {});
};

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
  const formatValue = useMemo(
    () =>
      (value: unknown) =>
        isValidElement(value)
          ? value
          : formatDetailValue(value),
    []
  );

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
      values: normalizePoolDetailValues(detail),
      status,
    };
  });

  return (
    columns.length === 1 ? (
      <SingleDetailView
        title="جزئیات فضای یکپارچه"
        sections={POOL_DETAIL_LAYOUT.sections}
        values={columns[0].values}
        status={columns[0].status}
        formatValue={formatValue}
        emptyStateMessage="اطلاعاتی برای نمایش وجود ندارد."
        attributeOrder={POOL_DETAIL_LAYOUT.comparisonPriority}
        attributeSort={createPriorityAwareComparatorFromRecords(
          columns.map(({ values }) => values),
          'fa-IR',
          POOL_DETAIL_LAYOUT.comparisonPriority
        )}
      />
    ) : (
      <DetailComparisonPanel
        title="مقایسه جزئیات فضاهای یکپارچه"
        attributeLabel="ویژگی"
        columns={columns}
        formatValue={formatValue}
        emptyStateMessage="اطلاعاتی برای نمایش وجود ندارد."
        attributeSort={createPriorityAwareComparatorFromRecords(
          columns.map(({ values }) => values),
          'fa-IR',
          POOL_DETAIL_LAYOUT.comparisonPriority
        )}
      />
    )
  );
};

export default SelectedPoolsDetailsPanel;