import { NextApiRequest, NextApiResponse } from "next";

import { Response, errorResponse, okResponse } from "@/api_helpers/types";
import requiresUserId from "@/api_helpers/userId";
import { BAD_REQUEST_METHOD } from "@/error";
import { resultError, resultOk } from "@/utils";
import { getController } from "@/backend/main";
import { IToken } from "@/backend/token";

export type Output = {
  list: IToken[]
};

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

  const result = await (await getController()).getTokenList(userId);

  res.status(200).json(resultOk({list: result}));
}
