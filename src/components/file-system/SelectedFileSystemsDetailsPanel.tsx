import DetailComparisonPanel, { type DetailComparisonColumn } from '../common/DetailComparisonPanel';
import SingleDetailView from '../common/SingleDetailView';
import type { FileSystemEntry } from '../../@types/filesystem';
import formatDetailValue from '../../utils/formatDetailValue';
import { createPriorityAwareComparatorFromRecords } from '../../utils/keySort';
import buildFilesystemDetailValues from '../../utils/filesystemDetails';
import { FILESYSTEM_DETAIL_LAYOUT } from '../../config/detailLayouts';
import { resolveFilesystemAttributeLabel } from '../../constants/filesystemAttributeLabels';

interface SelectedFileSystemsDetailsPanelProps {
  items: FileSystemEntry[];
  onRemove: (filesystemId: string) => void;
  pinnedId?: string | null;
  onPin?: (filesystemId: string) => void;
  onUnpin?: () => void;
}

const SelectedFileSystemsDetailsPanel = ({
  items,
  onRemove,
  pinnedId,
  onPin,
  onUnpin,
}: SelectedFileSystemsDetailsPanelProps) => {
  const columns: DetailComparisonColumn[] = items.map((filesystem) => ({
    id: filesystem.id,
    title: filesystem.filesystemName,
    onRemove: () => onRemove(filesystem.id),
    values: buildFilesystemDetailValues(filesystem),
  }));

  const title =
    columns.length > 1 ? 'مقایسه جزئیات فضاهای فایلی' : 'جزئیات فضای فایلی';

  return (
    columns.length === 1 ? (
      <SingleDetailView
        title={title}
        sections={FILESYSTEM_DETAIL_LAYOUT.sections}
        values={columns[0].values}
        formatValue={formatDetailValue}
        emptyStateMessage="اطلاعاتی برای نمایش وجود ندارد."
        attributeOrder={FILESYSTEM_DETAIL_LAYOUT.comparisonPriority}
        attributeSort={createPriorityAwareComparatorFromRecords(
          columns.map(({ values }) => values),
          'fa-IR',
          FILESYSTEM_DETAIL_LAYOUT.comparisonPriority
        )}
        attributeLabelResolver={resolveFilesystemAttributeLabel}
        isPinned={columns[0].id === pinnedId}
        onPin={onPin ? () => onPin(columns[0].id) : undefined}
        onUnpin={columns[0].id === pinnedId ? onUnpin : undefined}
      />
    ) : (
      <DetailComparisonPanel
        title={title}
        attributeLabel="ویژگی"
        columns={columns}
        formatValue={formatDetailValue}
        emptyStateMessage="اطلاعاتی برای نمایش وجود ندارد."
        attributeSort={createPriorityAwareComparatorFromRecords(
          columns.map(({ values }) => values),
          'fa-IR',
          FILESYSTEM_DETAIL_LAYOUT.comparisonPriority
        )}
        attributeLabelResolver={resolveFilesystemAttributeLabel}
      />
    )
  );
};

export default SelectedFileSystemsDetailsPanel;