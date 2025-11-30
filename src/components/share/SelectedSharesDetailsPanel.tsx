import type { SambaShareDetails } from '../../@types/samba';
import DetailComparisonPanel from '../common/DetailComparisonPanel';
import SingleDetailView from '../common/SingleDetailView';
import formatDetailValue from '../../utils/formatDetailValue';
import { createPriorityAwareComparatorFromRecords } from '../../utils/keySort';
import { omitNullishEntries } from '../../utils/detailValues';
import { SHARE_DETAIL_LAYOUT } from '../../config/detailLayouts';

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
    values: omitNullishEntries(detail),
  }));

  const title =
    columns.length > 1 ? 'مقایسه جزئیات اشتراک‌ها' : 'جزئیات اشتراک‌ها';
  const attributeSort = createPriorityAwareComparatorFromRecords(
    columns.map(({ values }) => values),
    'fa-IR',
    SHARE_DETAIL_LAYOUT.comparisonPriority
  );

  return (
    columns.length === 1 ? (
      <SingleDetailView
        title={title}
        sections={SHARE_DETAIL_LAYOUT.sections}
        values={columns[0].values}
        status={columns[0].status}
        formatValue={formatDetailValue}
        emptyStateMessage="اطلاعاتی برای نمایش وجود ندارد."
        attributeOrder={SHARE_DETAIL_LAYOUT.comparisonPriority}
        attributeSort={attributeSort}
      />
    ) : (
      <DetailComparisonPanel
        title={title}
        attributeLabel="ویژگی"
        columns={columns}
        formatValue={formatDetailValue}
        emptyStateMessage="اطلاعاتی برای نمایش وجود ندارد."
        attributeSort={attributeSort}
      />
    )
  );
};

export default SelectedSharesDetailsPanel;