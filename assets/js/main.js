const validRoutes = ['dashboard.html', 'inventario.html', 'movimientos.html', 'reportes.html'];

const currentPath = window.location.pathname.split('/').pop();

if (!validRoutes.includes(currentPath)) {
  window.location.href = '../error/404.html';
}
