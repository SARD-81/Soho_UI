import type { DiskResponse } from '../@types/disk';
import type { RawSambaUserDetails, SambaShareDetails } from '../@types/samba';
import type { ServiceDetails } from '../@types/service';
import type { VolumeRawEntry } from '../@types/volume';
import type { ZpoolCapacityPayload, ZpoolDetailEntry } from '../@types/zpool';
import type { CpuResponse } from '../hooks/useCpu';
import type { MemoryResponse } from '../hooks/useMemory';
import type { NetworkData } from '../hooks/useNetwork';
import type { PowerAction, PowerActionResponse } from '../hooks/usePowerAction';

export interface MockCredential {
  password: string;
  token: string;
}

export interface MockOsUser {
  username: string;
  fullName: string;
  uid: string;
  gid: string;
  home: string;
  shell: string;
  isSystem?: boolean;
  hasSambaUser?: boolean;
}

export interface MockSambaUserEntry {
  username: string;
  disabled: boolean;
  details: RawSambaUserDetails;
}

export interface MockWebUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  last_login: string | null;
  date_joined: string;
}

export interface DirPermissionsEntry {
  ok: boolean;
  error?: { message?: string } | null;
  owner?: string;
  group?: string;
  mode?: string;
}

export interface MockState {
  credentials: Record<string, MockCredential>;
  zpool: {
    capacities: ZpoolCapacityPayload[];
    details: Record<string, ZpoolDetailEntry[]>;
  };
  volumes: Record<string, VolumeRawEntry>;
  sambaShares: Record<string, SambaShareDetails>;
  sambaUsers: Record<string, MockSambaUserEntry>;
  osUsers: MockOsUser[];
  webUsers: MockWebUser[];
  services: Record<string, ServiceDetails>;
  network: NetworkData;
  memory: MemoryResponse;
  cpu: CpuResponse;
  disk: DiskResponse;
  diskWwnMap: Record<string, string>;
  dirPermissions: Record<string, DirPermissionsEntry>;
  powerActions: Record<PowerAction, PowerActionResponse>;
}

