import supabase from './client.js';
let chartt; 
// Menu despegable (variables)
const btn = document.getElementById('menuButton');
const menuDropdown = document.getElementById('menuDropdown');
const menutext = document.getElementById('menutext');
let selectedOption = null;
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
      const value = option.dataset.value;
       menuDropdown.classList.add("hidden");

       const chartData = getChartData(value,data);
       renderChart(chartData);

    });
  });

//-------------------------------------------------------------------------------------------------------------------------------------------------------

// datos traidos de supabase
const ctx = document.getElementById('lineChart').getContext('2d');
const {data,error} = await supabase
.from('movements')
.select('*'); 
if(error){
throw new Error('Error al obtener los movimientos: ' + error.message);
}
function getChartData(tipo,data) {
  // Nombres abreviados de los meses
const NombreMeses = [  "Ene", "Feb", "Mar", "Abr", "May", "Jun","Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const entradasMap = new Map(); 
const salidasMap = new Map();
data.forEach(movimiento => {
  const fecha = new Date(movimiento.created_at);
  const mesIndex = fecha.getMonth();
  const mes = NombreMeses[mesIndex]; 
// Agrupar cantidades por mes y tipo
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
}});

// Promediar las cantidades por mes
let  salidas = [];
let  entradas = [];
let  labels = [];  
//traemos la fecha actual
const fechaActual = new Date();
//filtramos la fecha actual para obtener el mes actual
const mesActual = fechaActual.getMonth();
switch (tipo) {
  //filtro de la lógica si el data-value es EsteMes.
  case "esteMes":{
    //agarramos el mes actual dentro del array de meses
    const NombreMes = NombreMeses[mesActual];
    //le pasamos al labels el mes actual
    labels = [NombreMes];
    //le pasamos al array de entradas y salidas la suma total de las entradas y salidas del mes actual
    entradas.push(entradasMap.has(NombreMes) ? entradasMap.get(NombreMes).reduce((a, b) => a + b, 0) : null);
    salidas.push(salidasMap.has(NombreMes) ? salidasMap.get(NombreMes).reduce((a, b) => a + b, 0) : null);
  }
    break;
  //filtro de la lógica si el data-value es ultMeses.
  case "ultMeses":{
    //logíca para últimos meses
    const ultimosMeses = []
    //obtenemos los últimos 3 meses
    for (let i = 2; i >= 0; i--) {
      const mesIndex = (mesActual - i + 12) % 12;
      ultimosMeses.push([mesIndex]);
    }
    //hacemos un map de los últimos meses para obtener los nombres de los meses
    labels = ultimosMeses.map(i => NombreMeses[i]);
    console.log(labels);
    //recorremos los labels para obtener las entradas y salidas de cada mes
    labels.forEach(mes => { 
      entradas.push(entradasMap.has(mes) ? entradasMap.get(mes).reduce((a, b) => a + b, 0) : null);
      salidas.push(salidasMap.has(mes) ? salidasMap.get(mes).reduce((a, b) => a + b, 0) : null); 
    });}
    break;
  //filtro de la lógica si el data-value es porA.
  case"porA":
    //logíca para este año
  //le pasamos todos los meses al labels
  labels = NombreMeses;
  //recorremos los labels para obtener las entradas y salidas de cada mes
  labels.forEach(mes => { 
salidas.push(salidasMap.has(mes) ? salidasMap.get(mes).reduce((a, b) => a + b, 0) : null);
entradas.push(entradasMap.has(mes) ? entradasMap.get(mes).reduce((a, b) => a + b, 0) : null); 
})
    break;
  //filtro de la lógica si el data-value es perzonalido.
  case"perzonalido":{

     //logíca para personalizado 
  // falta por hacer y no está del todo concreta :D, pero dejo mínimamente lo básico: 
   
    }
    break; 
}
return{ labels, entradas, salidas };
}



function renderChart({labels, entradas, salidas}) {
 if(chartt){
  chartt.destroy();
 } 


chartt = new Chart(ctx, {
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
  })}; 