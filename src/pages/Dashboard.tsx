import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';
import { MdAutoAwesome, MdOutlineDashboardCustomize } from 'react-icons/md';
import type { ComponentType } from 'react';
import Cpu from '../components/Cpu';
import Disk from '../components/Disk';
import Memory from '../components/Memory';
import Network from '../components/Network';
import Zpool from '../components/Zpool';
import DashboardLayoutPanel, {
  type DashboardLayoutPanelWidget,
} from '../components/dashboard/DashboardLayoutPanel';
import SortableWidget from '../components/dashboard/SortableWidget';

const LAYOUT_STORAGE_KEY = 'dashboard-layout.v2';

type BreakpointKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

type ResponsiveSpanConfig = Partial<Record<BreakpointKey, number>>;

interface WidgetLayoutConfig {
  columns?: ResponsiveSpanConfig;
  rows?: ResponsiveSpanConfig;
  minHeight?: number;
}

interface DashboardWidgetLayoutOption extends WidgetLayoutConfig {
  id: string;
  label: string;
  description?: string;
  isDefault?: boolean;
}

interface DashboardWidgetDefinition extends WidgetLayoutConfig {
  id: string;
  title: string;
  description?: string;
  component: ComponentType;
  layoutOptions?: DashboardWidgetLayoutOption[];
}

interface LayoutState {
  order: string[];
  hidden: string[];
  sizeOverrides: Record<string, string>;
}

const BREAKPOINT_ORDER: BreakpointKey[] = ['xs', 'sm', 'md', 'lg', 'xl'];
const FULL_WIDTH_COLUMNS = 12;
const DEFAULT_ROW_SPAN = 1;

const clampSpan = (value: number, max: number) => {
  if (!Number.isFinite(value)) {
    return 1;
  }

  const rounded = Math.floor(value);
  return Math.min(Math.max(rounded, 1), max);
};

const createResponsiveSpan = (
  spans: ResponsiveSpanConfig | undefined,
  defaultSpan: number,
  maxSpan = FULL_WIDTH_COLUMNS
) => {
  let currentSpan = spans?.xs ?? defaultSpan;

  return BREAKPOINT_ORDER.reduce(
    (acc, breakpoint, index) => {
      if (index === 0) {
        acc[breakpoint] = `span ${clampSpan(currentSpan, maxSpan)}`;
        return acc;
      }

      const nextSpan = spans?.[breakpoint];
      if (nextSpan != null) {
        currentSpan = nextSpan;
      }

      acc[breakpoint] = `span ${clampSpan(currentSpan, maxSpan)}`;

      return acc;
    },
    {} as Record<BreakpointKey, string>
  );
};

const dashboardWidgets: DashboardWidgetDefinition[] = [
  {
    id: 'cpu',
    title: 'وضعیت پردازنده',
    description: 'نمودار زنده مصرف CPU و جزئیات هسته‌ها',
    component: Cpu,
    columns: { xs: 12, md: 6, xl: 5 },
    layoutOptions: [
      {
        id: 'cpu-compact',
        label: 'چیدمان فشرده',
        description: 'ابعاد بهینه برای مانیتورینگ در صفحات کوچک‌تر',
        columns: { xs: 12, md: 6, xl: 4 },
      },
      {
        id: 'cpu-wide',
        label: 'نمای تمام عرض',
        description: 'فضای بیشتر برای تحلیل نمودار پردازنده',
        columns: { xs: 12, md: 12, xl: 10 },
      },
    ],
  },
  {
    id: 'memory',
    title: 'مصرف حافظه',
    description: 'تفکیک حافظه مصرفی و آزاد به صورت لحظه‌ای',
    component: Memory,
    columns: { xs: 12, md: 6, xl: 5 },
    layoutOptions: [
      {
        id: 'memory-compact',
        label: 'چیدمان فشرده',
        description: 'هماهنگ با چیدمان‌های ستونی',
        columns: { xs: 12, md: 6, xl: 4 },
      },
      {
        id: 'memory-wide',
        label: 'نمای گسترده',
        description: 'عرض کامل برای نمایش جزئیات بیشتر',
        columns: { xs: 12, md: 12, xl: 10 },
      },
    ],
  },
  {
    id: 'zpool-overview',
    title: 'تجمیع استخرهای ذخیره‌سازی',
    description: 'تصویر کلی از سلامت و ظرفیت استخرهای ZFS',
    component: Zpool,
    columns: { xs: 12, md: 10, xl: 10 },
    layoutOptions: [
      {
        id: 'zpool-compact',
        label: 'نیم عرض',
        description: 'چیدمان مناسب برای داشبوردهای چندگانه',
        columns: { xs: 12, md: 6, xl: 6 },
      },
      {
        id: 'zpool-full',
        label: 'تمام عرض',
        description: 'تمرکز کامل بر وضعیت ذخیره‌سازی',
        columns: { xs: 12, md: 12, xl: 12 },
      },
    ],
  },
  {
    id: 'disk',
    title: 'سلامت دیسک‌ها',
    description: 'بررسی وضعیت درایوها و ظرفیت استفاده‌شده',
    component: Disk,
    columns: { xs: 12 },
    layoutOptions: [
      {
        id: 'disk-half',
        label: 'نمای ستونی',
        description: 'نمایش در کنار سایر ویجت‌ها',
        columns: { xs: 12, md: 6, xl: 6 },
      },
    ],
  },
  {
    id: 'network',
    title: 'ترافیک شبکه',
    description: 'پایش لحظه‌ای ورودی و خروجی شبکه',
    component: Network,
    columns: { xs: 12 },
    layoutOptions: [
      {
        id: 'network-half',
        label: 'نمای ستونی',
        description: 'قرارگیری هم‌زمان با سایر کارت‌ها',
        columns: { xs: 12, md: 6, xl: 6 },
      },
    ],
  },
];