const baseState: MockState = {
  credentials: {
    admin: {
      password: 'admin123',
      token: 'mock-admin-token',
    },
    operator: {
      password: 'operator123',
      token: 'mock-operator-token',
    },
  },
  zpool: {
    capacities: [
      {
        name: 'tank',
        size: '10 TiB',
        alloc: '2.4 TiB',
        free: '7.6 TiB',
        capacity: '24%',
        dedup: '1.02x',
        fragmentation: '6%',
        health: 'ONLINE',
      },
      {
        name: 'backup',
        size: '4 TiB',
        alloc: '1.2 TiB',
        free: '2.8 TiB',
        capacity: '30%',
        dedup: '1.00x',
        fragmentation: '12%',
        health: 'ONLINE',
      },
    ],
    details: {
      tank: [
        {
          name: 'tank',
          state: 'ONLINE',
          status: 'Healthy',
          size: '10 TiB',
          alloc: '2.4 TiB',
          free: '7.6 TiB',
          fragmentation: '6%',
          dedup: '1.02x',
          scan: 'none requested',
        },
        {
          name: 'tank/data',
          type: 'raidz1',
          state: 'ONLINE',
          read: 0,
          write: 0,
          cksum: 0,
        },
        {
          name: 'tank/cache',
          type: 'cache',
          state: 'ONLINE',
          read: 0,
          write: 0,
          cksum: 0,
        },
      ],
      backup: [
        {
          name: 'backup',
          state: 'ONLINE',
          status: 'Degraded: single parity',
          size: '4 TiB',
          alloc: '1.2 TiB',
          free: '2.8 TiB',
          fragmentation: '12%',
          scan: 'scrub repaired 0B in 0 days 03:12:12 with 0 errors on 2025-01-10',
        },
        {
          name: 'backup/data',
          type: 'mirror',
          state: 'ONLINE',
          read: 0,
          write: 0,
          cksum: 0,
        },
      ],
    },
  },
  volumes: {
    'tank/media': {
      name: 'tank/media',
      mountpoint: '/tank/media',
      type: 'filesystem',
      compression: 'lz4',
      quota: '500G',
      reservation: '200G',
      creation: '2024-11-01T08:00:00Z',
    },
    'tank/database': {
      name: 'tank/database',
      mountpoint: '/tank/database',
      type: 'filesystem',
      recordsize: '128K',
      primarycache: 'all',
      logbias: 'throughput',
      creation: '2024-12-15T06:30:00Z',
    },
    'backup/snapshots': {
      name: 'backup/snapshots',
      mountpoint: '/backup/snapshots',
      readonly: 'on',
      compression: 'zstd',
      copies: 2,
      creation: '2025-01-05T10:45:00Z',
    },
  },
  sambaShares: {
    media: {
      full_path: '/tank/media',
      valid_users: 'mediauser',
      comment: 'Media library share',
      browseable: 'yes',
      'read only': 'no',
    },
    backups: {
      full_path: '/backup/snapshots',
      valid_users: 'backup',
      comment: 'Snapshot archive',
      browseable: 'no',
      'read only': 'yes',
    },
  },
  sambaUsers: {
    mediauser: {
      username: 'mediauser',
      disabled: false,
      details: {
        username: 'mediauser',
        domain: 'WORKGROUP',
        description: 'Media playback account',
        profile_path: '\\SOHO\\Profiles\\mediauser',
        password_last_set: '2025-01-12T10:15:00Z',
        password_must_change: 'no',
        logon_time: '2025-01-16T08:12:43Z',
        logoff_time: '2025-01-16T20:01:11Z',
      },
    },
    backup: {
      username: 'backup',
      disabled: false,
      details: {
        username: 'backup',
        domain: 'WORKGROUP',
        description: 'Off-site backup account',
        profile_path: '\\SOHO\\Profiles\\backup',
        password_last_set: '2025-01-05T08:00:00Z',
        password_must_change: 'no',
        logon_time: '2025-01-18T05:10:00Z',
      },
    },
    archived: {
      username: 'archived',
      disabled: true,
      details: {
        username: 'archived',
        domain: 'WORKGROUP',
        description: 'Disabled historical account',
        password_last_set: '2024-10-01T08:00:00Z',
        password_must_change: 'yes',
      },
    },
  },
  webUsers: [
    {
      id: 1,
      username: 'admin',
      email: 'admin@soho.local',
      first_name: 'مدیر',
      last_name: 'سیستم',
      is_active: true,
      is_staff: true,
      is_superuser: true,
      last_login: '2025-01-10T08:30:00Z',
      date_joined: '2024-12-01T09:00:00Z',
    },
    {
      id: 2,
      username: 'operator',
      email: 'operator@soho.local',
      first_name: 'اپراتور',
      last_name: 'سیستم',
      is_active: true,
      is_staff: true,
      is_superuser: false,
      last_login: '2025-01-18T07:45:00Z',
      date_joined: '2025-01-02T11:20:00Z',
    },
    {
      id: 3,
      username: 'backup',
      email: 'backup@soho.local',
      first_name: 'پشتیبان',
      last_name: 'شبکه',
      is_active: true,
      is_staff: false,
      is_superuser: false,
      last_login: null,
      date_joined: '2025-01-15T14:05:00Z',
    },
  ],
  osUsers: [
    {
      username: 'admin',
      fullName: 'System Administrator',
      uid: '1000',
      gid: '1000',
      home: '/home/admin',
      shell: '/bin/bash',
      hasSambaUser: false,
    },
    {
      username: 'mediauser',
      fullName: 'Media Service Account',
      uid: '1001',
      gid: '1001',
      home: '/srv/media',
      shell: '/usr/bin/zsh',
      hasSambaUser: true,
    },
    {
      username: 'backup',
      fullName: 'Backup Operator',
      uid: '1002',
      gid: '1002',
      home: '/srv/backup',
      shell: '/bin/bash',
      hasSambaUser: true,
    },
    {
      username: 'systemd-network',
      fullName: 'systemd Network Management',
      uid: '192',
      gid: '192',
      home: '/',
      shell: '/usr/sbin/nologin',
      isSystem: true,
      hasSambaUser: false,
    },
  ],
  services: {
    smbd: {
      unit: 'smbd.service',
      description: 'Samba SMB Daemon',
      active_state: 'active',
      sub_state: 'running',
      enabled: true,
      status: 'running',
    },
    nmbd: {
      unit: 'nmbd.service',
      description: 'Samba NMB Daemon',
      active_state: 'active',
      sub_state: 'running',
      enabled: true,
      status: 'running',
    },
    sshd: {
      unit: 'sshd.service',
      description: 'OpenSSH server daemon',
      active_state: 'active',
      sub_state: 'running',
      enabled: true,
      status: 'running',
    },
  },
  network: {
    interfaces: {
      enp0s31f6: {
        bandwidth: {
          download: 125.4,
          upload: 18.2,
          unit: 'MB/s',
        },
        addresses: [
          {
            address: '192.168.10.15',
            netmask: '255.255.255.0',
            family: 'IPv4',
          },
          {
            address: 'fe80::1234:56ff:fe78:9abc',
            netmask: null,
            family: 'IPv6',
          },
        ],
        status: {
          operstate: 'up',
          speed: '1 Gbps',
          mtu: 1500,
        },
      },
      wlan0: {
        bandwidth: {
          download: 36.1,
          upload: 12.3,
          unit: 'MB/s',
        },
        addresses: [
          {
            address: '10.0.0.52',
            netmask: '255.255.255.0',
            family: 'IPv4',
          },
        ],
        status: {
          operstate: 'up',
          speed: '600 Mbps',
          mtu: 1500,
        },
      },
    },
  },
  memory: {
    total: 16 * 1024 ** 3,
    available: 10.4 * 1024 ** 3,
    percent: 34.8,
    used: 5.6 * 1024 ** 3,
    free: 10.4 * 1024 ** 3,
    buffers: 512 * 1024 ** 2,
    cached: 2.1 * 1024 ** 3,
    shared: 512 * 1024 ** 2,
  },
  cpu: {
    cpu_percent: 18.7,
    cpu_frequency: {
      current: 3200,
      min: 1200,
      max: 3800,
    },
    cpu_cores: {
      physical: 6,
      logical: 12,
    },
  },
  disk: {
    disks: [
      {
        device: '/dev/sda',
        mountpoint: '/',
        fstype: 'ext4',
        opts: 'rw,relatime',
        usage: {
          total: 512 * 1024 ** 3,
          used: 180 * 1024 ** 3,
          free: 332 * 1024 ** 3,
          percent: 35.1,
        },
        io: {
          read_count: 123456,
          write_count: 98765,
          read_bytes: 3_456_789_012,
          write_bytes: 5_678_901_234,
          read_time: 12345,
          write_time: 23456,
          busy_time: 54321,
        },
        details: {
          model: 'Samsung SSD 970 EVO 500GB',
          serial: 'S3Z5NX0M123456A',
          wwn: '0x5002538d404b1234',
        },
      },
      {
        device: '/dev/sdb',
        mountpoint: '/tank',
        fstype: 'zfs_member',
        opts: 'rw',
        usage: {
          total: 8 * 1024 ** 4,
          used: 2.5 * 1024 ** 4,
          free: 5.5 * 1024 ** 4,
          percent: 31.2,
        },
        io: {
          read_count: 234567,
          write_count: 198765,
          read_bytes: 7_234_567_890,
          write_bytes: 9_876_543_210,
          read_time: 23456,
          write_time: 34567,
          busy_time: 65432,
        },
        details: {
          model: 'Seagate IronWolf Pro 12TB',
          serial: 'ZA1234ABC567',
          wwn: '0x5000c500a1b2c3d4',
        },
      },
      {
        device: '/dev/sdc',
        mountpoint: '/backup',
        fstype: 'zfs_member',
        opts: 'rw',
        usage: {
          total: 4 * 1024 ** 4,
          used: 1.2 * 1024 ** 4,
          free: 2.8 * 1024 ** 4,
          percent: 30.0,
        },
        io: {
          read_count: 134567,
          write_count: 88765,
          read_bytes: 3_834_567_890,
          write_bytes: 5_276_543_210,
          read_time: 12356,
          write_time: 16789,
          busy_time: 34567,
        },
        details: {
          model: 'Western Digital Red Plus 6TB',
          serial: 'WX21D1234567',
          wwn: '0x50014ee2ba123456',
        },
      },
    ],
    summary: {
      total_disks: 3,
      disk_io_summary: {
        '/dev/sda': {
          read_bytes: 3_456_789_012,
          write_bytes: 5_678_901_234,
          read_time: 12345,
          write_time: 23456,
        },
        '/dev/sdb': {
          read_bytes: 7_234_567_890,
          write_bytes: 9_876_543_210,
          read_time: 23456,
          write_time: 34567,
        },
        '/dev/sdc': {
          read_bytes: 3_834_567_890,
          write_bytes: 5_276_543_210,
          read_time: 12356,
          write_time: 16789,
        },
      },
    },
  },
  diskWwnMap: {
    '/dev/sda': 'wwn-0x5002538d404b1234',
    '/dev/sdb': 'wwn-0x5000c500a1b2c3d4',
    '/dev/sdc': 'wwn-0x50014ee2ba123456',
  },
  dirPermissions: {
    '/tank/media': {
      ok: true,
      owner: 'mediauser',
      group: 'mediauser',
      mode: '0770',
    },
    '/tank/database': {
      ok: true,
      owner: 'admin',
      group: 'admin',
      mode: '0750',
    },
    '/backup/snapshots': {
      ok: true,
      owner: 'backup',
      group: 'backup',
      mode: '0750',
    },
    '/restricted': {
      ok: false,
      error: {
        message: 'اجازه دسترسی به این مسیر وجود ندارد.',
      },
    },
  },
  powerActions: {
    restart: {
      status: 'scheduled',
      detail: 'سیستم تا چند لحظه دیگر راه‌اندازی مجدد می‌شود.',
      message: 'در حال برنامه‌ریزی برای ریستارت سیستم.',
    },
    shutdown: {
      status: 'scheduled',
      detail: 'سیستم در حال خاموش شدن است.',
      message: 'خاموشی سیستم در حال انجام است.',
    },
  },
};

const deepClone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

export const mockState: MockState = deepClone(baseState);

export const resetMockState = () => {
  const clone = deepClone(baseState);
  Object.assign(mockState, clone);
};