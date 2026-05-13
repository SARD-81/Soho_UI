import type { MockRoute } from '../mockAdapter';import { ok } from '../mockUtils';
export default [
{method:'GET',pattern:/^\/api\/volume\/?$/,handler:({state})=>({data:ok(state.volumes)})},
{method:'POST',pattern:/^\/api\/volume\/create\/?$/,handler:({state,body})=>{const name=`${body.pool_name}/${body.volume_name}`;state.volumes[name]={name,size:body.size??'10G'};return {status:201,data:ok(null,'والیوم ایجاد شد.')};}},
{method:'DELETE',pattern:/^\/api\/volume\/delete\/?$/,handler:({state,query})=>{const n=query.get('name')??'';delete state.volumes[n];return {data:ok(null,'والیوم حذف شد.')};}},
] satisfies MockRoute[];
