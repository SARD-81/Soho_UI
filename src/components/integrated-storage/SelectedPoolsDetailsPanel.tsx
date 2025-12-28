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
import { selectDetailViewState, useDetailSplitViewStore } from '../../stores/detailSplitViewStore';

interface PoolDetailItem {
  poolName: string;
  detail: ZpoolDetailEntry | null;
  isLoading: boolean;
  error: Error | null;
}

interface SelectedPoolsDetailsPanelProps {
  items: PoolDetailItem[];
  onRemove: (poolName: string) => void;
  viewId: string;
}

const SelectedPoolsDetailsPanel = ({
  items,
  onRemove,
  viewId,
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

  const { activeItemId, pinnedItemIds } = useDetailSplitViewStore(
    selectDetailViewState(viewId)
  );
  const togglePinnedItem = useDetailSplitViewStore((state) => state.togglePinnedItem);
  const itemLookup = useMemo(
    () => new Map(items.map((item) => [item.poolName, item])),
    [items]
  );

  const buildColumn = (item: PoolDetailItem, isPinned: boolean) => {
    const { poolName, detail, isLoading, error } = item;
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
      onRemove: isPinned ? () => onRemove(poolName) : undefined,
      values: buildPoolDetailValues(detail),
      status,
      pinToggle: {
        isPinned,
        onToggle: () => togglePinnedItem(viewId, poolName),
      },
    } satisfies DetailComparisonColumn;
  };

  const pinnedColumns: DetailComparisonColumn[] = pinnedItemIds
    .map((poolName) => itemLookup.get(poolName))
    .filter((item): item is PoolDetailItem => Boolean(item))
    .map((item) => buildColumn(item, true));

  const shouldShowSingle = pinnedColumns.length === 0;
  const activeItem = activeItemId ? itemLookup.get(activeItemId) : null;
  const comparisonColumns: DetailComparisonColumn[] = [];

  if (!shouldShowSingle && activeItem && !pinnedItemIds.includes(activeItem.poolName)) {
    comparisonColumns.push(buildColumn(activeItem, false));
  }

  comparisonColumns.push(...pinnedColumns);

  const title =
    pinnedColumns.length > 1 ? 'مقایسه جزئیات فضاهای یکپارچه' : 'جزئیات فضاهای یکپارچه';

  const comparisonValues =
    shouldShowSingle && activeItem
      ? [buildPoolDetailValues(activeItem.detail)]
      : comparisonColumns.map(({ values }) => values);

  const attributeSort = useMemo(
    () =>
      createPriorityAwareComparatorFromRecords(
        comparisonValues,
        'fa-IR',
        comparisonPriority
      ),
    [comparisonPriority, comparisonValues]
  );

  if (shouldShowSingle && activeItem) {
    return (
      <SingleDetailView
        title={title}
        sections={sections}
        values={buildPoolDetailValues(activeItem.detail)}
        status={buildColumn(activeItem, false).status}
        formatValue={formatValue}
        emptyStateMessage="اطلاعاتی برای نمایش وجود ندارد."
        attributeOrder={comparisonPriority}
        attributeSort={attributeSort}
        viewId={viewId}
        itemId={activeItem.poolName}
      />
    );
  }

  if (comparisonColumns.length === 0) {
    return null;
  }

  return (
    <DetailComparisonPanel
      title="مقایسه جزئیات فضاهای یکپارچه"
      attributeLabel="ویژگی"
      columns={comparisonColumns}
      formatValue={formatValue}
      emptyStateMessage="اطلاعاتی برای نمایش وجود ندارد."
      attributeSort={attributeSort}
    />
  );
};

export default SelectedPoolsDetailsPanel;