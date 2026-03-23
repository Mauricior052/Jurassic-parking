import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    parking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parking",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "FINISHED", "CANCELLED"],
      default: "ACTIVE",
    },
    cost: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

// Custom validation to prevent invalid dates
reservationSchema.pre("save", function (next) {
  if (this.endDate <= this.startDate) {
    next(new Error("The end date must be after the start date"));
  }
  next();
});

export default mongoose.model("Reservation", reservationSchema);