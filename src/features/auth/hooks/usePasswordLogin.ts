import { Response } from "@/api_helpers/types";
import { CONNECTION_ERROR } from "@/error";
import { Input, Output } from "@/pages/api/auth/login";
import { call } from "@/utils";
import { ok } from "assert";
import axios from "axios";

export default function usePasswordLogin() {
  return async (loginId: string, password: string) => {
    await call<Input, Output>("/api/auth/login", "POST", {
      loginId, password
    });
  };
}
