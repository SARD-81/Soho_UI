import type { MockRoute } from '../mockAdapter';import { ok } from '../mockUtils';
export default [
{ method:'GET', pattern:/^\/api\/disk\/?$/, handler:({state})=>({data:ok(state.disks)})},
{ method:'GET', pattern:/^\/api\/disk\/names\/?$/, handler:({state})=>({data:ok({disk_names:state.disks.map((d:Record<string, unknown>)=>d.name)})})},
{ method:'GET', pattern:/^\/api\/disk\/wwn\/map\/?$/, handler:({state})=>({data:ok(state.diskWwnMap)})},
{ method:'GET', pattern:/^\/api\/disk\/(?<diskName>[^/]+)\/?$/, handler:({state,params})=>({data:ok(state.disks.find((d:Record<string, unknown>)=>d.name===decodeURIComponent(params.diskName))??null)})},
{ method:'GET', pattern:/^\/api\/disk\/(?<diskName>[^/]+)\/has-partitions\/?$/, handler:({state,params})=>({data:ok({has_partitions:Boolean(state.diskHasPartitions[decodeURIComponent(params.diskName)])})})},
{ method:'POST', pattern:/^\/api\/disk\/(?<diskName>[^/]+)\/(clear-zfs|wipe)\/?$/, handler:()=>({data:ok(null,'عملیات پاکسازی انجام شد.')})},
] satisfies MockRoute[];
