# API Endpoint Map

This is the centralized frontend-facing map of backend endpoints currently used by SOHO UI.

It is intended for maintenance, troubleshooting, backend/frontend coordination, and impact analysis.

It does **not** replace feature documentation. Use the linked feature document for validation rules, response normalization, partial-failure behavior, and UI lifecycle.

## Legend

StateSync column:

- `—` — no current frontend StateSync domain mapping.
- `zpool + disk`, etc. — a successful normal mutation schedules canonical snapshots for those domains.
- `diagnostic` — explicitly must not trigger persistence.
- `observational` — read/monitoring traffic only.

Query-key examples describe current React Query cache identity where a stable key is relevant.

## Authentication and session

| Operation | Method | Endpoint | Owner | StateSync | Notes |
| --- | --- | --- | --- | --- | --- |
| Login/token issue | POST | `<auth-base>/token/` | `authApi.login` | — | Isolated auth Axios client. |
| Refresh access token | POST | `<auth-base>/token/refresh/` | `authApi.refreshAccessToken` | — | Isolated client; used by single-flight 401 recovery. |
| Verify access token | POST | `<auth-base>/token/verify/` | `authApi.verifyAccessToken` | — | Isolated client. |
| Logout | POST | `/api/system/ui-user/logout/` | `authApi.logout` | — | Uses shared client with current Bearer token. |

Auth base is configured by `VITE_AUTH_API_BASE_URL` or derived from `VITE_API_BASE_URL` + `/api/auth/`.

See [`authentication-api.md`](./authentication-api.md).

## Dashboard / monitoring

| Resource | Method | Endpoint | Query key | StateSync | Refresh |
| --- | --- | --- | --- | --- | --- |
| CPU | GET | `/api/system/cpu/` | `['cpu']` | observational | 2 s while mounted. |
| Memory | GET | `/api/system/memory/` | `['memory']` | observational | 2 s while mounted. |
| System uptime | GET | `/api/system/uptime/` | `['system','uptime']` | observational | 1 s while mounted. |
| Network interface names | GET | `/api/system/network` | `['network']` | observational | Base network query lifecycle. |
| Network interface detail | GET | `/api/system/network/{interface}/?property=all` | part of `['network']` query | observational | One request per interface after list. |
| Network bandwidth | GET | `/api/system/network/{interface}/bandwidth/` | `['network','bandwidth-snapshots',interfaceNames]` | observational | 2 s while active. |
| Zpool overview | GET | `/api/zpool/` | `['zpool']` | observational | 30 s by default. |

The Dashboard reuses domain APIs; it does not have dashboard-specific telemetry endpoints.

See [`../05-features/dashboard.md`](../05-features/dashboard.md).

## System power actions

| Operation | Method | Endpoint | Owner | StateSync | Notes |
| --- | --- | --- | --- | --- | --- |
| Reboot | GET | `/api/system/power/execute/?action=reboot` | `usePowerAction` | — | Operationally mutating despite GET method. |
| Power off | GET | `/api/system/power/execute/?action=poweroff` | `usePowerAction` | — | Operationally mutating despite GET method. |

This is an important backend-contract exception: HTTP GET does not mean the operation is observational here. Do not automatically replay/prefetch these URLs.

## Disk inventory and maintenance

| Operation/resource | Method | Endpoint | Query key / owner | StateSync | Notes |
| --- | --- | --- | --- | --- | --- |
| Disk inventory | GET | `/api/disk/` | `['disk','inventory']` | observational | Canonical disk inventory. |
| Disk detail | GET | `/api/disk/{diskName}/` | `['disk','detail',diskName]` | observational | Identifier URL encoded. |
| Partition count | GET | `/api/disk/{diskName}/partition-count/` | `['disk','partition-count',diskName]` | observational | Used for wipe safety. |
| Disk names | GET | `/api/disk/names/` | available-disk flow | observational | Current code has no-trailing-slash fallback on 404. |
| Has partitions | GET | `/api/disk/{diskName}/has-partitions/` | available-disk flow | observational | Used to select unpartitioned disks. |
| Clear ZFS metadata | POST | `/api/disk/{diskName}/clear-zfs/` | `cleanupDisk` | disk + zpool | Best-effort first cleanup step. |
| Wipe disk | POST | `/api/disk/{diskName}/wipe/` | `cleanupDisk` | disk + zpool | Mandatory cleanup step. |

