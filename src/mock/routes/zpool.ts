import type { MockRoute } from '../mockAdapter';import { ok } from '../mockUtils';
export default [
{method:'GET',pattern:/^\/api\/zpool\/?$/,handler:({state})=>({data:ok(state.zpools)})},
{method:'GET',pattern:/^\/api\/zpool\/(?<poolName>[^/]+)\/?$/,handler:({state,params})=>({data:ok(state.zpools.find((p:Record<string, unknown>)=>p.name===decodeURIComponent(params.poolName))??null)})},
{method:'GET',pattern:/^\/api\/zpool\/(?<poolName>[^/]+)\/devices\/?$/,handler:({state,params})=>({data:ok(state.zpools.find((p:Record<string, unknown>)=>p.name===decodeURIComponent(params.poolName))?.devices??[])})},
{method:'POST',pattern:/^\/api\/zpool\/create\/?$/,handler:({state,body})=>{state.zpools.push({name:body.pool_name,health:'ONLINE',total:500000000000,used:0,free:500000000000,capacity:'0%',vdev_type:body.vdev_type,devices:body.devices??[]});return {status:201,data:ok(null,'فضای یکپارچه ایجاد شد.')};}},
{method:'POST',pattern:/^\/api\/zpool\/(export|import)\/?$/,handler:()=>({data:ok(null)})},
{method:'POST',pattern:/^\/api\/zpool\/(?<poolName>[^/]+)\/(set|add|replace)\/?$/,handler:()=>({data:ok(null)})},
{method:'DELETE',pattern:/^\/api\/zpool\/delete\/?$/,handler:({state,query,body})=>{const name=body?.pool_name??query.get('pool_name');state.zpools=state.zpools.filter((p:Record<string, unknown>)=>p.name!==name);return {data:ok(null,'فضای یکپارچه حذف شد.')};}},
] satisfies MockRoute[];
