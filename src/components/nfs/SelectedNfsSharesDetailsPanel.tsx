import DetailComparisonPanel, { type DetailComparisonColumn } from '../common/DetailComparisonPanel';
import SingleDetailView from '../common/SingleDetailView';
import type { NfsShareEntry } from '../../@types/nfs';
import formatDetailValue from '../../utils/formatDetailValue';
import { createPriorityAwareComparatorFromRecords } from '../../utils/keySort';
import { NFS_SHARE_DETAIL_LAYOUT } from '../../config/detailLayouts';
import { translateDetailKey } from '../../utils/detailLabels';
import { selectDetailViewState, useDetailSplitViewStore } from '../../stores/detailSplitViewStore';
import { filterDetailValuesByLayout } from '../../utils/detailLayouts';
import { buildNfsShareDetailValues } from '../../utils/nfsDetails';
import TinyComparisonTable from '../common/TinyComparisonTable';
import { isNestedDetailTableData } from '../../@types/detailComparison';

interface SelectedNfsSharesDetailsPanelProps {
  items: NfsShareEntry[];
  viewId: string;
}

const formatNfsDetailValue = (value: unknown) => {
  if (isNestedDetailTableData(value)) {
    return <TinyComparisonTable data={value} />;
  }

  return formatDetailValue(value);
};

const SelectedNfsSharesDetailsPanel = ({
  items,
  viewId,
}: SelectedNfsSharesDetailsPanelProps) => {
  const { activeItemId, pinnedItemIds } = useDetailSplitViewStore(
    selectDetailViewState(viewId)
  );
  const togglePinnedItem = useDetailSplitViewStore((state) => state.togglePinnedItem);
  const unpinItem = useDetailSplitViewStore((state) => state.unpinItem);
  const itemLookup = new Map(items.map((share) => [share.path, share]));

  const buildColumn = (share: NfsShareEntry, isPinned: boolean) => ({
    id: share.path,
    title: share.path,
    onRemove: isPinned ? () => unpinItem(viewId, share.path) : undefined,
    values: filterDetailValuesByLayout(
      buildNfsShareDetailValues(share),
      NFS_SHARE_DETAIL_LAYOUT
    ),
    pinToggle: {
      isPinned,
      onToggle: () => togglePinnedItem(viewId, share.path),
    },
  });

  const pinnedColumns: DetailComparisonColumn[] = pinnedItemIds
    .map((path) => itemLookup.get(path))
    .filter((item): item is NfsShareEntry => Boolean(item))
    .map((item) => buildColumn(item, true));

  const title =
    pinnedColumns.length > 1 ? 'مقایسه جزئیات اشتراک‌های NFS' : 'جزئیات اشتراک NFS';

  const shouldShowSingle = pinnedColumns.length === 0;
  const activeItem = activeItemId ? itemLookup.get(activeItemId) : null;
  const comparisonColumns: DetailComparisonColumn[] = [];

  if (!shouldShowSingle && activeItem && !pinnedItemIds.includes(activeItem.path)) {
    comparisonColumns.push(buildColumn(activeItem, false));
  }

  comparisonColumns.push(...pinnedColumns);

  if (shouldShowSingle && activeItem) {
    const singleColumnValues = filterDetailValuesByLayout(
      buildNfsShareDetailValues(activeItem),
      NFS_SHARE_DETAIL_LAYOUT
    );
    const attributeSort = createPriorityAwareComparatorFromRecords(
      [singleColumnValues],
      'fa-IR',
      NFS_SHARE_DETAIL_LAYOUT.comparisonPriority
    );

    return (
      <SingleDetailView
        title={title}
        sections={NFS_SHARE_DETAIL_LAYOUT.sections}
        values={singleColumnValues}
        formatValue={formatNfsDetailValue}
        emptyStateMessage="اطلاعاتی برای نمایش وجود ندارد."
        attributeOrder={NFS_SHARE_DETAIL_LAYOUT.comparisonPriority}
        attributeSort={attributeSort}
        attributeLabelResolver={translateDetailKey}
        itemId={activeItem.path}
        viewId={viewId}
      />
    );
  }

  if (comparisonColumns.length === 0) {
    return null;
  }

  return (
    <DetailComparisonPanel
      title={title}
      attributeLabel="ویژگی"
      columns={comparisonColumns}
      formatValue={formatNfsDetailValue}
      emptyStateMessage="اطلاعاتی برای نمایش وجود ندارد."
      attributeSort={createPriorityAwareComparatorFromRecords(
        comparisonColumns.map(({ values }) => values),
        'fa-IR',
        NFS_SHARE_DETAIL_LAYOUT.comparisonPriority
      )}
      attributeLabelResolver={translateDetailKey}
    />
  );
};

export default SelectedNfsSharesDetailsPanel;
