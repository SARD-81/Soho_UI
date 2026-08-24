# API Endpoint Map

این سند map مرکزی endpointهای backend است که در حال حاضر توسط frontend SOHO UI استفاده می‌شوند.

هدف آن کمک به maintenance، troubleshooting، هماهنگی backend/frontend و impact analysis است.

این سند **جای feature documentation را نمی‌گیرد**. برای validation rule، response normalization، partial-failure behavior و UI lifecycle به feature document مرتبط مراجعه کنید.

## راهنما

ستون StateSync:

- `—` — در حال حاضر frontend StateSync domain mapping ندارد.
- `zpool + disk` و موارد مشابه — mutation موفق باعث schedule شدن canonical snapshot برای آن domainها می‌شود.
- `diagnostic` — صریحاً نباید persistence trigger کند.
- `observational` — فقط read/monitoring traffic.

Query-key exampleها cache identity فعلی React Query را در جایی که stable key وجود دارد نشان می‌دهند.

## Authentication و session

| Operation | Method | Endpoint | Owner | StateSync | توضیح |
| --- | --- | --- | --- | --- | --- |
| Login/token issue | POST | `<auth-base>/token/` | `authApi.login` | — | isolated auth Axios client |
| Refresh access token | POST | `<auth-base>/token/refresh/` | `authApi.refreshAccessToken` | — | isolated client؛ در single-flight 401 recovery استفاده می‌شود |
| Verify access token | POST | `<auth-base>/token/verify/` | `authApi.verifyAccessToken` | — | isolated client |
| Logout | POST | `/api/system/ui-user/logout/` | `authApi.logout` | — | shared client با Bearer token فعلی |

Auth base از `VITE_AUTH_API_BASE_URL` configure می‌شود یا از `VITE_API_BASE_URL` + `/api/auth/` derive می‌شود.

جزئیات:

[`authentication-api.md`](./authentication-api.md)

## Dashboard / monitoring

| Resource | Method | Endpoint | Query key | StateSync | Refresh |
| --- | --- | --- | --- | --- | --- |
| CPU | GET | `/api/system/cpu/` | `['cpu']` | observational | هر 2 ثانیه در زمان mount بودن |
| Memory | GET | `/api/system/memory/` | `['memory']` | observational | هر 2 ثانیه در زمان mount بودن |
| System uptime | GET | `/api/system/uptime/` | `['system','uptime']` | observational | هر 1 ثانیه در زمان mount بودن |
| Network interface names | GET | `/api/system/network` | `['network']` | observational | base network query lifecycle |
| Network interface detail | GET | `/api/system/network/{interface}/?property=all` | بخشی از `['network']` | observational | یک request به ازای هر interface بعد از list |
| Network bandwidth | GET | `/api/system/network/{interface}/bandwidth/` | `['network','bandwidth-snapshots',interfaceNames]` | observational | هر 2 ثانیه در حالت active |
| Zpool overview | GET | `/api/zpool/` | `['zpool']` | observational | به‌صورت پیش‌فرض هر 30 ثانیه |

Dashboard از domain APIهای موجود reuse می‌کند و telemetry endpoint مخصوص Dashboard ندارد.

جزئیات:

[`../05-features/dashboard.md`](../05-features/dashboard.md)

## System power actionها

| Operation | Method | Endpoint | Owner | StateSync | توضیح |
| --- | --- | --- | --- | --- | --- |
| Reboot | GET | `/api/system/power/execute/?action=reboot` | `usePowerAction` | — | با وجود GET، از نظر عملی mutating است |
| Power off | GET | `/api/system/power/execute/?action=poweroff` | `usePowerAction` | — | با وجود GET، از نظر عملی mutating است |

این یک استثنای مهم در backend contract است: GET بودن method به معنی observational بودن operation نیست. این URLها را خودکار prefetch/replay نکنید.

## Disk inventory و maintenance

