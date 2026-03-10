import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    estacionamiento: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parking",
      required: true,
    },
    calificacion: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comentario: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ usuario: 1, estacionamiento: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);
