import { type Request, type Response, type NextFunction } from "express";
import z, { ZodObject } from "zod";

const bodyValidator = (schema: ZodObject) => {
  return async (req: Request, _: Response, next: NextFunction) => {
    try {
      const data = req.body;
      if (!data || Object.keys(data).length === 0) {
        throw { code: 422, message: "Data not provided" };
      }
      const verifiedData = await schema.parseAsync(data);
      req.body = verifiedData;
      next();
    } catch (exception: any) {
      if (exception instanceof z.ZodError) {
        // console.log(exception.issues);
        let errorBag: Record<string, unknown> = {};
        exception.issues.map((err) => {
          let key = err.path.join(".");
          errorBag[key] = err.message;
        });
        return next({
          code: 422,
          message: "validation failed",
          detail: errorBag,
        });
      }
      next(exception);
    }
  };
};
export default bodyValidator;
