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
  const dia = fecha.getDate();
  const año = fecha.getFullYear();
  //traemos la fecha actual
  const semana = ObtenerSemanaDelDia(año, mesIndex, dia);
// Agrupar cantidades por mes y tipo
  if (movimiento.type === "entrada") {
    if(!entradasMap.has(mes)){
      const semanasArray = TraerSemanasDeMes(año,mesIndex);
      const semanasMap = new Map();
      semanasArray.forEach(semana => {
        semanasMap.set(semana, []);
      });
      entradasMap.set(mes, semanasMap);      
    }
     entradasMap.get(mes).get(semana).push(movimiento.quantity);

  } else if (movimiento.type === "salida") {
    if(!salidasMap.has(mes)){
      const semanasArray = TraerSemanasDeMes(año,mesIndex);
      const semanasMap = new Map();
      semanasArray.forEach(semana => {
        semanasMap.set(semana, []);
      });
      salidasMap.set(mes, semanasMap);      
    }
    salidasMap.get(mes).get(semana).push(movimiento.quantity);
}});
console.log(entradasMap);
console.log(salidasMap);


// Promediar las cantidades por mes
let  salidas = [];
let  entradas = [];
let  labels = [];  

const fechaActual = new Date();
const mesActual = fechaActual.getMonth(); 
const añoActual = fechaActual.getFullYear();
const diaActual = fechaActual.getDate();
console.log(TraerSemanasDeMes(añoActual,mesActual,diaActual));
switch (tipo) {
  //filtro de la lógica si el data-value es EsteMes.
  case "esteMes":{
    //agarramos el mes actual dentro del array de meses
    const semanaDelDia = ObtenerSemanaDelDia(añoActual,mesActual,diaActual); 
    const semanasDelMes = TraerSemanasDeMes(añoActual,mesActual);
    const NombreMes = NombreMeses[mesActual];
    //le pasamos al labels el mes actual
    console.log(semanasDelMes);
    labels = semanasDelMes;
    //le pasamos al array de entradas y salidas la suma total de las entradas y salidas del mes actual
    entradas = semanasDelMes.map(semana =>{   
    const valores = entradasMap.get(NombreMes)?.get(semana);
    return valores ? valores.reduce((a, b) => a + b, 0) : 0;
    }) 
    
    salidas = semanasDelMes.map(semana =>{
      const valores = salidasMap.get(NombreMes)?.get(semana);
    return valores ? valores.reduce((a, b) => a + b, 0) : 0;
    })
  }
    break;
  //filtro de la lógica si el data-value es ultMeses.
  case "ultMeses":{
    //logíca para últimos meses
    let indiceDelMesCambiante = 0;
    const ultimosMeses = [];
    //obtenemos los últimos 3 meses
    for (let i = 4; i >= 0; i--) {
      const mesIndex = (mesActual - i + 12) % 12;
      ultimosMeses.push([mesIndex]);
    }
    //hacemos un map de los últimos meses para obtener los nombres de los meses
    let labels = []
    console.log(labels);
   const ctxF = { ultimosMeses, NombreMeses,añoActual,entradasMap,salidasMap,labels: [], entradas: [], salidas: []};
    //recorremos los labels para obtener las entradas y salidas de cada mes
    document.getElementById('prevMes').addEventListener('click', () => {
      indiceDelMesCambiante = (indiceDelMesCambiante + 1 )% 5;
      renderMes(indiceDelMesCambiante,ctxF);
    })
    document.getElementById('nextMes').addEventListener('click', () => {
      indiceDelMesCambiante = (indiceDelMesCambiante - 1 + 5) % 5;
      renderMes(indiceDelMesCambiante,ctxF);
      
    })}
    break;
  //filtro de la lógica si el data-value es porA.
  case"porA":{
    //logíca para este año
  //le pasamos todos los meses al labels
  labels = NombreMeses;
  //recorremos los labels para obtener las entradas y salidas de cada mes
  labels.forEach(mes => {
    if(entradasMap.has(mes)) {
      let total = 0;
      entradasMap.get(mes).forEach(valores => {
        total += valores.reduce((a, b) => a + b, 0);
      });
      entradas.push(total);
  } else {
      entradas.push(null);
  }
    if(salidasMap.has(mes)) {
      let total = 0;
      salidasMap.get(mes).forEach(valores => {
        total += valores.reduce((a, b) => a + b, 0);
      });
      salidas.push(total);
  } else {
      salidas.push(null);
}})}
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

function ObtenerSemanaDelDia(año, mes, dia) {
  const primerDia = new Date(año, mes, 1);
  const PrimerDiaDe0 = primerDia.getDay(); 
  const primerDiaF = PrimerDiaDe0 ? PrimerDiaDe0 - 1 : 6; 

  const semanaNum = Math.ceil((dia + primerDiaF) / 7);
  return `Semana ${semanaNum}`;
}
function TraerSemanasDeMes(año, mes) {
  
  const ultimoDia = new Date(año, mes + 1, 0).getDate(); 
  const primerDia = new Date(año, mes, 1);
  const PrimerDiaDe0 = primerDia.getDay(); 
  const primerDiaF = PrimerDiaDe0 ? PrimerDiaDe0 - 1 : 6; 

  const semanasTotales = Math.ceil((ultimoDia + primerDiaF) / 7);

  const semanas = [];
  for (let i = 1; i <= semanasTotales; i++) {
    semanas.push(`Semana ${i}`);
  }

  return semanas;
}
function renderMes(indexMes,ctxF){
  // Nombres abreviados de los meses
  const { ultimosMeses, NombreMeses,añoActual,entradasMap,salidasMap, labels: [], entradas: [], salidas: []} = ctxF; 
  const mesIndex = ultimosMeses[indexMes];
  const nombreMes = NombreMeses[mesIndex];
  const semanasDelMes = TraerSemanasDeMes(añoActual,mesIndex);
  
   ctx.labels = semanasDelMes

  ctx.entradas = semanasDelMes.map(semana =>{
    const valores = entradasMap.get(nombreMes)?.get(semana);
    return valores ? valores.reduce((a, b) => a + b, 0) : 0;
  })
  
  ctx.salidas = semanasDelMes.map(semana =>{
    const valores = salidasMap.get(nombreMes)?.get(semana);
    return valores ? valores.reduce((a, b) => a + b, 0) : 0;
    });
    
    chartt.update();
    document.getElementById('mesesCambiantes').innerHTML = `${nombreMes}`;  
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