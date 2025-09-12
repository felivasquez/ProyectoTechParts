import { Router } from 'express';

const router = Router();

// GET /usuarios - todos los usuarios
router.get('/', (req, res) => {
  res.json({ mensaje: 'Esta es la ruta GET de mi entidad usuarios' });
});

// GET /usuarios/:id - usuario por id
router.get('/:id', (req, res) => {
  res.json({ mensaje: `Esta es la ruta GET de mi entidad usuarios con el ID ${req.params.id}` });
});

// POST /usuarios - crear usuario
router.post('/', (req, res) => {
  res.json({ mensaje: 'Esta es la ruta POST de mi entidad usuarios' });
});

// PUT /usuarios/:id - editar usuario por id
router.put('/:id', (req, res) => {
  res.json({ mensaje: `Esta es la ruta PUT de mi entidad usuarios para el id ${req.params.id}` });
});

// DELETE /usuarios/:id - eliminar usuario por id
router.delete('/:id', (req, res) => {
  res.json({ mensaje: `Esta es la ruta DELETE de mi entidad usuarios para el id ${req.params.id}` });
});

export default router;