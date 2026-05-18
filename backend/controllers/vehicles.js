import Vehicle from '../models/vehicle.js';

export const getAll = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ active: true });
    res.json(vehicles);
    
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findById(id)
      .populate('user', 'nombre email');

    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getByUser = async (req, res) => {
  try {
    const userId = req.id;

    const vehicles = await Vehicle.find({
      user: userId,
    });

    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const data = req.body;
    const userId = req.id;

    const vehicle = await Vehicle.create({
      ...data,
      user: userId,
    });

    res.status(201).json(vehicle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findByIdAndUpdate(
      id,
      req.body,
      { returnDocument: 'after' }
    );

    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateLayout = async (req, res) => {
  try {
    const { id } = req.params;
    const { viewBox, slots } = req.body;
    if (!slots || !Array.isArray(slots)) {
      return res.status(400).json({ message: 'slots debe ser un array' });
    }

    const vehicle = await Vehicle.findByIdAndUpdate(
      id,
      { viewBox, slots },
      { returnDocument: 'after', runValidators: true }
    );

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle no encontrado' });
    }

    res.json(vehicle);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'ID inválido' });
    }
    res.status(500).json({ message: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findByIdAndUpdate(
      id,
      { active: false },
      { returnDocument: 'after' }
    );

    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
