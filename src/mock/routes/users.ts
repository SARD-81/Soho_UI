import type { MockRoute } from '../mockAdapter';import { ok } from '../mockUtils';
export default [
{method:'GET',pattern:/^\/api\/system\/ui-user\/?$/,handler:({state})=>({data:ok(state.webUsers)})},
{method:'POST',pattern:/^\/api\/system\/ui-user\/?$/,handler:({state,body})=>{state.webUsers.push({username:body.username,is_active:true});return {status:201,data:ok(null,'کاربر وب ایجاد شد.')};}},
{method:'PUT',pattern:/^\/api\/system\/ui-user\/(?<username>[^/]+)\/update\/?$/,handler:()=>({data:ok(null)})},
{method:'DELETE',pattern:/^\/api\/system\/ui-user\/(?<username>[^/]+)\/?$/,handler:({state,params})=>{const u=decodeURIComponent(params.username);state.webUsers=state.webUsers.filter((x:Record<string, unknown>)=>x.username!==u);return {data:ok(null,'کاربر حذف شد.')};}},
{method:'GET',pattern:/^\/api\/os\/user\/?$/,handler:({state,query})=>({data:{data:query.get('include_system')==='true'?state.osUsers:state.osUsers.filter((u:Record<string, unknown>)=>!u.system)}})},
{method:'POST',pattern:/^\/api\/os\/user\/create\/?$/,handler:({state,body})=>{state.osUsers.push({username:body.username,uid:2000+state.osUsers.length,system:false});return {status:201,data:ok(null)}}},
] satisfies MockRoute[];
