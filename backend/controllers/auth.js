import bcryptjs from 'bcryptjs';
import User from '../models/user.js'; 
import { generateJWT } from '../helpers/generate-jwt.js';
import { googleVerify } from '../helpers/google-verify.js';
import { menuOptions } from '../helpers/menu-options.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, active: true });
    
    if (!user) {
      return res.status(404).json({ msg: "Email incorrecto" });
    }

    const validPassword = bcryptjs.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ msg: "Contraseña incorrecta" });
    }

    const token = await generateJWT(user.id);

    res.status(200).json({ 
        token, 
        menu: menuOptions(user.role) 
    });

  } catch (error) {
    res.status(500).json({ msg: "Hable con el administrador" });
  }
};

export const googleSignIn = async (req, res) => {
  try {
    const { email, name } = await googleVerify(req.body.token);
    const userDB = await User.findOne({ email });
    let user;

    if (!userDB) {
        user = new User({ name, email, password: '@@@@', google: true });
    } else {
        user = userDB;
        user.google = true;
        user.active = true;
    }

    await user.save();
    const token = await generateJWT(user.id);

    res.status(200).json({ 
        token, 
        menu: menuOptions(user.role) 
    });

  } catch (error) {
    res.status(400).json({ msg: "Token de Google invalido" });
  }
};

export const renewToken = async (req, res) => {
  try {
    const id = req.id;
    const token = await generateJWT(id);
    const user = await User.findById(id);

    if (!user || !user.active) {
      return res.status(401).json({ msg: "Usuario no encontrado" });
    }

    res.status(200).json({ 
      token, 
      user, 
      menu: menuOptions(user.role) 
    });

  } catch (error) {
    res.status(500).json({ msg: "Token invalido" });
  }
};