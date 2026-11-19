import "dotenv/config";
import express, {
  type NextFunction,
  type Application,
  type Request,
  type Response,
} from "express";
import mainRouter from "./router/MainRouter";
import "./config/MongoDb";
import { errorHandle } from "./middleware/ErrorHandlingMiddleware";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "node:path";

const app: Application = express();

const allowedDomain=["http://localhost:3000"];

app.use(cors({
  optionsSuccessStatus:200,
  credentials:true,
  origin:function(origin,cb){
    if(!origin){
      return cb(null,true);
    }
    if(allowedDomain.includes(origin as string)){
      return cb(null,true);
    }else{
      return cb(new Error("CORS not allowed"))
    }

  }

}))

app.use(cookieParser());
app.use(express.json());
app.use(express.static("public"));
app.use("/assets",express.static(path.join(process.cwd(),"public/uploads")));
app.use("/", mainRouter);

//adding 404 route
app.use((_: Request, __: Response, next: NextFunction) => {
  next({ code: 404, message: "Resource not found" });
});

app.use(errorHandle);

export default app;
