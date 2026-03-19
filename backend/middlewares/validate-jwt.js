import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const validateJWT = async (req, res, next) => {
  const token = req.header("token");

  if (!token) {
    return res.status(401).json({ msg: "No hay token en la petición" });
  }

  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    req.id = id;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ msg: "Token no válido" });
  }
};

export const validateAdmin = async (req, res, next) => {
  const id = req.id;
  console.log(id);

  try {
    const userDB = await User.findById(id);

    if (!userDB) {
      return res.status(404).json({ msg: "No se pudo autenticar usuario" });
    }

    if (userDB.rol !== "admin") {
      return res
        .status(403)
        .json({ msg: "No cuenta con privilegios suficientes" });
    }

    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Error inesperado" });
  }
};

export const validateCurrent = async (req, res, next) => {
  const id = req.id;
  const idParam = req.params.id;

  try {
    const userDB = await User.findById(id);

    if (!userDB) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    if (userDB.rol === "admin" || id === idParam) {
      return next();
    }

    return res
      .status(403)
      .json({ msg: "No cuenta con privilegios suficientes" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Error inesperado" });
  }
};
