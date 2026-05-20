import mongoose from "mongoose";
import Parking from "../../models/parking.js";

await mongoose.connect("mongodb://localhost:27017/parking");

try {

  const parkings = [];

  const minLat = 18.9;
  const maxLat = 22.8;
  const minLng = -105.8;
  const maxLng = -101.2;

  const COLS = 10;
  const SW = 50;
  const SH = 32;
  const GAP_X = 2;
  const GAP_Y = 10;
  const MARGIN = 20;

  for (let i = 1; i <= 2000; i++) {

    const totalSpaces = 20;

    const slots = Array.from({ length: totalSpaces }, (_, index) => {
      const row = Math.floor(index / COLS);
      const col = index % COLS;

      return {
        code: `A${index + 1}`,
        x: MARGIN + col * (SW + GAP_X),
        y: MARGIN + row * (SH + GAP_Y),

        angle: 0,
      };
    })

    const lat = Math.random() * (maxLat - minLat) + minLat;
    const lng = Math.random() * (maxLng - minLng) + minLng;

    parkings.push({
      name: `Parking ${i}`,

      address: `Calle ${i}, Guadalajara`,

      location: {
        type: "Point",
        coordinates: [lng, lat]
      },

      price: Math.floor(Math.random() * 100) + 20,

      totalSpaces,

      security: Math.random() > 0.5,

      schedule: {
        opening: "08:00",
        closing: "22:00",
        days: [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday"
        ]
      },

      viewBox: "0 0 600 400",

      slots
    });
  }

  await Parking.insertMany(parkings);

  console.log("2000 parkings insertados");

} catch (error) {
  console.error(error);
} finally {
  await mongoose.connection.close();
}