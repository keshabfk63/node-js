import { Router } from "express";
import AuthController from "../controller/AuthController";
import uploader from "../middleware/UploadMiddleware";
import bodyValidator from "../middleware/BodyValidationMiddleware";
import auth from "../middleware/AuthMiddleware";
import {
  LoginValidator,
  otpVerify,
  registerSchema,
} from "../middleware/SchemaMiddleware";

const userRouter = Router();
const authControl = new AuthController();
userRouter.post(
  "/register",
  uploader("/userImages").single("image"),
  bodyValidator(registerSchema),
  authControl.register,
);
userRouter.post(
  "/register-otp-verify",
  bodyValidator(otpVerify),
  authControl.otpVerifyRegister,
);
userRouter.post("/login", bodyValidator(LoginValidator), authControl.login);
userRouter.get("/profile",auth(),authControl.getUserProfile);
userRouter.post("/logout",auth(),authControl.logOut);
export default userRouter;
