import mongoose from "mongoose";

const cardSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    number: { type: String, required: true, trim: true },
    expiry: { type: String, required: true, trim: true },
    cvv: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Card", cardSchema);