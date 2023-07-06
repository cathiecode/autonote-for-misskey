import { Response } from "@/api_helpers/types";
import { CONNECTION_ERROR, ErrorCode } from "@/error";
import { Input, Output } from "@/pages/api/auth/login";
import { Result, call } from "@/utils";
import { ok } from "assert";
import axios from "axios";

export default function usePasswordLogin() {
  return async (loginId: string, password: string): Promise<Result<void, ErrorCode>> => {
    return await call<Output, Input>("/api/auth/login", "POST", {
      loginId, password
    });
  };
}
