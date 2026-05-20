import mongoose from "mongoose";

import Card from "../../models/card.js";
import User from "../../models/user.js";

await mongoose.connect("mongodb://localhost:27017/parking");

try {

  const users = await User.find();

  if (!users.length) {
    throw new Error("No hay usuarios");
  }

  const cards = [];

  for (let i = 1; i <= 2000; i++) {

    const user =
      users[Math.floor(Math.random() * users.length)];

    const month =
      String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");

    const year =
      String(Math.floor(Math.random() * 6) + 26);

    const expiry = `${month}/${year}`;

    const cvv =
      String(Math.floor(100 + Math.random() * 900));

    const number =
      `4111 1111 1111 ${String(i).padStart(4, "0")}`;

    cards.push({
      user: user._id,
      name: `Titular ${i}`,
      number,
      expiry,
      cvv
    });
  }

  await Card.insertMany(cards);

  console.log("2000 tarjetas insertadas");

} catch (error) {
  console.error(error);
} finally {
  await mongoose.connection.close();
}