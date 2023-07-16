import { getController } from "@/backend/main";
import { NextApiRequest, NextApiResponse } from "next";
import { Response, errorResponse } from "./types";
import { UNAUTHORIZED, UNAUTHORIZED_EXPIRED_SESSION } from "@/error";

export default async function requiresUserId<T>(req: NextApiRequest, res: NextApiResponse<Response<T>>): Promise<string | undefined> {
  const session = req.cookies["session"];

  if (!session) {
    res.status(405).json(errorResponse(UNAUTHORIZED));
    return;
  }

  const userId = (await (await getController()).getCurrentUser(session))?.userId;

  if (!userId) {
    res.status(405).json(errorResponse(UNAUTHORIZED_EXPIRED_SESSION));
    return;
  }

  return userId;
}
