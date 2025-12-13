import type { ZpoolDetailEntry } from '../../@types/zpool';
import DetailComparisonPanel, {
  type DetailComparisonColumn,
  type DetailComparisonStatus,
} from '../common/DetailComparisonPanel';
import TinyComparisonTable from '../common/TinyComparisonTable';
import SingleDetailView from '../common/SingleDetailView';
import formatDetailValue from '../../utils/formatDetailValue';
import { createPriorityAwareComparatorFromRecords } from '../../utils/keySort';
import { omitNullishEntries } from '../../utils/detailValues';
import { isValidElement, useMemo } from 'react';
import { POOL_DETAIL_LAYOUT } from '../../config/detailLayouts';
import { sortPoolDiskAttributes } from '../../utils/poolDetailTables';
import { isNestedDetailTableData } from '../../@types/detailComparison';

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
      values: omitNullishEntries(detail),
      status,
    };
  });
  const title =
    columns.length > 1 ? 'مقایسه جزئیات فضاهای یکپارچه' : 'جزئیات فضاهای یکپارچه';
  const attributeSort = useMemo(
    () =>
      createPriorityAwareComparatorFromRecords(
        columns.map(({ values }) => values),
        'fa-IR',
        POOL_DETAIL_LAYOUT.comparisonPriority
      ),
    [columns]
  );
  const formatValue = useMemo(
    () =>
      (value: unknown) => {
        if (isNestedDetailTableData(value)) {
          return (
            <TinyComparisonTable
              data={value}
              attributeSort={sortPoolDiskAttributes}
            />
          );
        }

        if (isValidElement(value)) {
          return value;
        }

        return formatDetailValue(value);
      },
    []
  );

  return (
    columns.length === 1 ? (
      <SingleDetailView
        title={title}
        sections={POOL_DETAIL_LAYOUT.sections}
        values={columns[0].values}
        status={columns[0].status}
        formatValue={formatValue}
        emptyStateMessage="اطلاعاتی برای نمایش وجود ندارد."
        attributeOrder={POOL_DETAIL_LAYOUT.comparisonPriority}
        attributeSort={attributeSort}
      />
    ) : (
      <DetailComparisonPanel
        title="مقایسه جزئیات فضاهای یکپارچه"
        attributeLabel="ویژگی"
        columns={columns}
        formatValue={formatValue}
        emptyStateMessage="اطلاعاتی برای نمایش وجود ندارد."
        attributeSort={attributeSort}
      />
    )
  );
};

export default SelectedPoolsDetailsPanel;