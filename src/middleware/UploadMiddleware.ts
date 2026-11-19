import multer from "multer";
import fs from "node:fs";

const uploader = (dir = "/") => {
  const myStorage = multer.diskStorage({
    destination(_, __, callback) {
      const uploadDir = "./public/uploads" + dir;
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      callback(null, uploadDir);
    },
    filename(_, file, callback) {
      const filename = Date.now() + "-" + file.originalname;
      callback(null, filename);
    },
  });
  return multer({
    storage: myStorage,
    fileFilter(_, file, callback) {
      const ext = file.originalname.split(".").pop() as string;
      const allowedExt = ["jpg", "jpeg", "png", "webp", "gif", "svg", "bmp"];
      if (allowedExt.includes(ext?.toLowerCase())) {
        callback(null, true);
      } else {
        callback(new Error("File format not supported"));
      }
    },
    limits: {
      fileSize: 3000000,
    },
  });
};
export default uploader;
