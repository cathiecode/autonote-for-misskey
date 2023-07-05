import { controller } from "@/backend/main";
import { NextApiRequest, NextApiResponse } from "next";
import { Response, UNAUTHORIZED, errorResponse } from "./types";

export default async function requiresUserId<T>(req: NextApiRequest, res: NextApiResponse<Response<T>>): Promise<string | undefined> {
  const session = req.cookies["session"];

  if (!session) {
    res.status(405).json(errorResponse(UNAUTHORIZED));
    throw new Error("Failed to get session");
  }

  return (await controller.getCurrentUser(session))?.userId;
}
