import supabase from './client.js';

// Menu despegable (variables)
const btn = document.getElementById('menuButton');
const menuDropdown = document.getElementById('menuDropdown');
const menutext = document.getElementById('menutext');
// mostrar/ocultar menu
btn.addEventListener('click', () => {
  menuDropdown.classList.remove('hidden');
})
// cerrarlo a la hora de pretar en otro lugar
document.addEventListener('click', (event) => {
  if (!btn.contains(event.target) && !menuDropdown.contains(event.target)) {
    menuDropdown.classList.add('hidden');
  }})
// seleccionar una opcion
   menuDropdown.querySelectorAll("a[data-value]").forEach(option => {
    option.addEventListener("click", (e) => {
      e.preventDefault();
      menutext.textContent = option.textContent;
      menuDropdown.classList.add("hidden");
    });
  });

//-------------------------------------------------------------------------------------------------------------------------------------------------------

// GRÁFICO DE LINEAS
const ctx = document.getElementById('lineChart').getContext('2d');
const {data,error} = await supabase
.from('movements')
.select('*'); 
if(error){
throw new Error('Error al obtener los movimientos: ' + error.message);
}
const NombreMeses = [  "Ene", "Feb", "Mar", "Abr", "May", "Jun","Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const entradasMap = new Map(); 
const salidasMap = new Map();
data.forEach(movimiento => {
  const fecha = new Date(movimiento.created_at);
  const mes = NombreMeses[fecha.getMonth()]; 

  if (movimiento.type === "entrada") {
    if(!entradasMap.has(mes)){
      entradasMap.set(mes, []);
    }
    entradasMap.get(mes).push(movimiento.quantity);
  } else if (movimiento.type === "salida") {
    if(!salidasMap.has(mes)){
      salidasMap.set(mes, []);
    }
    salidasMap.get(mes).push(movimiento.quantity);
}})
// Promediar las cantidades por mes
const salidas = [];
const entradas = [];
const labels = NombreMeses;

labels.forEach(mes => { 
salidas.push(salidasMap.has(mes) ? salidasMap.get(mes).reduce((a, b) => a + b, 0) : null);
entradas.push(entradasMap.has(mes) ? entradasMap.get(mes).reduce((a, b) => a + b, 0) : null); 
})
console.log(salidasMap.get('Ene'));
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Entradas',
          data: entradas,
          borderColor: '#10B981',
          backgroundColor: '#10B98120',
          tension: 0.4,
          spanGaps: true,
        },
        {
          label: 'Salidas',
          data: salidas,
          borderColor: '#EF4444',
          backgroundColor: '#EF444420',
          tension: 0.4,
          spanGaps: true,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: '#374151' } },
      },
      scales: {
        x: { ticks: { color: '#374151' } },
        y: { ticks: { color: '#374151' } },
      },
    },
  }); 