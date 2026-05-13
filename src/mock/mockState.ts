export interface MockState {
  cpu: Record<string, unknown>;
  memory: Record<string, unknown>;
  network: Record<string, unknown>;
  disks: Array<Record<string, unknown>>;
  diskHasPartitions: Record<string, boolean>;
  diskWwnMap: Record<string, string>;
  zpools: Array<Record<string, unknown>>;
  volumes: Record<string, Record<string, unknown>>;
  filesystems: Record<string, Record<string, unknown>>;
  services: Array<Record<string, unknown>>;
  webUsers: Array<Record<string, unknown>>;
  osUsers: Array<Record<string, unknown>>;
  sambaUsers: Array<Record<string, unknown>>;
  sambaGroups: Array<Record<string, unknown>>;
  sambaShares: Array<Record<string, unknown>>;
  nfsShares: Array<Record<string, unknown>>;
  snmp: Record<string, unknown>;
  systemInfo: Record<string, unknown>;
}

const initialState: MockState = {
  cpu: { usage_percent_total: 19, cpu_count_logical: 16, cpu_count_physical: 8, model_name: 'AMD EPYC 7302P' },
  memory: { total_bytes: 68719476736, available_bytes: 33285996544, used_bytes: 35433480192, free_bytes: 18874368000, usage_percent: 51.6 },
  network: {
    names: ['eno1', 'eno2'],
    details: {
      eno1: { bandwidth: { upload_bytes: 1024 * 1024, download_bytes: 3 * 1024 * 1024 }, general: { ip_addresses: [{ ip: '192.168.1.100', netmask: '255.255.255.0' }], is_up: true }, hardware: { speed_mbps: 1000, is_up: true } },
      eno2: { bandwidth: { upload_bytes: 120 * 1024, download_bytes: 220 * 1024 }, general: { ip_addresses: [{ ip: '10.0.0.10', netmask: '255.255.0.0' }], is_up: true }, hardware: { speed_mbps: 1000, is_up: true } },
    },
  },
  disks: [
    { name: 'sda', path: '/dev/sda', size: '1TB', slot_number: 1, wwn: 'wwn-sda' },
    { name: 'sdb', path: '/dev/sdb', size: '1TB', slot_number: 2, wwn: 'wwn-sdb' },
    { name: 'sdc', path: '/dev/sdc', size: '2TB', slot_number: 3, wwn: 'wwn-sdc' },
    { name: 'sdd', path: '/dev/sdd', size: '2TB', slot_number: 4, wwn: 'wwn-sdd' },
  ],
  diskHasPartitions: { sda: true, sdb: true, sdc: false, sdd: false },
  diskWwnMap: { sda: 'wwn-sda', sdb: 'wwn-sdb', sdc: 'wwn-sdc', sdd: 'wwn-sdd' },
  zpools: [
    { name: 'tank', health: 'ONLINE', total: 1099511627776, used: 439804651110, free: 6597070, capacity: '40%', vdev_type: 'mirror', devices: ['/dev/sda', '/dev/sdb'] },
    { name: 'backup', health: 'ONLINE', total: 2199023255552, used: 329853488332, free: 1869169767220, capacity: '15%', vdev_type: 'disk', devices: ['/dev/sdc'] },
  ],
  volumes: { 'tank/vol1': { name: 'tank/vol1', size: '100G' } },
  filesystems: { 'tank/data': { name: 'tank/data', mountpoint: '/tank/data', used: '20G', available: '80G' } },
  services: [{ name: 'smbd', active: true, status: 'running' }, { name: 'nfs-server', active: true, status: 'running' }],
  webUsers: [{ username: 'admin', is_active: true }],
  osUsers: [{ username: 'root', uid: 0, system: true }, { username: 'operator', uid: 1001, system: false }],
  sambaUsers: [{ 'Unix username': 'operator', 'Account Flags': '[U          ]' }],
  sambaGroups: [{ name: 'staff', members: ['operator'] }],
  sambaShares: [{ name: 'shared', path: '/tank/data', 'valid users': 'operator', 'read only': false, available: true }],
  nfsShares: [{ path: '/tank/data', clients: ['192.168.1.0/24'], options: 'rw,sync' }],
  snmp: { enabled: true, community: 'public', allowed_ips: ['127.0.0.1'], contact: 'admin', location: 'datacenter-rack-2', sys_name: 'soho-ui-node', port: '161', bind_ip: '0.0.0.0', version: '2c' },
  systemInfo: { hostname: 'soho-dev', os: 'Debian 12', kernel: '6.1.0', uptime: '3 days' },
};

export let mockState: MockState = JSON.parse(JSON.stringify(initialState));
export const resetMockState = () => { mockState = JSON.parse(JSON.stringify(initialState)); };
