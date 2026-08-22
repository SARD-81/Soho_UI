# Services

## Purpose

The Services feature is the operational control surface for backend system services. It presents runtime state, boot-time enablement, and operator actions while continuously refreshing service information.

Route: `/services`

Entry point: `src/pages/Services.tsx`

## Main responsibilities

The feature coordinates:

- reading the service list every five seconds;
- reading per-unit status every five seconds;
- merging the more specific per-unit `enabled` state into list data;
- deriving a stable UI runtime status from several possible backend fields;
- starting and stopping services;
- enabling and disabling services at system startup;
- preventing start while a service is masked;
- requiring confirmation before Stop;
- refreshing both list and per-unit status queries after a successful control action.

The underlying action type also supports `restart`, `reload`, `mask`, and `unmask`, but the current table UI primarily exposes Start/Stop and boot-time Enable/Disable.

## Runtime flow

```mermaid
flowchart TD
    Page[Services page]
    Page --> LIST[useServices]
    Page --> STATUS[useServiceStatuses]
    Page --> ACTION[useServiceAction]

    LIST --> LISTAPI[GET /api/system/service/]
    STATUS --> DETAILAPI[GET /api/system/service/{unit}/]
    ACTION --> CTRL[PUT /api/system/service/{unit}/control/?action=...]

    ACTION --> IL[invalidate ['services']]
    ACTION --> IS[invalidate service status queries]
```

## Service list

Hook: `useServices()`

Query key:

```text
['services']
```

Endpoint:

```text
GET /api/system/service/
```

Refresh policy:

```text
5 seconds
```

Background polling and window-focus refetch are disabled.

The list query provides the base service objects used by the page and by status-change notification monitoring elsewhere in the application.

## Per-service status queries

Hook: `useServiceStatuses(services)`

For every service returned by the list, the hook creates a separate query:

```text
['services', 'status', service.unit]
```

Endpoint:

```text
GET /api/system/service/{encoded-unit}/
```

Each query refreshes every five seconds while mounted.

The hook extracts the boot-time `enabled` flag from several possible response shapes:

```text
data.status.enabled
data.enabled
status.enabled
enabled
```

The page then overlays this more specific value onto the corresponding service's list details.

## Backend-load characteristic

The feature currently performs:

- one service-list request every five seconds;
- plus one status request per displayed service every five seconds.

Therefore network/API load grows approximately with the number of services:

```text
1 + N service requests per polling cycle
```

where `N` is the number of service units.

This is current architecture, not a React Query duplication bug: the list query and each per-unit status query use intentionally different query keys/endpoints.

If backend load becomes a concern, the preferred solution is a backend/list contract that exposes all required status fields or a batch status endpoint—not arbitrary suppression of necessary queries.

## Row model

The page maps each backend service into:

```ts
{
  name: service.unit,
  label: localized/display label,
  details: normalized backend details
}
```

`getServiceLabel()` converts known unit names/descriptions into operator-friendly labels while preserving the raw service unit for backend identity.

The raw unit name remains the mutation/query identity and is shown as secondary text.

## Runtime status derivation

`ServicesTable` derives a UI status from multiple backend fields because service-manager responses can represent state in different ways.

Possible UI statuses are:

```text
running
stopped
transitioning
error
masked
```

### Masked

A service is considered masked when `masked` or `mask` normalizes to true.

### Error

`failed` in the status token or active state maps to Error.

### Running

Running is recognized when either:

- active state is `active` and sub-state is `running`, `exited`, or `listening`;
- status token is `running` or `active`.

### Transitioning

While a runtime action is pending for the row, the UI temporarily renders `transitioning` instead of trusting the previous backend status.

### Stopped

Anything not matching the states above falls back to Stopped.

## Boolean-like service flags

Boot-time enabled state may arrive as boolean, number, or string.

Truthy values include:

```text
true
1
yes
on
enabled
active
```

Falsy values include:

```text
false
0
no
off
disabled
inactive
```

If the value cannot be normalized, the startup switch is shown disabled with an explanatory tooltip rather than guessing a state.

## Service actions

Hook: `useServiceAction()`

Endpoint pattern:

```text
PUT /api/system/service/{service}/control/?action={action}
```

The service unit and action are URL encoded.

Supported action type values in the frontend model are:

```text
start
restart
stop
reload
enable
disable
mask
unmask
```

### Actions currently exposed by the table

Runtime button:

- Running service → Stop
- Non-running service → Start

Boot-time switch:

- Enabled → Disable
- Disabled → Enable

The other action types remain supported by the hook/type contract but are not currently presented as direct controls in `ServicesTable`.

## Stop confirmation

