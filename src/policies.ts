import { ErrorCode, ID_POLICY_ERROR, NAME_POLICY_ERROR, PASSWORD_POLICY_ERROR } from "./error";
import { Result, resultError, resultOk } from "./utils";

type Acceptable<Key extends string, T> = T & { [key in `__marked_as_${Key}`]: never }

type Policy<Key extends string, T> = {
  id: Key,
  validate: (input: T) => Result<Acceptable<Key, T>, ErrorCode>,
}

export type AcceptableId = Acceptable<"id", string>;
export const idPolicy: Policy<"id", string> = {
  id: "id",
  validate: (input: string) => {
    if (/^[a-zA-Z0-9-_]{4,50}$/.test(input)) {
      return resultOk(input as Acceptable<"id", string>);
      
    }

    return resultError(ID_POLICY_ERROR);
  }
};

export type AcceptablePassword = Acceptable<"password", string>
export const passwordPolicy: Policy<"password", string> = {
  id: "password",
  validate: (input: string) => {
    if (/^[!-~]{4,50}$/.test(input)) {
      return resultOk(input as Acceptable<"password", string>);
    }

    return resultError(PASSWORD_POLICY_ERROR);
  }
}

export type AcceptableName = Acceptable<"name", string>;
export const namePolicy: Policy<"name", string> = {
  id: "name",
  validate: (input: string) => {
    if (/<|>/.test(input)) {
      return resultError(NAME_POLICY_ERROR);
    }

    if (input.length > 128) {
      return resultError(NAME_POLICY_ERROR)
    }

    return resultOk(input as Acceptable<"name", string>);
  }
}
