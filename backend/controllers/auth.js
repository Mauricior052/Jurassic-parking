import bcryptjs from 'bcryptjs';
import User from '../models/user.js'; 
import { generateJWT } from '../helpers/generate-jwt.js';
import { googleVerify } from '../helpers/google-verify.js';
import { menuOptions } from '../helpers/menu-options.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
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
        menu: menuOptions(user.rol) 
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Hable con el administrador" });
  }
};

export const googleSignIn = async (req, res) => {
  try {
    const { email, name } = await googleVerify(req.body.token);
    const usuarioDB = await User.findOne({ email });
    let usuario;

    if (!usuarioDB) {
        usuario = new User({ nombre: name, email, password: '@@@@', google: true });
    } else {
        usuario = usuarioDB;
        usuario.google = true;
    }

    await usuario.save();
    const token = await generateJWT(usuario.id);

    res.status(200).json({ 
        token, 
        menu: menuOptions(usuario.rol) 
    });

  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "Token de Google invalido" });
  }
};

export const renewToken = async (req, res) => {
  try {
    const id = req.id
    const token = await generateJWT(id);
    const usuario = await User.findById(id)

    res.status(200).json({ token, usuario, menu: menuOptions(usuario.rol) });

  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Token invalido" });
  }
};
