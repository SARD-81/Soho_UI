import type { SambaShareDetails } from '../../@types/samba';
import DetailComparisonPanel from '../common/DetailComparisonPanel';
import formatDetailValue from '../../utils/formatDetailValue';
import { createLengthAwareComparatorFromRecords } from '../../utils/keySort';
import { localizeDetailEntries } from '../../utils/detailLabels';

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
    values: localizeDetailEntries(detail),
  }));

  const title =
    columns.length > 1 ? 'مقایسه جزئیات اشتراک‌ها' : 'جزئیات اشتراک‌ها';
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

export default SelectedSharesDetailsPanel;