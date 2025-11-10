import supabase from './client.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Traer todos los productos
    const { data: productos, error } = await supabase
        .from('products')
        .select('*');

    if (error) {
        console.error('Error al traer productos:', error);
        return;
    }    
    const {data: dataM,error: errorM} = await supabase
    .from('movements')
    .select('*');    
    if (errorM) {
        console.error('Error al traer la fecha del movimiento:', errorM);
        return;
    }
    // Total de componentes
    const totalComponentes = productos.length;

    // Valor total (suma de todos los precios * stock)
    const valorTotal = productos.reduce((acc, prod) => acc + ((prod.price || 0) * (prod.stock || 0)), 0);

    // Stock bajo (productos donde stock < min_stock)
    const stockBajo = productos.filter(prod => prod.stock !== null && prod.min_stock !== null && prod.stock < prod.min_stock).length;

    // Movimientos hoy 
    const hoy = new Date().toISOString().split('T')[0];
    let movimientosHoy = 0;
    dataM.forEach(fecha => {
        if (fecha.created_at.split('T')[0] === hoy) { 
            movimientosHoy++
        };
});
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

async function checkSession() {
    const { data, error } = await supabase.auth.getSession();
    if (!data.session) {
        window.location.href = '/dashboard/session/login.html';
    } else {
        // Muestra el nombre de usuario en el dashboard
        const username = data.session.user.user_metadata?.username || data.session.user.email;
        document.getElementById('username').textContent = `Bienvenido, ${username}`;
    }
}
checkSession();

document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', async (e) => {
            e.preventDefault();
            const { error } = await supabase.auth.signOut();
            if (error) {
                alert('Hubo un error al cerrar sesión.');
            } else {
                window.location.href = '/dashboard/session/login.html';
            }
        });
    }
});

async function cardRenderAlert() {
    const {data,error} = await supabase
    .from('products')
    .select('*');
    if (error){
        console.error("Error al obtener los datos:", error);
    }
   const productosCriticos = data.filter(p => p.stock < p.min_stock).slice(0, 3);

  const contenedor = document.getElementById('alertas-stock');
  contenedor.innerHTML = ''; // limpiar antes

  productosCriticos.forEach(producto => {
    const card = cardAlertas(producto);
    contenedor.appendChild(card);
  });
}

function cardAlertas(data) {
 const card = document.createElement('div');
 card.className = 'space-y-2 p-4 rounded-lg border bg-red-50'
 card.innerHTML =
 `
                                        <div class="flex justify-between items-start">
                                            <div>
                                                <p class="font-medium text-sm">'${data.name}'</p>
                                                <p class="text-xs text-gray-500">${data.category}</p>
                                            </div>
                                            <div
                                                class="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 text-xs">
                                                Crítico
                                                </div>
                                        </div>
                                        <div class="space-y-1">
                                            <div class="flex justify-between text-xs"><span>Stock actual:
                                                    ${data.stock}</span><span>Mínimo: ${data.min_stock}</span></div>
                                            <div aria-valuemax="100" aria-valuemin="0" role="progressbar"
                                                data-state="indeterminate" data-max="100"
                                                class="relative w-full overflow-hidden rounded-full bg-secondary h-2">
                                                <div data-state="indeterminate" data-max="100"
                                                    class="h-full w-full flex-1 bg-primary transition-all"
                                                    style="transform: translateX(-66.6667%);"></div>
                                            </div>
                                        </div>
                                   `
return card;
}
cardRenderAlert();