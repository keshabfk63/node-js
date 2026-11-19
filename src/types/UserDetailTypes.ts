import mongoose from "mongoose";

interface IImage {
  url: string;
  path: string;
  filename: string;
  type: string;
  size: string;
}
export interface IUserDetail {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: string;
  address?: string;
  status: string;
  img: IImage;
  activated: Boolean;
}
