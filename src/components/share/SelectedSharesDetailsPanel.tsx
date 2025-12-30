import type { ReactNode } from 'react';
import type { SambaShareDetails } from '../../@types/samba';
import DetailComparisonPanel, {
  type DetailComparisonColumn,
} from '../common/DetailComparisonPanel';
import SingleDetailView from '../common/SingleDetailView';
import formatDetailValue from '../../utils/formatDetailValue';
import { createPriorityAwareComparatorFromRecords } from '../../utils/keySort';
import { omitNullishEntries } from '../../utils/detailValues';
import { SHARE_DETAIL_LAYOUT } from '../../config/detailLayouts';
import ShareDetailValueControl from './ShareDetailValueControl';
import { useUpdateSharepoint } from '../../hooks/useUpdateSharepoint';
import { selectDetailViewState, useDetailSplitViewStore } from '../../store/detailSplitViewStore';

interface ShareDetailItem {
  shareName: string;
  detail: SambaShareDetails;
}

interface EditableShareValue {
  __type: 'share-editable-value';
  shareName: string;
  attributeKey: string;
  value: unknown;
}

interface SelectedSharesDetailsPanelProps {
  items: ShareDetailItem[];
  viewId: string;
}

const SHARE_ATTRIBUTE_LABELS: Record<string, string> = {
  path: 'مسیر',
  full_path: 'مسیر کامل',
  valid_users: 'کاربران مجاز',
  'valid users': 'کاربران مجاز',
  valid_groups: 'گروه های مجاز',
  'valid groups': 'گروه های مجاز',
  available: 'فعال',
  'read only': 'فقط خواندنی',
  browseable: 'قابل مرور',
  'guest ok': 'دسترسی مهمان',
  'inherit permissions': 'ارث‌بری مجوزها',
  'create mask': 'ماسک ایجاد',
  'directory mask': 'ماسک پوشه',
  'max connections': 'حداکثر اتصال',
  is_custom: 'سفارشی',
  created_time: 'زمان ایجاد',
};

const SelectedSharesDetailsPanel = ({
  items,
  viewId,
}: SelectedSharesDetailsPanelProps) => {
  const { activeItemId, pinnedItemIds } = useDetailSplitViewStore(
    selectDetailViewState(viewId)
  );
  const togglePinnedItem = useDetailSplitViewStore((state) => state.togglePinnedItem);
  const unpinItem = useDetailSplitViewStore((state) => state.unpinItem);
  const updateSharepoint = useUpdateSharepoint();
  const resolveAttributeLabel = (key: string) => SHARE_ATTRIBUTE_LABELS[key] ?? key;

  const pendingKey = updateSharepoint.variables
    ? `${updateSharepoint.variables.shareName}-${Object.keys(updateSharepoint.variables.updates)[0]}`
    : null;

  const itemLookup = new Map(items.map((item) => [item.shareName, item]));

  const buildColumn = (item: ShareDetailItem, isPinned: boolean) => {
    const cleanedValues = omitNullishEntries(item.detail);
    const editableValues = Object.fromEntries(
      Object.entries(cleanedValues).map(([key, value]) => [
        key,
        {
          __type: 'share-editable-value',
          shareName: item.shareName,
          attributeKey: key,
          value,
        } satisfies EditableShareValue,
      ])
    );

    return {
      id: item.shareName,
      title: item.shareName,
      onRemove: isPinned ? () => unpinItem(viewId, item.shareName) : undefined,
      values: editableValues,
      pinToggle: {
        isPinned,
        onToggle: () => togglePinnedItem(viewId, item.shareName),
      },
    } satisfies DetailComparisonColumn;
  };

  const pinnedColumns: DetailComparisonColumn[] = pinnedItemIds
    .map((shareName) => itemLookup.get(shareName))
    .filter((item): item is ShareDetailItem => Boolean(item))
    .map((item) => buildColumn(item, true));

  const shouldShowSingle = pinnedColumns.length === 0;
  const activeItem = activeItemId ? itemLookup.get(activeItemId) : null;
  const comparisonColumns: DetailComparisonColumn[] = [];

  if (!shouldShowSingle && activeItem && !pinnedItemIds.includes(activeItem.shareName)) {
    comparisonColumns.push(buildColumn(activeItem, false));
  }

  comparisonColumns.push(...pinnedColumns);

  const title =
    comparisonColumns.length > 1 ? 'مقایسه جزئیات اشتراک‌ها' : 'جزئیات اشتراک‌ها';

  const formatShareValue = (value: unknown): ReactNode => {
    if (
      value &&
      typeof value === 'object' &&
      '__type' in value &&
      (value as { __type?: string }).__type === 'share-editable-value'
    ) {
      const editableValue = value as EditableShareValue;
      const compositeKey = `${editableValue.shareName}-${editableValue.attributeKey}`;

      return (
        <ShareDetailValueControl
          attributeKey={editableValue.attributeKey}
          value={editableValue.value}
          isUpdating={pendingKey === compositeKey && updateSharepoint.isPending}
          errorMessage={
            updateSharepoint.isError && pendingKey === compositeKey
              ? updateSharepoint.error?.message ?? null
              : null
          }
          onSubmit={(newValue) =>
            updateSharepoint.mutate({
              shareName: editableValue.shareName,
              updates: { [editableValue.attributeKey]: newValue },
            })
          }
        />
      );
    }

    return formatDetailValue(value);
  };

  if (shouldShowSingle && activeItem) {
    const singleValues = comparisonColumns[0]?.values ?? buildColumn(activeItem, false).values;
    const attributeSort = createPriorityAwareComparatorFromRecords(
      [singleValues],
      'fa-IR',
      SHARE_DETAIL_LAYOUT.comparisonPriority
    );

    return (
      <SingleDetailView
        title={title}
        sections={SHARE_DETAIL_LAYOUT.sections}
        values={singleValues}
        status={comparisonColumns[0]?.status}
        formatValue={formatShareValue}
        emptyStateMessage="اطلاعاتی برای نمایش وجود ندارد."
        attributeOrder={SHARE_DETAIL_LAYOUT.comparisonPriority}
        attributeSort={attributeSort}
        attributeLabelResolver={resolveAttributeLabel}
        itemId={activeItem.shareName}
        viewId={viewId}
      />
    );
  }

  if (comparisonColumns.length === 0) {
    return null;
  }

  return (
    <DetailComparisonPanel
      title={title}
      attributeLabel="ویژگی"
      columns={comparisonColumns}
      formatValue={formatShareValue}
      emptyStateMessage="اطلاعاتی برای نمایش وجود ندارد."
      attributeSort={createPriorityAwareComparatorFromRecords(
        comparisonColumns.map(({ values }) => values),
        'fa-IR',
        SHARE_DETAIL_LAYOUT.comparisonPriority
      )}
      attributeLabelResolver={resolveAttributeLabel}
    />
  );
};

export default SelectedSharesDetailsPanel;