Starting a service executes immediately from the action button.

Stopping is different: the table first opens a confirmation modal warning that stopping a service may interrupt user access.

Only confirmation calls the Stop mutation.

Preserve this distinction unless product requirements explicitly change the destructive/availability-risk UX.

## Masked service rule

When the derived status is `masked`, Start is disabled and the tooltip tells the operator the mask must be removed first.

The current table does not expose an Unmask button, even though `unmask` exists in `ServiceActionType`.

Therefore a masked service may require another management path/API client before it can be started from this page. This is an important current-product limitation.

## Pending action behavior

`useServiceAction()` is one mutation instance for the page.

The page passes:

```text
isActionLoading
activeServiceName
activeAction
```

into the table.

The table uses those values to show per-row transition/loading UI for the active mutation.

Runtime Start/Stop pending state is kept separate from boot Enable/Disable visual semantics so toggling startup enablement does not make the runtime status appear as transitioning.

## Post-action refresh

After any successful control action, the hook invalidates:

```text
['services']
```

and every query whose key begins with:

```text
['services', 'status', ...]
```

This refreshes both:

- the base service list;
- all mounted unit-status queries.

The feature does not wait for the next five-second interval after a successful operator action.

## Error handling

The mutation normalizes common backend error payloads:

- plain string response;
- `detail`;
- `message`;
- `error`;
- `errors` string/array;
- Axios fallback message.

The page then shows an action-specific toast including the target service.

A failed action does not invalidate the service queries through the hook's `onSuccess` path.

## StateSync boundary

System service control is not one of the frontend's persisted StateSync domains.

Service operations therefore remain operational system-control actions rather than managed storage snapshot mutations.

Do not add `save_to_db` flags to service-control calls.

## Notifications relationship

The notification subsystem's resource-status observer also calls `useServices()`.

Because it uses the same canonical `['services']` key, React Query can share the ordinary service-list query lifecycle when both consumers are mounted.

The per-service status queries used by the Services page are separate entries and are not the same thing as notification baseline storage.

## Important invariants

- `['services']` is the canonical service-list key.
- Per-unit enabled-state keys are `['services','status', unit]`.
- Both list and per-unit queries poll every five seconds while mounted.
- Per-unit query count scales with the number of services.
- Successful actions invalidate both list and per-unit status query families.
- Stop remains confirmation-driven.
- A masked service cannot be started from the current table.
- Unknown enabled state must not be guessed.
- Service control is not a StateSync persistence domain.

## Common failure scenarios

### Startup switch shows disabled/unknown

Inspect the per-unit status response. `useServiceStatuses()` looks for enabled state in several nested shapes; if none normalize to boolean-like data, the UI intentionally refuses to guess.

### Too many service requests appear in DevTools

Count the service rows. The page intentionally runs one list request plus one status query per service every five seconds.

### Start button is disabled although the service is stopped

Check whether the service derives as `masked`. A masked service cannot be started until unmasked.

### A successful action does not update immediately

Verify both invalidation paths in `useServiceAction()` and check that the affected unit name exactly matches the query-key identity.

### Runtime status looks wrong

Inspect backend `active`, `active_state`, `sub`, `sub_state`, `status`, and mask fields. The table derives status from all of them rather than a single property.

### A masked service cannot be recovered from the page

That is a current UI limitation: `unmask` exists in the action type/hook contract but no direct Unmask control is rendered in `ServicesTable`.

## Extension guide

### Exposing Restart/Reload/Mask/Unmask

1. confirm product permissions and operator-risk UX;
2. reuse `useServiceAction()` rather than creating a second transport path;
3. add confirmation for disruptive operations where appropriate;
4. ensure status derivation/loading state remains correct;
5. keep invalidation on the canonical service query families.

### Reducing polling traffic

Do not simply increase intervals without understanding operational requirements. Prefer consolidating backend status data or adding a batch endpoint if request fan-out becomes expensive.

## Related files

- `src/pages/Services.tsx`
- `src/components/services/ServicesTable.tsx`
- `src/constants/serviceLabels.ts`
- `src/hooks/useServices.ts`
- `src/hooks/useServiceStatuses.ts`
- `src/hooks/useServiceAction.ts`
- `src/@types/service.ts`

## Related documentation

- [`../04-core-flows/server-state-and-cache.md`](../04-core-flows/server-state-and-cache.md)
- [`../04-core-flows/polling-and-data-refresh.md`](../04-core-flows/polling-and-data-refresh.md)
- [`../04-core-flows/notifications.md`](../04-core-flows/notifications.md)
- [`../04-core-flows/api-request-lifecycle.md`](../04-core-flows/api-request-lifecycle.md)
