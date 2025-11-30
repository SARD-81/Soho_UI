import DetailComparisonPanel from '../common/DetailComparisonPanel';
import SingleDetailView from '../common/SingleDetailView';
import type { SambaUserTableItem } from '../../@types/samba';
import formatDetailValue from '../../utils/formatDetailValue';
import { createPriorityAwareComparatorFromRecords } from '../../utils/keySort';
import { omitNullishEntries } from '../../utils/detailValues';
import { SAMBA_USER_DETAIL_LAYOUT } from '../../config/detailLayouts';

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
    values: omitNullishEntries(item.details),
  }));

  const title =
    columns.length > 1
      ? 'مقایسه جزئیات کاربران اشتراک فایل'
      : 'جزئیات کاربران اشتراک فایل';
  const attributeSort = createPriorityAwareComparatorFromRecords(
    columns.map(({ values }) => values),
    'fa-IR',
    SAMBA_USER_DETAIL_LAYOUT.comparisonPriority
  );

  return (
    columns.length === 1 ? (
      <SingleDetailView
        title={title}
        sections={SAMBA_USER_DETAIL_LAYOUT.sections}
        values={columns[0].values}
        status={columns[0].status}
        formatValue={formatDetailValue}
        emptyStateMessage="اطلاعاتی برای نمایش وجود ندارد."
        attributeOrder={SAMBA_USER_DETAIL_LAYOUT.comparisonPriority}
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

export default SelectedSambaUsersDetailsPanel;