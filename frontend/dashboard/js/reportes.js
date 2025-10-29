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
  }
})
// seleccionar una opcion
menuDropdown.querySelectorAll("a[data-value]").forEach(option => {
  option.addEventListener("click", (e) => {
    e.preventDefault();
    menutext.textContent = option.textContent;
    const value = option.dataset.value;
    menuDropdown.classList.add("hidden");

    // Mostrar/ocultar botones de cambio de mes
    const prevBtn = document.getElementById('prevMes');
    const nextBtn = document.getElementById('nextMes');
    if (value === "ultMeses") {
      prevBtn.classList.remove("hidden");
      nextBtn.classList.remove("hidden");
    } else {
      prevBtn.classList.add("hidden");
      nextBtn.classList.add("hidden");
    }

    const chartData = getChartData(value, data);
    renderChart(chartData);
  });
});


//-------------------------------------------------------------------------------------------------------------------------------------------------------



// datos traidos de supabase
const ctx = document.getElementById('lineChart').getContext('2d');
const { data, error } = await supabase
  .from('movements')
  .select('*');
if (error) {
  throw new Error('Error al obtener los movimientos: ' + error.message);
}

// Mostrar por defecto la tendencia del mes actual
const chartData = getChartData("esteMes", data);
renderChart(chartData);

function getChartData(tipo, data) {
  // Nombres abreviados de los meses
  const NombreMeses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const entradasMap = new Map();
  const salidasMap = new Map();
  const TextTendencias = document.getElementById('TextTendencias');
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
      if (!entradasMap.has(mes)) {
        const semanasArray = TraerSemanasDeMes(año, mesIndex);
        const semanasMap = new Map();
        semanasArray.forEach(semana => {
          semanasMap.set(semana, []);
        });
        entradasMap.set(mes, semanasMap);
      }
      entradasMap.get(mes).get(semana).push(movimiento.quantity);

    } else if (movimiento.type === "salida") {
      if (!salidasMap.has(mes)) {
        const semanasArray = TraerSemanasDeMes(año, mesIndex);
        const semanasMap = new Map();
        semanasArray.forEach(semana => {
          semanasMap.set(semana, []);
        });
        salidasMap.set(mes, semanasMap);
      }
      salidasMap.get(mes).get(semana).push(movimiento.quantity);
    }
  });
  console.log(entradasMap);
  console.log(salidasMap);


  // Promediar las cantidades por mes
  let salidas = [];
  let entradas = [];
  let labels = [];

  const fechaActual = new Date();
  const mesActual = fechaActual.getMonth();
  const añoActual = fechaActual.getFullYear();
  const diaActual = fechaActual.getDate();
  console.log(TraerSemanasDeMes(añoActual, mesActual, diaActual));
  switch (tipo) {
    //filtro de la lógica si el data-value es EsteMes.
    case "esteMes": {
      //agarramos el mes actual dentro del array de meses
      const semanaDelDia = ObtenerSemanaDelDia(añoActual, mesActual, diaActual);
      const semanasDelMes = TraerSemanasDeMes(añoActual, mesActual);
      const NombreMes = NombreMeses[mesActual];
      //le pasamos al labels el mes actual
      console.log(semanasDelMes);
      labels = semanasDelMes;
      //le pasamos al array de entradas y salidas la suma total de las entradas y salidas del mes actual
      entradas = semanasDelMes.map(semana => {
        const valores = entradasMap.get(NombreMes)?.get(semana);
        return valores ? valores.reduce((a, b) => a + b, 0) : 0;
      })

      salidas = semanasDelMes.map(semana => {
        const valores = salidasMap.get(NombreMes)?.get(semana);
        return valores ? valores.reduce((a, b) => a + b, 0) : 0;
      })
      TextTendencias.textContent = `Entradas vs Salidas de ${NombreMes}`;
    }
      break;
    //filtro de la lógica si el data-value es ultMeses.
    case "ultMeses": {
      //logíca para últimos meses
      let indiceDelMesCambiante = 0;
      const ultimosMeses = [];
      //obtenemos los últimos 3 meses
      for (let i = 4; i >= 0; i--) {
        const mesIndex = (mesActual - i + 12) % 12;
        ultimosMeses.push(mesIndex);
      }
      //hacemos un map de los últimos meses para obtener los nombres de los meses
      let labels = []
      console.log(labels);
      const ctxF = { ultimosMeses, NombreMeses, añoActual, entradasMap, salidasMap, labels: [], entradas: [], salidas: [] };
      renderMes(indiceDelMesCambiante, ctxF);
      renderChart(ctxF);
      //recorremos los labels para obtener las entradas y salidas de cada mes
      const len = ctxF.ultimosMeses.length;
        TextTendencias.textContent = `Entradas vs Salidas de ${ctxF.NombreMeses[ctxF.ultimosMeses[indiceDelMesCambiante]]}`;
      
      document.getElementById('prevMes').addEventListener('click', () => {
        indiceDelMesCambiante = (indiceDelMesCambiante + 1) % len;
        renderMes(indiceDelMesCambiante, ctxF);
        TextTendencias.textContent = `Entradas vs Salidas de ${ctxF.NombreMeses[ctxF.ultimosMeses[indiceDelMesCambiante]]}`;
        renderChart(ctxF);

      })
      document.getElementById('nextMes').addEventListener('click', () => {
        indiceDelMesCambiante = (indiceDelMesCambiante - 1 + 5) % len;
        renderMes(indiceDelMesCambiante, ctxF);
        TextTendencias.textContent = `Entradas vs Salidas de ${ctxF.NombreMeses[ctxF.ultimosMeses[indiceDelMesCambiante]]}`;
        renderChart(ctxF);

      })
      console.log(ctxF.labels);

    }
      break;
    //filtro de la lógica si el data-value es porA.
    case "porA": {
      //logíca para este año
      //le pasamos todos los meses al labels
      labels = NombreMeses;
      //recorremos los labels para obtener las entradas y salidas de cada mes
      labels.forEach(mes => {
        if (entradasMap.has(mes)) {
          let total = 0;
          entradasMap.get(mes).forEach(valores => {
            total += valores.reduce((a, b) => a + b, 0);
          });
          entradas.push(total);
        } else {
          entradas.push(null);
        }
        if (salidasMap.has(mes)) {
          let total = 0;
          salidasMap.get(mes).forEach(valores => {
            total += valores.reduce((a, b) => a + b, 0);
          });
          salidas.push(total);
        } else {
          salidas.push(null);
        }
      })
      TextTendencias.textContent = `Entradas vs Salidas del año ${añoActual}`;
    }
      break;
         
  }
  return { labels, entradas, salidas };
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
function renderMes(indexMes, ctxF) {
  // Nombres abreviados de los meses
  const { ultimosMeses, NombreMeses, añoActual, entradasMap, salidasMap } = ctxF;

  const mesIndex = ultimosMeses[indexMes];
  const nombreMes = NombreMeses[mesIndex];
  const semanasDelMes = TraerSemanasDeMes(añoActual, mesIndex);

  ctxF.labels = semanasDelMes

  ctxF.entradas = semanasDelMes.map(semana => {
    const valores = entradasMap.get(nombreMes)?.get(semana);
    return valores ? valores.reduce((a, b) => a + b, 0) : 0;
  })

  ctxF.salidas = semanasDelMes.map(semana => {
    const valores = salidasMap.get(nombreMes)?.get(semana);
    return valores ? valores.reduce((a, b) => a + b, 0) : 0;
  });

  document.getElementById('mesesCambiantes').innerHTML = `${nombreMes}`;
  
}

