import 'dotenv/config';
import express from "express";
import cors from 'cors';

import { connectDB } from "./database/connection.js";

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import parkingRoutes from './routes/parking.js';
import recordRoutes from './routes/record.js';
import vehicleRoutes from './routes/vehicles.js';

const app = express();
app.use(cors({ origin: '*' }));    
app.use(express.json());
app.use(express.static('public'));

connectDB();

app.use('/api/login', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/vehicles', vehicleRoutes);


const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor corriendo en http://localhost:${port}`)
})
