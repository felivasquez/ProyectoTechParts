import supabase from './client.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('add-product-form');
    const modal = document.getElementById('add-product-modal');
    const openModalBtn = document.getElementById('open-add-modal');
    const submitBtn = document.getElementById('submit-product-btn');
    const productIdInput = document.getElementById('product-id');

    // Abrir modal para agregar
    if (openModalBtn) {
        openModalBtn.addEventListener('click', () => {
            form.reset();
            productIdInput.value = '';
            submitBtn.textContent = 'Agregar';
            modal.classList.remove('hidden');
            modal.setAttribute('data-state', 'open');
        });
    }

    // Cerrar modal
    document.querySelectorAll('#add-product-modal button[type="button"], #close-add-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            modal.classList.add('hidden');
            modal.setAttribute('data-state', 'closed');
        });
    });

    // Lógica para agregar o editar
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = productIdInput.value;
        const name = document.getElementById('name').value.trim();
        const category = document.getElementById('category')?.value?.trim() || 'Sin categoría';
        const brand = document.getElementById('brand').value.trim();
        const model = document.getElementById('model').value.trim();
        const stock = parseInt(document.getElementById('stock').value);
        const min_stock = parseInt(document.getElementById('min_stock').value);
        const price = parseFloat(document.getElementById('price').value);
        const location = document.getElementById('location').value.trim();
        const description = document.getElementById('description').value.trim();

        let error;
        if (id) {
            // Editar producto
            ({ error } = await supabase
                .from('products')
                .update({
                    name, category, brand, model, stock, min_stock, price, location, description
                })
                .eq('id', id));
        } else {
            // Agregar producto
            ({ error } = await supabase
                .from('products')
                .insert([{
                    name, category, brand, model, stock, min_stock, price, location, description
                }]));
        }
        const {data} = await supabase
        .from('products')
        .select("*");

        




        if (error) {
            showNotification('Error al guardar el producto', 'error');
            return;
        } else {
            showNotification(id ? 'Producto editado con éxito' : 'Producto agregado con éxito', 'success');
            form.reset();
            modal.classList.add('hidden');
            modal.setAttribute('data-state', 'closed');
            if (typeof fetchProducts === 'function') {
                fetchProducts();
            } else if (window.fetchProducts) {
                window.fetchProducts();
            }
        }
    });

    // Escucha el evento personalizado para editar
    window.openEditProductModal = function(product) {
        const modal = document.getElementById('add-product-modal');
        const form = document.getElementById('add-product-form');
        document.getElementById('product-id').value = product.id;
        document.getElementById('name').value = product.name || '';
        document.getElementById('category').value = product.category || '';
        document.getElementById('brand').value = product.brand || '';
        document.getElementById('model').value = product.model || '';
        document.getElementById('stock').value = product.stock || 0;
        document.getElementById('min_stock').value = product.min_stock || 0;
        document.getElementById('price').value = product.price || 0;
        document.getElementById('location').value = product.location || '';
        document.getElementById('description').value = product.description || '';
        document.getElementById('submit-product-btn').textContent = 'Guardar cambios';
        modal.classList.remove('hidden');
        modal.setAttribute('data-state', 'open');
    };

    // Lógica para el botón de editar en cada tarjeta de producto
    document.querySelectorAll('.product-card').forEach(card => {
        const product = {
            id: card.getAttribute('data-id'),
            name: card.querySelector('.product-name').textContent,
            category: card.getAttribute('data-category'),
            brand: card.getAttribute('data-brand'),
            model: card.getAttribute('data-model'),
            stock: card.getAttribute('data-stock'),
            min_stock: card.getAttribute('data-min_stock'),
            price: card.getAttribute('data-price'),
            location: card.getAttribute('data-location'),
            description: card.getAttribute('data-description')
        };

        const editBtn = card.querySelector('.inline-flex.items-center:not(.btn-delete)');
        editBtn.addEventListener('click', () => {
            window.openEditProductModal(product);
        });
    });

    const searchInput = document.querySelector('.BusquedaComponentes input[placeholder="Buscar componentes..."]');
    const categorySelect = document.getElementById('category-filter');
    const brandSelect = document.getElementById('brand-filter');

    async function updateProducts() {
        const search = searchInput ? searchInput.value.trim() : '';
        const category = categorySelect ? categorySelect.value : '';
        const brand = brandSelect ? brandSelect.value : '';
        await fetchProducts(search, category, brand);
    }

    if (searchInput) searchInput.addEventListener('input', updateProducts);
    if (categorySelect) categorySelect.addEventListener('change', updateProducts);
    if (brandSelect) brandSelect.addEventListener('change', updateProducts);

    loadFilters();
    fetchProducts();
});

