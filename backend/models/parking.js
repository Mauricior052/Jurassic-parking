import mongoose from "mongoose";

const parkingSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    direccion: {
      type: String,
      required: true,
    },
    coordenadas: {
      type: [Number], // [longitud, latitud]
      required: true,
    },
    precio: {
      type: Number,
      required: true,
      min: 0,
    },
    totalEspacios: {
      type: Number,
      required: true,
      min: 1,
    },
    espaciosDisponibles: {
      type: Number,
      required: true,
      min: 0,
    },
    seguridad: {
      type: Boolean,
      default: false,
    },
    horario: {
      apertura: {
        type: String,
      },
      cierre: {
        type: String,
      },
    },
    propietario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    calificacion: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// const cercanos = await Parking.find({
//   coordenadas: {
//     $near: {
//       $geometry: {
//         type: "Point",
//         coordinates: [-103.34, 20.67] // Tu ubicación actual [lng, lat]
//       },
//       $maxDistance: 1000 // Distancia en metros
//     }
//   }
// });

// Índice geoespacial
parkingSchema.index({ coordenadas: "2dsphere" });

export default mongoose.model("Parking", parkingSchema);
