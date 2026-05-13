import type { MockRoute } from '../mockAdapter';import { ok } from '../mockUtils';
export default [
{method:'GET',pattern:/^\/api\/system\/service\/?$/,handler:({state})=>({data:ok(state.services)})},
{method:'PUT',pattern:/^\/api\/system\/service\/(?<serviceName>[^/]+)\/control\/?$/,handler:({state,params,body})=>{const s=state.services.find((x:Record<string, unknown>)=>x.name===decodeURIComponent(params.serviceName));if(s){const action=body?.action;s.active=action!=='stop';s.status=s.active?'running':'stopped';}return {data:ok(null,'وضعیت سرویس به‌روزرسانی شد.')};}},
] satisfies MockRoute[];
