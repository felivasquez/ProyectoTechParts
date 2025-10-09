import supabase from "./client.js";



async function renderCard() {
        const {data,error} = await supabase
        .from('movements')
.select('*,products: products (name, category)')
.order('quantity',{ascending:false}) 
.eq('type','entrada')
.limit (5);

if (error){
    console.error("Error al obtener los datos:", error);
}
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
    card.innerHTML =`
                                           
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
 async function renderTabla(){
    const {data,error} = await supabase
    .from('products')
    .select('*');
    
    if(error){
        console.error("Error al obtener los datos:", error);
    }
    const tbody = document.getElementById('cuerpoT');
    tbody.innerHTML = '';  
    const filtros = data.filter(item => item.stock < item.min_stock)
    filtros.forEach(item => {
        let estados = null;        
        let estadoColor = null;
       if ( item.stock <= item.min_stock /2){
        estados = 'Crítico'; 
       }    
       else{
        estados = 'Bajo';
       }
        estadoColor = 
        estados === 'Crítico' 
        ? 'bg-destructive text-destructive-foreground hover:bg-destructive/80 border-transparent'
        : 'bg-yellow-200 text-yellow-900 border-transparent';   
       const fila = document.createElement('tr');
       fila.className = 'border-b';
       fila.innerHTML = `
      <td class="py-3 font-medium">${item.name}</td>

      <td class="py-3">
        <div class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
          ${item.category}
        </div>
      </td>

      <td class="py-3 text-center">${item.stock}</td>
      <td class="py-3 text-center">${item.min_stock}</td>

      <td class="py-3 text-center">
        <div class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${estadoColor}">
          ${estados}
        </div>
      </td>
    `;
    tbody.appendChild(fila);
    })
} 
renderTabla();
renderCard();
