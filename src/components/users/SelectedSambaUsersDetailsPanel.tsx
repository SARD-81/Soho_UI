import { useMemo } from 'react';
import DetailComparisonPanel from '../common/DetailComparisonPanel';
import type { SambaUserTableItem } from '../../@types/samba';
import formatDetailValue from '../../utils/formatDetailValue';
import {
  buildKeyLengthMap,
  createLengthAwareComparator,
} from '../../utils/keySort';

interface SelectedSambaUsersDetailsPanelProps {
  items: SambaUserTableItem[];
  onRemove: (username: string) => void;
}

const SelectedSambaUsersDetailsPanel = ({
  items,
  onRemove,
}: SelectedSambaUsersDetailsPanelProps) => {
  const columns = useMemo(
    () =>
      items.map((item) => ({
        id: item.username,
        title: item.username,
        onRemove: () => onRemove(item.username),
        values: item.details ?? {},
      })),
    [items, onRemove]
  );

  const attributeLengthMap = useMemo(
    () => buildKeyLengthMap(columns.map((column) => column.values ?? {})),
    [columns]
  );

  const attributeSort = useMemo(
    () => createLengthAwareComparator(attributeLengthMap, 'fa-IR'),
    [attributeLengthMap]
  );

  const title =
    columns.length > 1
      ? 'مقایسه جزئیات کاربران اشتراک فایل'
      : 'جزئیات کاربران اشتراک فایل';

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