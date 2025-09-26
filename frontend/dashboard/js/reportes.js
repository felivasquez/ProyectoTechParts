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
document.addEventListener('DOMContentLoaded', async () => {
  // Traer todas las categorías
  const { data: productos, error } = await supabase
    .from('products')
    .select('category');

  if (error) {
    console.error('Error al traer productos:', error);
    return;
  }

  // Contar productos por categoría
  const conteoCategorias = {};
  productos.forEach(p => {
    if (conteoCategorias[p.category]) {
      conteoCategorias[p.category]++;
    } else {
      conteoCategorias[p.category] = 1;
    }
  });

  // Obtener labels y series dinámicamente
  const labels = Object.keys(conteoCategorias);
  const series = Object.values(conteoCategorias);

  // Configuración del gráfico
  const chartOptions = {
    series: series,
    labels: labels,
    colors: ["#10b981", "#3b82f6", "#8b5cf6", "#E74694", "#fcd34d", "#f97316"],
    chart: {
      height: 320,
      width: "100%",
      type: "donut",
    },
    stroke: { colors: ["transparent"] },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            name: { show: true, fontFamily: "Inter, sans-serif", offsetY: 20 },
            total: {
              showAlways: true,
              show: true,
              label: "Total productos",
              fontFamily: "Inter, sans-serif",
              formatter: function (w) {
                const sum = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                return sum;
              }
            },
            value: {
              show: true,
              fontFamily: "Inter, sans-serif",
              offsetY: -20,
              formatter: (value) => value
            }
          },
          size: "80%"
        }
      }
    },
    dataLabels: { enabled: false },
    legend: { position: "bottom", fontFamily: "Inter, sans-serif" }
  };

  // Renderizar el gráfico
  if (document.getElementById("donut-chart")) {
    const chart = new ApexCharts(document.getElementById("donut-chart"), chartOptions);
    chart.render();
  }
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
    const ultimosMeses = []
    //obtenemos los últimos 3 meses
    for (let i = 4; i >= 0; i--) {
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
}})
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
  });
}; 

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