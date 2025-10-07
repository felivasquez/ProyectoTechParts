import supabase from "./client.js";

const {data,error} = await supabase
.from('movements')
.select('*,products: products (name, category)')
.order('quantity',{ascending:false}) 
.eq('type','entrada')
.limit (5);

if (error){
    console.error("Error al obtener los datos:", error);
}

function renderCard() {
    const container = document.getElementById('contenedor');
    container.innerHTML = '';
    data.forEach(item => {
      const movementProductsCard = card(item);
        container.appendChild(movementProductsCard);
    });
}
function card(data) {
    const card = document.createElement('div');
    card.className = 'flex items-center justify-between p-3 rounded-lg border'
    card.innerHTML = + `
                                           
                                                <div>
                                                    <p class="font-medium text-sm">${data.products?.name|| 'Sin nombre'}</p>
                                                    <p class="text-xs text-gray-500">${data.products?.category|| 'Sin categoria'}</p>
                                                </div>
                                                <div class="text-right">
                                                    <p class="font-semibold">${data.quantity}</p>
                                                    <p class="text-xs text-gray-500">movimientos</p>
                                                </div>
                                            `
    return card;
;
}
renderCard();