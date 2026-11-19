import { type NextFunction, type Response, type Request } from "express";

export const errorHandle = (
  error: any,
  _: Request,
  res: Response,
  __: NextFunction,
) => {
  let statuscode = error?.code || error.status;
  if (typeof statuscode !== "number" || statuscode < 100 || statuscode > 999) {
    statuscode = 500;
  }
  let detail = error?.detail || error?.details || null;
  let message = error?.message || "Internal server error";

  res.status(statuscode).json({
    message: message,
    errordetail: detail,
    meta: null,
  });
};
