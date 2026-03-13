import 'dotenv/config';
import express from "express";
import cors from 'cors';

import { connectDB } from "./database/connection.js";

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';

const app = express();
app.use(cors());    
app.use(express.json());
app.use(express.static('public'));

connectDB();

app.use('/api/login', authRoutes);
app.use('/api/users', userRoutes);


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`)
})
