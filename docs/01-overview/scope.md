# Project Scope

This document defines what the SOHO UI repository is responsible for, what it deliberately delegates to backend/system layers, and which product areas are currently implemented.

The scope boundary matters because this frontend performs high-impact administration actions, but it is not the authoritative implementation of storage, operating-system, authentication, or persistence rules.

## Product role

SOHO UI is the browser-based administrative frontend for the StoreX storage management system.

Its job is to let an authenticated operator observe and initiate supported management workflows through backend APIs.

The repository contains frontend application code, client-side state management, API integration, presentation logic, and engineering documentation.

It does not contain the backend service implementation or managed-system operating-system/storage code.

## In scope

### Authentication/session UX

The frontend owns:

- login form and submission;
- client-side authenticated state;
- access-token attachment to API requests;
- refresh-token based session recovery;
- single-flight 401 recovery;
- protected routes;
- idle-timeout behavior;
- local-first logout UX.

The backend still owns credential validation, token issuance, token validity, authorization, and server-side token invalidation.

### System monitoring

The frontend presents supported monitoring data such as:

- CPU;
- memory;
- network/interface telemetry;
- system uptime;
- storage pool health/capacity;
- disk/slot information;
- service runtime state.

Polling cadence and cache behavior are frontend responsibilities; metric truth is backend/system-owned.

### Storage administration

Supported UI areas include:

- physical disk inspection and cleanup;
- integrated/ZFS-like pool lifecycle;
- block Volume lifecycle;
- filesystem lifecycle and properties;
- mount/unmount/canmount;
- supported encryption-key/passphrase operations.

Frontend validation and confirmation improve safety but do not replace backend storage-integrity checks.

### File-sharing administration

Supported domains include:

- Samba shares;
- Samba users;
- Samba groups;
- Samba access membership;
- NFS shares;
- Web Share creation/deletion/permission workflow.

Some workflows span multiple resources and are explicitly non-atomic at frontend level.

### User administration

Current frontend user domains are distinct:

- OS users;
- Samba users;
- Web/UI users.

Do not treat these as one identity store simply because workflows can link them.

### System configuration

Supported settings include:

- hostname;
- timezone;
- NTP;
- manual time;
- hardware clock operations;
- system version display;
- network interface configuration;
- Web/UI user management;
- SNMP configuration and diagnostics.

### System service/power actions

The frontend exposes supported service controls and system power actions through backend APIs.

These are operator-triggered system operations; backend authorization and execution remain authoritative.

### Server-state cache and refresh

The frontend owns:

- React Query cache identity;
- stale time;
- polling intervals;
- mutation invalidation;
- manual refetch UX;
- conditional query enablement.

### Canonical frontend-requested snapshots

The frontend owns the **coordination policy** for canonical `save_to_db=true` snapshot requests through `StateSyncManager`.

It does not own the backend database or how the backend persists the snapshot internally.

### UI preferences/state

The frontend owns browser-local presentation state such as:

- Dashboard layout preferences;
- modal state;
- selected/pinned detail panels;
- theme state;
- temporary form drafts.

These must not be confused with authoritative managed-system state.

### Build artifact

The repository owns the Vite production build contract that creates:

```text
dist/
```

Operations can serve this static artifact through Nginx or another appropriate static web server.

## Current routed product surface

| Route | Area | Current status |
| --- | --- | --- |
| `/login` | Authentication | Implemented |
| `/dashboard` | Monitoring dashboard | Implemented |
| `/disks` | Physical disks | Implemented |
| `/Integrated-space` | Integrated/Zpool storage | Implemented |
| `/block-space` | Block storage/Volumes | Implemented |
| `/file-system` | Filesystems | Implemented |
| `/services` | System services | Implemented |
| `/users` | OS/Samba user bridge | Partially implemented; “Other Users” tab is placeholder |
| `/settings` | General/network/Web-user settings | Implemented |
| `/share` | Samba administration | Implemented |
| `/share-nfs` | NFS administration | Implemented |
| `/web-share` | Web Share | Implemented |
| `/history` | History | Placeholder only |
| `/snmp-service` | SNMP | Implemented |

