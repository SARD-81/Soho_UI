import DetailComparisonPanel from '../common/DetailComparisonPanel';
import type { FileSystemEntry } from '../../@types/filesystem';
import formatDetailValue from '../../utils/formatDetailValue';
import { createLengthAwareComparatorFromRecords } from '../../utils/keySort';
import buildFilesystemDetailValues from '../../utils/filesystemDetails';

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
    <DetailComparisonPanel
      title={title}
      attributeLabel="ویژگی"
      columns={columns}
      formatValue={formatDetailValue}
      emptyStateMessage="اطلاعاتی برای نمایش وجود ندارد."
      attributeSort={createLengthAwareComparatorFromRecords(
        columns.map(({ values }) => values),
        'fa-IR'
      )}
    />
  );
};

export default SelectedFileSystemsDetailsPanel;
