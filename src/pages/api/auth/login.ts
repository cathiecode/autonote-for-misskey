import { controller } from "@/backend/main";
import Ajv, { JSONSchemaType } from "ajv";
import { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";

import {
  BAD_REQUEST_BODY,
  BAD_REQUEST_METHOD,
  Response,
  errorResponse,
} from "@/api_helpers/types";

const ajv = new Ajv();

export type Input = {
  loginId: string;
  password: string;
};

export type Output = {
  
}

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
  if (req.method !== "POST") {
    res.status(405).json(errorResponse(BAD_REQUEST_METHOD));
    return;
  }

  if (!validateInput(req.body)) {
    res.status(403).json(errorResponse(BAD_REQUEST_BODY));
  }

  const session = await controller.createSessionWithPasswordLogin(
    req.body.loginId,
    req.body.password
  );

  res
    .setHeader(
      "Set-Cookie",
      serialize("session", session, {
        maxAge: 60 * 24 * 10,
      })
    )
    .status(201)
    .json({ body: undefined });
}
