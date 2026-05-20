import Parking from '../models/parking.js';
import Record from '../models/record.js';

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

export const getSlotsWithStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const parking = await Parking.findById(id).lean();
    if (!parking) throw new Error("Estacionamiento no encontrado");

    const registrosActivos = await Record.find({ parking: id, status: 'ACTIVE' }).lean();

    const slotsOcupadosCodes = new Set(registrosActivos.map(reg => reg.slotCode));
    const slotsConEstado = parking.slots.map(slot => ({
      ...slot,
      isOccupied: slotsOcupadosCodes.has(slot.code)
    }));

    res.json({ parkingId: id, viewBox: parking.viewBox, slots: slotsConEstado });

  } catch (error) {
    console.error("Error al obtener los slots:", error);
    throw error;
  }
};

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

export const updateLayout = async (req, res) => {
  try {
    const { id } = req.params;
    const { viewBox, slots } = req.body;
    if (!slots || !Array.isArray(slots)) {
      return res.status(400).json({ message: 'slots debe ser un array' });
    }

    const parking = await Parking.findByIdAndUpdate(
      id,
      { viewBox, slots },
      { returnDocument: 'after', runValidators: true }
    );

    if (!parking) {
      return res.status(404).json({ message: 'Parking no encontrado' });
    }

    res.json(parking);
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