`cleanupDisk()` calls clear-ZFS first and wipe second. Clear-ZFS failure does not prevent the wipe attempt.

See [`../05-features/disks.md`](../05-features/disks.md).

## Integrated Storage / Zpool

| Operation/resource | Method | Endpoint | Query key / owner | StateSync | Notes |
| --- | --- | --- | --- | --- | --- |
| Pool list | GET | `/api/zpool/` | `['zpool']` | observational | Canonical pool collection. |
| Pool detail | GET | `/api/zpool/{poolName}/` | `['zpool',poolName,'details']` | observational | Selected/pinned details. |
| Pool devices | GET | `/api/zpool/{poolName}/devices/` | `['zpool','devices',...]` | observational | Membership, vdev type, slot mapping. |
| Create pool | POST | `/api/zpool/create/` | `useCreatePool` | zpool + disk | Payload: pool name/devices/vdev type. |
| Add devices | POST | `/api/zpool/{poolName}/add/` | `useAddPoolDevices` | zpool + disk | Validates vdev/device count. |
| Replace disk | POST | `/api/zpool/{poolName}/replace/` | `useReplacePoolDisk` | zpool + disk | Current mutation can execute replacements sequentially. |
| Destroy pool | POST | `/api/zpool/{poolName}/destroy/` | `useDeleteZpool` | zpool + disk | Followed by former-disk cleanup. |
| Export pool | POST | `/api/zpool/export/` | `useExportPool` | zpool + disk | Payload contains pool name. |
| Discover importable pools | GET | `/api/zpool/import/` | import-modal query | observational | Modal scoped. |
| Import pool | POST | `/api/zpool/import/` | `useImportPool` | zpool + disk | Invalidates zpool/importable list. |
| Set pool property | POST | `/api/zpool/{poolName}/set-property/` | `useSetZpoolProperty` | zpool + disk | `prop`, `value=on|off`. |

Destroy workflow is non-atomic from the frontend perspective: destroy occurs before former-disk cleanup.

See [`../05-features/integrated-storage.md`](../05-features/integrated-storage.md).

## Block Storage / Volumes

| Operation | Method | Endpoint | Query key / owner | StateSync | Notes |
| --- | --- | --- | --- | --- | --- |
| List Volumes | GET | `/api/volume/` | `['volumes']` | — | No continuous polling. |
| Create Volume | POST | `/api/volume/create` | `useCreateVolume` | — | Full name `<pool>/<volume>`. |
| Delete Volume | DELETE | `/api/volume/delete` | `useDeleteVolume` | — | Request body contains `volume_name`. |

There is currently no Volume StateSync domain. Do not add caller-owned `save_to_db` as a workaround.

See [`../05-features/block-storage.md`](../05-features/block-storage.md).

## File System

| Operation/resource | Method | Endpoint | Query key / owner | StateSync | Notes |
| --- | --- | --- | --- | --- | --- |
| Detailed filesystem list | GET | `/api/filesystem/?detail=true` | `['filesystems']` | observational | Preferred collection contract. |
| Legacy filesystem detail fallback | GET | `/api/filesystem/detail/?name={filesystem}` | `useFileSystems` compatibility path | observational | Only when list response lacks detail. |
| Create filesystem | POST | `/api/filesystem/` | `useCreateFileSystem` | filesystem + zpool | Optional encryption/passphrase. |
| Delete filesystem | DELETE | `/api/filesystem/delete/?name={pool/filesystem}` | `useDeleteFileSystem` | filesystem + zpool | Confirmation-driven. |
| Mount | POST | `/api/filesystem/mount/?name={pool/filesystem}` | `useMountFileSystem` | filesystem + zpool | Invalidates filesystem collection. |
| Unmount | POST | `/api/filesystem/unmount/?name={pool/filesystem}&force={boolean}` | `useUnmountFileSystem` | filesystem + zpool | UI normally uses `force=false`. |
| Set canmount | POST | `/api/filesystem/set-canmount/?name={pool/filesystem}&state=on|off` | `useSetCanmount` | filesystem + zpool | Automatic-mount toggle. |
| Load encryption key | POST | `/api/filesystem/load-key/?name={pool/filesystem}` | `useLoadKey` | filesystem + zpool | Body contains Base64-encoded passphrase. |
| Unload encryption key | POST | `/api/filesystem/unload-key/?name={pool/filesystem}` | `useUnloadKey` | filesystem + zpool | No passphrase body. |
| Change passphrase | POST | `/api/filesystem/change-passphrase/?name={pool/filesystem}` | `useChangeFileSystemPassphrase` | filesystem + zpool | `new_passphrase` Base64 encoded for transport. |

