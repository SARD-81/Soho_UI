import DetailComparisonPanel, { type DetailComparisonColumn } from '../common/DetailComparisonPanel';
import SingleDetailView from '../common/SingleDetailView';
import type { SambaUserTableItem } from '../../@types/samba';
import formatDetailValue from '../../utils/formatDetailValue';
import { createPriorityAwareComparatorFromRecords } from '../../utils/keySort';
import { omitNullishEntries } from '../../utils/detailValues';
import { SAMBA_USER_DETAIL_LAYOUT } from '../../config/detailLayouts';
import { selectDetailViewState, useDetailSplitViewStore } from '../../store/detailSplitViewStore';

interface SelectedSambaUsersDetailsPanelProps {
  items: SambaUserTableItem[];
  viewId: string;
}

const SelectedSambaUsersDetailsPanel = ({
  items,
  viewId,
}: SelectedSambaUsersDetailsPanelProps) => {
  const { activeItemId, pinnedItemIds } = useDetailSplitViewStore(
    selectDetailViewState(viewId)
  );
  const togglePinnedItem = useDetailSplitViewStore((state) => state.togglePinnedItem);
  const unpinItem = useDetailSplitViewStore((state) => state.unpinItem);
  const itemLookup = new Map(items.map((item) => [item.username, item]));

  const buildColumn = (item: SambaUserTableItem, isPinned: boolean) => ({
    id: item.username,
    title: item.username,
    onRemove: isPinned ? () => unpinItem(viewId, item.username) : undefined,
    values: omitNullishEntries(item.details),
    pinToggle: {
      isPinned,
      onToggle: () => togglePinnedItem(viewId, item.username),
    },
  });

  const pinnedColumns: DetailComparisonColumn[] = pinnedItemIds
    .map((username) => itemLookup.get(username))
    .filter((item): item is SambaUserTableItem => Boolean(item))
    .map((item) => buildColumn(item, true));

  const shouldShowSingle = pinnedColumns.length === 0;
  const activeItem = activeItemId ? itemLookup.get(activeItemId) : null;
  const comparisonColumns: DetailComparisonColumn[] = [];

  if (!shouldShowSingle && activeItem && !pinnedItemIds.includes(activeItem.username)) {
    comparisonColumns.push(buildColumn(activeItem, false));
  }

  comparisonColumns.push(...pinnedColumns);

  const title =
    comparisonColumns.length > 1
      ? 'مقایسه جزئیات کاربران اشتراک فایل'
      : 'جزئیات کاربران اشتراک فایل';

  if (shouldShowSingle && activeItem) {
    const singleValues = buildColumn(activeItem, false).values;
    const attributeSort = createPriorityAwareComparatorFromRecords(
      [singleValues],
      'fa-IR',
      SAMBA_USER_DETAIL_LAYOUT.comparisonPriority
    );

    return (
      <SingleDetailView
        title={title}
        sections={SAMBA_USER_DETAIL_LAYOUT.sections}
        values={singleValues}
        formatValue={formatDetailValue}
        emptyStateMessage="اطلاعاتی برای نمایش وجود ندارد."
        attributeOrder={SAMBA_USER_DETAIL_LAYOUT.comparisonPriority}
        attributeSort={attributeSort}
        itemId={activeItem.username}
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
      formatValue={formatDetailValue}
      emptyStateMessage="اطلاعاتی برای نمایش وجود ندارد."
      attributeSort={createPriorityAwareComparatorFromRecords(
        comparisonColumns.map(({ values }) => values),
        'fa-IR',
        SAMBA_USER_DETAIL_LAYOUT.comparisonPriority
      )}
    />
  );
};

export default SelectedSambaUsersDetailsPanel;
