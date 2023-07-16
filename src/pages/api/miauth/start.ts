import { NextApiRequest, NextApiResponse } from "next";

import { Response, errorResponse, okResponse } from "@/api_helpers/types";
import requiresUserId from "@/api_helpers/userId";
import { BAD_REQUEST_BODY, BAD_REQUEST_METHOD } from "@/error";
import { getController } from "@/backend/main";
import Ajv, { JSONSchemaType } from "ajv";

export type Input = {
  instance: string
}
export type Output = null;

const ajv = new Ajv();

const inputSchema: JSONSchemaType<Input> = {
  type: "object",
  properties: {
    instance: {type: "string"},
  },
  required: ["instance"],
  additionalProperties: false
};

const validateInput = ajv.compile(inputSchema);

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse<Response<Output>>
) {
  if (req.method && req.method !== "POST") {
    res.status(405).json(errorResponse(BAD_REQUEST_METHOD));
    return;
  }

  const userId = await requiresUserId(req, res);

  if (!userId) {
    return;
  }

  if (!validateInput(req.body)) {
    res.status(403).json(errorResponse(BAD_REQUEST_BODY));
    return;
  }

  const result = await (await getController()).startMiAuth(userId, req.body.instance);

  res.status(302).setHeader("Location", result.redirect).end();
}