Base64 is transport encoding, not encryption; TLS remains required for confidentiality.

See [`../05-features/file-system.md`](../05-features/file-system.md).

## System services

| Operation/resource | Method | Endpoint | Query key / owner | StateSync | Notes |
| --- | --- | --- | --- | --- | --- |
| Service list | GET | `/api/system/service/` | `['services']` | — | 5 s polling. |
| Per-unit status | GET | `/api/system/service/{unit}/` | `['services','status',unit]` | — | One query per unit, 5 s. |
| Control service | PUT | `/api/system/service/{unit}/control/?action={action}` | `useServiceAction` | — | `start`, `stop`, `restart`, `reload`, `enable`, `disable`, `mask`, `unmask`. |

The current UI primarily exposes Start/Stop and boot Enable/Disable. Stop requires confirmation.

See [`../05-features/services.md`](../05-features/services.md).

## OS users

| Operation/resource | Method | Endpoint | Query key / owner | StateSync | Notes |
| --- | --- | --- | --- | --- | --- |
| List OS users | GET | `/api/os/user?include_system={boolean}` | `['os-users',{includeSystem}]` | — | Main Users page uses `false`. |
| Create OS user | POST | `/api/os/user/create/` | `useCreateOsUser` | — | Used directly and in cross-domain user creation flows. |

OS-user persistence is not a current StateSync domain.

See [`../05-features/users.md`](../05-features/users.md).

## Samba shares

| Operation/resource | Method | Endpoint | Query key / owner | StateSync | Notes |
| --- | --- | --- | --- | --- | --- |
| List shares | GET | `/api/samba/sharepoints/?property=all` | `['samba','shares']` | observational | No continuous polling. |
| Read share access/property | GET | `/api/samba/sharepoints/{shareName}/?property={property}` | share member/detail queries | observational | Member editor reads current access. |
| Create share | POST | `/api/samba/sharepoints/` | `useCreateShare` | samba-shares | Page reloads `smbd.service` after success. |
| Update share | PUT | `/api/samba/sharepoints/{shareName}/update/` | `useUpdateSharepoint` | samba-shares | Central field-alias mapping. |
| Delete share | DELETE | `/api/samba/sharepoints/{shareName}/` | `useDeleteShare` | samba-shares | Confirmation-driven. |

## Samba users

| Operation/resource | Method | Endpoint | Query key / owner | StateSync | Notes |
| --- | --- | --- | --- | --- | --- |
| List users | GET | `/api/samba/users/?property=all` | `['samba-users']` | observational | 15 s stale time. |
| Username-only list | GET | `/api/samba/users/?property=Unix username` | Samba availability helpers | observational | Used by membership/selection UI. |
| Account flags | GET | `/api/samba/users/{username}/?property=Account Flags` | `['samba-user',username,'account-flags']` | observational | One query per displayed username. |
| Create user | POST | `/api/samba/users/` | `useCreateSambaUser` | samba-users + samba-groups | Payload username/password. |
| Delete user | DELETE | `/api/samba/users/{username}/` | `useDeleteSambaUser` | samba-users + samba-groups | HTTP 400 can represent active-share dependency. |
| Update status/password | PUT | `/api/samba/users/{username}/update/` | status/password hooks | samba-users + samba-groups | Actions: enable/disable/change_password. |

## Samba groups

