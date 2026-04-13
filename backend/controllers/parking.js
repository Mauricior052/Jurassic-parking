import Parking from '../models/parking.js';

export const create = async (req, res) => {
  try {
    const data = req.body;
    const userId = req.id;

    const parking = await Parking.create({
      ...data,
      owner: userId,
    });

    res.status(201).json(parking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAll = async (req, res) => {
  try {
    const parkings = await Parking.find({ active: true });
    res.json(parkings);
    
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const parking = await Parking.findById(id)
      .populate('owner', 'nombre email');

    res.json(parking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const nearby = async (req, res) => {
  try {
    const { lng, lat, distance = 1000 } = req.query;

    const parkings = await Parking.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseInt(distance),
        },
      },
      active: true,
    });

    res.json(parkings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;

    const parking = await Parking.findByIdAndUpdate(
      id,
      req.body,
      { returnDocument: 'after' }
    );

    res.json(parking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const parking = await Parking.findByIdAndUpdate(
      id,
      { active: false },
      { returnDocument: 'after' }
    );

    res.json(parking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const mine = async (req, res) => {
  try {
    const userId = req.user?.id;

    const parkings = await Parking.find({
      owner: userId,
    });

    res.json(parkings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
