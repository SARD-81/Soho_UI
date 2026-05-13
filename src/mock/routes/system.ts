import type { MockRoute } from '../mockAdapter';import { ok } from '../mockUtils';
export default [
{method:'GET',pattern:/^\/api\/system\/info\/?$/,handler:({state})=>({data:state.systemInfo})},
{method:'POST',pattern:/^\/api\/system\/ui-user\/logout\/?$/,handler:()=>({data:ok(null,'خروج انجام شد.')})},
{method:'GET',pattern:/^\/api\/system\/power\/execute\/?$/,handler:({query})=>({data:{status:'ok',message:`${query.get('action')==='reboot'?'راه‌اندازی مجدد':'خاموش‌سازی'} شبیه‌سازی شد.`}})},
] satisfies MockRoute[];
