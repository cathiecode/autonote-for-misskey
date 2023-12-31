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
  }

  const session = await (
    await getController()
  ).createSessionWithPasswordLogin(req.body.loginId, req.body.password);

  if (!session.ok) {
    res.status(403).json(errorResponse(session.error));
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
