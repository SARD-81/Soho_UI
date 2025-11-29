import type { ReactNode } from 'react';
import type { DetailComparisonColumn } from './DetailComparisonPanel';

export type AttributeConfig<T> = {
  key: keyof T | string;
  label: string;
  visible?: (data: T) => boolean;
  render?: (value: unknown, data: T) => ReactNode;
};

export function buildColumnFromConfig<T>(
  id: string,
  title: string,
  data: T,
  config: AttributeConfig<T>[]
): DetailComparisonColumn {
  const values: Record<string, unknown> = {};

  config.forEach((cfg) => {
    const isVisible = cfg.visible ? cfg.visible(data) : true;

    if (!isVisible) {
      return;
    }

    const label = cfg.label;
    const rawValue = (data as Record<string, unknown>)[cfg.key as string];

    values[label] = cfg.render ? cfg.render(rawValue, data) : rawValue ?? '-';
  });

  return {
    id,
    title,
    values,
  };
}
