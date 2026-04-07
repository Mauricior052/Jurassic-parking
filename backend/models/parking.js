import mongoose from "mongoose";

const parkingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true
      }
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    totalSpaces: {
      type: Number,
      required: true,
      min: 1,
    },
    security: {
      type: Boolean,
      default: false,
    },
    schedule: {
      opening: {
        type: String,
      },
      closing: {
        type: String,
      },
      days: {
        type: [String],
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

parkingSchema.index({ location: "2dsphere" });

export default mongoose.model("Parking", parkingSchema);