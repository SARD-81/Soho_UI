import type { MockRoute } from '../mockAdapter';import { ok } from '../mockUtils';
export default [
{method:'GET',pattern:/^\/api\/nfs\/shares\/?$/,handler:({state})=>({data:ok(state.nfsShares)})},
{method:'POST',pattern:/^\/api\/nfs\/shares\/?$/,handler:({state,body})=>{state.nfsShares.push(body);return {status:201,data:ok(null)}}},
{method:'PUT',pattern:/^\/api\/nfs\/shares\/update\/?$/,handler:({state,body})=>{const i=state.nfsShares.findIndex((s:Record<string, unknown>)=>s.path===body.old_path||s.path===body.path);if(i>=0)state.nfsShares[i]={...state.nfsShares[i],...body};return {data:ok(null)}}},
{method:'DELETE',pattern:/^\/api\/nfs\/shares\/delete\/?$/,handler:({state,query})=>{const p=query.get('path');state.nfsShares=state.nfsShares.filter((s:Record<string, unknown>)=>s.path!==p);return {data:ok(null)}}},
] satisfies MockRoute[];
