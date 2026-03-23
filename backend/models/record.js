import mongoose from "mongoose";

const recordSchema = new mongoose.Schema({
  plate: {
    type: String,
    required: true,
    uppercase: true,
  },

  vehicle: {
    type: String,
    required: true,
  },

  parking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Parking",
    required: true,
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  entryTime: {
    type: Date,
    required: true,
    default: Date.now,
  },

  exitTime: {
    type: Date,
  },

  status: {
    type: String,
    enum: ["ACTIVE", "FINISHED", "CANCELLED"],
    default: "ACTIVE",
  },

  totalMinutes: Number,
  totalAmount: Number,

  reservation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reservation",
  }
}, { timestamps: true });

export default mongoose.model("Record", recordSchema);
