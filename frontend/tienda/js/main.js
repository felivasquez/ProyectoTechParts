import supabase from '../../dashboard/js/client.js';

document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    // Configura el input de búsqueda
    const buscadorInput = document.getElementById('buscador-productos');
    buscadorInput.addEventListener('input', function () {
        const searchValue = this.value.trim();
        mostrarResultadosBusqueda(searchValue);
    });
});  

    const procesadorBtnHome = document.getElementById("Procesadores-Btn-home");
    const TarjetaBtnHome = document.getElementById("Tarjetas-Btn-home");
    const RAMBtnHome = document.getElementById("RAM-Btn-home");
    const AlmacenamientoBtnHome = document.getElementById("Almacenamiento-Btn-home");
    const fuentesBntHome = document.getElementById("fuentes-Btn-home");
    const pcsBtnHome = document.getElementById("pcs-Btn-home");
    let filtroCategoria = null;  

async function fetchProducts(search = '') {
    
    
    let query = supabase.from('products').select('*');
    let orQuery = [];
    if (search) {
        const isNumber = !isNaN(search);
        orQuery.push(`name.ilike.%${search}%`);
        orQuery.push(`brand.ilike.%${search}%`);
        orQuery.push(`model.ilike.%${search}%`);
        if (isNumber) {
            orQuery.push(`stock.eq.${search}`);
            orQuery.push(`price.eq.${search}`);
        }
    }
    if (orQuery.length) query = query.or(orQuery.join(','));
    const { data, error } = await query;
    if (error) {
        console.error('Error al obtener productos:', error);
        return;
    }
    const productsContainer = document.getElementById('productos-container');
    const productosFiltrados = document.getElementById('productos-filtrados');
    productsContainer.innerHTML = '';
    productosFiltrados.innerHTML = '';
    // Si hay búsqueda, muestra en productosFiltrados, si no, en productsContainer
    const targetContainer = search ? productosFiltrados : productsContainer;
    if (data.length === 0 && search) {
        // Si no hay productos y es una búsqueda, muestra mensaje
        targetContainer.innerHTML = '<h2 class="text-3xl font-bold mb-4 text-white">No se encontraron productos para esa búsqueda.</h2>';
    } else {
        data.forEach(product => {
            const productCard = renderProductCard(product);
            targetContainer.appendChild(productCard);
        });
    }
}
async function AplicarFiltrosHome(params){
    const productsContainer = document.getElementById('productos-container');
    const productosFiltrados = document.getElementById('contenedorFiltrado');
    productsContainer.innerHTML = '';
    productosFiltrados.innerHTML = '';

    if (!filtroCategoria) return;

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', filtroCategoria);

    if (error) {
        console.error('Error al filtrar productos:', error);
        return;
    }

    if (!data.length) {
        productsContainer.innerHTML = `
            <h2 class="text-2xl font-bold text-white">
                No se encontraron productos en ${filtroCategoria}.
            </h2>`;
        return;
    }

    // Renderizar los productos
    data.forEach(product => {
        const card = renderProductCard(product);
        productsContainer.appendChild(card);
    });
}
BotonesHome(procesadorBtnHome,'Procesadores');
BotonesHome(TarjetaBtnHome,'Tarjetas Gráficas')
BotonesHome(RAMBtnHome,'Memoria RAM')
BotonesHome(AlmacenamientoBtnHome,'Almacenamiento')
BotonesHome(fuentesBntHome,'Fuente')