| Operation/resource | Method | Endpoint | Query key / owner | StateSync | توضیح |
| --- | --- | --- | --- | --- | --- |
| Disk inventory | GET | `/api/disk/` | `['disk','inventory']` | observational | canonical disk inventory |
| Disk detail | GET | `/api/disk/{diskName}/` | `['disk','detail',diskName]` | observational | identifier باید URL encode شود |
| Partition count | GET | `/api/disk/{diskName}/partition-count/` | `['disk','partition-count',diskName]` | observational | برای wipe safety |
| Disk names | GET | `/api/disk/names/` | available-disk flow | observational | code فعلی در 404 fallback بدون trailing slash دارد |
| Has partitions | GET | `/api/disk/{diskName}/has-partitions/` | available-disk flow | observational | برای انتخاب unpartitioned disk |
| Clear ZFS metadata | POST | `/api/disk/{diskName}/clear-zfs/` | `cleanupDisk` | disk + zpool | مرحله‌ی اول cleanup به‌شکل best-effort |
| Wipe disk | POST | `/api/disk/{diskName}/wipe/` | `cleanupDisk` | disk + zpool | مرحله‌ی اجباری cleanup |

`cleanupDisk()` ابتدا clear-ZFS و بعد wipe را call می‌کند. Failure در clear-ZFS مانع attempt شدن wipe نمی‌شود.

جزئیات:

[`../05-features/disks.md`](../05-features/disks.md)

## Integrated Storage / Zpool

| Operation/resource | Method | Endpoint | Query key / owner | StateSync | توضیح |
| --- | --- | --- | --- | --- | --- |
| Pool list | GET | `/api/zpool/` | `['zpool']` | observational | canonical pool collection |
| Pool detail | GET | `/api/zpool/{poolName}/` | `['zpool',poolName,'details']` | observational | selected/pinned detail |
| Pool devices | GET | `/api/zpool/{poolName}/devices/` | `['zpool','devices',...]` | observational | membership، vdev type و slot mapping |
| Create pool | POST | `/api/zpool/create/` | `useCreatePool` | zpool + disk | payload شامل pool name/devices/vdev type |
| Add devices | POST | `/api/zpool/{poolName}/add/` | `useAddPoolDevices` | zpool + disk | vdev/device count validate می‌شود |
| Replace disk | POST | `/api/zpool/{poolName}/replace/` | `useReplacePoolDisk` | zpool + disk | mutation فعلی replacementها را sequential اجرا می‌کند |
| Destroy pool | POST | `/api/zpool/{poolName}/destroy/` | `useDeleteZpool` | zpool + disk | پس از آن cleanup diskهای قبلی انجام می‌شود |
| Export pool | POST | `/api/zpool/export/` | `useExportPool` | zpool + disk | payload شامل pool name |
| Discover importable pools | GET | `/api/zpool/import/` | import-modal query | observational | modal-scoped |
| Import pool | POST | `/api/zpool/import/` | `useImportPool` | zpool + disk | zpool/importable list را invalidate می‌کند |
| Set pool property | POST | `/api/zpool/{poolName}/set-property/` | `useSetZpoolProperty` | zpool + disk | `prop` و `value=on|off` |

Destroy workflow از دید frontend atomic نیست: destroy قبل از cleanup diskهای قبلی اتفاق می‌افتد.

جزئیات:

[`../05-features/integrated-storage.md`](../05-features/integrated-storage.md)

## Block Storage / Volumes

| Operation | Method | Endpoint | Query key / owner | StateSync | توضیح |
| --- | --- | --- | --- | --- | --- |
| List Volumes | GET | `/api/volume/` | `['volumes']` | — | continuous polling ندارد |
| Create Volume | POST | `/api/volume/create` | `useCreateVolume` | — | full name با فرمت `<pool>/<volume>` |
| Delete Volume | DELETE | `/api/volume/delete` | `useDeleteVolume` | — | request body شامل `volume_name` |

