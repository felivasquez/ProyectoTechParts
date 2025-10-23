import supabase from '../../dashboard/js/client.js';


let productosData = []; // Guarda todos los productos

// Traer productos desde Supabase
async function fetchProducts() {
    const { data, error } = await supabase
        .from('products')
        .select('*');

    if (error) {
        console.error('Error al traer productos:', error);
        return;
    }

    productosData = data; // Guardamos todos los productos
    mostrarProductos(data); // Mostramos todos al cargar
}

// Mostrar productos en el grid
function mostrarProductos(array) {
    const contenedor = document.getElementById('productos-container');
    contenedor.innerHTML = '';

    array.forEach(producto => {
        const productCardHTML = renderProductCard(producto);
        contenedor.appendChild(productCardHTML);
               
    });
}

// Filtrar productos por categoría y mostrarlos
function filtrarPorCategoria(categoria) {
    const filtrados = productosData.filter(p => p.category === categoria);
    mostrarProductos(filtrados);
}

// Asignar eventos a los botones
function initBotones() {
    const botones = {
        'btn-procesadores': 'Procesadores',
        'btn-ram': 'Memoria RAM',
        'btn-tarjetas': 'Tarjetas Gráficas',
        'btn-almacenamiento': 'Almacenamiento',
        'btn-fuentes': 'Fuente',
        'btn-pcs': 'PC Gaming'
    };

    for (const [id, categoria] of Object.entries(botones)) {
        const btn = document.getElementById(id);
        if (!btn) continue;
        btn.addEventListener('click', () => filtrarPorCategoria(categoria));
    }
}

// Inicializar todo al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    initBotones();
});

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

let cartButton = document.getElementById('myCartDropdownButton1');
let cartModal = document.getElementById('myCartDropdown1');
let userButton = document.getElementById('userDropdownButton1');
let userModal = document.getElementById('userDropdown1');


// Cart dropdown functionality
cartButton.addEventListener('click', function () {
    cartModal.classList.toggle('hidden');
    userModal.classList.add('hidden');
});

// User dropdown functionality
userButton.addEventListener('click', function () {
    userModal.classList.toggle('hidden');
    cartModal.classList.add('hidden');
});

// logica para dirigir al login si no está autenticado
const loginButton = document.getElementById('btnUser');

loginButton.addEventListener('click', async () => {
    const user = supabase.auth.getUser();
    if (!(await user).data.user) {
        window.location.href = './auth/login.html';
    }
});

// logica para si esta logueado mostrar el user modal
const userDropdown1 = document.getElementById('contUserSec');

document.addEventListener('DOMContentLoaded', async () => {
    const user = await supabase.auth.getUser();
    if (user.data.user) {
        userDropdown1.classList.remove('hidden');
        loginButton.classList.add('hidden');
        cartButton.style.display = 'flex';
        console.log(user.data.user);
    }
    else {
        userDropdown1.classList.add('hidden');
        cartButton.style.display = 'none';
        loginButton.classList.remove('hidden');
        console.log('No hay usuario logueado');
    }
});

// logica para cerrar sesión
const logoutButton = document.getElementById('logout-button');

logoutButton.addEventListener('click', async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Error al cerrar sesión:', error.message);
        alert('Hubo un error al cerrar sesión.');
    } else {
        window.location.href = './home.html';
    }
    console.log('Sesión cerrada');
});

// Cerrar los dropdowns si se hace clic fuera de ellos
document.addEventListener('click', function (event) {
    if (!cartButton.contains(event.target) && !cartModal.contains(event.target)) {
        cartModal.classList.add('hidden');
    }
    if (!userButton.contains(event.target) && !userModal.contains(event.target)) {
        userModal.classList.add('hidden');
    }
});
