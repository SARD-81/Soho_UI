import { Box, Button, Grow, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';
import { MdAdd, MdAutoAwesome, MdClose, MdOutlineDashboardCustomize, MdOutlineSave } from 'react-icons/md';
import type { ComponentType } from 'react';
import Cpu from '../components/Cpu';
import Disk from '../components/Disk';
import Memory from '../components/Memory';
import Network from '../components/Network';
// import SystemInfo from '../components/SystemInfo';
import Zpool from '../components/Zpool';
import DashboardLayoutPanel, {
  type DashboardLayoutPanelWidget,
} from '../components/dashboard/DashboardLayoutPanel';
import SortableWidget from '../components/dashboard/SortableWidget';
import { useAuth } from '../contexts/AuthContext';
import { TransitionGroup } from 'react-transition-group';

const LAYOUT_STORAGE_BASE_KEY = 'dashboard-layout.v2';

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
  // {
  //   id: 'system-info',
  //   title: 'اطلاعات سیستم',
  //   description: 'نمای کلی از نسخه، پلتفرم، نام میزبان و وضعیت به‌روزرسانی سیستم',
  //   component: SystemInfo,
  //   columns: { xs: 12, md: 6, xl: 4 },
  //   layoutOptions: [
  //     {
  //       id: 'system-info-compact',
  //       label: 'چیدمان فشرده',
  //       description: 'ابعاد متعادل برای نمایش در کنار سایر ویجت‌ها',
  //       columns: { xs: 12, md: 5, xl: 3 },
  //     },
  //     {
  //       id: 'system-info-wide',
  //       label: 'نمای گسترده',
  //       description: 'فضای بیشتر برای نمایش جزئیات سیستم',
  //       columns: { xs: 12, md: 12, xl: 6 },
  //     },
  //   ],
  // },
  {
    id: 'cpu',
    title: 'وضعیت پردازنده',
    description: 'نمودار زنده مصرف CPU و جزئیات هسته‌ها',
    component: Cpu,
    columns: { xs: 12, md: 6, xl: 5 },
    layoutOptions: [
      {
        id: 'cpu-short',
        label: 'چیدمان کوچک',
        description: 'ابعاد کوچیک برای مانیتورینگ در صفحات کوچک‌تر',
        columns: { xs: 12, md: 6, xl: 2 },
      },
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
        id: 'memory-short',
        label: 'چیدمان کوچک',
        description: 'هماهنگ با چیدمان‌های کوچک',
        columns: { xs: 12, md: 6, xl: 2 },
      },
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
    title: 'تجمیع فضاهای یکپارچه',
    description: 'تصویر کلی از سلامت و ظرفیت فضاهای یکپارچه',
    component: Zpool,
    columns: { xs: 12, md: 10, xl: 10 },
    layoutOptions: [
      {
        id: 'zpool-short',
        label: 'فشرده',
        description: 'چیدمان مناسب برای داشبوردهای فشرده',
        columns: { xs: 12, md: 3, xl: 3 },
      },
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

const loadStoredLayout = (storageKey: string): Partial<LayoutState> | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = localStorage.getItem(storageKey);
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

const cloneLayoutState = (state: LayoutState): LayoutState => ({
  order: [...state.order],
  hidden: [...state.hidden],
  sizeOverrides: { ...state.sizeOverrides },
});

const Dashboard = () => {
  const { username } = useAuth();
  const layoutStorageKey = useMemo(() => {
    const normalizedUsername = username?.trim().toLowerCase();
    return normalizedUsername
      ? `${LAYOUT_STORAGE_BASE_KEY}:${normalizedUsername}`
      : `${LAYOUT_STORAGE_BASE_KEY}:guest`;
  }, [username]);
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
  const [persistedLayout, setPersistedLayout] = useState<LayoutState>(() => {
    const stored = loadStoredLayout(layoutStorageKey);
    return createNormalizedState(stored);
  });
  const [draftLayout, setDraftLayout] = useState<LayoutState | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const isCustomizing = draftLayout !== null;
  const layoutState = draftLayout ?? persistedLayout;

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    localStorage.setItem(layoutStorageKey, JSON.stringify(persistedLayout));
  }, [layoutStorageKey, persistedLayout]);

  useEffect(() => {
    setPersistedLayout((prev) => {
      const stored = loadStoredLayout(layoutStorageKey);
      const normalized = createNormalizedState(stored);
      return areLayoutStatesEqual(prev, normalized) ? prev : normalized;
    });
    setDraftLayout(null);
  }, [createNormalizedState, layoutStorageKey]);

  useEffect(() => {
    setPersistedLayout((prev) => {
      const normalized = createNormalizedState(prev);
      return areLayoutStatesEqual(prev, normalized) ? prev : normalized;
    });
  }, [createNormalizedState]);

  useEffect(() => {
    if (!isCustomizing) {
      return;
    }

    setDraftLayout((prev) => {
      if (!prev) {
        return prev;
      }

      const normalized = createNormalizedState(prev);
      return areLayoutStatesEqual(prev, normalized) ? prev : cloneLayoutState(normalized);
    });
  }, [createNormalizedState, isCustomizing]);

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
      if (!isCustomizing) {
        return;
      }

      const { active, over } = event;
      if (!over || active.id === over.id) {
        return;
      }

      setDraftLayout((prev) => {
        if (!prev) {
          return prev;
        }

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

        const nextState = { ...prev, order: nextOrder };
        return areLayoutStatesEqual(prev, nextState) ? prev : nextState;
      });
    },
    [isCustomizing]
  );

  const handleToggleWidget = useCallback(
    (widgetId: string) => {
      if (!isCustomizing || !widgetMap.has(widgetId)) {
        return;
      }

      setDraftLayout((prev) => {
        if (!prev) {
          return prev;
        }

        const isHidden = prev.hidden.includes(widgetId);
        const hidden = isHidden
          ? prev.hidden.filter((id) => id !== widgetId)
          : [...prev.hidden, widgetId];

        const nextState = { ...prev, hidden };
        return areLayoutStatesEqual(prev, nextState) ? prev : nextState;
      });
    },
    [isCustomizing, widgetMap]
  );

  const handleHideAll = useCallback(() => {
    if (!isCustomizing) {
      return;
    }

    setDraftLayout((prev) => {
      if (!prev) {
        return prev;
      }

      const nextState = { ...prev, hidden: [...prev.order] };
      return areLayoutStatesEqual(prev, nextState) ? prev : nextState;
    });
  }, [isCustomizing]);

  const handleShowAll = useCallback(() => {
    if (!isCustomizing) {
      return;
    }

    setDraftLayout((prev) => {
      if (!prev) {
        return prev;
      }

      const nextState = { ...prev, hidden: [] };
      return areLayoutStatesEqual(prev, nextState) ? prev : nextState;
    });
  }, [isCustomizing]);

  const handleSelectLayout = useCallback(
    (widgetId: string, optionId: string) => {
      if (!isCustomizing) {
        return;
      }

      setDraftLayout((prev) => {
        if (!prev) {
          return prev;
        }

        const widget = widgetMap.get(widgetId);
        if (!widget) {
          return prev;
        }

        if (optionId === 'default') {
          if (!(widgetId in prev.sizeOverrides)) {
            return prev;
          }

          const rest = { ...prev.sizeOverrides };
          delete rest[widgetId];
          const nextState = { ...prev, sizeOverrides: rest };
          return areLayoutStatesEqual(prev, nextState) ? prev : nextState;
        }

        const options = getWidgetLayoutOptions(widget);
        const isValid = options.some((option) => option.id === optionId);
        if (!isValid) {
          return prev;
        }

        const nextState = {
          ...prev,
          sizeOverrides: { ...prev.sizeOverrides, [widgetId]: optionId },
        };
        return areLayoutStatesEqual(prev, nextState) ? prev : nextState;
      });
    },
    [getWidgetLayoutOptions, isCustomizing, widgetMap]
  );

  const handleResetLayout = useCallback(() => {
    if (!isCustomizing) {
      return;
    }

    const normalizedDefault = createNormalizedState();
    setDraftLayout((prev) => {
      if (!prev) {
        return prev;
      }
      return areLayoutStatesEqual(prev, normalizedDefault)
        ? prev
        : cloneLayoutState(normalizedDefault);
    });
  }, [createNormalizedState, isCustomizing]);

  const handleOpenPanel = useCallback(() => {
    if (!isCustomizing) {
      setDraftLayout(cloneLayoutState(persistedLayout));
    }

    setIsPanelOpen(true);
  }, [isCustomizing, persistedLayout]);

  const handleClosePanel = () => {
    setIsPanelOpen(false);
  };

  const handleEnterCustomize = useCallback(() => {
    setDraftLayout(cloneLayoutState(persistedLayout));
  }, [persistedLayout]);

  const handleCancelCustomize = useCallback(() => {
    setDraftLayout(null);
    setIsPanelOpen(false);
  }, []);

  const handleSaveCustomize = useCallback(() => {
    if (!draftLayout) {
      return;
    }

    const normalized = createNormalizedState(draftLayout);
    setPersistedLayout(cloneLayoutState(normalized));
    setDraftLayout(null);
    setIsPanelOpen(false);
  }, [createNormalizedState, draftLayout]);

  const isDirty = useMemo(
    () => !areLayoutStatesEqual(layoutState, defaultLayoutState),
    [defaultLayoutState, layoutState]
  );

  const hasUnsavedChanges = useMemo(
    () => (draftLayout ? !areLayoutStatesEqual(draftLayout, persistedLayout) : false),
    [draftLayout, persistedLayout]
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
            داشبورد
          </Typography>
          <Stack direction="row" gap={1} alignItems="center" mt={0.5}>
            <MdAutoAwesome size={18} color="var(--color-primary-500, currentColor)" />
            <Typography variant="body2" color="text.secondary">
              با استفاده از ابزارهای طرح‌بندی، ویجت‌ها را مرتب، اضافه یا پنهان کنید
            </Typography>
          </Stack>
        </Box>
        {isCustomizing ? (
          <Stack
            direction="row"
            gap={1}
            justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
            flexWrap="wrap"
          >
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<MdAdd />}
              onClick={handleOpenPanel}
            >
              اضافه کردن
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<MdOutlineSave />}
              onClick={handleSaveCustomize}
              disabled={!hasUnsavedChanges}
            >
              ذخیره کردن
            </Button>
            <Button
              variant="contained"
              color="inherit"
              startIcon={<MdClose />}
              onClick={handleCancelCustomize}
            >
              لغو
            </Button>
          </Stack>
        ) : (
          <Stack direction="row" justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<MdOutlineDashboardCustomize />}
              onClick={handleEnterCustomize}
            >
              سفارشی‌سازی صفحه
            </Button>
          </Stack>
        )}
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
            <TransitionGroup component={null}>
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
                  <Grow
                    key={widget.id}
                    timeout={{ enter: 360, exit: 260 }}
                    style={{ transformOrigin: 'center' }}
                  >
                    <Box
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
                  </Grow>
                );
              })}
            </TransitionGroup>
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