const loadStoredLayout = (): Partial<LayoutState> | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = localStorage.getItem(LAYOUT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<LayoutState>) : null;
  } catch {
    return null;
  }
};

const areLayoutStatesEqual = (a: LayoutState, b: LayoutState) => {
  if (a.order.length !== b.order.length) {
    return false;
  }

  for (let index = 0; index < a.order.length; index += 1) {
    if (a.order[index] !== b.order[index]) {
      return false;
    }
  }

  const sortedHiddenA = [...a.hidden].sort();
  const sortedHiddenB = [...b.hidden].sort();
  if (sortedHiddenA.length !== sortedHiddenB.length) {
    return false;
  }

  for (let index = 0; index < sortedHiddenA.length; index += 1) {
    if (sortedHiddenA[index] !== sortedHiddenB[index]) {
      return false;
    }
  }

  const keysA = Object.keys(a.sizeOverrides).sort();
  const keysB = Object.keys(b.sizeOverrides).sort();

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (let index = 0; index < keysA.length; index += 1) {
    const key = keysA[index];
    if (key !== keysB[index] || a.sizeOverrides[key] !== b.sizeOverrides[key]) {
      return false;
    }
  }

  return true;
};

const Dashboard = () => {
  const widgetIds = useMemo(() => dashboardWidgets.map((widget) => widget.id), []);
  const widgetMap = useMemo(
    () => new Map<string, DashboardWidgetDefinition>(dashboardWidgets.map((widget) => [widget.id, widget])),
    []
  );

  const createNormalizedState = useCallback(
    (raw?: Partial<LayoutState> | null): LayoutState => {
      const providedOrder = Array.isArray(raw?.order) ? raw?.order ?? [] : [];
      const seen = new Set<string>();
      const order: string[] = [];

      providedOrder.forEach((id) => {
        if (id && widgetMap.has(id) && !seen.has(id)) {
          order.push(id);
          seen.add(id);
        }
      });

      widgetIds.forEach((id) => {
        if (!seen.has(id)) {
          order.push(id);
          seen.add(id);
        }
      });

      const providedHidden = Array.isArray(raw?.hidden) ? raw?.hidden ?? [] : [];
      const hiddenSeen = new Set<string>();
      const hidden: string[] = [];

      providedHidden.forEach((id) => {
        if (id && widgetMap.has(id) && !hiddenSeen.has(id)) {
          hidden.push(id);
          hiddenSeen.add(id);
        }
      });

      const sizeOverrides: Record<string, string> = {};
      if (raw?.sizeOverrides && typeof raw.sizeOverrides === 'object') {
        Object.entries(raw.sizeOverrides).forEach(([widgetId, presetId]) => {
          if (typeof presetId !== 'string') {
            return;
          }

          const widget = widgetMap.get(widgetId);
          if (!widget) {
            return;
          }

          const validOption = widget.layoutOptions?.some((option) => option.id === presetId);
          if (validOption) {
            sizeOverrides[widgetId] = presetId;
          }
        });
      }

      return { order, hidden, sizeOverrides };
    },
    [widgetIds, widgetMap]
  );

  const defaultLayoutState = useMemo(() => createNormalizedState(), [createNormalizedState]);
  const [layoutState, setLayoutState] = useState<LayoutState>(() => {
    const stored = loadStoredLayout();
    return createNormalizedState(stored);
  });
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layoutState));
  }, [layoutState]);

  const getWidgetLayoutOptions = useCallback(
    (widget: DashboardWidgetDefinition): DashboardWidgetLayoutOption[] => {
      const baseOption: DashboardWidgetLayoutOption = {
        id: 'default',
        label: 'چیدمان استاندارد',
        description: 'تعادل بین اطلاعات و فضا',
        columns: widget.columns,
        rows: widget.rows,
        minHeight: widget.minHeight,
        isDefault: true,
      };

      return [baseOption, ...(widget.layoutOptions ?? [])];
    },
    []
  );

  const visibleWidgetIds = useMemo(
    () => layoutState.order.filter((id) => !layoutState.hidden.includes(id)),
    [layoutState.order, layoutState.hidden]
  );

  const panelWidgets = useMemo<DashboardLayoutPanelWidget[]>(() => {
    const orderedForPanel = [
      ...layoutState.order.filter((id) => !layoutState.hidden.includes(id)),
      ...layoutState.order.filter((id) => layoutState.hidden.includes(id)),
    ];

    return orderedForPanel
      .map((id) => {
        const widget = widgetMap.get(id);
        if (!widget) {
          return null;
        }

        const options = getWidgetLayoutOptions(widget);
        const activeOptionId = layoutState.sizeOverrides[id] ?? 'default';
        const optionExists = options.some((option) => option.id === activeOptionId);

        return {
          id,
          title: widget.title,
          description: widget.description,
          hidden: layoutState.hidden.includes(id),
          activeOptionId: optionExists ? activeOptionId : 'default',
          options: options.map(({ id: optionId, label, description, isDefault }) => ({
            id: optionId,
            label,
            description,
            isDefault,
          })),
        } satisfies DashboardLayoutPanelWidget;
      })
      .filter(Boolean) as DashboardLayoutPanelWidget[];
  }, [getWidgetLayoutOptions, layoutState.hidden, layoutState.order, layoutState.sizeOverrides, widgetMap]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) {
        return;
      }

      setLayoutState((prev) => {
        const currentVisible = prev.order.filter((id) => !prev.hidden.includes(id));
        const oldIndex = currentVisible.indexOf(String(active.id));
        const newIndex = currentVisible.indexOf(String(over.id));

        if (oldIndex === -1 || newIndex === -1) {
          return prev;
        }

        const reorderedVisible = arrayMove(currentVisible, oldIndex, newIndex);
        const nextOrder: string[] = [];
        let visiblePointer = 0;

        prev.order.forEach((id) => {
          if (prev.hidden.includes(id)) {
            nextOrder.push(id);
            return;
          }

          nextOrder.push(reorderedVisible[visiblePointer]);
          visiblePointer += 1;
        });

        return { ...prev, order: nextOrder };
      });
    },
    []
  );

  const handleToggleWidget = useCallback((widgetId: string) => {
    setLayoutState((prev) => {
      if (!widgetMap.has(widgetId)) {
        return prev;
      }

      const isHidden = prev.hidden.includes(widgetId);
      const hidden = isHidden
        ? prev.hidden.filter((id) => id !== widgetId)
        : [...prev.hidden, widgetId];

      return { ...prev, hidden };
    });
  }, [widgetMap]);

  const handleHideAll = useCallback(() => {
    setLayoutState((prev) => ({ ...prev, hidden: [...prev.order] }));
  }, []);

  const handleShowAll = useCallback(() => {
    setLayoutState((prev) => ({ ...prev, hidden: [] }));
  }, []);

  const handleSelectLayout = useCallback(
    (widgetId: string, optionId: string) => {
      setLayoutState((prev) => {
        const widget = widgetMap.get(widgetId);
        if (!widget) {
          return prev;
        }

        if (optionId === 'default') {
          if (!(widgetId in prev.sizeOverrides)) {
            return prev;
          }

          const { [widgetId]: _removed, ...rest } = prev.sizeOverrides;
          return { ...prev, sizeOverrides: rest };
        }

        const options = getWidgetLayoutOptions(widget);
        const isValid = options.some((option) => option.id === optionId);
        if (!isValid) {
          return prev;
        }

        return {
          ...prev,
          sizeOverrides: { ...prev.sizeOverrides, [widgetId]: optionId },
        };
      });
    },
    [getWidgetLayoutOptions, widgetMap]
  );

  const handleResetLayout = useCallback(() => {
    setLayoutState(createNormalizedState());
  }, [createNormalizedState]);

  const handleCustomizeToggle = () => {
    setIsCustomizing((prev) => {
      const next = !prev;
      setIsPanelOpen(next);
      return next;
    });
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setIsCustomizing(false);
  };

  const isDirty = useMemo(
    () => !areLayoutStatesEqual(layoutState, defaultLayoutState),
    [defaultLayoutState, layoutState]
  );

  const resolveLayoutConfig = useCallback(
    (widget: DashboardWidgetDefinition): WidgetLayoutConfig => {
      const options = getWidgetLayoutOptions(widget);
      const overrideId = layoutState.sizeOverrides[widget.id] ?? 'default';
      const activeOption = options.find((option) => option.id === overrideId) ?? options[0];

      return {
        columns: activeOption.columns ?? widget.columns,
        rows: activeOption.rows ?? widget.rows,
        minHeight: activeOption.minHeight ?? widget.minHeight,
      };
    },
    [getWidgetLayoutOptions, layoutState.sizeOverrides]
  );

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        fontFamily: 'var(--font-vazir)',
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        width: '100%',
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'stretch', md: 'center' }}
        justifyContent="space-between"
        gap={2}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            داشبورد سیستم
          </Typography>
          <Stack direction="row" gap={1} alignItems="center" mt={0.5}>
            <MdAutoAwesome size={18} color="var(--color-primary-500, currentColor)" />
            <Typography variant="body2" color="text.secondary">
              چیدمان کارت‌ها را مطابق نیاز خود تنظیم کنید.
            </Typography>
          </Stack>
        </Box>
        <Stack direction="row" gap={1} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
          {isCustomizing ? (
            <Chip label="حالت شخصی‌سازی فعال است" color="primary" variant="outlined" />
          ) : null}
          <Button
            variant={isCustomizing ? 'contained' : 'outlined'}
            color="primary"
            startIcon={<MdOutlineDashboardCustomize />}
            onClick={handleCustomizeToggle}
          >
            {isCustomizing ? 'پایان شخصی‌سازی' : 'شخصی‌سازی چیدمان'}
          </Button>
        </Stack>
      </Stack>

      <DndContext onDragEnd={handleDragEnd}>
        <SortableContext items={visibleWidgetIds} strategy={rectSortingStrategy}>
          <Box
            sx={{
              display: 'grid',
              gap: { xs: 2, md: 3 },
              gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
              gridAutoFlow: 'dense',
              width: '100%',
            }}
          >
            {visibleWidgetIds.map((id) => {
              const widget = widgetMap.get(id);
              if (!widget) {
                return null;
              }

              const layout = resolveLayoutConfig(widget);
              const WidgetComponent = widget.component;
              const columnStyles = createResponsiveSpan(
                layout.columns ?? widget.columns,
                FULL_WIDTH_COLUMNS
              );
              const rowStyles = layout.rows
                ? createResponsiveSpan(layout.rows, DEFAULT_ROW_SPAN, Number.MAX_SAFE_INTEGER)
                : undefined;

              return (
                <Box
                  key={widget.id}
                  sx={{
                    gridColumn: columnStyles,
                    gridRow: rowStyles,
                    minHeight: layout.minHeight ?? widget.minHeight,
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    minWidth: 0,
                  }}
                >
                  <SortableWidget id={widget.id} customizing={isCustomizing} title={widget.title}>
                    <WidgetComponent />
                  </SortableWidget>
                </Box>
              );
            })}
          </Box>
        </SortableContext>
      </DndContext>

      <DashboardLayoutPanel
        open={isPanelOpen}
        widgets={panelWidgets}
        onClose={handleClosePanel}
        onToggleWidget={handleToggleWidget}
        onSelectLayout={handleSelectLayout}
        onHideAll={handleHideAll}
        onShowAll={handleShowAll}
        onReset={handleResetLayout}
        isDirty={isDirty}
      />
    </Box>
  );
};

export default Dashboard;
