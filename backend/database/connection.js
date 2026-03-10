import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    mongoose.set('toJSON', {
      virtuals: true,
      versionKey: false,
      transform: (doc, ret) => {
        delete ret._id;
        return ret;
      }
    });

    mongoose.set('toObject', { virtuals: true });

    
    await mongoose.connect(process.env.MONGO_URL);
    console.log("DB online");

  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
