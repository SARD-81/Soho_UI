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
  onRemove: (shareName: string) => void;
}

const SelectedSharesDetailsPanel = ({
  items,
  onRemove,
}: SelectedSharesDetailsPanelProps) => {
  const updateSharepoint = useUpdateSharepoint();

  const pendingKey = updateSharepoint.variables
    ? `${updateSharepoint.variables.shareName}-${Object.keys(updateSharepoint.variables.updates)[0]}`
    : null;

  const columns: DetailComparisonColumn[] = items.map(({ shareName, detail }) => {
    const cleanedValues = omitNullishEntries(detail);
    const editableValues = Object.fromEntries(
      Object.entries(cleanedValues).map(([key, value]) => [
        key,
        {
          __type: 'share-editable-value',
          shareName,
          attributeKey: key,
          value,
        } satisfies EditableShareValue,
      ])
    );

    return {
      id: shareName,
      title: shareName,
      onRemove: () => onRemove(shareName),
      values: editableValues,
    };
  });

  const title =
    columns.length > 1 ? 'مقایسه جزئیات اشتراک‌ها' : 'جزئیات اشتراک‌ها';
  const attributeSort = createPriorityAwareComparatorFromRecords(
    columns.map(({ values }) => values),
    'fa-IR',
    SHARE_DETAIL_LAYOUT.comparisonPriority
  );

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

  return (
    columns.length === 1 ? (
      <SingleDetailView
        title={title}
        sections={SHARE_DETAIL_LAYOUT.sections}
        values={columns[0].values}
        status={columns[0].status}
        formatValue={formatShareValue}
        emptyStateMessage="اطلاعاتی برای نمایش وجود ندارد."
        attributeOrder={SHARE_DETAIL_LAYOUT.comparisonPriority}
        attributeSort={attributeSort}
      />
    ) : (
      <DetailComparisonPanel
        title={title}
        attributeLabel="ویژگی"
        columns={columns}
        formatValue={formatShareValue}
        emptyStateMessage="اطلاعاتی برای نمایش وجود ندارد."
        attributeSort={attributeSort}
      />
    )
  );
};

export default SelectedSharesDetailsPanel;
