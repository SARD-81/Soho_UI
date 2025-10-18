import DetailComparisonPanel from '../common/DetailComparisonPanel';
import type { SambaUserTableItem } from '../../@types/samba';
import formatDetailValue from '../../utils/formatDetailValue';

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

  return (
    <DetailComparisonPanel
      title="مقایسه جزئیات کاربران اشتراک فایل"
      attributeLabel="ویژگی"
      columns={columns}
      formatValue={formatDetailValue}
      emptyStateMessage="اطلاعاتی برای نمایش وجود ندارد."
      attributeSort={(a, b) => a.localeCompare(b, 'fa-IR')}
    />
  );
};

export default SelectedSambaUsersDetailsPanel;