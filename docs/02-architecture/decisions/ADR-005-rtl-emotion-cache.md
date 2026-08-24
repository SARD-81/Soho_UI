# ADR-005: Use an RTL Emotion Cache for Material UI Styling

- Status: Accepted
- Scope: RTL style transformation and Material UI integration

## Context

SOHO UI is primarily a Persian right-to-left administrative interface while many technical values inside it (IPs, hostnames, filesystem paths, metrics, service names) remain naturally left-to-right.

Material UI uses Emotion for styling. The application needs a consistent mechanism that mirrors directional CSS while still allowing semantic DOM direction and explicit LTR islands where appropriate.

## Decision

Use a dedicated Emotion cache configured with RTL Stylis processing and provide it near the application root.

The runtime provider order includes the RTL cache before feature UI renders.

Semantic HTML direction remains an independent concern. Components/pages can still use actual `dir="rtl"` or `dir="ltr"` attributes where browser text/layout semantics require them.

## Why both style mirroring and semantic direction matter

Stylis can transform directional CSS properties, but it cannot replace the meaning of the HTML `dir` attribute.

For example, the Settings page explicitly establishes an RTL DOM boundary because tab/table content needs semantic RTL direction in addition to mirrored styles.

Likewise, technical values may intentionally render as LTR inside the RTL application.

## Consequences

### Positive

- Material UI directional styles are transformed consistently;
- feature components do not need to manually mirror every margin/padding rule;
- Persian layout behavior is centralized;
- technical LTR content can be handled explicitly instead of forcing the whole application into one direction strategy.

### Tradeoffs

- developers must understand that CSS mirroring and DOM `dir` are different mechanisms;
- hardcoded directional CSS can still produce incorrect results if it bypasses reusable tokens/layout conventions;
- third-party components may require explicit direction handling.

## Rules

1. Keep the shared RTL Emotion cache as a root styling concern.
2. Use semantic `dir` attributes when actual browser direction semantics are required.
3. Keep technical values LTR when that improves readability.
4. Prefer logical/shared layout styles over scattered manual left/right inversion.
5. Test dialogs, tables, tabs, inputs, icons, and popovers in RTL after changing styling infrastructure.
6. Do not remove RTL processing because one component appears correct without it.

## Alternatives considered

### Manual RTL CSS everywhere

Rejected because it duplicates directional styling decisions and is difficult to maintain across Material UI components.

### Only setting `dir="rtl"` on a root element

Insufficient by itself for CSS-in-JS rules that need directional transformation.

### Force every value to RTL

Rejected because technical strings such as IP addresses, hostnames, versions, and paths are easier to read with LTR direction.

## When to revisit

Revisit if the UI framework/styling engine changes or if the product becomes fully bidirectional with runtime language switching.

A bidirectional redesign would need explicit cache/theme/direction switching rather than removing the existing RTL contract ad hoc.

## Related files

- `src/rtl-cache.ts`
- `src/main.tsx`
- `src/pages/Settings.tsx`

## Related documentation

- [`../frontend-architecture.md`](../frontend-architecture.md)
- [`../../05-features/settings.md`](../../05-features/settings.md)
