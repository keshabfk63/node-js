import { Router } from "express";
import auth from "../middleware/AuthMiddleware";
import uploader from "../middleware/UploadMiddleware";
import bodyValidator from "../middleware/BodyValidationMiddleware";
import { categoryDto } from "../middleware/SchemaMiddleware";
import CategoryController from "../controller/CategoryContoller";

const categoryCtrl = new CategoryController();
const categoryRouter = Router();

categoryRouter.get("/all-categories", categoryCtrl.homeListAllCtegories);
categoryRouter.get("/:slug/detail", categoryCtrl.getCategoryDetailBySlug);

categoryRouter.post(
  "/addCategory",
  auth(),
  uploader("categories/").single("image"),
  bodyValidator(categoryDto),
  categoryCtrl.addCategory,
);
categoryRouter.get("/allCategories", auth(), categoryCtrl.listAllCategories);
categoryRouter.get("/categoryDetail", auth(), categoryCtrl.getCategoryDetail);
categoryRouter.put(
  "/:categoryId",
  auth(),
  uploader("categories/").single("image"),
  bodyValidator(categoryDto),
  categoryCtrl.updateCategory,
);
categoryRouter.delete("/:categoryId", auth(), categoryCtrl.deleteCategory);

export default categoryRouter;
