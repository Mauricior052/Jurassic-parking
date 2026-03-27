import Record from '../models/record.js';
import Parking from '../models/parking.js';

export const getAll = async (req, res) => {
  try {
    const { parking } = req.params;
    let records;
    if (parking == "all") {
      records = await Record.find().sort({ entryTime: -1 });
    } else {
      records = await Record.find({ parking: parking }).sort({ entryTime: -1 });
    }
    res.json(records);
    
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const active = async (req, res) => {  
  try {
    const { parking } = req.params;
    const records = await Record.find({ parking: parking, status: "ACTIVE", }).sort({ entryTime: -1 });
    res.json(records);
    
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const entry = async (req, res) => {
  try {
    const { plate, vehicle, parking } = req.body;
    const user = req.id;
    const record = await Record.create({ plate, vehicle, parking, user, entryTime: new Date() });

    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const exit = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await Record.findById(id);
    const exitTime = new Date();
    const minutes = calculateMinutes(
      record.entryTime,
      exitTime
    );
    const cost = await Parking.findById(record.parking).then(p => p.price);
    const amount = calculateAmount(minutes, cost);
    record.exitTime = exitTime;
    record.totalMinutes = minutes;
    record.totalAmount = amount;
    record.status = "FINISHED";
    await record.save();

    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const calculate = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await Record.findById(id);
    const now = new Date();
    const minutes = calculateMinutes(
      record.entryTime,
      now
    );
    const cost = await Parking.findById(record.parking).then(p => p.price);
    const amount = calculateAmount(minutes, cost);

    res.json({ minutes, amount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const cancel = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await Record.findById(id);
    record.status = "CANCELLED";

    await record.save();

    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

const calculateMinutes = (entryTime, exitTime) => {
  const diffMs = exitTime.getTime() - entryTime.getTime();
  return Math.ceil(diffMs / 60000);
};

const calculateAmount = (minutes, cost) => {
  const hours = Math.ceil(minutes / 60);
  return hours * cost;
}
