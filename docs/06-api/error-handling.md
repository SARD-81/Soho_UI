# API Error Handling

This document defines how SOHO UI currently detects, normalizes, logs, and presents API failures.

The frontend must preserve enough error context for operators and maintainers without coupling every component to every backend response shape.

## Error-handling layers

Current API failures can be handled at several layers:

```text
backend response
   ↓
Axios transport/interceptor
   ↓
API helper / normalization layer
   ↓
React Query query or mutation
   ↓
page/modal/table presentation
```

Each layer has a different responsibility.

## Shared Axios response interceptor

The shared application client logs failed Axios responses through:

```text
logApiErrorDetails(error)
```

before applying special 401 recovery logic.

Non-401 errors are rejected back to the owning query/mutation.

The interceptor must not convert every error into a generic toast because presentation belongs to the feature that knows the operator context.

## Central error-message helper

Shared helper:

```text
extractApiErrorMessage(error, fallback)
```

Current lookup order for Axios response objects includes:

```text
detail
message
error.message
error.detail
```

If no recognized response field exists:

1. use `Error.message` when available;
2. otherwise use the supplied stable fallback.

The helper should be preferred for ordinary feature mutations rather than duplicating response-shape parsing.

## Error codes and development logging

`logApiErrorDetails()` also attempts to extract an error code from:

```text
code
error.code
```

and logs a normalized console message:

```text
[API Error] code: <code>, message: <message>
```

This is diagnostic logging, not operator-facing UX.

Do not expose raw internal codes to end users unless they have a documented support/troubleshooting purpose.

## Feature-specific legacy error shapes

Some endpoints currently return additional shapes such as:

```text
errors: string
errors: string[]
error: string
```

Features including Web Share, Volume creation, NFS, and Samba create flows contain compatibility extractors for these response forms.

This is acceptable while backend contracts remain heterogeneous, but new code should not proliferate new one-off parsers unnecessarily.

Long-term direction should be a consistent backend error envelope.

## Logical failure inside HTTP success

Several API helpers cannot rely on HTTP status alone.

Some backend responses can return:

```json
{
  "ok": false,
  "error": "operation failed"
}
```

inside a 2xx response.

Examples of frontend code that explicitly handles this pattern include:

- disk inventory/detail;
- disk partition count;
- pool-device reads;
- general system settings response assertions.

When an endpoint's current contract supports `ok:false`, API helpers must convert it into an Error/rejected query rather than letting the UI treat it as successful empty data.

## 401 is special

An HTTP 401 from a normal application request enters centralized token recovery when:

```text
originalRequest exists
and
originalRequest._retry is not already true
```

Recovery sequence:

1. obtain refresh token;
2. clear the session immediately if no refresh token exists;
3. if another refresh is active, queue the failed request;
4. otherwise start one refresh request;
5. save the new access token;
6. replay queued requests;
7. replay the original request.

If refresh fails, all queued requests fail and the authenticated frontend session is cleared.

See [`authentication-api.md`](./authentication-api.md).

## Do not retry every error centrally

The global React Query defaults currently disable automatic retries.

This is intentional for an administration UI where mutations and operational actions may not be safe to replay blindly.

Do not add broad transport-level retries for:

- create/delete mutations;
- disk wipe/cleanup;
- service control;
- system settings changes;
- network reconfiguration;
- credential/password changes.

If a particular observational GET should retry, make that behavior explicit in its query with documented rationale.

## Query errors

Independent server-state resources should fail independently.

Examples:

- one Dashboard telemetry widget failing must not blank the whole Dashboard;
- one selected disk detail failing must not hide the complete inventory;
- one pool-device slot lookup failing must not erase successful pools;
- one general Settings query failing should not necessarily disable every unrelated settings section.

Prefer resource-local error state over one global page failure when resources have independent lifecycles.

## Mutation errors

A mutation failure must not close/reset the owning modal as though success occurred.

Typical pattern:

```text
submit
  ↓
mutation pending
  ↓
 success -> invalidate + close/reset + success feedback
 failure -> preserve form/target + expose error + retry/recovery option
```

This is especially important when the operator entered complex configuration that should not be lost after a backend validation failure.

## Toast versus inline/modal error

Use transient toast feedback for concise operation results.

Use inline/modal state when the error affects the form or confirmation context and the user needs it while deciding what to change.

