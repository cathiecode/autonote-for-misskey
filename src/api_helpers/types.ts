export type Response<T> = { error: string } | { error?: null; body: T };

export function errorResponse(code: string): { error: string } {
  return {
    error: code,
  };
}

export const BAD_REQUEST_METHOD = "BAD_REQUEST_METHOD";
export const BAD_REQUEST_BODY = "BAD_REQUEST_BODY";
export const UNAUTHORIZED = "UNAUTHORIZED";
export const FORBIDDEN = "FORBIDDEN";
