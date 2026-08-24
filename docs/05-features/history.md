# History

## Purpose

Route: `/history`

Entry point: `src/pages/History.tsx`

The History feature is **not implemented yet**.

The current page renders only the page title:

```text
تاریخچه
```

There are currently no History-specific:

- API calls;
- React Query keys;
- mutations;
- filters;
- tables;
- persistence rules;
- polling intervals;
- business workflows.

## Why this document exists

A placeholder route is still part of the product surface. Documenting its actual state prevents future maintainers from assuming that missing history behavior is hidden elsewhere in the repository.

Do not invent an API contract from the route name alone.

## Extension guide

Before implementing History, define:

1. what events/history records the product must expose;
2. whether records come from an audit-log backend, operation history, storage events, or another source;
3. pagination/filter/search requirements;
4. authorization and sensitive-data rules;
5. timestamp/timezone representation;
6. retention semantics;
7. whether history is read-only or supports administrative actions;
8. the canonical query keys;
9. whether polling is required or explicit refresh is sufficient;
10. whether any new API belongs to StateSync (normally an audit/history read model should not).

Once implemented, replace this placeholder document with the normal feature template:

```text
Purpose
User Flow
Entry Point
Main Components
Data Sources
API Endpoints
State Management
Data Flow
Mutations
Refresh / Polling
Error Handling
Business Rules
Failure Scenarios
Extension Guide
Related Files
```

## Related files

- `src/pages/History.tsx`
- `src/routes/Routes.tsx`
