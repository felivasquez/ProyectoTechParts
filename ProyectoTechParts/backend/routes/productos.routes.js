import { Router } from 'express';

const router = Router();

// GET /productos - todos los productos
router.get('/', (req, res) => {
  res.json({ mensaje: 'Esta es la ruta GET de mi entidad productos' });
});

// GET /productos/:id - producto por id
router.get('/:id', (req, res) => {
  res.json({ mensaje: `Esta es la ruta GET de mi entidad productos con el ID ${req.params.id}` });
});

// POST /productos - crear producto
router.post('/', (req, res) => {
  res.json({ mensaje: 'Esta es la ruta POST de mi entidad productos' });
});

// PUT /productos/:id - editar producto por id
router.put('/:id', (req, res) => {
  res.json({ mensaje: `Esta es la ruta PUT de mi entidad productos para el id ${req.params.id}` });
});

// DELETE /productos/:id - eliminar producto por id
router.delete('/:id', (req, res) => {
  res.json({ mensaje: `Esta es la ruta DELETE de mi entidad productos para el id ${req.params.id}` });
});

export default router;