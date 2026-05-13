export const ok = (data: unknown, message = 'عملیات با موفقیت انجام شد.') => ({ ok: true, error: null, message, data });
export const fail = (error: string, status = 400) => ({ status, data: { ok: false, error, message: error, data: null } });
