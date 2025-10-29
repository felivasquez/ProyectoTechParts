import express from 'express';
import registerRoutes from './routes/index.js';

const app = express();
const PORT = 3000;

app.use(express.json());

// Centraliza todas las rutas
registerRoutes(app);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ mensaje: 'Bienvenido a la API de TechParts' });
});

// Iniciar server
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
