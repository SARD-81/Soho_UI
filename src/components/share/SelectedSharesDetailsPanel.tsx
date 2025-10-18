import type { SambaShareDetails } from '../../@types/samba';
import DetailComparisonPanel from '../common/DetailComparisonPanel';
import formatDetailValue from '../../utils/formatDetailValue';

interface ShareDetailItem {
  shareName: string;
  detail: SambaShareDetails;
}

interface SelectedSharesDetailsPanelProps {
  items: ShareDetailItem[];
  onRemove: (shareName: string) => void;
}

const SelectedSharesDetailsPanel = ({
  items,
  onRemove,
}: SelectedSharesDetailsPanelProps) => {
  const columns = items.map(({ shareName, detail }) => ({
    id: shareName,
    title: shareName,
    onRemove: () => onRemove(shareName),
    values: detail ?? {},
  }));

  return (
    <DetailComparisonPanel
      title="مقایسه جزئیات اشتراک‌ها"
      attributeLabel="ویژگی"
      columns={columns}
      formatValue={formatDetailValue}
      emptyStateMessage="اطلاعاتی برای نمایش وجود ندارد."
      attributeSort={(a, b) => a.localeCompare(b, 'fa-IR')}
    />
  );
};

export default SelectedSharesDetailsPanel;