import fs from "fs";
import User from "../models/user.js";
import Parking from "../models/parking.js";


const dropImage = (path) => {
  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
  }
};

export const updateImage = async (tipo, id, nombre) => {
  switch (tipo) {
    case "parkings":
      const parking = await Parking.findById(id);
      if (!parking) return false;

      borrarImagen(`./uploads/parkings/${parking.img}`);

      parking.img = nombre;
      await parking.save();
      return true;

    case "users":
      const user = await User.findById(id);
      if (!user) return false;

      borrarImagen(`./uploads/users/${user.img}`);

      user.img = nombre;
      await user.save();
      return true;

    default:
      return false;
  }
};
