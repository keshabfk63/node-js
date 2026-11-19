import mongoose from "mongoose";
import { ImageSchema } from "../../common/Schema";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      min: 3,
      max: 160,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: mongoose.Types.ObjectId,
      ref: "Category",
      required: false,
    },
    description: {
      type: String,
      required: true,
    },
    // seller: {
    //   type: mongoose.Types.ObjectId,
    //   ref: "User",
    //   required: true,
    // },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
    image: ImageSchema,
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  { timestamps: true },
);
const categoryModel = mongoose.model("Category", categorySchema);
export default categoryModel;
