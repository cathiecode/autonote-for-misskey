import { Response } from "./api_helpers/types";
import { CONNECTION_ERROR } from "./error";

export function todo(feature: string): never {
  throw new Error(`${feature} is not implemented`);
}

export async function call<I, O>(endpoint: string, method: string = "GET", body?: I): Promise<Response<O> | {error: string}> {
  const response = await fetch(endpoint, {
    method: method,
    headers: method === "GET" ? {} : {
      "Content-Type": "application/json",
    },
    body: method === "GET" ? undefined : JSON.stringify(body),
  });


  if (!response.ok) {
    return {
      error: CONNECTION_ERROR
    }
  }

  return await response.json() as Response<O>;
}