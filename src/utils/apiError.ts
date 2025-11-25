import { isAxiosError } from 'axios';

export const extractApiErrorMessage = (error: unknown, fallback: string) => {
  if (isAxiosError(error)) {
    const responseData = error.response?.data;
    if (responseData && typeof responseData === 'object') {
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
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallback;
};

export default extractApiErrorMessage;