import mongoose from "mongoose";

const slotSchema = new mongoose.Schema({
  code:  { type: String, required: true },
  x:     { type: Number, required: true },
  y:     { type: Number, required: true },
  angle: { type: Number, default: 0 }
}, { _id: false });

const parkingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }
    },
    price: { type: Number, required: true, min: 0 },
    totalSpaces: { type: Number, required: true, min: 1 },
    security: { type: Boolean, default: false },
    schedule: {
      opening: String,
      closing: String,
      days: {
        type: [String],
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      },
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    active: { type: Boolean, default: true },

    viewBox: { type: String, default: '0 0 600 600' },
    slots:   { type: [slotSchema], default: [] }
  },
  { timestamps: true }
);

parkingSchema.index({ location: "2dsphere" });

export default mongoose.model("Parking", parkingSchema);