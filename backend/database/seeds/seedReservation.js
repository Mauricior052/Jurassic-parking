import mongoose from "mongoose";

import Reservation from "../../models/reservation.js";
import User from "../../models/user.js";
import Parking from "../../models/parking.js";

await mongoose.connect("mongodb://localhost:27017/parking");

try {

  const users = await User.find();
  const parkings = await Parking.find();

  if (!users.length) {
    throw new Error("No hay usuarios");
  }

  if (!parkings.length) {
    throw new Error("No hay parkings");
  }

  const reservations = [];

  for (let i = 1; i <= 2000; i++) {

    const user =
      users[Math.floor(Math.random() * users.length)];

    const parking =
      parkings[Math.floor(Math.random() * parkings.length)];

    const daysAgo = Math.floor(Math.random() * 90);

    const startDate = new Date();

    startDate.setDate(startDate.getDate() - daysAgo);

    startDate.setHours(
      Math.floor(Math.random() * 24),
      Math.floor(Math.random() * 60),
      0,
      0
    );

    const durationHours =
      Math.floor(Math.random() * 12) + 1;

    const endDate = new Date(
      startDate.getTime() + durationHours * 60 * 60 * 1000
    );

    const cost =
      Math.floor(durationHours * (20 + Math.random() * 30));

    reservations.push({
      user: user._id,
      parking: parking._id,
      startDate,
      endDate,
      status: "FINISHED",
      cost
    });
  }

  await Reservation.insertMany(reservations);

  console.log("2000 reservaciones insertadas");

} catch (error) {
  console.error(error);
} finally {
  await mongoose.connection.close();
}