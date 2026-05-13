import type { MockRoute } from '../mockAdapter';import { ok } from '../mockUtils';
export default [
{method:'GET',pattern:/^\/api\/samba\/users\/?$/,handler:({state})=>({data:ok(state.sambaUsers)})},
{method:'POST',pattern:/^\/api\/samba\/users\/?$/,handler:({state,body})=>{state.sambaUsers.push({'Unix username':body.username,'Account Flags':'[U          ]'});return {status:201,data:ok(null)}}},
{method:'DELETE',pattern:/^\/api\/samba\/users\/(?<username>[^/]+)\/?$/,handler:({state,params})=>{const u=decodeURIComponent(params.username);state.sambaUsers=state.sambaUsers.filter((x:Record<string, unknown>)=>x['Unix username']!==u);return {data:ok(null)}}},
{method:'PUT',pattern:/^\/api\/samba\/users\/(?<username>[^/]+)\/update\/?$/,handler:()=>({data:ok(null)})},
{method:'GET',pattern:/^\/api\/samba\/groups\/?$/,handler:({state})=>({data:ok(state.sambaGroups)})},
{method:'POST',pattern:/^\/api\/samba\/groups\/?$/,handler:({state,body})=>{state.sambaGroups.push({name:body.groupname,members:[]});return {status:201,data:ok(null)}}},
{method:'DELETE',pattern:/^\/api\/samba\/groups\/(?<name>[^/]+)\/?$/,handler:({state,params})=>{const n=decodeURIComponent(params.name);state.sambaGroups=state.sambaGroups.filter((g:Record<string, unknown>)=>g.name!==n);return {data:ok(null)}}},
{method:'PUT',pattern:/^\/api\/samba\/groups\/(?<name>[^/]+)\/update\/?$/,handler:()=>({data:ok(null)})},
{method:'GET',pattern:/^\/api\/samba\/sharepoints\/?$/,handler:({state})=>({data:ok(state.sambaShares)})},
{method:'POST',pattern:/^\/api\/samba\/(sharepoints|config\/append)\/?$/,handler:({state,body})=>{state.sambaShares.push({name:body.name??body.full_path?.split('/').pop()??'share-new',...body});return {status:201,data:ok(null)}}},
{method:'DELETE',pattern:/^\/api\/samba\/sharepoints\/(?<name>[^/]+)\/?$/,handler:({state,params})=>{const n=decodeURIComponent(params.name);state.sambaShares=state.sambaShares.filter((s:Record<string, unknown>)=>s.name!==n);return {data:ok(null)}}},
{method:'PUT',pattern:/^\/api\/samba\/sharepoints\/(?<name>[^/]+)\/update\/?$/,handler:()=>({data:ok(null)})},
{method:'POST',pattern:/^\/api\/dir\/(create|set)\/permissions\/?$/,handler:()=>({data:ok(null)})},
] satisfies MockRoute[];
