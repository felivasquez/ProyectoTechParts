import supabase from '../../dashboard/js/client.js';

document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();

    // Búsqueda en escritorio
    const buscadorDesktop = document.getElementById('buscador-productos');
    buscadorDesktop.addEventListener('input', function () {
        const searchValue = this.value.trim();
        mostrarResultadosBusqueda(searchValue);
    });

    // Búsqueda en móvil
    const buscadorMobile = document.getElementById('buscador-productos-mobile');
    buscadorMobile.addEventListener('input', function () {
        const searchValue = this.value.trim();
        mostrarResultadosBusqueda(searchValue);
    });
});

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

    // Decide en qué contenedor mostrar
    const targetContainer = search ? productosFiltrados : productsContainer;

    if (data.length === 0 && search) {
        targetContainer.innerHTML = `
            <h2 class="text-3xl font-bold mb-4 text-white">
                No se encontraron productos para esa búsqueda.
            </h2>`;
    } else {
        data.forEach(product => {
            const productCard = renderProductCard(product);
            targetContainer.appendChild(productCard);
        });
    }
}

/* Render de la card del producto */
function renderProductCard(product) {
    const card = document.createElement('div');
    card.className = 'rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-shadow';

    card.innerHTML = `
        <div class="group overflow-hidden rounded-lg border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-800/50 transition-all duration-300 hover:shadow-lg hover:shadow-sky-400/10">
            <div class="relative overflow-hidden">
                <span class="absolute top-3 left-3 z-10 inline-flex items-center rounded-full bg-sky-400 px-2.5 py-0.5 text-xs font-medium text-gray-900">
                    Más vendido
                </span>
                <span class="absolute top-3 right-3 z-10 inline-flex items-center rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-medium text-white">
                    -18%
                </span>
                <div class="aspect-square overflow-hidden bg-gray-700">
                    <img src="${product.image_url}" alt="${product.name}"
                        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105">
                </div>
            </div>
            <div class="p-4">
                <a href="productDetails.html?id=${product.id}" class="block mb-4">
                    <div class="mb-2">
                        <span class="inline-flex items-center rounded-md bg-gray-700 px-2 py-1 text-xs font-medium text-gray-300">
                            ${product.category || 'Sin categoría'}
                        </span>
                    </div>
                    <h3 class="font-semibold mb-2 text-white group-hover:text-sky-400 transition-colors line-clamp-2">
                        ${product.name}
                    </h3>
                    <div class="flex items-center gap-1 mb-3">
                        <div class="flex">
                            <!-- estrellas -->
                            <svg class="lucide lucide-star h-4 w-4 fill-yellow-400 text-yellow-400" xmlns="http://www.w3.org/2000/svg"
                                width="24" height="24" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round"><path
                                    d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z">
                                </path></svg>
                        </div>
                        <span class="text-sm text-gray-400">(124)</span>
                    </div>
                    <div class="flex items-center gap-2 mb-4">
                        <span class="text-xl font-bold text-sky-400">$${product.price || 0}</span>
                        <span class="text-sm text-gray-400 line-through">$${product.price * 1.3}</span>
                    </div>
                </a>
                <button class="add-to-cartBtn w-full group inline-flex items-center justify-center gap-2 h-10 px-4 py-2 bg-gray-800 border border-sky-400/20 text-white hover:bg-sky-400/10 hover:border-sky-400/40 transition-all duration-300 rounded-md"
                    data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-action="add-to-cart">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-shopping-cart h-4 w-4 group-hover:scale-110 transition-transform">
                        <circle cx="8" cy="21" r="1"></circle>
                        <circle cx="19" cy="21" r="1"></circle>
                        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
                    </svg>
                    Agregar al carrito
                </button>
            </div>
        </div>`;
    return card;
}

let oned = true;

