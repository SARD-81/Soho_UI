import { isAxiosError } from 'axios';

const extractMessageFromResponse = (responseData: unknown) => {
  if (!responseData || typeof responseData !== 'object') return undefined;

  const detail = (responseData as { detail?: unknown }).detail;
  if (typeof detail === 'string' && detail.trim().length > 0) {
    return detail;
  }

  const message = (responseData as { message?: unknown }).message;
  if (typeof message === 'string' && message.trim().length > 0) {
    return message;
  }

  const nestedError = (responseData as { error?: unknown }).error;
  if (nestedError && typeof nestedError === 'object') {
    const nestedMessage = (nestedError as { message?: unknown }).message;
    if (typeof nestedMessage === 'string' && nestedMessage.trim().length > 0) {
      return nestedMessage;
    }

    const nestedDetail = (nestedError as { detail?: unknown }).detail;
    if (typeof nestedDetail === 'string' && nestedDetail.trim().length > 0) {
      return nestedDetail;
    }
  }

  return undefined;
};

const extractCodeFromResponse = (responseData: unknown) => {
  if (!responseData || typeof responseData !== 'object') return undefined;

  const code = (responseData as { code?: unknown }).code;
  if (typeof code === 'string' && code.trim().length > 0) {
    return code;
  }

  const nestedError = (responseData as { error?: unknown }).error;
  if (nestedError && typeof nestedError === 'object') {
    const nestedCode = (nestedError as { code?: unknown }).code;
    if (typeof nestedCode === 'string' && nestedCode.trim().length > 0) {
      return nestedCode;
    }
  }

  return undefined;
};

export const extractApiErrorMessage = (error: unknown, fallback: string) => {
  if (isAxiosError(error)) {
    const responseData = error.response?.data;
    const message = extractMessageFromResponse(responseData);
    if (message) {
      return message;
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallback;
};

export const logApiErrorDetails = (error: unknown) => {
  if (!isAxiosError(error)) return;

  const responseData = error.response?.data;
  const code = extractCodeFromResponse(responseData) ?? 'unknown';
  const message = extractMessageFromResponse(responseData) ?? 'unknown error';

  console.error(`[API Error] code: ${code}, message: ${message}`);
};

export default extractApiErrorMessage;