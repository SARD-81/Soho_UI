# ADR-003: Persist Canonical Snapshots Through `StateSyncManager`

- Status: Accepted
- Scope: Frontend-triggered `save_to_db` snapshot persistence

## Context

Several backend domains expose a `save_to_db` contract. Earlier feature code could attach persistence flags directly to ordinary GETs or mutation payloads.

That approach is fragile because:

- a mutation payload is often only a partial change, not complete resource state;
- polling/manual refresh can accidentally persist snapshots;
- feature hooks disagree about true/false values;
- cross-domain effects are easy to miss;
- rapid mutations can create redundant persistence traffic.

The frontend needs one owner for deciding **when** a canonical snapshot should be persisted and **which complete endpoint** represents each domain.

## Decision

Use `StateSyncManager` as the only frontend owner of canonical `save_to_db=true` snapshot requests.

Normal API traffic is forced to `save_to_db=false` by Axios transport policy.

After a successful mapped mutation, StateSync schedules one or more canonical snapshot GETs for affected persisted domains.

## Persisted domains

Current domains are:

```text
zpool
filesystem
disk
nfs
samba-users
samba-groups
samba-shares
webshare
snmp
```

Each domain has one canonical complete-read definition.

## Cross-domain mapping

Some mutation families intentionally map to more than one domain.

Examples:

```text
zpool      -> zpool + disk
filesystem -> filesystem + zpool
disk       -> disk + zpool
samba user -> samba-users + samba-groups
samba group -> samba-groups + samba-users
```

The mapping captures resource dependencies rather than forcing each feature hook to know persistence topology.

## Coalescing

StateSync coalesces rapid mutations with a short scheduling delay.

If another mutation occurs while a domain snapshot is already in flight, exactly one follow-up snapshot is requested after the current one completes.

The goal is eventual newest-state persistence without an unbounded snapshot queue.

## Session baseline

After login/session restoration, a canonical baseline snapshot is requested once per authenticated frontend session.

StrictMode renders, token refreshes, or repeated auth renders reuse the same baseline promise and must not trigger duplicate full-session snapshots.

## Diagnostic operations

HTTP method alone does not determine StateSync semantics.

A successful POST may be diagnostic rather than mutating persisted configuration.

Example:

```text
POST /api/snmp/test-connection/
```

This operation is explicitly excluded from SNMP persistence mapping.

## Consequences

### Positive

- persistence ownership is centralized;
- database snapshots represent complete current resource state;
- polling/manual reads cannot accidentally persist;
- cross-domain dependencies are explicit;
- rapid mutations are coalesced;
- legacy caller flags can be removed from domain types/hooks.

### Tradeoffs

- URL-to-domain mapping must stay synchronized with backend endpoints;
- new persisted domains require central definitions;
- diagnostic actions under a persisted URL namespace require explicit exclusions;
- frontend correctness still depends on canonical endpoints returning complete data.

## Rules

1. Feature hooks must not send `save_to_db=true`.
2. Ordinary requests/mutations are observational/operational traffic with false transport semantics.
3. Add new persistence behavior to StateSync mapping, not individual components.
4. Persist complete canonical snapshots, not mutation payload copies.
5. Failed mutations must not schedule persistence.
6. Diagnostic actions must be excluded even when implemented with POST/PUT.
7. Update StateSync documentation and tests when URL mappings change.

## Alternatives considered

### Persist from every mutation hook

Rejected because ownership becomes fragmented and partial payloads may not represent current complete state.

### Persist on every GET/poll

Rejected because observation should not create database side effects and high-frequency monitoring would generate excessive persistence traffic.

### Let only the backend persist mutations internally

Architecturally simpler, but not the current backend contract. If the backend eventually owns all persistence atomically, this ADR should be superseded and StateSync retired deliberately.

## When to revisit

Revisit when:

- backend mutation endpoints become fully responsible for persistence;
- snapshot persistence semantics change;
- websocket/event-driven backend synchronization replaces this contract.

## Related documentation

- [`../../04-core-flows/state-sync-save-to-db.md`](../../04-core-flows/state-sync-save-to-db.md)
- [`../../04-core-flows/api-request-lifecycle.md`](../../04-core-flows/api-request-lifecycle.md)
- [`../data-flow.md`](../data-flow.md)
