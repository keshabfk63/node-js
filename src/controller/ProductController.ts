import { type NextFunction, type Request, type Response } from "express";
import productSvc from "../services/Product.service";
import slugify from "slugify";
import { ImageMap } from "../utilities/Helper";
import productModel from "../model/product/ProductModel";

type filterType =
  | string
  | Record<string, string>
  | RegExp
  | Array<Record<string, string | RegExp>>;

class ProductController {
  async addProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      data.slug = await productSvc.checkUniqueSlug(
        slugify(data.name, {
          lower: true,
          replacement: "-",
          trim: true,
          remove: /[*+~.()'"!:@]/g,
        }),
      );
      //FE if is in Rupees-> store it in paisa
      data.price = data.price * 100;
      data.afterDiscount = data.price - (data.price * data.discount) / 100;
      data.seller = data.seller ?? req.loggedInUser?._id;
      data.status = "active";
      data.createdBy = req.loggedInUser?._id;

      if (req.files) {
        const files = req.files as unknown as Array<Express.Multer.File>;
        data.images = data.images || [];

        files.map((image: Express.Multer.File) => {
          data.images.push(ImageMap(image, req, "products"));
        });
      }
      if (!data.category || data.category === "null") {
        data.category = null;
      }
      //data entry
      const product = new productModel(data);
      await product.save();

      res.json({
        data: product,
        message: "product created",
        meta: null,
      });
    } catch (exception) {
      next(exception);
    }
  }

  async listAllProducts(req: Request, res: Response, next: NextFunction) {
    try {
      let filter: Record<string, filterType> = {};

      //list by seller-only products created by seller
      if (req.loggedInUser?.role === "seller") {
        filter = {
          seller: req.loggedInUser._id.toString(),
        };
      }

      if (req.query.search) {
        filter = {
          ...filter,
          $or: [
            { category: new RegExp(req.query.search as string, "i") },
            { brand: new RegExp(req.query.search as string, "i") },
            { name: new RegExp(req.query.search as string, "i") },
            { description: new RegExp(req.query.search as string, "i") },
          ],
        };
      }
      if (req.query.status) {
        filter = {
          ...filter,
          status: req.query.status as string,
        };
      }

      const page = Number(req.query.page || 1);
      const limit = Number(req.query.limit || 20);
      const skip = (page - 1) * limit;

      const data = await productModel
        .find(filter)
        .populate("categoryId", [
          "_id",
          "name",
          "description",
          "image",
          "status",
        ])
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
        data: data,
        message: "product list",
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

  async homeListAllProduct(req: Request, res: Response, next: NextFunction) {
    try {
      let filter: Record<string, filterType> = {};
      status: "active";

      if (req.query.search) {
        filter = {
          ...filter,

          $or: [
            { category: new RegExp(req.query.search as string, "i") },
            { brand: new RegExp(req.query.search as string, "i") },
            { name: new RegExp(req.query.search as string, "i") },
            { description: new RegExp(req.query.search as string, "i") },
          ],
        };
      }
      const page = Number(req.query.page || 1);
      const limit = Number(req.query.limit || 10);
      const skip = (page - 1) * limit;

      const data = await productModel
        .find(filter)
        .populate("seller", [
          "_id",
          "name",
          "email",
          "role",
          "image",
          "address",
        ])
        .sort({ createAt: "desc" })
        .skip(skip)
        .limit(limit);
      const count = await productModel.countDocuments(filter);
      res.json({
        data: data,
        message: "product list",
        meta: {
          pagination: {
            page: page,
            count: count,
            limit: limit,
            pages: Math.ceil(count / limit),
          },
        },
      });
    } catch (exception) {
      next(exception);
    }
  }

  async getProductDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = req.params.productId;
      let filter: Record<string, filterType> = {
        _id: productId.toString(),
      };
      if (req.loggedInUser?.role === "seller") {
        filter = {
          $or: [
            { seller: req.loggedInUser?._id.toString() },
            { createdBy: req.loggedInUser?._id.toString() },
          ],
        };
      }
      const detail = await productModel
        .findOne(filter)
        .populate("seller", [
          "_id",
          "name",
          "email",
          "address",
          "image",
          "role",
        ]);
      res.json({
        data: detail,
        message: "Product Detail",
        meta: null,
      });
    } catch (exception) {
      next(exception);
    }
  }
  async updateProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = req.params.productId;
      let filter: Record<string, filterType> = {
        _id: productId.toString(),
      };
      if (req.loggedInUser?.role === "seller") {
        filter = {
          $or: [
            { seller: req.loggedInUser?._id.toString() },
            { createdBy: req.loggedInUser?._id.toString() },
          ],
        };
      }
      const detail = await productModel.findOne(filter);
      if (!detail) {
        throw { code: 422, message: "Product not found" };
      }

      const data = req.body;
      data.price = data.price * 100;
      data.afterDiscount = data.price - (data.price * data.discount) / 100;
      data.seller = data.seller ?? req.loggedInUser?._id;
      data.status = "active";
      data.updatedBy = req.loggedInUser?._id;
      data.images = detail.images;

      if (req.files) {
        const files = req.files as unknown as Array<Express.Multer.File>;
        files.map((image: Express.Multer.File) => {
          data.images.push(ImageMap(image, req, "products/"));
        });
      }

      const product = await productModel.findOneAndUpdate(
        { _id: detail._id },
        data,
        { new: true },
      );
      res.json({
        data: product,
        message: "Product Updated",
        meta: null,
      });
    } catch (exception) {
      next(exception);
    }
  }
  async deleteProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = req.params.productId;
      let filter: Record<string, filterType> = {
        _id: productId.toString(),
      };
      if (req.loggedInUser?.role === "seller") {
        filter = {
          $or: [
            { seller: req.loggedInUser?._id.toString() },
            { createdBy: req.loggedInUser?._id.toString() },
          ],
        };
      }
      let detail = await productModel.findOne(filter);
      if (!detail) {
        throw { code: 422, message: "product not found" };
      }
      detail = await productModel.findOneAndDelete({ _id: productId });
      res.json({
        data: detail,
        message: "product deleted",
        meta: null,
      });
    } catch (exception) {
      next(exception);
    }
  }
  async getProuductBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = req.params.slug;
      let filter: Record<string, filterType> = {
        slug: slug.toString(),
      };
      const detail = await productModel
        .findOne(filter)
        .populate("seller", [
          "_id",
          "name",
          "email",
          "address",
          "image",
          "role",
        ]);
      if (!detail) {
        throw { code: 422, message: "product not found" };
      }
      const recommendedProducts = await productModel
        .find({
          slug: { $ne: slug },
          $or: [{ category: detail.category }, { brand: detail.brand }],
        })
        .sort({ _id: "desc" })
        .limit(12);
      res.json({
        data: detail,
        messge: "product details",
        meta: {
          recommended: recommendedProducts,
        },
      });
    } catch (exception) {
      next(exception);
    }
  }
}

export default ProductController;
