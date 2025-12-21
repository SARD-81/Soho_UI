import { useCallback, useReducer } from 'react';

interface PinnedSelectionState {
  selectedIds: string[];
  pinnedId: string | null;
}

const normalizeSelection = (selectedIds: string[], pinnedId: string | null) => {
  const uniqueIds = Array.from(new Set(selectedIds));

  if (pinnedId) {
    const otherIds = uniqueIds.filter((id) => id !== pinnedId);
    const lastOther = otherIds[otherIds.length - 1];

    return lastOther ? [pinnedId, lastOther] : [pinnedId];
  }

  const lastId = uniqueIds[uniqueIds.length - 1];
  return lastId ? [lastId] : [];
};

interface SelectAction {
  type: 'select';
  id: string;
}

interface PinAction {
  type: 'pin';
  id: string;
}

interface UnpinAction {
  type: 'unpin';
}

interface RemoveAction {
  type: 'remove';
  id: string;
}

interface PruneAction {
  type: 'prune';
  allowedIds: Set<string>;
}

interface SetSelectionAction {
  type: 'set';
  ids: string[];
  pinnedId?: string | null;
}

type Action =
  | SelectAction
  | PinAction
  | UnpinAction
  | RemoveAction
  | PruneAction
  | SetSelectionAction;

const reducer = (state: PinnedSelectionState, action: Action): PinnedSelectionState => {
  switch (action.type) {
    case 'select': {
      const selectedIds = normalizeSelection([...state.selectedIds, action.id], state.pinnedId);
      return { ...state, selectedIds };
    }
    case 'pin': {
      const pinnedId = action.id;
      const selectedIds = normalizeSelection([...state.selectedIds, pinnedId], pinnedId);
      return { selectedIds, pinnedId };
    }
    case 'unpin': {
      const selectedIds = normalizeSelection(
        state.selectedIds.filter((id) => id !== state.pinnedId),
        null
      );
      return { selectedIds, pinnedId: null };
    }
    case 'remove': {
      const nextPinnedId = state.pinnedId === action.id ? null : state.pinnedId;
      const selectedIds = normalizeSelection(
        state.selectedIds.filter((id) => id !== action.id),
        nextPinnedId
      );
      return { selectedIds, pinnedId: nextPinnedId };
    }
    case 'prune': {
      const nextPinnedId = state.pinnedId && action.allowedIds.has(state.pinnedId)
        ? state.pinnedId
        : null;
      const selectedIds = normalizeSelection(
        state.selectedIds.filter((id) => action.allowedIds.has(id)),
        nextPinnedId
      );
      return { selectedIds, pinnedId: nextPinnedId };
    }
    case 'set': {
      const pinnedId = action.pinnedId ?? null;
      const selectedIds = normalizeSelection(action.ids, pinnedId);
      return { selectedIds, pinnedId };
    }
    default:
      return state;
  }
};

const usePinnedSelection = (initialIds: string[] = []) => {
  const [state, dispatch] = useReducer(reducer, {
    selectedIds: normalizeSelection(initialIds, null),
    pinnedId: null,
  });

  const select = useCallback((id: string) => dispatch({ type: 'select', id }), []);

  const pin = useCallback((id: string) => dispatch({ type: 'pin', id }), []);

  const unpin = useCallback(() => dispatch({ type: 'unpin' }), []);

  const remove = useCallback((id: string) => dispatch({ type: 'remove', id }), []);

  const prune = useCallback(
    (allowedIds: string[]) => dispatch({ type: 'prune', allowedIds: new Set(allowedIds) }),
    []
  );

  const setSelection = useCallback(
    (ids: string[], pinnedId?: string | null) => dispatch({ type: 'set', ids, pinnedId }),
    []
  );

  return {
    selectedIds: state.selectedIds,
    pinnedId: state.pinnedId,
    select,
    pin,
    unpin,
    remove,
    prune,
    setSelection,
  } as const;
};

export default usePinnedSelection;
