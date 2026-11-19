import mongoose from "mongoose";
import { ImageSchema } from "../../common/Schema";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      min: 2,
      max: 50,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["admin", "customer"],
      default: "customer",
    },
    address: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
    img: ImageSchema,
    activated: { type: Boolean, default: false },
    otp: String,
    timeExpiry: Date,
  },
  {
    autoCreate: true,
    autoIndex: true,
    timestamps: true,
  },
);

const userModel = mongoose.model("User", userSchema);
export default userModel;