Volume در حال حاضر StateSync domain ندارد. برای workaround، caller-owned `save_to_db` اضافه نکنید.

جزئیات:

[`../05-features/block-storage.md`](../05-features/block-storage.md)

## File System

| Operation/resource | Method | Endpoint | Query key / owner | StateSync | توضیح |
| --- | --- | --- | --- | --- | --- |
| Detailed filesystem list | GET | `/api/filesystem/?detail=true` | `['filesystems']` | observational | preferred collection contract |
| Legacy filesystem detail fallback | GET | `/api/filesystem/detail/?name={filesystem}` | compatibility path در `useFileSystems` | observational | فقط وقتی list response detail ندارد |
| Create filesystem | POST | `/api/filesystem/` | `useCreateFileSystem` | filesystem + zpool | encryption/passphrase اختیاری |
| Delete filesystem | DELETE | `/api/filesystem/delete/?name={pool/filesystem}` | `useDeleteFileSystem` | filesystem + zpool | confirmation-driven |
| Mount | POST | `/api/filesystem/mount/?name={pool/filesystem}` | `useMountFileSystem` | filesystem + zpool | filesystem collection را invalidate می‌کند |
| Unmount | POST | `/api/filesystem/unmount/?name={pool/filesystem}&force={boolean}` | `useUnmountFileSystem` | filesystem + zpool | UI معمولاً `force=false` استفاده می‌کند |
| Set canmount | POST | `/api/filesystem/set-canmount/?name={pool/filesystem}&state=on|off` | `useSetCanmount` | filesystem + zpool | automatic-mount toggle |
| Load encryption key | POST | `/api/filesystem/load-key/?name={pool/filesystem}` | `useLoadKey` | filesystem + zpool | body شامل Base64-encoded passphrase |
| Unload encryption key | POST | `/api/filesystem/unload-key/?name={pool/filesystem}` | `useUnloadKey` | filesystem + zpool | passphrase body ندارد |
| Change passphrase | POST | `/api/filesystem/change-passphrase/?name={pool/filesystem}` | `useChangeFileSystemPassphrase` | filesystem + zpool | `new_passphrase` برای transport Base64 encoded است |

Base64 فقط transport encoding است، encryption نیست؛ برای confidentiality همچنان TLS لازم است.

جزئیات:

[`../05-features/file-system.md`](../05-features/file-system.md)

## System services

| Operation/resource | Method | Endpoint | Query key / owner | StateSync | توضیح |
| --- | --- | --- | --- | --- | --- |
| Service list | GET | `/api/system/service/` | `['services']` | — | polling هر 5 ثانیه |
| Per-unit status | GET | `/api/system/service/{unit}/` | `['services','status',unit]` | — | یک query به ازای هر unit، هر 5 ثانیه |
| Control service | PUT | `/api/system/service/{unit}/control/?action={action}` | `useServiceAction` | — | `start`, `stop`, `restart`, `reload`, `enable`, `disable`, `mask`, `unmask` |

UI فعلی عمدتاً Start/Stop و boot Enable/Disable را expose می‌کند. Stop confirmation لازم دارد.

جزئیات:

[`../05-features/services.md`](../05-features/services.md)

## OS users

| Operation/resource | Method | Endpoint | Query key / owner | StateSync | توضیح |
| --- | --- | --- | --- | --- | --- |
| List OS users | GET | `/api/os/user?include_system={boolean}` | `['os-users',{includeSystem}]` | — | صفحه‌ی اصلی Users مقدار `false` استفاده می‌کند |
| Create OS user | POST | `/api/os/user/create/` | `useCreateOsUser` | — | مستقیم و در cross-domain user creation flow استفاده می‌شود |

OS-user persistence در حال حاضر StateSync domain نیست.

جزئیات:

[`../05-features/users.md`](../05-features/users.md)

## Samba shares

