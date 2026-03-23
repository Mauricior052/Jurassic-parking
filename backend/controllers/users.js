import bcryptjs from 'bcryptjs';
import User from '../models/user.js';
import { generateJWT } from '../helpers/generate-jwt.js';

export const getUsers = async (req, res) => {  
  const [users, total] = await Promise.all([
    User.find({ active: true }, 'name email role google favorites'),
    User.countDocuments({ active: true })
  ]);

  res.json({ users, total });
};

export const createUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ msg: 'El correo ya está registrado' });
    }

    const user = new User(req.body);

    const salt = bcryptjs.genSaltSync();
    user.password = bcryptjs.hashSync(password, salt);

    await user.save();
    const token = await generateJWT(user.id);

    res.json({ user, token });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: 'Error inesperado' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const userDB = await User.findById(id);

    if (!userDB) {
      return res.status(404).json({ msg: 'No existe un usuario con ese id' });
    }

    const { password, google, email, ...fields } = req.body;

    if (email && userDB.email !== email) {
      if (userDB.google) {
        return res.status(400).json({ msg: 'Usuarios de Google no pueden cambiar su correo' });
      }

      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ msg: 'Ya existe un usuario con ese email' });
      }

      fields.email = email;
    }

    const updatedUser = await User.findByIdAndUpdate(id, fields, { returnDocument: 'after' });

    res.json({ user: updatedUser });

  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: 'Error inesperado' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const userDB = await User.findById(id);

    if (!userDB) {
      return res.status(404).json({ msg: 'No existe un usuario con ese id' });
    }

    const deactivatedUser = await User.findByIdAndUpdate(id, { active: false }, { returnDocument: 'after' });
    res.json({ deactivatedUser });

  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: 'Error inesperado' });
  }
};