function mostrarResultadosBusqueda(searchValue) {
  const contenedorFiltrado = document.getElementById('contenedorFiltrado');
  const productosFiltrados = document.getElementById('productos-filtrados');
  const sections = document.querySelectorAll('section');
  const salir = document.getElementById('volver-Tech');
  const mostrarCategorias = document.getElementById('mostrar-Categorias');
  const volverAtras = document.createElement('div');
  const layoutBusqueda = document.createElement('div');

  volverAtras.innerHTML = `
    <a href="home.html"
      class="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent pl-8 mb-4 block">
      < Volver atrás
    </a>`;

  layoutBusqueda.innerHTML = `
    <div class="flex flex-col lg:flex-row gap-8 container mx-5 w-11/12 py-6">
      <!-- 🧭 SIDEBAR -->
  <div class="barra_lateral w-full lg:w-1/4">
<aside class="rounded-xl p-3 space-y-4 ">
  <h2 class="categoria-header text-lg font-semibold text-white cursor-pointer select-none border-b pb-2 mb-5 flex items-center justify-between hover:text-sky-400 transition-colors">
    Categorías
    <svg xmlns="http://www.w3.org/2000/svg" class="flecha-categoria h-5 w-5 text-white transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
    </svg>
  </h2>

  <ul class="lista-categorias space-y-5 text-gray-300 transition-all duration-500 overflow-hidden">
    <li class="flex items-center justify-between hover:text-sky-400 cursor-pointer">PC de Escritorio <span>›</span></li>
    <li class="flex items-center justify-between hover:text-sky-400 cursor-pointer">Notebooks <span>›</span></li>
    <li class="flex items-center justify-between hover:text-sky-400 cursor-pointer">Procesadores <span>›</span></li>
    <li class="flex items-center justify-between hover:text-sky-400 cursor-pointer">Placas de Video <span>›</span></li>
    <li class="flex items-center justify-between hover:text-sky-400 cursor-pointer">Memorias RAM <span>›</span></li>
    <li class="flex items-center justify-between hover:text-sky-400 cursor-pointer">Fuentes <span>›</span></li>
    <li class="flex items-center justify-between hover:text-sky-400 cursor-pointer">Periféricos <span>›</span></li>
    <li class="flex items-center justify-between hover:text-sky-400 cursor-pointer">Sillas Gamers <span>›</span></li>
  </ul>
</aside>
  </div>

      <!-- 🛒 PRODUCTOS -->
      <div id="productos-filtrados" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full"></div>
    </div>
  `;


  if (searchValue) {
        sections.forEach(s => s.style.display = 'none');
                productosFiltrados.style.display = 'grid';
        contenedorFiltrado.classList.remove('hidden');
       
            if(oned===true){ contenedorFiltrado.innerHTML = '';
            contenedorFiltrado.appendChild(volverAtras);
            contenedorFiltrado.appendChild(layoutBusqueda);
            oned=false;
        }
        fetchProducts(searchValue);

        // ✅ AHORA que el HTML ya existe, agregamos la animación de categorías
        const categoriaHeader = contenedorFiltrado.querySelector(".categoria-header");
        const listaCategorias = contenedorFiltrado.querySelector(".lista-categorias");
        const flecha = contenedorFiltrado.querySelector(".flecha-categoria");

        let abierto = true;
        categoriaHeader.addEventListener("click", () => {
            abierto = !abierto;
            if (abierto) {
                listaCategorias.classList.remove("max-h-0", "opacity-0", "pointer-events-none");
                listaCategorias.classList.add("max-h-[1000px]", "opacity-100");
                flecha.classList.remove("rotate-180");
            } else {
                listaCategorias.classList.add("max-h-0", "opacity-0", "pointer-events-none");
                listaCategorias.classList.remove("max-h-[1000px]", "opacity-100");
                flecha.classList.add("rotate-180");
            }
        });
    } else if(searchValue){
        // Muestra secciones y contenedor general, oculta filtrados
        sections.forEach(section => section.style.display = 'none');
        productosFiltrados.style.display = 'none';
        fetchProducts();
    }

}


// === CARRITO ===
const cartButton = document.getElementById("myCartDropdownButton1");
const cartDropdown = document.getElementById("myCartDropdown1");

// === USUARIO ===
const userButton = document.getElementById("userDropdownButton1");
const userDropdown = document.getElementById("userDropdown1");

