import crypto from "crypto";
import { type Request } from "express";
import { AppConfig } from "../config/AppConfig";
import path from "node:path";
export const ImageMap = (
  image: Express.Multer.File,
  req: Request,
  dir = "/",
) => {
  //ensure that dir starts and ends with single slash(eg:/user/)
  let cleanDir = dir.startsWith("/") ? dir : `/${dir}`;
  if (!cleanDir.endsWith("/")) {
    cleanDir = `${cleanDir}/`;
  }
  return {
    url: `${AppConfig.getImageUrl(req)}${cleanDir}${image.filename}`,
    path: path.resolve(image.destination, image.filename),
    filename: image.filename,
    type: image.mimetype,
    size: image.size,
  };
};

export const generateOtp = (len: number = 6): string => {
  const maxLimit = Math.pow(10, len);
  let otp = crypto.randomInt(0, maxLimit).toString().padStart(len, "0");
  return otp;
};
