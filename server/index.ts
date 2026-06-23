import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './src/routes/auth.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/v2/auth', authRoutes);


app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    message: 'Servidor Express + TypeScript corriendo en Ubuntu 24.04!',
    timestamp: new Date().toISOString()});
});

app.listen(PORT, () => {
  console.log(`🚀 [server]: Servidor adaptativo escuchando en http://localhost:${PORT}`);
});