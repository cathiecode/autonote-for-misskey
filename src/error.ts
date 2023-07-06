export const CONNECTION_ERROR = "CONNECTION_ERROR";
export const BAD_REQUEST_METHOD = "BAD_REQUEST_METHOD";
export const BAD_REQUEST_BODY = "BAD_REQUEST_BODY";
export const UNAUTHORIZED = "UNAUTHORIZED";
export const UNAUTHORIZED_EXPIRED_SESSION = "UNAUTHORIZED_EXPIRED_SESSION";
export const FORBIDDEN = "FORBIDDEN";
//export const INVALID_CREDENTIAL = "INVALID_CREDENTIAL";
export const NO_SUCH_USER = "NO_SUCH_USER";
export const INVALID_PASSWORD = "INVALID_PASSWORD";
export const INVALID_RESPONSE = "INVALID_RESPONSE";
export const APPLICATION_ERROR = "APPLICATION_ERROR";
export const LOGINID_ALREADY_TAKEN = "LOGINID_ALREADY_TAKEN";
export const PASSWORD_ALREADY_REGISTERED = "PASSWORD_ALREADY_REGISTERED";

export const ID_POLICY_ERROR = "ID_POLICY_ERROR";
export const PASSWORD_POLICY_ERROR = "PASSWORD_POLICY_ERROR";
export const NAME_POLICY_ERROR = "NAME_POLICY_ERROR";

export type ErrorCode = string;

const japaneseError: Record<ErrorCode, string> = {
  [CONNECTION_ERROR]: "接続に問題が発生しました。",
  [BAD_REQUEST_METHOD]: "アプリケーションに問題があります。",
  [BAD_REQUEST_BODY]: "アプリケーションに問題があります。",
  [UNAUTHORIZED]: "ログインする必要があります。",
  [FORBIDDEN]: "ログインする必要があります。",
  [NO_SUCH_USER]: "指定されたユーザーは存在しません。",
  [INVALID_PASSWORD]: "パスワードに誤りがあります。",
  [INVALID_RESPONSE]: "アプリケーションに問題があります。",
  [APPLICATION_ERROR]: "アプリケーションに問題があります。",
  [LOGINID_ALREADY_TAKEN]: "そのログインIDはすでに使用されています",
  [PASSWORD_ALREADY_REGISTERED]: "アプリケーションに問題があります。"
}

export function humanReadable(errorCode: ErrorCode) {
  return japaneseError[errorCode] ?? "エラーが発生しました";
}
