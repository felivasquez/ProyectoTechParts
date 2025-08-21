import supabase from '/backend/config/client.js';

document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
});

async function fetchProducts() {
    const { data, error } = await supabase
        .from('products')
        .select('*');

    if (error) {
        console.error('Error al traer productos:', error);
        return;
    }

    console.log('Productos:', data);
    const productsContainer = document.getElementById('productos-container');
    productsContainer.innerHTML = ''; // Limpia contenedor antes de agregar nuevos productos

    data.forEach(product => {
        const productCard = renderProductCard(product);
        productsContainer.appendChild(productCard);
    });
}

/*render product card */
function renderProductCard(product) {
    const card = document.createElement('div');
    card.className = 'rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-shadow';

    card.innerHTML = `
        <div class="flex flex-col space-y-1.5 p-6">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-memory-stick h-5 w-5 text-blue-600">
                        <path d="M6 19v-3"></path>
                        <path d="M10 19v-3"></path>
                        <path d="M14 19v-3"></path>
                        <path d="M18 19v-3"></path>
                        <path d="M8 11V9"></path>
                        <path d="M16 11V9"></path>
                        <path d="M12 11V9"></path>
                        <path d="M2 15h20"></path>
                        <path d="M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1.1a2 2 0 0 0 0 3.837V17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5.1a2 2 0 0 0 0-3.837Z"></path>
                    </svg>
                    <div class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                        ${product.category || 'Sin categoría'}
                    </div>
                </div>
                <div class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-primary text-primary-foreground">
                    ${product.tipo || 'Normal'}
                </div>
            </div>
            <h3 class="font-semibold tracking-tight text-lg">${product.name}</h3>
            <p class="text-sm text-muted-foreground">${product.description || ''}</p>
        </div>
        <div class="p-6 pt-0 space-y-4">
            <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p class="text-gray-500">Stock</p>
                    <p class="font-semibold">${product.stock || 0} unidades</p>
                </div>
                <div>
                    <p class="text-gray-500">Precio</p>
                    <p class="font-semibold">$${product.price || 0}</p>
                </div>
                <div>
                    <p class="text-gray-500">Ubicación</p>
                    <p class="font-semibold">${product.location || '-'}</p>
                </div>
                <div>
                    <p class="text-gray-500">Mín. Stock</p>
                    <p class="font-semibold">${product.min_stock || '-'}</p>
                </div>
            </div>
            <p class="text-sm text-gray-600">${product.category || ''}</p>
            <div class="flex space-x-2">
                <a data-id="${product.id}" id="edit-product-btn" class="inline-flex items-center gap-2 cursor-pointer text-sm border rounded-md px-3 h-9 hover:bg-accent">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" stroke="currentColor" stroke-width="2"
                        viewBox="0 0 24 24"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.375 2.625a1 1 0 0 1 3 3L12.362 14.64a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"></path>
                    </svg>Editar
                </a>
                <button data-id="${product.id}" command="show-modal" commandfor="dialog" class="btn-delete cursor-pointer inline-flex items-center gap-2 text-sm border rounded-md px-3 h-9 text-red-600 hover:text-red-700">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" stroke="currentColor" stroke-width="2"
                        viewBox="0 0 24 24"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>Eliminar
                </button>
            </div>
        </div>
    `;

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
                                <img src="/assets/cpu-product-C2izR_Yp.jpg" alt="${product.name}"
                                    class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105">
                            </div>
                        </div>
                        <div class="p-4">
                            <div class="mb-2">
                                <span
                                    class="inline-flex items-center rounded-md bg-gray-700 px-2 py-1 text-xs font-medium text-gray-300">${product.category || 'Sin categoría'}</span>
                            </div>
                            <h3
                                class="font-semibold mb-2 text-white group-hover:text-sky-400 transition-colors line-clamp-2">
                                ${product.name}
                            </h3>
                            
                            <div class="flex items-center gap-1 mb-3">
                                <div class="flex">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round"
                                        class="lucide lucide-star h-4 w-4 fill-yellow-400 text-yellow-400">
                                        <path
                                            d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z">
                                        </path>
                                    </svg>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round"
                                        class="lucide lucide-star h-4 w-4 fill-yellow-400 text-yellow-400">
                                        <path
                                            d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z">
                                        </path>
                                    </svg>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round"
                                        class="lucide lucide-star h-4 w-4 fill-yellow-400 text-yellow-400">
                                        <path
                                            d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z">
                                        </path>
                                    </svg>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round"
                                        class="lucide lucide-star h-4 w-4 fill-yellow-400 text-yellow-400">
                                        <path
                                            d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z">
                                        </path>
                                    </svg>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round" class="lucide lucide-star h-4 w-4 text-gray-500">
                                        <path
                                            d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z">
                                        </path>
                                    </svg>
                                </div>
                                <span class="text-sm text-gray-400">(124)</span>
                            </div>
                            <div class="flex items-center gap-2 mb-4">
                                <span class="text-xl font-bold text-sky-400">$${product.price || 0}</span>
                                <span class="text-sm text-gray-400 line-through">$109.990</span>
                            </div>
                            <button
                                class="w-full group inline-flex items-center justify-center gap-2 h-10 px-4 py-2 bg-gray-800 border border-sky-400/20 text-white hover:bg-sky-400/10 hover:border-sky-400/40 transition-all duration-300 rounded-md">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round"
                                    class="lucide lucide-shopping-cart h-4 w-4 group-hover:scale-110 transition-transform">
                                    <circle cx="8" cy="21" r="1"></circle>
                                    <circle cx="19" cy="21" r="1"></circle>
                                    <path
                                        d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12">
                                    </path>
                                </svg>
                                Agregar al carrito
                            </button>
                        </div>
                    </div>
    `;

    return card;
}
