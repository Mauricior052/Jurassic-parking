import mongoose from "mongoose";

import Vehicle from "../../models/vehicle.js";
import User from "../../models/user.js";

await mongoose.connect("mongodb://localhost:27017/parking");

try {

  const users = await User.find();

  if (!users.length) {
    throw new Error("No hay usuarios");
  }

  const vehicles = [];

  const brands = [
    "Nissan Versa",
    "Mazda 3",
    "Jetta",
    "Sentra",
    "Civic",
    "Corolla",
    "Aveo",
    "March",
    "Rio",
    "Mustang",
    "CRV",
    "Tacoma",
    "Ranger",
    "Hilux",
    "Kia Soul"
  ];

  const types = [
    "Auto",
    "Moto",
    "Camioneta"
  ];

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (let i = 1; i <= 2000; i++) {

    const user =
      users[Math.floor(Math.random() * users.length)];

    const randomPlate =
      `${letters[Math.floor(Math.random() * 26)]}${letters[Math.floor(Math.random() * 26)]}${letters[Math.floor(Math.random() * 26)]}-${Math.floor(100 + Math.random() * 900)}`;

    vehicles.push({

      plate: randomPlate,

      description:
        brands[Math.floor(Math.random() * brands.length)],

      type:
        types[Math.floor(Math.random() * types.length)],

      user: user._id,

      active: Math.random() > 0.1
    });
  }

  await Vehicle.insertMany(vehicles);

  console.log("2000 vehículos insertados");

} catch (error) {
  console.error(error);
} finally {
  await mongoose.connection.close();
}