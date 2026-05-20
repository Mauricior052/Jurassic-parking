import mongoose from "mongoose";
import bcryptjs from 'bcryptjs';
import User from "../../models/user.js";

await mongoose.connect("mongodb://localhost:27017/parking");

const users = [];
const salt = bcryptjs.genSaltSync();
const hashedPassword = bcryptjs.hashSync("1234", salt);

for (let i = 1; i <= 2000; i++) {
  users.push({
    name: `usuario${i}`,
    email: `usuario${i}@gmail.com`,
    password: hashedPassword,
    titular: `Titular ${i}`,
    number: `411111111111${String(i).padStart(4, "0")}`,
    expiry: "12/30",
  });
}

try {
  await User.insertMany(users);

  console.log("2000 usuarios insertados correctamente");
} catch (error) {
  console.error(error);
} finally {
  await mongoose.connection.close();
}