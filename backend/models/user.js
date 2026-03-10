import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    rol: {
      type: String,
      enum: ["admin", "cliente"],
      default: "cliente",
    },
    google: {
      type: Boolean,
      default: false,
    },
    favoritos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Parking",
      },
    ],
    activo: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