// Modifica fetchProducts para aceptar un parámetro de búsqueda
async function fetchProducts(search = '', category = '', brand = '') {
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

    if (category) query = query.eq('category', category);
    if (brand) query = query.eq('brand', brand);
    if (orQuery.length) query = query.or(orQuery.join(','));

    const { data, error } = await query;
    if (error) {
        console.error('Error al traer productos:', error);
        return;
    }
    const productsContainer = document.getElementById('products-container');
    productsContainer.innerHTML = '';
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
    // evento de eliminar 
    const deleteBtn = card.querySelector('.btn-delete');
    deleteBtn.addEventListener('click', async () => {
        // Confirmación de eliminación
        const btnConfirm = document.getElementById('confirm-delete-btn');

        if (btnConfirm) {
            btnConfirm.addEventListener('click', async () => {
                const { error } = await supabase
                    .from('products')
                    .delete()
                    .eq('id', product.id);

                if (error) {
                    showNotification('Error al eliminar el producto', 'error');
                } else {
                    showNotification('Producto eliminado con éxito', 'success');
                    if (typeof fetchProducts === 'function') {
                        fetchProducts();
                    } else if (window.fetchProducts) {
                        window.fetchProducts();
                    }
                }
            }, { once: true });
        }
    });

    // Editar producto
    const editBtn = card.querySelector('#edit-product-btn');
    editBtn.addEventListener('click', () => {
        window.openEditProductModal(product);
    });

    window.fetchProducts = fetchProducts;

    return card;
}

async function checkSession() {
    const { data, error } = await supabase.auth.getSession();
    if (!data.session) {
        window.location.href = 'session/login.html';
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
                window.location.href = 'session/login.html';
            }
        });
    }
});

function showNotification(message, type = 'info') {
    const toast = document.getElementById('toast-default');
    if (!toast) return;
    // Cambia el mensaje
    toast.querySelector('.text-sm.font-normal').textContent = message;
    // Cambia el color/icono según tipo
    const icon = toast.querySelector('svg');
    if (type === 'error') {
        toast.style.borderColor = 'red';
        icon.classList.remove('text-blue-500');
        icon.classList.add('text-red-500');
    } else {
        toast.style.borderColor = 'blue';
        icon.classList.remove('text-red-500');
        icon.classList.add('text-blue-500');
    }
    toast.style.display = 'flex';
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.style.display = 'none';
        toast.classList.add('hidden');
    }, 3000);

    // Botón cerrar
    const closeBtn = toast.querySelector('[data-dismiss-target]');
    if (closeBtn) {
        closeBtn.onclick = () => {
            toast.style.display = 'none';
            toast.classList.add('hidden');
        };
    }
}

async function loadFilters() {
    const { data, error } = await supabase.from('products').select('category,brand');
    if (error) return;

    const categories = [...new Set(data.map(p => p.category).filter(Boolean))];
    const brands = [...new Set(data.map(p => p.brand).filter(Boolean))];

    const categorySelect = document.getElementById('category-filter');
    const brandSelect = document.getElementById('brand-filter');

    // Limpia opciones previas
    categorySelect.innerHTML = '<option value="">Todas las categorías</option>';
    brandSelect.innerHTML = '<option value="">Todas las marcas</option>';

    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
    });

    brands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        brandSelect.appendChild(option);
    });
}