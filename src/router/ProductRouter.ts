import { Router } from "express";
import auth from "../middleware/AuthMiddleware";
import uploader from "../middleware/UploadMiddleware";
import ProductController from "../controller/ProductController";

const productRouter = Router();
const productCtrl = new ProductController();

productRouter.get("/all-products", productCtrl.homeListAllProduct);
productRouter.get("/:slug/detail", productCtrl.getProuductBySlug);

productRouter.get("/:productId", auth(), productCtrl.getProductDetail);
productRouter.post(
  "/addProduct",
  auth(),
  uploader("products").array("images"),
  productCtrl.addProduct,
);
productRouter.get("/", auth(), productCtrl.listAllProducts);
productRouter.put(
  "/:productId",
  auth(),
  uploader("products").array("images"),
  productCtrl.updateProductById,
);
productRouter.delete("/:productId", auth(), productCtrl.deleteProductById);

export default productRouter;
