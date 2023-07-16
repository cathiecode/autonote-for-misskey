import Ajv, { JSONSchemaType } from "ajv";
import { Response } from "./api_helpers/types";
import { CONNECTION_ERROR, ErrorCode, INVALID_RESPONSE } from "./error";

export function todo(feature: string): never {
  throw new Error(`${feature} is not implemented`);
}

export async function call<O, I = void>(
  endpoint: string,
  method: string = "GET",
  body?: I
): Promise<Response<O>> {
  let response
  try {
    response = await fetch(endpoint, {
      method: method,
      headers:
        method === "GET"
          ? {}
          : {
              "Content-Type": "application/json",
            },
      body: method === "GET" ? undefined : JSON.stringify(body),
    });
  } catch (e) {
    console.error(e);
    return resultError(CONNECTION_ERROR);
  }

  try {
    return (await response.json()) as Response<O>;
  } catch(e) {
    console.error(e);
    return resultError(INVALID_RESPONSE);
  }
}

export async function swrCall<O, I = void>(endpoint: string, method: string = "GET", body?: I): Promise<O> {
  const result = await call<O, I>(endpoint, method, body);
  if (result.ok) {
    return result.result;
  } else {
    throw result.error;
  }
}

export type Result<T, E> =
  | {
      ok: true;
      result: T;
    }
  | {
      ok: false;
      error: E;
    };

export function resultOk<T>(result: T, detail?: any) {
  return {
    ok: true as const,
    result,
    detail
  };
}

export function resultError<E = ErrorCode>(error: E, detail?: any) {
  return {
    ok: false as const,
    error,
    detail
  };
}

export function errorIfNullable<T, E = ErrorCode>
(object: T | undefined | null, error: E) {
  if (object) {
    return resultOk(object);
  }
  return resultError(error);
}

const ajv = new Ajv({allErrors: true});

export function validator<T>(schema: JSONSchemaType<T>) {
  return ajv.compile(schema);
}
