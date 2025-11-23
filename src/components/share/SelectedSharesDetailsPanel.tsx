import { useMemo } from 'react';
import type { SambaShareDetails } from '../../@types/samba';
import DetailComparisonPanel from '../common/DetailComparisonPanel';
import formatDetailValue from '../../utils/formatDetailValue';
import {
  buildKeyLengthMap,
  createLengthAwareComparator,
} from '../../utils/keySort';

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
  const columns = useMemo(
    () =>
      items.map(({ shareName, detail }) => ({
        id: shareName,
        title: shareName,
        onRemove: () => onRemove(shareName),
        values: detail ?? {},
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
    columns.length > 1 ? 'مقایسه جزئیات اشتراک‌ها' : 'جزئیات اشتراک‌ها';

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