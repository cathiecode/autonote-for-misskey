import { getController } from "@/backend/main";
import Ajv, { JSONSchemaType } from "ajv";
import { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";

import {
  Response,
  errorResponse,
  okResponse,
} from "@/api_helpers/types";
import { BAD_REQUEST_BODY, BAD_REQUEST_METHOD } from "@/error";
import { idPolicy, namePolicy, passwordPolicy } from "@/policies";

const ajv = new Ajv();

export type Input = {
  loginId: string;
  password: string;
};

export type Output = undefined;

const schema: JSONSchemaType<Input> = {
  type: "object",
  properties: {
    loginId: { type: "string" },
    password: { type: "string" },
  },
  required: ["loginId", "password"],
  additionalProperties: false,
};

const validateInput = ajv.compile(schema);

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse<Response<undefined>>
) {
  if (req.method && req.method !== "POST") {
    res.status(405).json(errorResponse(BAD_REQUEST_METHOD));
    return;
  }

  if (!validateInput(req.body)) {
    res.status(403).json(errorResponse(BAD_REQUEST_BODY));
    return;
  }

  const loginIdAsId = idPolicy.validate(req.body.loginId);
  const loginIdAsName = namePolicy.validate(req.body.loginId);
  const password = passwordPolicy.validate(req.body.password);

  if (!loginIdAsId.ok) {
    res.status(400).json(loginIdAsId);
    return;
  }

  if (!loginIdAsName.ok) {
    res.status(400).json(loginIdAsName);
    return;
  }

  if (!password.ok) {
    res.status(400).json(password);
    return;
  }

  const session = await (
    await getController()
  ).createUserWithPasswordAuth(loginIdAsName.result, loginIdAsId.result, password.result);

  if (!session.ok) {
    res.status(403).json(session);
    return;
  }

  res
    .setHeader(
      "Set-Cookie",
      serialize("session", session.result, {
        maxAge: 60 * 24 * 10,
        path: "/api"
      })
    )
    .status(201)
    .json(okResponse(undefined));
}
