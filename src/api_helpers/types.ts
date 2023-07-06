import { ErrorCode } from "@/error";
import { Result } from "@/utils";

export type Response<T> = Result<T, ErrorCode>

export function okResponse<T>(body: T): Response<T> {
  return {
    ok: true,
    result: body
  };
}

export function errorResponse<T>(code: string): Response<T> {
  return {
    ok: false,
    error: code,
  };
}
