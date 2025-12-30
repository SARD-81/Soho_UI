import DetailComparisonPanel, { type DetailComparisonColumn } from '../common/DetailComparisonPanel';
import SingleDetailView from '../common/SingleDetailView';
import type { FileSystemEntry } from '../../@types/filesystem';
import formatDetailValue from '../../utils/formatDetailValue';
import { createPriorityAwareComparatorFromRecords } from '../../utils/keySort';
import buildFilesystemDetailValues from '../../utils/filesystemDetails';
import { FILESYSTEM_DETAIL_LAYOUT } from '../../config/detailLayouts';
import { resolveFilesystemAttributeLabel } from '../../constants/filesystemAttributeLabels';
import { selectDetailViewState, useDetailSplitViewStore } from '../../stores/detailSplitViewStore';

interface SelectedFileSystemsDetailsPanelProps {
  items: FileSystemEntry[];
  viewId: string;
}

const SelectedFileSystemsDetailsPanel = ({
  items,
  viewId,
}: SelectedFileSystemsDetailsPanelProps) => {
  const { activeItemId, pinnedItemIds } = useDetailSplitViewStore(
    selectDetailViewState(viewId)
  );
  const togglePinnedItem = useDetailSplitViewStore((state) => state.togglePinnedItem);
  const unpinItem = useDetailSplitViewStore((state) => state.unpinItem);
  const itemLookup = new Map(items.map((filesystem) => [filesystem.id, filesystem]));

  const buildColumn = (filesystem: FileSystemEntry, isPinned: boolean) => ({
    id: filesystem.id,
    title: filesystem.filesystemName,
    onRemove: isPinned ? () => unpinItem(viewId, filesystem.id) : undefined,
    values: buildFilesystemDetailValues(filesystem),
    pinToggle: {
      isPinned,
      onToggle: () => togglePinnedItem(viewId, filesystem.id),
    },
  });

  const pinnedColumns: DetailComparisonColumn[] = pinnedItemIds
    .map((filesystemId) => itemLookup.get(filesystemId))
    .filter((item): item is FileSystemEntry => Boolean(item))
    .map((item) => buildColumn(item, true));

  const title =
    pinnedColumns.length > 1 ? 'مقایسه جزئیات فضاهای فایلی' : 'جزئیات فضای فایلی';

  const shouldShowSingle = pinnedColumns.length === 0;
  const activeItem = activeItemId ? itemLookup.get(activeItemId) : null;
  const comparisonColumns: DetailComparisonColumn[] = [];

  if (!shouldShowSingle && activeItem && !pinnedItemIds.includes(activeItem.id)) {
    comparisonColumns.push(buildColumn(activeItem, false));
  }

  comparisonColumns.push(...pinnedColumns);

  if (shouldShowSingle && activeItem) {
    const singleColumnValues = buildFilesystemDetailValues(activeItem);
    const attributeSort = createPriorityAwareComparatorFromRecords(
      [singleColumnValues],
      'fa-IR',
      FILESYSTEM_DETAIL_LAYOUT.comparisonPriority
    );

    return (
      <SingleDetailView
        title={title}
        sections={FILESYSTEM_DETAIL_LAYOUT.sections}
        values={singleColumnValues}
        formatValue={formatDetailValue}
        emptyStateMessage="اطلاعاتی برای نمایش وجود ندارد."
        attributeOrder={FILESYSTEM_DETAIL_LAYOUT.comparisonPriority}
        attributeSort={attributeSort}
        attributeLabelResolver={resolveFilesystemAttributeLabel}
        itemId={activeItem.id}
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
        FILESYSTEM_DETAIL_LAYOUT.comparisonPriority
      )}
      attributeLabelResolver={resolveFilesystemAttributeLabel}
    />
  );
};

export default SelectedFileSystemsDetailsPanel;