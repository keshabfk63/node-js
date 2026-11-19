import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User",
    },
    token: {
      accessToken: {
        type: String,
        required: true,
      },
      refreshToken: String,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    data: String,
  },
  {
    autoCreate: true,
    autoIndex: true,
    timestamps: true,
  },
);

const sessionModel = mongoose.model("session", sessionSchema);
export default sessionModel;