| Operation/resource | Method | Endpoint | Query key / owner | StateSync | توضیح |
| --- | --- | --- | --- | --- | --- |
| List shares | GET | `/api/samba/sharepoints/?property=all` | `['samba','shares']` | observational | continuous polling ندارد |
| Read share access/property | GET | `/api/samba/sharepoints/{shareName}/?property={property}` | share member/detail queryها | observational | member editor access فعلی را می‌خواند |
| Create share | POST | `/api/samba/sharepoints/` | `useCreateShare` | samba-shares | صفحه بعد از success، `smbd.service` را reload می‌کند |
| Update share | PUT | `/api/samba/sharepoints/{shareName}/update/` | `useUpdateSharepoint` | samba-shares | field-alias mapping مرکزی |
| Delete share | DELETE | `/api/samba/sharepoints/{shareName}/` | `useDeleteShare` | samba-shares | confirmation-driven |

## Samba users

| Operation/resource | Method | Endpoint | Query key / owner | StateSync | توضیح |
| --- | --- | --- | --- | --- | --- |
| List users | GET | `/api/samba/users/?property=all` | `['samba-users']` | observational | `staleTime` برابر 15 ثانیه |
| Username-only list | GET | `/api/samba/users/?property=Unix username` | Samba availability helperها | observational | برای membership/selection UI |
| Account flags | GET | `/api/samba/users/{username}/?property=Account Flags` | `['samba-user',username,'account-flags']` | observational | یک query به ازای هر username نمایش‌داده‌شده |
| Create user | POST | `/api/samba/users/` | `useCreateSambaUser` | samba-shares | طبق resolver صحیح GitLab، generic `/api/samba...` به `samba-shares` map می‌شود |
| Delete user | DELETE | `/api/samba/users/{username}/` | `useDeleteSambaUser` | samba-shares | HTTP 400 می‌تواند active-share dependency باشد |
| Update status/password | PUT | `/api/samba/users/{username}/update/` | status/password hookها | samba-shares | actionها: enable/disable/change_password |

> نکته: `samba-users` در نسخه‌ی فعلی GitLab یک StateSync domain مستقل نیست. Query key مربوط به Samba user همچنان وجود دارد، اما cache identity را نباید با persistence domain یکی دانست.

## Samba groups

| Operation/resource | Method | Endpoint | Query key / owner | StateSync | توضیح |
| --- | --- | --- | --- | --- | --- |
| List groups | GET | `/api/samba/groups/?property=all&contain_system_groups=false` | `['samba-groups']` | observational | system groupها exclude می‌شوند |
| Group names | GET | `/api/samba/groups/?property=name&contain_system_groups=false` | group availability helper | observational | selection list |
| Group members | GET | `/api/samba/groups/{groupName}/?property=members` | group member key | observational | current group detail |
| Members list | GET | `/api/samba/groups/?property=members&contain_system_groups=false` | group-member helperها | observational | batch read |
| Create group | POST | `/api/samba/groups/` | `useCreateSambaGroup` | samba-shares | initial-member flow مرحله‌ی بعدی است |
| Delete group | DELETE | `/api/samba/groups/{groupName}/` | `useDeleteSambaGroup` | samba-shares | — |
| Add/remove member | PUT | `/api/samba/groups/{groupName}/update/?action=add_user|remove_user` | `useUpdateSambaGroupMember` | samba-shares | یک PUT به ازای هر username |

> `samba-groups` نیز query domain فعال است ولی در `StateSyncManager` صحیح GitLab persisted domain مستقل نیست.

جزئیات:

[`../05-features/samba-shares.md`](../05-features/samba-shares.md)

## NFS shares