// === FUNCIONES DE TOGGLE ===
function toggleDropdown(button, dropdown) {
  const isVisible = !dropdown.classList.contains("hidden");

  // Cierra todos los dropdowns abiertos antes de abrir otro
  document.querySelectorAll("#myCartDropdown1, #userDropdown1").forEach((el) => {
    el.classList.add("hidden");
  });

  // Si estaba oculto, mostrarlo
  if (!isVisible) {
    const rect = button.getBoundingClientRect();

    // Calcula posición justo debajo del botón
    dropdown.style.position = "absolute";
    dropdown.style.top = `${rect.bottom + window.scrollY + 8}px`;
    dropdown.style.left = `${rect.left}px`;

    dropdown.classList.remove("hidden");
    dropdown.classList.add("animate-fadeIn");
  }
}

// === EVENTOS ===
cartButton.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleDropdown(cartButton, cartDropdown);
});

if (userButton) {
  userButton.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleDropdown(userButton, userDropdown);
  });
}

// === Cerrar al hacer clic fuera ===
document.addEventListener("click", (e) => {
  if (
    !cartDropdown.contains(e.target) &&
    !userDropdown.contains(e.target) &&
    !cartButton.contains(e.target) &&
    !userButton.contains(e.target)
  ) {
    cartDropdown.classList.add("hidden");
    userDropdown.classList.add("hidden");
  }
});

// === Animación con Tailwind ===
const style = document.createElement("style");
style.innerHTML = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.2s ease-out;
}
`;
document.head.appendChild(style);
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

document.addEventListener("DOMContentLoaded", () => {
  const mobileSearchBar = document.getElementById("mobile-search-bar");
  const desktopSearch = document.querySelector(".BusquedaComponentes");
  const nav = document.querySelector("nav");

  // Crear botón de búsqueda solo en móvil
  const searchBtn = document.createElement("button");
  searchBtn.id = "mobile-search-btn";
  searchBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
      fill="none" stroke="currentColor" stroke-width="2" 
      stroke-linecap="round" stroke-linejoin="round" 
      class="lucide lucide-search text-white">
      <circle cx="11" cy="11" r="8"></circle>
      <path d="m21 21-4.3-4.3"></path>
    </svg>
  `;
  searchBtn.className =
    "md:hidden p-2 rounded-lg hover:bg-gray-800 transition-all duration-200";

  // Insertar botón antes del carrito
  const cartButton = document.getElementById("myCartDropdownButton1");
  if (cartButton && nav) {
    cartButton.parentNode.insertBefore(searchBtn, cartButton);
  }

  // Mostrar/ocultar barra móvil
  let isSearchOpen = false;
  searchBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    isSearchOpen = !isSearchOpen;
    mobileSearchBar.classList.toggle("hidden", !isSearchOpen);
    if (isSearchOpen) {
      document.getElementById("buscador-productos-mobile").focus();
    }
  });

  // Ocultar al hacer clic fuera
  document.addEventListener("click", (e) => {
    if (
      isSearchOpen &&
      !mobileSearchBar.contains(e.target) &&
      !searchBtn.contains(e.target)
    ) {
      mobileSearchBar.classList.add("hidden");
      isSearchOpen = false;
    }
  });

  // Mostrar según tamaño de pantalla
  const handleResize = () => {
    if (window.innerWidth >= 768) {
      // Desktop
      desktopSearch.classList.remove("hidden");
      mobileSearchBar.classList.add("hidden");
      searchBtn.classList.add("hidden");
    } else {
      // Móvil
      desktopSearch.classList.add("hidden");
      searchBtn.classList.remove("hidden");
    }
  };

  handleResize();
  window.addEventListener("resize", handleResize);
});

//categorias animacion antes de la busqueda
  const categoriaHeader = document.querySelector(".categoria-header");
  const listaCategorias = document.querySelector(".lista-categorias");
  const flecha = document.querySelector(".flecha-categoria");

  // Estado inicial: visible
  let abierto = true;

  categoriaHeader.addEventListener("click", () => {
    abierto = !abierto;

    // Alternar visibilidad
    if (abierto) {
      listaCategorias.classList.remove("max-h-0", "opacity-0", "pointer-events-none");
      listaCategorias.classList.add("max-h-[1000px]", "opacity-100");
      flecha.classList.remove("rotate-180");
    } else {
      listaCategorias.classList.add("max-h-0", "opacity-0", "pointer-events-none");
      listaCategorias.classList.remove("max-h-[1000px]", "opacity-100");
      flecha.classList.add("rotate-180");
    }
  });
