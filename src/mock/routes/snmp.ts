import type { MockRoute } from '../mockAdapter';import { ok } from '../mockUtils';
export default [
{method:'GET',pattern:/^\/api\/snmp\/info\/?$/,handler:({state})=>({data:ok(state.snmp)})},
{method:'POST',pattern:/^\/api\/snmp\/config\/?$/,handler:({state,body})=>{state.snmp={...state.snmp,...body};return {data:ok(state.snmp,'تنظیمات SNMP ذخیره شد.')};}},
] satisfies MockRoute[];
