import { type NextFunction, type Request, type Response } from "express";
import { generateOtp, ImageMap } from "../utilities/Helper";
import bcrypt from "bcryptjs";
import userModel from "../model/user/UserModel";
import EmailService from "../services/EmailService";
import jwt from "jsonwebtoken";
import { AppConfig } from "../config/AppConfig";
import sessionModel from "../model/session/SessionModel";
class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = { ...req.body };

      if (req.file) {
        data.img = ImageMap(req.file, req, "/userImages");
      }
      data.role=data.role||"customer";
      data.password = bcrypt.hashSync(data.password, 12);
      //activation process
      data.status = "inactive";
      data.activated = false;
      data.otp = generateOtp();

      const userData = new userModel(data);
      await userData.save();
      //smtp feature
      const emailService = new EmailService();
      await emailService.sendEmail({
        to: userData.email,
        subject: "Activate your account!!!",
        message: `<h1>Welcome!</h1><p>your account activation code is :<strong>${userData.otp}</strong></p>`,
      });

      res.status(200).json({
        data: null,
        message: "User Register sucessfully",
        meta: null,
      });
    } catch (e) {
      next(e);
    }
  }
  async otpVerifyRegister(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp } = req.body;
      const userDetail = await userModel.findOne({
        email: email,
      });
      if (!userDetail) {
        throw { code: 422, message: "user not found" };
      }
      if (userDetail.otp !== otp) {
        throw {
          code: 400,
          message: "Otp not verified",
          details: { otp: "otp does not match" },
        };
      }
      if (userDetail.activated === true) {
        throw { code: 422, message: "user already activated" };
      }
      ((userDetail.otp = null),
        (userDetail.status = "active"),
        (userDetail.activated = true));

      await userDetail.save();
      res.status(200).json({
        data: null,
        message: "User Activated",
        meta: null,
      });
    } catch (exception) {
      next(exception);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const userDetail = await userModel.findOne({ email });
      if (!userDetail) {
        throw { code: 422, message: "user does not exist" };
      }
      if (userDetail.status === "inactive" || userDetail.activated === false) {
        throw { code: 422, message: "your account is not activated" };
      }
      if (!bcrypt.compareSync(password, userDetail.password)) {
        throw { code: 422, message: "credentails does not match" };
      }

      const accessLogin = jwt.sign(
        { sub: userDetail.id },
        AppConfig.jwtSecret as string,
        { expiresIn: "8h" },
      );
      const session = new sessionModel({
        userId: userDetail.id,
        token: {
          accessToken: accessLogin,
        },
        status: "active",
        data: JSON.stringify({ device: "web" }),
      });
      await session.save();
      res.cookie("userLoginCookie", session._id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 8 * 60 * 60 * 1000,
      });
      res.status(200).json({
        data: {
          sessionId: session._id,
          _id: userDetail.id,
          name: userDetail.name,
          email: userDetail.email,
          role: userDetail.role,
          status: userDetail.status,
        },
        message: "login sucess",
        meta: "null",
      });
    } catch (exception) {
      next(exception);
    }
  }
  async getUserProfile(req:Request,res:Response,next:NextFunction){
    try{
      res.json({
        data:req.loggedInUser,
        message:"your account details",
        meta:null
      })
    }catch(exception){
      next(exception);
    }
  }
  async logOut(req:Request,res:Response,next:NextFunction){
    try {
      const sessionId=req.cookies.userLoginCookie;
      if(sessionId){
        await sessionModel.findByIdAndUpdate(sessionId, {status:"inactive"});
      }
      res.clearCookie("userLoginCookie");
      res.status(200).json({
        data:null,
        message:"Logged out sucessfull",
        meta:null
      })
    } catch (exception) {
      next(exception);
      
    }
  }
}
export default AuthController;
