import type { MockRoute } from '../mockAdapter';
import cpu from './cpu';import memory from './memory';import network from './network';import disk from './disk';import zpool from './zpool';import volume from './volume';import system from './system';import services from './services';import users from './users';import samba from './samba';import nfs from './nfs';import snmp from './snmp';import power from './power';

const routes: MockRoute[] = [...cpu,...memory,...network,...disk,...zpool,...volume,...system,...services,...users,...samba,...nfs,...snmp,...power,
{ method:'GET', pattern:/^\/api\/filesystem\/filesystems\/?$/, handler:({state})=>({data:{ok:true,data:Object.keys(state.filesystems)}}) },
{ method:'GET', pattern:/^\/api\/filesystem\/filesystems\/(?<pool>[^/]+)\/(?<fs>[^/]+)\/?$/, handler:({state,params})=>{const key=`${decodeURIComponent(params.pool)}/${decodeURIComponent(params.fs)}`; return {data:{ok:true,data:state.filesystems[key]??{name:key,mountpoint:`/${key}`}}}; } },
{ method:'POST', pattern:/^\/api\/filesystem\/create\/?$/, handler:({state,body})=>{const key=`${body.pool_name}/${body.filesystem_name}`; state.filesystems[key]={name:key,mountpoint:body.mountpoint??`/${key}`}; return {status:201,data:{ok:true}}; } },
];
export default routes;
