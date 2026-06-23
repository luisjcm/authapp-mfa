import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    message: 'Servidor Express + TypeScript corriendo en Ubuntu 24.04!',
    timestamp: new Date().toISOString()});
});

app.listen(PORT, () => {
  console.log(`🚀 [server]: Servidor adaptativo escuchando en http://localhost:${PORT}`);
});