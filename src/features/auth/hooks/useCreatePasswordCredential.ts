export default function useCreatePasswordCredential() {
  return (loginId: string, password: string) => {
    fetch("/api/auth/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        loginId,
        password,
      }),
    });
  };
}