| Operation/resource | Method | Endpoint | Query key / owner | StateSync | Notes |
| --- | --- | --- | --- | --- | --- |
| List groups | GET | `/api/samba/groups/?property=all&contain_system_groups=false` | `['samba-groups']` | observational | System groups excluded. |
| Group names | GET | `/api/samba/groups/?property=name&contain_system_groups=false` | group availability helper | observational | Selection lists. |
| Group members | GET | `/api/samba/groups/{groupName}/?property=members` | group member key | observational | Current group detail. |
| Members list | GET | `/api/samba/groups/?property=members&contain_system_groups=false` | group-member helpers | observational | Batch read. |
| Create group | POST | `/api/samba/groups/` | `useCreateSambaGroup` | samba-groups + samba-users | Initial-member flow is a later stage. |
| Delete group | DELETE | `/api/samba/groups/{groupName}/` | `useDeleteSambaGroup` | samba-groups + samba-users | — |
| Add/remove member | PUT | `/api/samba/groups/{groupName}/update/?action=add_user|remove_user` | `useUpdateSambaGroupMember` | samba-groups + samba-users | One PUT per username. |

See [`../05-features/samba-shares.md`](../05-features/samba-shares.md).

## NFS shares

| Operation/resource | Method | Endpoint | Query key / owner | StateSync | Notes |
| --- | --- | --- | --- | --- | --- |
| List shares | GET | `/api/nfs/shares/` | `['nfs','shares']` | observational | No continuous polling. |
| Filesystem mountpoint source | GET | `/api/filesystem/?detail=true` | `['filesystem-mountpoints']` | observational | Loaded for create choices. |
| Create share | POST | `/api/nfs/shares/` | `useCreateNfsShare` | nfs | UI `no_subtree_check` is inverted to backend `subtree_check`. |
| Update share | PUT | `/api/nfs/shares/update/` | `useUpdateNfsShare` | nfs | Existing path fixed in current edit UI. |
| Delete share | DELETE | `/api/nfs/shares/delete/?path={sharePath}` | `useDeleteNfsShare` | nfs | Confirmation-driven. |

Current create UI requests `nfs-server.service` restart before submitting create. This ordering is documented as a current limitation requiring backend/system clarification.

See [`../05-features/nfs-shares.md`](../05-features/nfs-shares.md).

## Web Share

| Operation/resource | Method | Endpoint | Query key / owner | StateSync | Notes |
| --- | --- | --- | --- | --- | --- |
| List Web Shares | GET | `/api/webshare/?detail=true` | `['webshare','shares']` | observational | 15 s stale time. |
| Create Web Share | POST | `/api/webshare/` | `useCreateWebShare` | webshare | Stage 1 of create workflow. |
| Set permission | POST | `/api/webshare/set-permission/` | `useSetWebSharePermission` | webshare | Current create flow sets `777`. |
| Delete Web Share | DELETE | `/api/webshare/delete/` | `useDeleteWebShare` | webshare | Params: pool name + filesystem name. |

Create + permission is a two-stage, non-atomic frontend workflow.

See [`../05-features/web-share.md`](../05-features/web-share.md).

## SNMP

| Operation/resource | Method | Endpoint | Query key / owner | StateSync | Notes |
| --- | --- | --- | --- | --- | --- |
| Read SNMP config | GET | `/api/snmp/info/` | `['snmp','info']` | observational | 60 s stale time; no polling. |
| Configure SNMP | POST | `/api/snmp/config/` | `useConfigureSnmp` | snmp | Invalidates SNMP info. |
| Test connection | POST | `/api/snmp/test-connection/` | `useTestSnmpConnection` | diagnostic | Explicitly excluded from StateSync. |

See [`../05-features/snmp.md`](../05-features/snmp.md).

## General system settings

