import supabase from '../js/client.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('add-product-form');
    const modal = document.getElementById('add-product-modal');
    const openModalBtn = document.getElementById('open-add-modal');

    if (openModalBtn) {
        openModalBtn.addEventListener('click', () => {
            modal.classList.remove('hidden');
            modal.setAttribute('data-state', 'open');
        });
    }

    document.querySelectorAll('#add-product-modal button[type="button"]').forEach(btn => {
        btn.addEventListener('click', () => {
            modal.classList.add('hidden');
            modal.setAttribute('data-state', 'closed');
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const category = document.getElementById('category')?.value?.trim() || 'Sin categoría';
        const brand = document.getElementById('brand').value.trim();
        const model = document.getElementById('model').value.trim();
        const stock = parseInt(document.getElementById('stock').value);
        const min_stock = parseInt(document.getElementById('min_stock').value);
        const price = parseFloat(document.getElementById('price').value);
        const location = document.getElementById('location').value.trim();
        const description = document.getElementById('description').value.trim();

        const { error } = await supabase.from('products').insert([{
            name,
            category,
            brand,
            model,
            stock,
            min_stock,
            price,
            location,
            description
        }]);

        if (error) {
            alert('Error al agregar el producto: ' + error.message);
            return;
        }

        alert('Producto agregado con éxito');
        // Limpiar el formulario
        form.reset();
        modal.classList.add('hidden');
        modal.setAttribute('data-state', 'closed');

        if (typeof fetchProducts === 'function') {
            fetchProducts();
        }
    });
});
