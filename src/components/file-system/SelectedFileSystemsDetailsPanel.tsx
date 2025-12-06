import DetailComparisonPanel from '../common/DetailComparisonPanel';
import SingleDetailView from '../common/SingleDetailView';
import type { FileSystemEntry } from '../../@types/filesystem';
import formatDetailValue from '../../utils/formatDetailValue';
import { createPriorityAwareComparatorFromRecords } from '../../utils/keySort';
import buildFilesystemDetailValues from '../../utils/filesystemDetails';
import { FILESYSTEM_DETAIL_LAYOUT } from '../../config/detailLayouts';

interface SelectedFileSystemsDetailsPanelProps {
  items: FileSystemEntry[];
  onRemove: (filesystemId: string) => void;
}

const SelectedFileSystemsDetailsPanel = ({
  items,
  onRemove,
}: SelectedFileSystemsDetailsPanelProps) => {
  const columns = items.map((filesystem) => ({
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
      />
    )
  );
};

export default SelectedFileSystemsDetailsPanel;