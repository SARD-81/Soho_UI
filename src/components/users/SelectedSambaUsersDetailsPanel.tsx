import DetailComparisonPanel, { type DetailComparisonColumn } from '../common/DetailComparisonPanel';
import SingleDetailView from '../common/SingleDetailView';
import type { SambaUserTableItem } from '../../@types/samba';
import formatDetailValue from '../../utils/formatDetailValue';
import { createPriorityAwareComparatorFromRecords } from '../../utils/keySort';
import { omitNullishEntries } from '../../utils/detailValues';
import { SAMBA_USER_DETAIL_LAYOUT } from '../../config/detailLayouts';

interface SelectedSambaUsersDetailsPanelProps {
  items: SambaUserTableItem[];
  onRemove: (username: string) => void;
  pinnedId?: string | null;
  onPin?: (username: string) => void;
  onUnpin?: () => void;
}

const SelectedSambaUsersDetailsPanel = ({
  items,
  onRemove,
  pinnedId,
  onPin,
  onUnpin,
}: SelectedSambaUsersDetailsPanelProps) => {
  const columns: DetailComparisonColumn[] = items.map((item) => ({
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
        formatValue={formatDetailValue}
        emptyStateMessage="اطلاعاتی برای نمایش وجود ندارد."
        attributeOrder={SAMBA_USER_DETAIL_LAYOUT.comparisonPriority}
        attributeSort={attributeSort}
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
        attributeSort={attributeSort}
      />
    )
  );
};

export default SelectedSambaUsersDetailsPanel;