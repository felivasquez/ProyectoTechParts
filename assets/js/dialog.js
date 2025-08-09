import supabase from '../js/client.js';

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

        if (error) {
            alert('Error al guardar el producto: ' + error.message);
            return;
        } else {
            alert(id ? 'Producto editado con éxito' : 'Producto agregado con éxito');
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
});