Every implemented route has a corresponding feature document under [`../05-features/`](../05-features/).

## Explicitly out of scope for this frontend

### Backend implementation

This repository does not own:

- Django/other backend views/controllers;
- backend serializers/models;
- database migrations;
- storage-management shell/system commands;
- systemd implementation;
- ZFS implementation;
- Samba/NFS server configuration internals beyond API requests;
- backend job scheduling.

### Authorization enforcement

Frontend route protection and disabled buttons are not security boundaries.

The backend must enforce:

- authentication;
- authorization;
- role/permission policy;
- destructive-operation access;
- resource ownership/dependency rules.

### Storage integrity

The frontend must not be considered authoritative for:

- whether a disk is actually safe to wipe;
- whether a pool can be destroyed;
- whether a filesystem/share can be deleted;
- whether a resource name is globally unique;
- concurrent administration conflicts.

The UI can prevent obvious mistakes using current data, but the backend must revalidate.

### Transactionality across endpoints

The frontend does not provide database/distributed transactions for multi-request workflows.

A sequence of requests can partially succeed.

Where atomicity is required, prefer a backend endpoint that owns the complete transaction/recovery behavior.

### Secret storage

Frontend configuration must not contain confidential server secrets.

`VITE_*` values are browser-visible.

Backend/database/SSH/signing credentials are out of scope for frontend configuration.

### Backend snapshot implementation

`StateSyncManager` decides **when** the frontend requests canonical snapshots and which domains are affected.

The backend owns:

- actual persistence storage;
- transaction handling;
- schema;
- retention;
- database consistency.

### Production infrastructure ownership

This repository currently does not contain a complete CI/CD or infrastructure-as-code solution.

The frontend documentation defines the build/deployment contract, but server provisioning, TLS, firewalling, monitoring, backups, and backend operations belong to the deployment/infrastructure environment.

## Product limitations currently documented

### Automated tests

There is currently no automated `test` script/test runner in `package.json`.

See [`../03-development/testing.md`](../03-development/testing.md).

### History page

`/history` is currently a placeholder and must not be described as a completed audit/history subsystem.

### Users “Other Users” tab

The secondary tab in `/users` is currently a placeholder.

### Volume StateSync

Volumes are not currently represented by a frontend StateSync domain.

### General settings / network / OS users / Web users StateSync

These areas currently rely on backend mutation + query refresh without a frontend canonical snapshot domain.

### NFS service-apply behavior

Current create flow requests `nfs-server.service` restart before submitting NFS create; edit does not use the same restart path. This is documented current behavior requiring backend/system-contract clarification before redesign.

### Node version pinning

The project currently recommends a supported Node LTS but does not pin an exact version in repository metadata.

### CI/CD

No `.github/workflows/`, Dockerfile, or repository-managed deployment script currently exists.

## Change-boundary questions

Before implementing a new capability, answer:

1. Is this a frontend presentation/cache concern or a backend integrity/security concern?
2. What backend resource is authoritative?
3. Does an existing query key already represent that resource?
4. Does the operation change a persisted StateSync domain?
5. Is it diagnostic/observational despite using POST/PUT?
6. Can the workflow partially succeed?
7. Is destructive confirmation required?
8. Does the backend need a new transactional endpoint rather than multiple frontend requests?
9. Is the feature currently in product scope or merely visible as a placeholder?
10. Which existing architecture/feature/API documents need updating?

## Related documentation

- [`project-overview.md`](./project-overview.md)
- [`glossary.md`](./glossary.md)
- [`../02-architecture/frontend-architecture.md`](../02-architecture/frontend-architecture.md)
- [`../04-core-flows/server-state-and-cache.md`](../04-core-flows/server-state-and-cache.md)
- [`../04-core-flows/state-sync-save-to-db.md`](../04-core-flows/state-sync-save-to-db.md)
- [`../06-api/api-conventions.md`](../06-api/api-conventions.md)
- [`../07-operations/deployment.md`](../07-operations/deployment.md)
