import { NextApiRequest, NextApiResponse } from "next";

import { Response, errorResponse, okResponse } from "@/api_helpers/types";
import requiresUserId from "@/api_helpers/userId";
import { BAD_REQUEST_METHOD } from "@/error";
import { resultOk } from "@/utils";
import { getController } from "@/backend/main";

export type Output = undefined;

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse<Response<Output>>
) {
  if (req.method && req.method !== "GET") {
    res.status(405).json(errorResponse(BAD_REQUEST_METHOD));
    return;
  }

  const userId = await requiresUserId(req, res);

  if (!userId) {
    return;
  }

  const result = await (await getController()).validateMiAuth(userId, req.query.session as string);
  
  if (!result.ok) {
    res.status(500).json(result);
    return;
  }

  res.status(200).json(resultOk(undefined));
}
