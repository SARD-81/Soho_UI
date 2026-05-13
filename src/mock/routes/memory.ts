import { ok } from '../mockUtils';import type { MockRoute } from '../mockAdapter';
export default [{ method: 'GET', pattern: /^\/api\/(system\/)?memory\/?$/, handler: ({ state }) => ({ data: ok(state.memory) }) }] satisfies MockRoute[];
