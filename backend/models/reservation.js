import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
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
    fechaInicio: {
      type: Date,
      required: true,
    },
    fechaFin: {
      type: Date,
      required: true,
    },
    estado: {
      type: String,
      enum: ["activa", "finalizada", "cancelada"],
      default: "activa",
    },
    costo: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

// Validación personalizada para evitar fechas inválidas
reservationSchema.pre("save", function (next) {
  if (this.fechaFin <= this.fechaInicio) {
    next(new Error("La fecha de fin debe ser mayor que la fecha de inicio"));
  }
  next();
});

export default mongoose.model("Reservation", reservationSchema);
