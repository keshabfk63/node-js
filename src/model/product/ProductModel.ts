import mongoose from "mongoose";
import { ImageSchema } from "../../common/Schema";
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      min: 3,
      max: 160,
      required: true,
    },
    slug: {
      type: String,
      requried: true,
      unique: true,
    },
    category: {
      type: String,
      required: true,
    },
    categoryId: {
      type: mongoose.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    images: [ImageSchema],
    //price should be always kept in paisa format
    price: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    afterDiscount: {
      type: Number,
      required: true,
    },
    brand: {
      type: String,
    },
    seller: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updateBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  {
    timestamps: true,
  },
);
const productModel = mongoose.model("Product", productSchema);
export default productModel;
