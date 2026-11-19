import { IUserDetail } from "./UserDetailTypes";

declare global {
  namespace Express {
    interface Request {
      loggedInUser?: IUserDetail | null | undefined;
    }
  }
}
