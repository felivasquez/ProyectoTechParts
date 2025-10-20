import productosRoutes from './productos.routes.js';
import usuariosRoutes from './usuarios.routes.js';

export default function registerRoutes(app) {
  app.use('/productos', productosRoutes);
  app.use('/usuarios', usuariosRoutes);
}