| Operation/resource | Method | Endpoint | Query key / owner | StateSync | توضیح |
| --- | --- | --- | --- | --- | --- |
| List shares | GET | `/api/nfs/shares/` | `['nfs','shares']` | observational | continuous polling ندارد |
| Filesystem mountpoint source | GET | `/api/filesystem/?detail=true` | `['filesystem-mountpoints']` | observational | برای create choice load می‌شود |
| Create share | POST | `/api/nfs/shares/` | `useCreateNfsShare` | nfs | UI `no_subtree_check` به backend `subtree_check` invert می‌شود |
| Update share | PUT | `/api/nfs/shares/update/` | `useUpdateNfsShare` | nfs | path موجود در edit UI فعلی ثابت است |
| Delete share | DELETE | `/api/nfs/shares/delete/?path={sharePath}` | `useDeleteNfsShare` | nfs | confirmation-driven |

Create UI فعلی پیش از submit کردن create، restart مربوط به `nfs-server.service` را request می‌کند. این ordering یک current limitation است و نیاز به clarification از backend/system دارد.

جزئیات:

[`../05-features/nfs-shares.md`](../05-features/nfs-shares.md)

## Web Share

| Operation/resource | Method | Endpoint | Query key / owner | StateSync | توضیح |
| --- | --- | --- | --- | --- | --- |
| List Web Shares | GET | `/api/webshare/?detail=true` | `['webshare','shares']` | observational | `staleTime` برابر 15 ثانیه |
| Create Web Share | POST | `/api/webshare/` | `useCreateWebShare` | webshare | مرحله‌ی اول create workflow |
| Set permission | POST | `/api/webshare/set-permission/` | `useSetWebSharePermission` | webshare | create flow فعلی مقدار `777` اعمال می‌کند |
| Delete Web Share | DELETE | `/api/webshare/delete/` | `useDeleteWebShare` | webshare | params شامل pool name و filesystem name |

Create + permission یک frontend workflow دو مرحله‌ای و non-atomic است.

جزئیات:

[`../05-features/web-share.md`](../05-features/web-share.md)

## SNMP

| Operation/resource | Method | Endpoint | Query key / owner | StateSync | توضیح |
| --- | --- | --- | --- | --- | --- |
| Read SNMP config | GET | `/api/snmp/info/` | `['snmp','info']` | observational | `staleTime` برابر 60 ثانیه؛ بدون polling |
| Configure SNMP | POST | `/api/snmp/config/` | `useConfigureSnmp` | — | SNMP info را invalidate می‌کند؛ در GitLab فعلی StateSync domain مستقل ندارد |
| Test connection | POST | `/api/snmp/test-connection/` | `useTestSnmpConnection` | diagnostic | config mutation نیست و نباید persistence trigger کند |

جزئیات:

[`../05-features/snmp.md`](../05-features/snmp.md)

## General system settings

| Operation/resource | Method | Endpoint | Query key / owner | StateSync | توضیح |
| --- | --- | --- | --- | --- | --- |
| System time info | GET | `/api/system/time/` | `['general-settings','time']` | — | `staleTime` برابر 15 ثانیه |
| Timezone list | GET | `/api/system/time/zones/` | `['general-settings','timezones']` | — | `staleTime` برابر 24 ساعت |
| Hostname info | GET | `/api/system/hostname/` | `['general-settings','hostname']` | — | `staleTime` برابر 15 ثانیه |
| System version | GET | `/api/system/version/` | `['general-settings','version']` | — | `staleTime` برابر 1 ساعت |
| Set hostname | POST | `/api/system/hostname/set/` | `useSetHostname` | — | confirmation-driven |
| Set timezone | POST | `/api/system/time/set-timezone/` | `useSetTimezone` | — | time info را invalidate می‌کند |
| Manage NTP | POST | `/api/system/time/ntp/` | `useManageNtp` | — | enable/disable + serverها |
| Set manual time | POST | `/api/system/time/set-time/` | `useSetManualTime` | — | ممکن است پیش از آن NTP disable شود |
| Hardware clock | POST | `/api/system/time/hwclock/` | `useManageHwclock` | — | `show` observational است؛ actionهای دیگر می‌توانند clock state را تغییر دهند |

جزئیات:

