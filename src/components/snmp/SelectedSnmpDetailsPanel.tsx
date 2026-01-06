import { Box, Chip } from '@mui/material';
import type { ReactNode } from 'react';
import { SNMP_DETAIL_LAYOUT } from '../../config/detailLayouts';
import { selectDetailViewState, useDetailSplitViewStore } from '../../stores/detailSplitViewStore';
import { filterDetailValuesByLayout } from '../../utils/detailLayouts';
import formatDetailValue from '../../utils/formatDetailValue';
import { createPriorityAwareComparatorFromRecords } from '../../utils/keySort';
import { translateDetailKey } from '../../utils/detailLabels';
import DetailComparisonPanel, { type DetailComparisonColumn } from '../common/DetailComparisonPanel';
import SingleDetailView from '../common/SingleDetailView';
import type { SnmpInfoRow } from './SnmpInfoTable';

interface SelectedSnmpDetailsPanelProps {
  items: SnmpInfoRow[];
  viewId: string;
}

const formatSnmpValue = (value: unknown): ReactNode => {
  if (Array.isArray(value)) {
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {value.map((ip) => (
          <Chip
            key={ip as string}
            size="small"
            label={String(ip)}
            sx={{
              backgroundColor: 'rgba(0, 198, 169, 0.12)',
              color: 'var(--color-primary)',
              fontWeight: 700,
            }}
          />
        ))}
      </Box>
    );
  }

  if (typeof value === 'boolean') {
    return value ? 'فعال' : 'غیرفعال';
  }

  return formatDetailValue(value);
};

const SelectedSnmpDetailsPanel = ({ items, viewId }: SelectedSnmpDetailsPanelProps) => {
  const { activeItemId, pinnedItemIds } = useDetailSplitViewStore(
    selectDetailViewState(viewId)
  );
  const togglePinnedItem = useDetailSplitViewStore((state) => state.togglePinnedItem);
  const unpinItem = useDetailSplitViewStore((state) => state.unpinItem);

  const itemLookup = new Map(items.map((item) => [item.id, item]));

  const buildColumn = (item: SnmpInfoRow, isPinned: boolean): DetailComparisonColumn => ({
    id: item.id,
    title: item.sys_name ?? 'SNMP',
    onRemove: isPinned ? () => unpinItem(viewId, item.id) : undefined,
    values: filterDetailValuesByLayout(item.details, SNMP_DETAIL_LAYOUT),
    pinToggle: {
      isPinned,
      onToggle: () => togglePinnedItem(viewId, item.id),
    },
  });

  const pinnedColumns: DetailComparisonColumn[] = pinnedItemIds
    .map((id) => itemLookup.get(id))
    .filter((item): item is SnmpInfoRow => Boolean(item))
    .map((item) => buildColumn(item, true));

  const title = pinnedColumns.length > 1 ? 'مقایسه تنظیمات SNMP' : 'جزئیات SNMP';
  const shouldShowSingle = pinnedColumns.length === 0;
  const activeItem = activeItemId ? itemLookup.get(activeItemId) : null;
  const comparisonColumns: DetailComparisonColumn[] = [];

  if (!shouldShowSingle && activeItem && !pinnedItemIds.includes(activeItem.id)) {
    comparisonColumns.push(buildColumn(activeItem, false));
  }

  comparisonColumns.push(...pinnedColumns);

  if (shouldShowSingle && activeItem) {
    const singleColumnValues = filterDetailValuesByLayout(
      activeItem.details,
      SNMP_DETAIL_LAYOUT
    );
    const attributeSort = createPriorityAwareComparatorFromRecords(
      [singleColumnValues],
      'fa-IR',
      SNMP_DETAIL_LAYOUT.comparisonPriority
    );

    return (
      <SingleDetailView
        title={title}
        sections={SNMP_DETAIL_LAYOUT.sections}
        values={singleColumnValues}
        formatValue={formatSnmpValue}
        emptyStateMessage="اطلاعاتی برای نمایش وجود ندارد."
        attributeOrder={SNMP_DETAIL_LAYOUT.comparisonPriority}
        attributeSort={attributeSort}
        attributeLabelResolver={translateDetailKey}
        itemId={activeItem.id}
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
      formatValue={formatSnmpValue}
      emptyStateMessage="اطلاعاتی برای نمایش وجود ندارد."
      attributeSort={createPriorityAwareComparatorFromRecords(
        comparisonColumns.map(({ values }) => values),
        'fa-IR',
        SNMP_DETAIL_LAYOUT.comparisonPriority
      )}
      attributeLabelResolver={translateDetailKey}
    />
  );
};

export default SelectedSnmpDetailsPanel;
