import { type Request, type Response, type NextFunction } from "express";
import slugify from "slugify";
import catSev from "../services/Category.service";
import { ImageMap } from "../utilities/Helper";
import categoryModel from "../model/category/CategoryModel";
import productModel from "../model/product/ProductModel";
type filterType =
  | string
  | Record<string, string | null>
  | RegExp
  | Array<Record<string, string | RegExp>>;
export default class CategoryController {
  async addCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      data.slug = await catSev.checkUniqueSlug(
        slugify(data.name, {
          lower: true,
          replacement: "-",
          trim: true,
          remove: /[*+~.()'"!:@]/g,
        }),
      );
      if (!data.category || data.category === null) {
        data.category = null;
      }
      data.status = "active";
      data.createdBy = req.loggedInUser?._id;
      if (req.file) {
        data.image = ImageMap(req.file, req, "categories/");
      }

      const category = new categoryModel(data);
      await category.save();

      res.json({
        data: category,
        message: "Category created",
        meta: null,
      });
    } catch (exception) {
      next(exception);
    }
  }
  async listAllCategories(req: Request, res: Response, next: NextFunction) {
    try {
      let filter: Record<string, filterType> = {};
      //to list seller category only
      // if (req.loggedInUser?.role === "seller") {
      //   filter = {
      //     seller: req.loggedInUser._id.toString(),
      //   };
      // }
      if (req.query.search) {
        const safeSearch = (req.query.search as string).replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&",
        );
        const searchRegex = new RegExp(safeSearch, "i");

        filter = {
          ...filter,
          $or: [
            { category: searchRegex },
            { name: searchRegex },
            { description: searchRegex },
          ],
        };
      }
      if (req.query.status) {
        filter = { ...filter, status: req.query.status as string };
      }
      if (req.query.category) {
        filter = { ...filter, category: req.query.category as string };
      }
      const page = Number(req.query.page || 1);
      const limit = Number(req.query.limit || 20);
      const skip = (page - 1) * limit;
      const data = await categoryModel
        .find(filter)
        .populate("category", ["_id", "name", "image", "description"])
        .sort({ createdAt: "desc" })
        .skip(skip)
        .limit(limit);
      const count = await categoryModel.countDocuments(filter);
      res.json({
        data: data,
        message: "Category list",
        meta: {
          pagination: {
            page: page,
            limit: limit,
            count: count,
            pages: Math.ceil(count / limit),
          },
        },
      });
    } catch (exception) {
      next(exception);
    }
  }
  async getCategoryDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const categoryId = req.params.categoryId;

      let filter: Record<string, filterType> = {
        _id: categoryId.toString(),
      };
      if (req.loggedInUser?.role === "seller") {
        filter = {
          ...filter,
          $or: [
            { seller: req.loggedInUser?._id.toString() },
            { createBy: req.loggedInUser?._id.toString() },
          ],
        };
      }
      const detail = await categoryModel.findOne(filter);
      if (!detail) {
        throw { code: 404, message: "Category not found" };
      }
      res.json({
        data: detail,
        message: "Category Detail",
        meta: null,
      });
    } catch (exception) {
      next(exception);
    }
  }
  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const categoryId = req.params.categoryId;
      let filter: Record<string, filterType> = {
        _id: categoryId.toString(),
      };
      if (req.loggedInUser?.role === "seller") {
        filter = {
          ...filter,
          $or: [{ createdBy: req.loggedInUser?._id.toString() }],
        };
      }
      const detail = await categoryModel.findOne(filter);
      if (!detail) {
        throw { code: 404, message: "Category not found" };
      }
      const data = req.body;
      if (
        !data.category ||
        data.category === null ||
        data.category.trim() === ""
      ) {
        data.category = null;
      }
      data.updatedBy = req.loggedInUser?._id;
      data.image = detail.image;
      if (req.file) {
        data.image = ImageMap(req.file, req, "categories/");
      }

      const category = await categoryModel.findOneAndUpdate(
        { _id: detail._id },
        data,
        { returnDocument: "after" },
      );
      res.json({
        data: category,
        message: "Category Updated",
        meta: null,
      });
    } catch (exception) {
      next(exception);
    }
  }
  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const categoryId = req.params.categoryId;
      let filter: Record<string, filterType> = {
        _id: categoryId.toString(),
      };
      if (req.loggedInUser?.role === "seller") {
        filter = {
          ...filter,
          $or: [{ createdBy: req.loggedInUser?._id.toString() }],
        };
      }
      let detail = await categoryModel.findOne(filter);
      if (!detail) {
        throw { code: 404, message: "category not found" };
      }
      detail = await categoryModel.findOneAndDelete({ _id: categoryId });
      res.json({
        data: detail,
        message: "Category Deleted",
        meta: null,
      });
    } catch (exception) {
      next(exception);
    }
  }
  async homeListAllCtegories(req: Request, res: Response, next: NextFunction) {
    try {
      let filter: Record<string, filterType> = { status: "active" };
      if (req.query.search) {
        const safeSearch = (req.query.search as string).replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&",
        );
        const searchRegex = new RegExp(safeSearch, "i");
        filter = {
          ...filter,
          $or: [{ name: searchRegex }, { description: searchRegex }],
        };
      }
      if (req.query.category) {
        if (req.query.category === "top") {
          filter = {
            ...filter,
            category: { $eq: null },
          };
        } else if (req.query.category !== "all") {
          filter = { ...filter, category: req.query.category as string };
        }
      }
      const page = Number(req.query.page || 1);
      const limit = Number(req.query.limit || 20);
      const skip = (page - 1) * limit;
      const data = await categoryModel
        .find(filter)
        .populate("category", ["_id", "name", "description", "image"])
        .sort({ createdAt: "desc" })
        .skip(skip)
        .limit(limit);
      const count = await categoryModel.countDocuments(filter);
      res.json({
        data: data,
        message: "category List",
        meta: {
          pagination: {
            page: page,
            limit: limit,
            count: count,
            pages: Math.ceil(count / limit),
          },
        },
      });
    } catch (exception) {
      next(exception);
    }
  }
  async getCategoryDetailBySlug(req: Request, res: Response, next: Function) {
    try {
      const slug = req.params.slug;
      let filter: Record<string, filterType> = {
        slug: slug.toString(),
      };
      const detail = await categoryModel.findOne(filter);
      if (!detail) {
        throw { code: 404, message: "category not found" };
      }
      const recomendedCategories = await categoryModel
        .find({
          slug: { $ne: slug },
          // $or: [{ category: detail.category }],
          category: detail.category,
        })
        .sort({ _id: -1 })
        .limit(12);
      const page = Number(req.query.page || 1);
      const limit = Number(req.query.limit || 32);
      const skip = (page - 1) * limit;

      const products = await productModel
        .find({ stauts: "active", categoryId: detail._id })
        .populate("categoryId", ["_id", "name", "category", "status", "image"])
        .populate("seller", [
          "_id",
          "name",
          "email",
          "address",
          "image",
          "role",
        ])
        .sort({ createdAt: "desc" })
        .skip(skip)
        .limit(limit);
      const count = await productModel.countDocuments(filter);
      res.json({
        data: { detail, recomendedCategories, products },
        message: "Category detail",
        meta: {
          productPagination: {
            page: page,
            limit: limit,
            total: count,
            pages: Math.ceil(count / limit),
          },
        },
      });
    } catch (exception) {
      next(exception);
    }
  }
}
