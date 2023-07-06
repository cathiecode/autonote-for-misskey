import { call } from "@/utils";

export default function useCreateUserWithPassword() {
  return async (loginId: string, password: string) => {
    return await call("/api/auth/create-user-with-password", "POST", {
      loginId, password
    });
  };
}