function renderChart({ labels, entradas, salidas }) {
  if (chartt) {
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
  })

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

async function cuadrosReport() {
  // Elementos del DOM
  const valor = document.getElementById('valorT');
  const sinStock = document.getElementById('sinStock');
  const alertas = document.getElementById('alertas'); 
  const ganacias = document.getElementById('ganancias');
  const valorP = document.getElementById('porcentajeV');     
  const stock = document.getElementById('div-stock'); 
  const gananciasP = document.getElementById('gananciasP');
  // Obtener datos de Supabase para Valor total del mes
  const {data,error} = await supabase
  .from('products')
  .select('*');

  if (error){
    console.error("Error al obtener los datos:", error);
    return;
  }
  
const fechaA = new Date();
const mesA  = fechaA.getMonth();
let fechaAnterior = mesA - 1;
if (fechaAnterior < 0) {
  fechaAnterior = 11; 
}

let valorTotalM = 0;
let valorTotalManterior = 0;

data.forEach(producto => {
  const fechaD = new Date(producto.created_at);
  const mesD = fechaD.getMonth();
  
  const valorProducto = producto.price * producto.stock; // Valor de cada producto

  if (mesD === mesA) {
    valorTotalM += valorProducto; 
  }  
  if (mesD === fechaAnterior) {
    valorTotalManterior += valorProducto; 
  }
});

// Calcular diferencia y porcentaje
const valorFinal = valorTotalM - valorTotalManterior;
const porcentaje = valorTotalManterior === 0 ? 0 : (valorFinal / valorTotalManterior) * 100;

// Mostrar resultados
valor.textContent = `$${valorTotalM.toLocaleString()}`;
valorP.textContent = porcentaje.toLocaleString() + '% ' + 'vs mes anterior';
//fin del valor total del mes
//sin stock
const filtroStock = data.filter(item => item.stock === 0);
let sinStockNum = filtroStock.length;
sinStock.textContent = sinStockNum;
// Obtener datos de Supabase para las alertas de reportes
if (error){
  console.error("Error al obtener los datos:", errorMovimientos);
  return;
}
const Filtro = data.filter(item => item.stock < item.min_stock);
let alertasNum = Filtro.length;
alertas.textContent = alertasNum;


}
cuadrosReport();

//-------------------------------------

//------------------------------------------------------

