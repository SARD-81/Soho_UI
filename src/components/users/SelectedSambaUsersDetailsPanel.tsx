import DetailComparisonPanel from '../common/DetailComparisonPanel';
import type { SambaUserTableItem } from '../../@types/samba';
import formatDetailValue from '../../utils/formatDetailValue';
import { createLengthAwareComparatorFromRecords } from '../../utils/keySort';

interface SelectedSambaUsersDetailsPanelProps {
  items: SambaUserTableItem[];
  onRemove: (username: string) => void;
}

const SelectedSambaUsersDetailsPanel = ({
  items,
  onRemove,
}: SelectedSambaUsersDetailsPanelProps) => {
  const columns = items.map((item) => ({
    id: item.username,
    title: item.username,
    onRemove: () => onRemove(item.username),
    values: item.details ?? {},
  }));

  const title =
    columns.length > 1
      ? 'مقایسه جزئیات کاربران اشتراک فایل'
      : 'جزئیات کاربران اشتراک فایل';
  const attributeSort = createLengthAwareComparatorFromRecords(
    columns.map(({ values }) => values),
    'fa-IR'
  );

  return (
    <DetailComparisonPanel
      title={title}
      attributeLabel="ویژگی"
      columns={columns}
      formatValue={formatDetailValue}
      emptyStateMessage="اطلاعاتی برای نمایش وجود ندارد."
      attributeSort={attributeSort}
    />
  );
};

export default SelectedSambaUsersDetailsPanel;