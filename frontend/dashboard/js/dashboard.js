import supabase from './backend/config/client.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Traer todos los productos
    const { data: productos, error } = await supabase
        .from('products')
        .select('*');

    if (error) {
        console.error('Error al traer productos:', error);
        return;
    }

    // Total de componentes
    const totalComponentes = productos.length;

    // Valor total (suma de todos los precios * stock)
    const valorTotal = productos.reduce((acc, prod) => acc + ((prod.price || 0) * (prod.stock || 0)), 0);

    // Stock bajo (productos donde stock < min_stock)
    const stockBajo = productos.filter(prod => prod.stock !== null && prod.min_stock !== null && prod.stock < prod.min_stock).length;

    // Movimientos hoy 
    const movimientosHoy = 0;

    // Agrupar por categoría
    const categoriasMap = {};
    productos.forEach(prod => {
        const cat = prod.category || 'Sin categoría';
        if (!categoriasMap[cat]) {
            categoriasMap[cat] = { nombre: cat, cantidad: 0, valor: 0 };
        }
        categoriasMap[cat].cantidad += prod.stock || 0;
        categoriasMap[cat].valor += (prod.price || 0) * (prod.stock || 0);
    });
    const categorias = Object.values(categoriasMap);

    // Alertas de stock bajo
    const alertas = productos
        .filter(prod => prod.stock !== null && prod.min_stock !== null && prod.stock < prod.min_stock)
        .slice(0, 3)
        .map(prod => ({
            nombre: prod.name,
            categoria: prod.category || 'Sin categoría',
            stock: prod.stock,
            min: prod.min_stock
        }));

    // Mostrar en tarjetas 
    document.getElementById('total-componentes').textContent = totalComponentes;
    document.getElementById('valor-total').textContent = `$${valorTotal.toLocaleString()}`;
    document.getElementById('stock-bajo').textContent = stockBajo;
    document.getElementById('movimientos-hoy').textContent = movimientosHoy;

    // Distribución por Categorías
    const categoriasDivs = document.querySelectorAll('.space-y-4 > div.flex.items-center.justify-between');
    categorias.forEach((cat, i) => {
        if (categoriasDivs[i]) {
            categoriasDivs[i].querySelector('.font-medium').textContent = cat.nombre;
            categoriasDivs[i].querySelector('.text-sm.text-gray-500').textContent = `${cat.cantidad} unidades`;
            categoriasDivs[i].querySelector('.text-right .font-semibold').textContent = `$${cat.valor.toLocaleString()}`;
        }
    });

    // Alertas de Stock
    const alertasDivs = document.querySelectorAll('.p-6.pt-0.space-y-4 .space-y-2.p-4');
    alertas.forEach((alerta, i) => {
        if (alertasDivs[i]) {
            alertasDivs[i].querySelector('.font-medium.text-sm').textContent = alerta.nombre;
            alertasDivs[i].querySelector('.text-xs.text-gray-500').textContent = alerta.categoria;
            const spans = alertasDivs[i].querySelectorAll('.flex.justify-between.text-xs span');
            if (spans.length === 2) {
                spans[0].textContent = `Stock actual: ${alerta.stock}`;
                spans[1].textContent = `Mínimo: ${alerta.min}`;
            }
        }
    }); 
});