Several current flows intentionally do both:

- modal retains the backend failure;
- toast gives immediate global feedback.

Avoid showing the same long raw error in several redundant surfaces.

## Partial-failure workflows

A frontend workflow can report failure after earlier backend steps have already succeeded.

Important current examples:

### Pool delete

Sequence:

```text
destroy pool
   ↓
clear/wipe former disks
```

If disk cleanup fails after destroy, the pool can already be gone.

### Web Share create

Sequence:

```text
create Web Share
   ↓
set permission 777
```

Permission failure does not roll back the created Web Share.

### Samba group create

Sequence:

```text
create group
   ↓
add users one-by-one
```

Membership failure does not delete the newly created group.

### Samba membership batch

Each username is a separate PUT. Earlier successful changes are not rolled back if a later username fails.

### Web-user -> OS-user creation

Web user can remain even if subsequent OS-user creation fails.

### OS-user -> Samba-user creation

OS user can remain even if subsequent Samba-user creation fails.

Error copy and troubleshooting documentation must describe the actual partial state instead of implying a transaction rolled back.

## Best-effort sub-steps

Some workflows intentionally continue after a failed sub-step.

Current example:

```text
disk cleanup
```

`clear-zfs` is best-effort; the subsequent wipe is still attempted.

A successful final workflow can therefore include a non-fatal sub-step failure.

When introducing best-effort steps, return enough structured information for the caller to decide whether a warning should be shown.

## Dependency errors

Some backend failures represent domain dependencies rather than generic transport problems.

Current UI examples include:

- filesystem delete blocked by share configuration;
- zpool delete blocked by dependent filesystem/share state;
- Samba-user delete blocked because the user is used by active shares.

The frontend may translate known backend context into operator-friendly guidance, but the backend must remain the authoritative integrity check.

Do not reproduce complex dependency rules purely in frontend validation.

## Validation errors

Frontend validation should prevent obvious invalid requests and improve UX, but must not be treated as integrity enforcement.

Examples:

- duplicate usernames/names from currently loaded lists;
- pool/vdev disk count;
- filesystem naming/quota;
- SNMP IP validation;
- hostname/NTP validation;
- NFS client/path validation.

Client state can be stale and concurrent operators can change backend state. Backend validation remains mandatory.

## Network and unavailable-backend failures

When there is no response payload, `extractApiErrorMessage()` falls back to the Axios/Error message and then to the feature fallback.

Feature code should provide fallback messages that tell the operator what operation failed, for example:

```text
امکان دریافت اطلاعات دیسک‌ها وجود ندارد.
```

rather than a context-free message such as:

```text
خطا رخ داد.
```

## Cancellation is not an operator error

Query cancellation caused by navigation/disablement should not normally be surfaced as an application failure toast.

Pass React Query's `AbortSignal` to Axios read helpers where supported so obsolete requests can end cleanly.

## Diagnostic actions

A diagnostic result can be unsuccessful without being a transport error.

SNMP test is the clearest example:

```text
HTTP request succeeds
connection_success = false
```

The UI converts that into a structured failed diagnostic result rather than treating it as a configuration mutation error.

Keep transport success and domain/diagnostic success distinct.

## Error-handling checklist for new API work

For every new request, define:

1. What HTTP statuses are expected?
2. Can `2xx` contain `ok:false` or equivalent logical failure?
3. What response fields carry human-readable errors?
4. Is the operation safe to retry?
5. Does failure leave a partial backend state?
6. Should the modal remain open?
7. Is toast feedback useful?
8. Does the error indicate a dependency/business rule that needs clearer operator guidance?
9. Is cancellation possible and should it remain silent?
10. Does 401 belong to central auth recovery rather than feature-level handling?
11. Does the backend return sensitive information that must not be shown directly?
12. Is the fallback message specific enough to identify the failed operation?

## Related files

- `src/utils/apiError.ts`
- `src/lib/axiosInstance.ts`
- `src/lib/authApi.ts`

## Related documentation

- [`api-conventions.md`](./api-conventions.md)
- [`authentication-api.md`](./authentication-api.md)
- [`endpoint-map.md`](./endpoint-map.md)
- [`../04-core-flows/api-request-lifecycle.md`](../04-core-flows/api-request-lifecycle.md)
- [`../04-core-flows/authentication.md`](../04-core-flows/authentication.md)
