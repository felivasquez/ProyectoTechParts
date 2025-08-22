
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('add-move-modal');
    const form = document.getElementById('add-move-form');
    const openModalBtn = document.getElementById('open-add-modal');
    const submit = document.getElementById('submit-move-btn');
    // Abrir modal para añadir movimiento
    if(openModalBtn){
        openModalBtn.addEventListener('click', () => {
             form.reset();
             modal.classList.remove('hidden');
             modal.setAttribute('data-state', 'open');
        });
    }
    // Cerrar modal
    document.querySelectorAll('#add-move-modal button[type="button"]').forEach(btn => {
        btn.addEventListener('click', () => {
            modal.classList.add('hidden');
            modal.setAttribute('data-state', 'closed');
        });
    });
    });                      