import { controller } from "@/backend/main";
import { NextApiRequest, NextApiResponse } from "next";

import {
  BAD_REQUEST_METHOD,
  Response,
  errorResponse,
} from "@/api_helpers/types";
import requiresUserId from "@/api_helpers/userId";

type Output = {
  userId: string;
};

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse<Response<Output>>
) {
  if (req.method !== "GET") {
    res.status(405).json(errorResponse(BAD_REQUEST_METHOD));
    return;
  }

  const userId = await requiresUserId(req, res);

  if (!userId) {
    return;
  }

  res.status(200).json({
    body: {
      userId,
    },
  });
}
