import type { ZpoolDetailEntry } from '../../@types/zpool';
import DetailComparisonPanel, {
  type DetailComparisonColumn,
  type DetailComparisonStatus,
} from '../common/DetailComparisonPanel';
import SingleDetailView from '../common/SingleDetailView';
import TinyComparisonTable from '../common/TinyComparisonTable';
import { isNestedDetailTableData } from '../../@types/detailComparison';
import formatDetailValue from '../../utils/formatDetailValue';
import {
  POOL_DISK_ATTRIBUTE_SORT,
  buildPoolDetailValues,
} from '../../utils/poolDetails';
import { createPriorityAwareComparatorFromRecords } from '../../utils/keySort';
import { isValidElement, useMemo } from 'react';
import { POOL_DETAIL_LAYOUT } from '../../config/detailLayouts';
import { translateDetailKey } from '../../utils/detailLabels';

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
      (value: unknown) => {
        if (isNestedDetailTableData(value)) {
          return <TinyComparisonTable data={value} attributeSort={POOL_DISK_ATTRIBUTE_SORT} />;
        }

        if (isValidElement(value)) {
          return value;
        }

        const formatted = formatDetailValue(value);

        if (typeof formatted === 'string' && formatted.includes('\n')) {
          return formatted
            .split('\n')
            .map((line, index) => <span key={`${line}-${index}`}>{line}</span>);
        }

        return formatted;
      },
    []
  );

  const comparisonPriority = useMemo(
    () => POOL_DETAIL_LAYOUT.comparisonPriority.map(translateDetailKey),
    []
  );

  const sections = useMemo(
    () =>
      POOL_DETAIL_LAYOUT.sections.map((section) => ({
        ...section,
        keys: section.keys.map(translateDetailKey),
      })),
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
      values: buildPoolDetailValues(detail),
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
        comparisonPriority
      ),
    [columns, comparisonPriority]
  );

  return (
    columns.length === 1 ? (
      <SingleDetailView
        title={title}
        sections={sections}
        values={columns[0].values}
        status={columns[0].status}
        formatValue={formatValue}
        emptyStateMessage="اطلاعاتی برای نمایش وجود ندارد."
        attributeOrder={comparisonPriority}
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