| Operation/resource | Method | Endpoint | Query key / owner | StateSync | Notes |
| --- | --- | --- | --- | --- | --- |
| System time info | GET | `/api/system/time/` | `['general-settings','time']` | — | 15 s stale time. |
| Timezone list | GET | `/api/system/time/zones/` | `['general-settings','timezones']` | — | 24 h stale time. |
| Hostname info | GET | `/api/system/hostname/` | `['general-settings','hostname']` | — | 15 s stale time. |
| System version | GET | `/api/system/version/` | `['general-settings','version']` | — | 1 h stale time. |
| Set hostname | POST | `/api/system/hostname/set/` | `useSetHostname` | — | Confirmation-driven. |
| Set timezone | POST | `/api/system/time/set-timezone/` | `useSetTimezone` | — | Invalidates time info. |
| Manage NTP | POST | `/api/system/time/ntp/` | `useManageNtp` | — | Enable/disable + servers. |
| Set manual time | POST | `/api/system/time/set-time/` | `useSetManualTime` | — | Can be preceded by disabling NTP. |
| Hardware clock | POST | `/api/system/time/hwclock/` | `useManageHwclock` | — | `show` observational; other actions can mutate clock state. |

See [`../05-features/settings.md`](../05-features/settings.md) and [`../general-settings.md`](../general-settings.md).

## Network configuration

| Operation | Method | Endpoint | Owner | StateSync | Notes |
| --- | --- | --- | --- | --- | --- |
| Configure DHCP | POST | `/api/network/{interface}/configure/` | `useConfigureNetworkInterface` | — | Body includes mode + MTU. |
| Configure static | POST | `/api/system/network/{interface}/configure/` | `useConfigureNetworkInterface` | — | Body includes IP/netmask and optional gateway/DNS. |

The DHCP/static endpoint asymmetry is current backend contract. Do not merge the URLs based on convention alone.

## Web/UI users

| Operation/resource | Method | Endpoint | Query key / owner | StateSync | Notes |
| --- | --- | --- | --- | --- | --- |
| List Web users | GET | `/api/system/ui-user/` | `['web-users']` | — | Settings Users tab. |
| Create Web user | POST | `/api/system/ui-user/` | `useCreateWebUser` | — | Followed by separate OS-user create. |
| Delete Web user | DELETE | `/api/system/ui-user/{username}/` | `useDeleteWebUser` | — | Frontend protects normalized `admin`. |
| Update Web user | PUT | `/api/system/ui-user/{username}/update/?action=update` | `useUpdateWebUser` | — | Profile fields. |
| Change password | PUT | `/api/system/ui-user/{username}/update/?action=change_password` | `useUpdateWebUserPassword` | — | Password-only update. |

Web-user creation followed by OS-user creation is non-atomic. Web-user deletion does not automatically delete an OS user.

See [`../05-features/settings.md`](../05-features/settings.md).

## Canonical StateSync snapshot endpoints

These requests are created internally by `StateSyncManager` with `save_to_db=true`.

Feature code should not call them as persistence operations.

| StateSync domain | Canonical GET | Additional params |
| --- | --- | --- |
| `zpool` | `/api/zpool/` | — |
| `filesystem` | `/api/filesystem/` | `detail=true` |
| `disk` | `/api/disk` | — |
| `nfs` | `/api/nfs/shares/` | — |
| `samba-users` | `/api/samba/users/` | `property=all` |
| `samba-groups` | `/api/samba/groups/` | `property=all`, `contain_system_groups=false` |
| `samba-shares` | `/api/samba/sharepoints/` | `property=all` |
| `webshare` | `/api/webshare/` | `detail=true` |
| `snmp` | `/api/snmp/info/` | — |

The StateSync executor marks these requests internally so the Axios request policy sets `save_to_db=true`; normal requests to the same endpoints remain `false`.

## Endpoint ownership rules

When this map and source code disagree, source code is runtime truth and this document must be updated in the same change.

When adding an endpoint:

1. add it to the owning feature hook/lib module;
2. define query/mutation cache behavior;
3. decide whether it changes a persisted StateSync domain;
4. add diagnostic exclusions when POST/PUT does not actually mutate persisted state;
5. add the endpoint here;
6. update the owning feature document.

## Related documentation

- [`api-conventions.md`](./api-conventions.md)
- [`authentication-api.md`](./authentication-api.md)
- [`error-handling.md`](./error-handling.md)
- [`../04-core-flows/api-request-lifecycle.md`](../04-core-flows/api-request-lifecycle.md)
- [`../04-core-flows/state-sync-save-to-db.md`](../04-core-flows/state-sync-save-to-db.md)
