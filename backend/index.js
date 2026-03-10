import 'dotenv/config';
import express from "express";
import cors from 'cors';

import { connectDB } from "./database/connection.js";

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
// import busquedasRoutes from './routes/busquedas.js';
// import uploadsRoutes from './routes/uploads.js';

const app = express();
app.use(cors());    
app.use(express.json());
app.use(express.static('public'));

connectDB();

app.use('/api/login', authRoutes);
app.use('/api/users', userRoutes);
// app.use('/api/todo', busquedasRoutes);
// app.use('/api/uploads', uploadsRoutes);


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`)
})