function BotonesHome(boton, categoria) {
    boton.addEventListener('click', async () => {
        filtroCategoria = categoria; // guarda la categoría actual
        await AplicarFiltrosHome(); // ejecuta el filtrado
        activarBotonSeleccionado(boton); // resalta el botón activo
    });
}
/*render product card */
function renderProductCard(product) {
    const card = document.createElement('div');
    card.className = 'rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-shadow';

    card.innerHTML = `
                      <div
                        class="group overflow-hidden rounded-lg border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-800/50 transition-all duration-300 hover:shadow-lg hover:shadow-sky-400/10">
                        <div class="relative overflow-hidden">
                        <span
                            class="absolute top-3 left-3 z-10 inline-flex items-center rounded-full bg-sky-400 px-2.5 py-0.5 text-xs font-medium text-gray-900">
                            Más vendido</span>
                        <span
                            class="absolute top-3 right-3 z-10 inline-flex items-center rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-medium text-white">-18%</span>
                        <div class="aspect-square overflow-hidden bg-gray-700">
                            <img src="${product.image_url}" alt="${product.name}"
                            class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105">
                        </div>
                        </div>
                        <div class="p-4">
                        <a href="productDetails.html?id=${product.id}" class="block mb-4">
                            <div class="mb-2">
                            <span
                                class="inline-flex items-center rounded-md bg-gray-700 px-2 py-1 text-xs font-medium text-gray-300">${product.category
        || 'Sin categoría'}</span>
                            </div>
                            <h3 class="font-semibold mb-2 text-white group-hover:text-sky-400 transition-colors line-clamp-2">
                            ${product.name}
                            </h3>

                            <div class="flex items-center gap-1 mb-3">
                            <div class="flex">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                class="lucide lucide-star h-4 w-4 fill-yellow-400 text-yellow-400">
                                <path
                                    d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z">
                                </path>
                                </svg>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                class="lucide lucide-star h-4 w-4 fill-yellow-400 text-yellow-400">
                                <path
                                    d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z">
                                </path>
                                </svg>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                class="lucide lucide-star h-4 w-4 fill-yellow-400 text-yellow-400">
                                <path
                                    d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z">
                                </path>
                                </svg>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                class="lucide lucide-star h-4 w-4 fill-yellow-400 text-yellow-400">
                                <path
                                    d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z">
                                </path>
                                </svg>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                class="lucide lucide-star h-4 w-4 text-gray-500">
                                <path
                                    d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z">
                                </path>
                                </svg>
                            </div>
                            <span class="text-sm text-gray-400">(124)</span>
                            </div>
                            <div class="flex items-center gap-2 mb-4">
                            <span class="text-xl font-bold text-sky-400">$${product.price || 0}
                            </span>
                            <span class="text-sm text-gray-400 line-through">$${product.price * 1.30}</span>
                            </div>
                        </a>
                                                <button class="add-to-cartBtn w-full group inline-flex items-center justify-center gap-2 h-10 px-4 py-2 bg-gray-800 border border-sky-400/20 text-white hover:bg-sky-400/10 hover:border-sky-400/40 transition-all duration-300 rounded-md"
                                                            data-id="${product.id}"
                                                        data-name="${product.name}"
                                                        data-price="${product.price}" data-action="add-to-cart">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            class="lucide lucide-shopping-cart h-4 w-4 group-hover:scale-110 transition-transform">
                            <circle cx="8" cy="21" r="1"></circle>
                            <circle cx="19" cy="21" r="1"></circle>
                            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12">
                            </path>
                            </svg>
                            Agregar al carrito
                        </button>
                        </div>
                    </div>
    `;

    return card;
}


function mostrarResultadosBusqueda(searchValue) {
    const contenedorFiltrado = document.getElementById('contenedorFiltrado');
    const productosFiltrados = document.getElementById('productos-filtrados');
    const sections = document.querySelectorAll('section');
    if (searchValue) {
        // Oculta secciones y contenedor general, muestra filtrados
        sections.forEach(section => section.style.display = 'none');
        productosFiltrados.style.display = 'grid';
        contenedorFiltrado.classList.remove('hidden');  
        fetchProducts(searchValue);
    } else {
        // Muestra secciones y contenedor general, oculta filtrados
        sections.forEach(section => section.style.display = 'flex');
        productosFiltrados.style.display = 'none';
        fetchProducts();
    }
}
 
