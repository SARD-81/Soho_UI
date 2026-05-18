import { ok } from '../mockUtils';import type { MockRoute } from '../mockAdapter';
export default [
{ method: 'GET', pattern: /^\/api\/net\/?$/, handler: ({ state }) => ({ data: ok(state.network) }) },
{ method: 'GET', pattern: /^\/api\/system\/network\/?$/, handler: ({ state }) => { const network = state.network as { names?: unknown[] }; const names = Array.isArray(network.names) ? network.names : []; return { data: ok({ count: names.length, names }) }; } },
{ method: 'GET', pattern: /^\/api\/system\/network\/(?<name>[^/]+)\/?$/, handler: ({ state, params }) => { const network = state.network as { details?: Record<string, unknown> }; return { data: ok(network.details?.[params.name] ?? {}) }; } },
] satisfies MockRoute[];
