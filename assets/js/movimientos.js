import supabase from './client.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('movimiento-form');

    // Abrir modal
    const openModalBtn = document.getElementById('open-movimiento-modal');
    const modal = document.getElementById('movimiento-modal');
    if (openModalBtn && modal) {
        openModalBtn.addEventListener('click', () => {
            modal.classList.remove('hidden');
            modal.setAttribute('data-state', 'open');
        });
    }

    // Cerrar modal (botón cancelar y X)
    document.getElementById('close-movimiento-modal')?.addEventListener('click', () => {
        modal.classList.add('hidden');
        modal.setAttribute('data-state', 'closed');
    });
    document.getElementById('close-movimiento-modal-x')?.addEventListener('click', () => {
        modal.classList.add('hidden');
        modal.setAttribute('data-state', 'closed');
    });


    
    // Manejar el envío del formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        try {
            if (data.id) {
                // Actualizar producto existente
                await supabase.from('products').update(data).eq('id', data.id);
            } else {
                // Agregar nuevo producto
                await supabase.from('products').insert(data);
            }

            // Cerrar modal y actualizar lista de productos
            modal.classList.add('hidden');
            modal.setAttribute('data-state', 'closed');
            loadProducts();
        } catch (error) {
            console.error('Error al agregar/actualizar producto:', error);
        }
    });
});