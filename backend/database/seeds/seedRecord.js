import mongoose from "mongoose";
import Record from "../../models/record.js";
import Parking from "../../models/parking.js";
import User from "../../models/user.js";

await mongoose.connect("mongodb://localhost:27017/parking");

try {
  const parkings = await Parking.find();
  const users = await User.find();

  if (!parkings.length) {
    throw new Error("No hay parkings");
  }
  const records = [];
  const vehicles = [
    "Nissan Versa",
    "Mazda 3",
    "Jetta",
    "Sentra",
    "Civic",
    "Corolla",
    "Aveo",
    "March",
    "Rio",
    "Mustang"
  ];

  for (let i = 1; i <= 2000; i++) {
    const parking = parkings[Math.floor(Math.random() * parkings.length)];
    const user = users[Math.floor(Math.random() * users.length)];

    const daysAgo = Math.floor(Math.random() * 90);

    const entryTime = new Date();
    entryTime.setDate(entryTime.getDate() - daysAgo);

    entryTime.setHours(
      Math.floor(Math.random() * 24),
      Math.floor(Math.random() * 60),
      0,
      0
    );

    const totalMinutes =
      Math.floor(Math.random() * 600) + 30;

    const exitTime = new Date(
      entryTime.getTime() + totalMinutes * 60000
    );

    const totalAmount =
      Math.floor(totalMinutes * 0.5);

    records.push({
      plate: `ABC${String(i).padStart(4, "0")}`,
      vehicle: vehicles[Math.floor(Math.random() * vehicles.length)],
      parking: parking._id,
      user: user?._id,
      slotCode: `A${Math.floor(Math.random() * 20) + 1}`,
      entryTime,
      exitTime,
      status: "FINISHED",
      totalMinutes,
      totalAmount
    });
  }
  await Record.insertMany(records);
  console.log("2000 records insertados");

} catch (error) {
  console.error(error);
} finally {
  await mongoose.connection.close();
}