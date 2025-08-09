import supabase from '../js/client.js';

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
    const productsContainer = document.getElementById('products-container');
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
                <a data-id="${product.id}" class="btn-delete cursor-pointer inline-flex items-center gap-2 text-sm border rounded-md px-3 h-9 text-red-600 hover:text-red-700">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" stroke="currentColor" stroke-width="2"
                        viewBox="0 0 24 24"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>Eliminar
                </a>
            </div>
        </div>
    `;
    // evento de eliminar 
    const deleteBtn = card.querySelector('.btn-delete');
    deleteBtn.addEventListener('click', async () => {
        const confirmed = confirm(`¿Estás seguro de eliminar "${product.name}"?`);
        if (!confirmed) return;

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', product.id);

        if (error) {
            console.error('Error al eliminar producto:', error);
            alert('Hubo un error al eliminar el producto.');
        } else {
            card.remove(); // ✅ Elimina del DOM
            alert('Producto eliminado exitosamente.');
        }
    });
    const editBtn = card.querySelector('#edit-product-btn');
    editBtn.addEventListener('click', () => {
        window.openEditProductModal(product);
    });

    window.fetchProducts = fetchProducts;

    return card;
}