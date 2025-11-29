import type { ZpoolDetailEntry } from '../../@types/zpool';
import { isValidElement, useMemo } from 'react';
import DetailComparisonPanel, {
  type DetailComparisonColumn,
  type DetailComparisonStatus,
} from '../common/DetailComparisonPanel';
import { buildColumnFromConfig } from '../common/attributeConfig';
import formatDetailValue from '../../utils/formatDetailValue';
import { createLengthAwareComparatorFromRecords } from '../../utils/keySort';
import { createPoolAttributeConfig, type PoolDetailModel } from './poolAttributeConfig';

interface PoolDetailItem {
  poolName: string;
  detail: ZpoolDetailEntry | null;
  isLoading: boolean;
  error: Error | null;
}

interface SelectedPoolsDetailsPanelProps {
  items: PoolDetailItem[];
  onRemove: (poolName: string) => void;
}

const SelectedPoolsDetailsPanel = ({
  items,
  onRemove,
}: SelectedPoolsDetailsPanelProps) => {
  const formatValue = useMemo(
    () =>
      (value: unknown) =>
        isValidElement(value)
          ? value
          : formatDetailValue(value),
    []
  );

  const columns: DetailComparisonColumn[] = items.map(({
    poolName,
    detail,
    isLoading,
    error,
  }) => {
    let status: DetailComparisonStatus | undefined;

    if (isLoading) {
      status = { type: 'loading', message: 'در حال دریافت اطلاعات...' };
    } else if (error) {
      status = {
        type: 'error',
        message: `خطا در دریافت اطلاعات: ${error.message}`,
      };
    } else if (!detail || Object.keys(detail).length === 0) {
      status = { type: 'empty', message: 'اطلاعاتی برای نمایش وجود ندارد.' };
    }

    const detailWithMetadata: PoolDetailModel | null = detail
      ? { ...detail, poolName }
      : null;

    const columnFromConfig = detailWithMetadata
      ? buildColumnFromConfig(
          detailWithMetadata.poolName,
          (detailWithMetadata.name as string | undefined) ?? poolName,
          detailWithMetadata,
          createPoolAttributeConfig(detailWithMetadata)
        )
      : { id: poolName, title: poolName, values: {} };

    return {
      ...columnFromConfig,
      onRemove: () => onRemove(poolName),
      status,
    };
  });

  return (
    <DetailComparisonPanel
      title="مقایسه جزئیات فضاهای یکپارچه"
      attributeLabel="ویژگی"
      columns={columns}
      formatValue={formatValue}
      emptyStateMessage="اطلاعاتی برای نمایش وجود ندارد."
      attributeSort={createLengthAwareComparatorFromRecords(
        columns.map(({ values }) => values),
        'fa-IR'
      )}
    />
  );
};

export default SelectedPoolsDetailsPanel;