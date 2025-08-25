import supabase from './client.js';

document.addEventListener('DOMContentLoaded', () => {
   

    // Abrir modal
        const modal = document.getElementById('movimiento-modal');
    const openBtn = document.getElementById('open-movimiento-modal');
     const form = document.getElementById('movimiento-form');
    if (openBtn) {
        openBtn.addEventListener('click', () => {
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
    let error;
    const componentes = document.getElementById('producto-id')?.value?.trim();
    const type = document.getElementById('tipo')?.value?.trim();
    const quantity = parseInt(document.getElementById('cantidad')?.value?.trim(),);                   
    const reason = document.getElementById('reason')?.value?.trim();
    const supplier = document.getElementById('supplier').value.trim();
    const notas = document.getElementById('notes').value.trim(); 

    ({error} = await supabase.from('movimientos').insert([{
        type,quantity,reason,supplier,notas,componentes
    }]));
    if(error){
        alert('Error al registrar el movimiento: ' + error.message);
        return;
    }
    else {
        alert('Movimiento registrado exitosamente');
        form.reset();
        modal.classList.add('hidden');
        modal.setAttribute('data-state', 'closed');
        // Recargar la página para ver el nuevo movimiento
        window.location.reload();
    }

});
fetchmovements();
});
async function fetchmovements() {
    // Traer los movimientos desde Supabase
    const { data, error } = await supabase
        .from('movimientos')
        .select('*')

    if (error) {
        console.error('Error al traer productos:', error);
        return;
    }
    console.log('movimientos:',data);
    const container = document.getElementById('conteiner-movements');
    container.innerHTML = ''; // Limpiar el contenedor antes de agregar nuevos movimientos
    data.array.forEach(movimientos => {
        const cardmovement = createMovementCard(movimientos);
        container.appendChild(cardmovement);        
    });

}

function createMovementCard(movimientos) {
    // Crear un card para cada movimiento
    const card = document.createElement('div');
    card.className ="rounded-lg border bg-card text-card-foreground shadow-sm";
    card.innerHTML = `<div class="p-6 pt-6">
                                        <div class="flex items-start justify-between">
                                            <div class="flex items-start space-x-4">
                                                <div class="p-2 rounded-full bg-gray-100">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                        viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                                        class="lucide lucide-trending-up h-5 w-5 text-green-600">
                                                        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                                                        <polyline points="16 7 22 7 22 13"></polyline>
                                                    </svg>
                                                </div>
                                                <div class="flex-1">
                                                    <div class="flex items-center space-x-2 mb-2">
                                                        <h3 class="font-semibold text-lg">Intel Core i7-13700K</h3>
                                                        <div
                                                            class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800">
                                                            Entrada
                                                        </div>
                                                    </div>
                                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <p class="text-gray-600"><span
                                                                    class="font-medium">Cantidad:</span> 7 unidades</p>
                                                            <p class="text-gray-600"><span
                                                                    class="font-medium">Motivo:</span> Compra a
                                                                proveedor
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p class="text-gray-600"><span
                                                                    class="font-medium">Fecha:</span>
                                                                14/08/2025, 02:25</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="text-right">
                                                <p class="text-2xl font-bold text-green-600">+7</p>
                                            </div>
                                        </div>
                                    </div>
    
    
    `;      
}