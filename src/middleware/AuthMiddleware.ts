import { type Request, type Response, type NextFunction } from "express";
import sessionModel from "../model/session/SessionModel";
import jwt from "jsonwebtoken";
import { AppConfig } from "../config/AppConfig";
import userModel from "../model/user/UserModel";
import { IUserDetail } from "../types/UserDetailTypes";
const auth = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessionId = req.cookies.userLoginCookie;
      const sessionData = await sessionModel
        .findOne({
          _id: sessionId,
          status: "active",
        })
        .populate("userId", [
          "_id",
          "name",
          "email",
          "role",
          "phone",
          "address",
        ]);
      if (!sessionData) {
        throw { code: 401, message: "session not found" };
      }
      const accessToken = sessionData.token?.accessToken;
      if (!accessToken) {
        throw { code: 401, message: "Access token not found" };
      }
      const verify = jwt.verify(
        accessToken,
        AppConfig.jwtSecret as string,
      ) as jwt.JwtPayload;
      const userDetail = await userModel.findOne(
        {
          _id: verify.sub,
        },
        { __v: 0, otp: 0, password: 0 },
      ).lean();
      if (!userDetail) {
        res.clearCookie("userLoginCookie");
        throw { code: 401, message: "user not found" };
      }
      req.loggedInUser = userDetail as unknown as IUserDetail;
      next();
    } catch (exception) {
      res.clearCookie("userLoginCookie");
      next(exception);
    }
  };
};
export default auth;
