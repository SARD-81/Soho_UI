import { ok } from '../mockUtils';import type { MockRoute } from '../mockAdapter';
export default [
{ method: 'GET', pattern: /^\/api\/net\/?$/, handler: ({ state }) => ({ data: ok(state.network) }) },
{ method: 'GET', pattern: /^\/api\/system\/network\/?$/, handler: ({ state }) => ({ data: ok({ count: state.network.names.length, names: state.network.names }) }) },
{ method: 'GET', pattern: /^\/api\/system\/network\/(?<name>[^/]+)\/?$/, handler: ({ state, params }) => ({ data: ok(state.network.details[params.name] ?? {}) }) },
] satisfies MockRoute[];
