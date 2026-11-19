import { Router } from "express";
import userRouter from "./UserRouter";
import productRouter from "./ProductRouter";
import categoryRouter from "./CategoryRouter";

const mainRouter = Router();
mainRouter.use("/user", userRouter);
mainRouter.use("/product", productRouter);
mainRouter.use("/category", categoryRouter);
export default mainRouter;