- [`../05-features/settings.md`](../05-features/settings.md)
- [`../general-settings.md`](../general-settings.md)

## Network configuration

| Operation | Method | Endpoint | Owner | StateSync | توضیح |
| --- | --- | --- | --- | --- | --- |
| Configure DHCP | POST | `/api/network/{interface}/configure/` | `useConfigureNetworkInterface` | — | body شامل mode + MTU |
| Configure static | POST | `/api/system/network/{interface}/configure/` | `useConfigureNetworkInterface` | — | body شامل IP/netmask و gateway/DNS اختیاری |

Asymmetry بین DHCP/static endpoint بخشی از backend contract فعلی است. URLها را صرفاً بر اساس convention merge نکنید.

## Web/UI users

| Operation/resource | Method | Endpoint | Query key / owner | StateSync | توضیح |
| --- | --- | --- | --- | --- | --- |
| List Web users | GET | `/api/system/ui-user/` | `['web-users']` | — | Settings Users tab |
| Create Web user | POST | `/api/system/ui-user/` | `useCreateWebUser` | — | بعد از آن OS-user create جدا اجرا می‌شود |
| Delete Web user | DELETE | `/api/system/ui-user/{username}/` | `useDeleteWebUser` | — | frontend از normalized `admin` محافظت می‌کند |
| Update Web user | PUT | `/api/system/ui-user/{username}/update/?action=update` | `useUpdateWebUser` | — | profile fieldها |
| Change password | PUT | `/api/system/ui-user/{username}/update/?action=change_password` | `useUpdateWebUserPassword` | — | password-only update |

Web-user creation و OS-user creation بعد از آن non-atomic هستند. Delete کردن Web user به‌صورت خودکار OS user را حذف نمی‌کند.

جزئیات:

[`../05-features/settings.md`](../05-features/settings.md)

## Canonical StateSync snapshot endpointها

این requestها به‌صورت internal توسط `StateSyncManager` با `save_to_db=true` ساخته می‌شوند.

Feature code نباید آن‌ها را مستقیماً به‌عنوان persistence operation call کند.

بر اساس `stateSyncManager.ts` صحیح GitLab:

| StateSync domain | Canonical GET | Additional params |
| --- | --- | --- |
| `zpool` | `/api/zpool/` | — |
| `filesystem` | `/api/filesystem/` | `detail=true` |
| `disk` | `/api/disk` | — |
| `nfs` | `/api/nfs/shares/` | — |
| `samba-shares` | `/api/samba/sharepoints/` | `property=all` |
| `webshare` | `/api/webshare/` | `detail=true` |

`StateSyncManager` فعلی canonical snapshot مستقل برای `samba-users`، `samba-groups` یا `snmp` ندارد.

StateSync executor این requestها را internal mark می‌کند تا Axios request policy مقدار `save_to_db=true` تنظیم کند؛ normal request به همین endpointها همچنان `false` باقی می‌ماند.

## قواعد endpoint ownership

اگر این map با source code اختلاف داشت، source code runtime truth است و این سند باید در همان change update شود.

هنگام اضافه کردن endpoint:

1. آن را به owning feature hook/lib module اضافه کنید.
2. query/mutation cache behavior را تعریف کنید.
3. مشخص کنید persisted StateSync domain را تغییر می‌دهد یا خیر.
4. اگر POST/PUT واقعاً persisted state را تغییر نمی‌دهد، diagnostic exclusion لازم را اعمال کنید.
5. endpoint را به این map اضافه کنید.
6. feature document مالک آن را update کنید.

## مستندات مرتبط

- [`api-conventions.md`](./api-conventions.md)
- [`authentication-api.md`](./authentication-api.md)
- [`error-handling.md`](./error-handling.md)
- [`../04-core-flows/api-request-lifecycle.md`](../04-core-flows/api-request-lifecycle.md)
- [`../04-core-flows/state-sync-save-to-db.md`](../04-core-flows/state-sync-save-to-db.md)
