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
        e.preventDefault();
    let error;
    const componentes = document.getElementById('product_id')?.value?.trim();
    const type = document.getElementById('type')?.value?.trim();
    const quantity = parseInt(document.getElementById('quantity')?.value?.trim());
    const reason = document.getElementById('reason')?.value?.trim();
    const supplier = document.getElementById('supplier').value.trim();
    const notes = document.getElementById('notes').value.trim(); 
    console.log({ type, quantity, reason, supplier, notes, componentes});
    ({error} = await supabase.from('movements').insert([{
        type,quantity,reason,supplier,notes,componentes
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
        .from('movements')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) {
        console.error('Error al traer productos:', error);
        return;
    }
    console.log('movimientos:',data);

    // Calcular totales; Entradas,Salidas y Movimientos:
    let totalEntradas = 0;
    let totalSalidas = 0;   
    let totalMovimientos = data.length;

    data.forEach(movimientos => {
        if (movimientos.type === 'entrada') {
            totalEntradas += movimientos.quantity;
        } else if (movimientos.type === 'salida'){
            totalSalidas += movimientos.quantity;
        }
    });
    console.log({totalEntradas,totalSalidas,totalMovimientos});
    // Actualizar el DOM con los totales
    document.getElementById('entrada').textContent = totalEntradas;
    document.getElementById('salida').textContent = totalSalidas;
    document.getElementById('total').textContent = totalMovimientos;

    // Renderizar los movimientos en el contenedor
    const container = document.getElementById('conteiner-movements');
    container.innerHTML = '';
    data.forEach(movimientos => {
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
                                                        <h3 class="font-semibold text-lg">${movimientos.componentes}</h3>
                                                        <div
                                                            class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800">
                                                            ${movimientos.type}
                                                        </div>
                                                    </div>
                                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <p class="text-gray-600"><span
                                                                    class="font-medium">Cantidad:</span> ${movimientos.quantity}</p>
                                                            <p class="text-gray-600"><span
                                                                    class="font-medium">Motivo:</span> ${movimientos.reason}</p>
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p class="text-gray-600"><span
                                                                    class="font-medium">Fecha: </span>
                                                                ${new Date(movimientos.created_at).toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="text-right">
                                                <p class="text-2xl font-bold text-green-600">${movimientos.quantity}</p>
                                            </div>
                                        </div>
                                    </div>
    `;
    return card;                                        

}

async function SelectDinamic() {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) {
        console.error('Error al traer productos:', error);
    } else {
        return Option(data);
     }
}


 function Option(data) {
    const select = document.getElementById('product_id');
    data.forEach(occiones => {
    const option = document.createElement('option');
    option.value = occiones.id;   
    option.textContent = occiones.name;
    option.classList = "";
    select.appendChild(option);

  });
  console.log('option agregada');
};

SelectDinamic();


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




