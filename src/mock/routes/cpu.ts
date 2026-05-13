import { ok } from '../mockUtils';import type { MockRoute } from '../mockAdapter';
export default [{ method: 'GET', pattern: /^\/api\/(system\/)?cpu\/?$/, handler: ({ state }) => ({ data: ok(state.cpu) }) }] satisfies MockRoute[];
