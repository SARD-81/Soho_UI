import type { ZpoolDetailEntry } from '../../@types/zpool';
import { translateDetailKey } from '../../utils/detailLabels';
import PoolPropertyToggle from './PoolPropertyToggle';
import type { AttributeConfig } from '../common/attributeConfig';

export type PoolDetailModel = ZpoolDetailEntry & { poolName: string; name?: string };

const INTERACTIVE_POOL_PROPERTIES = [
  'autoexpand',
  'autoreplace',
  'autotrim',
  'compatibility',
  'listsnapshots',
  'multihost',
];

const basePoolAttributeConfig: AttributeConfig<PoolDetailModel>[] = [
  { key: 'size', label: translateDetailKey('size'), visible: (data) => !!data?.size },
  { key: 'free', label: translateDetailKey('free'), visible: (data) => !!data?.free },
  { key: 'alloc', label: translateDetailKey('alloc'), visible: (data) => !!data?.alloc },
  {
    key: 'capacity',
    label: translateDetailKey('capacity'),
    visible: (data) => !!data?.capacity,
  },
  { key: 'health', label: translateDetailKey('health'), visible: (data) => !!data?.health },
  {
    key: 'vdev_type',
    label: translateDetailKey('vdev_type'),
    visible: (data) => !!data?.vdev_type,
  },
];

const interactivePoolAttributeConfig: AttributeConfig<PoolDetailModel>[] =
  INTERACTIVE_POOL_PROPERTIES.map((propertyKey) => ({
    key: propertyKey,
    label: translateDetailKey(propertyKey),
    render: (value, data) => (
      <PoolPropertyToggle
        poolName={data.poolName}
        propertyKey={propertyKey}
        value={value}
      />
    ),
    visible: (data) => propertyKey in (data ?? {}),
  }));

export const createPoolAttributeConfig = (
  detail: PoolDetailModel | null
): AttributeConfig<PoolDetailModel>[] => {
  if (!detail) {
    return [];
  }

  const knownKeys = new Set<string>(
    [...basePoolAttributeConfig, ...interactivePoolAttributeConfig].map((cfg) =>
      String(cfg.key)
    )
  );
  knownKeys.add('poolName');

  const dynamicConfig: AttributeConfig<PoolDetailModel>[] = Object.keys(detail)
    .filter((key) => !knownKeys.has(key))
    .map((key) => ({
      key,
      label: translateDetailKey(key),
      visible: (data) => data?.[key] != null,
    }));

  return [...basePoolAttributeConfig, ...interactivePoolAttributeConfig, ...dynamicConfig];
};
