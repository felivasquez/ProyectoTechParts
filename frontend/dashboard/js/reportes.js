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
  //-------------------------------------------------------------
  const alertasDivs = document.querySelectorAll('.p-6 pt-0');
    alertas.forEach((alerta, i) => {
        if (alertasDivs[i]) {
            alertasDivs[i].querySelector('.font-medium.text-sm').textContent = alerta.nombre;
            alertasDivs[i].querySelector('.text-xs.text-gray-500').textContent = alerta.categoria;
            const spans = alertasDivs[i].querySelectorAll('.flex.justify-between.text-xs span');
            if (spans.length === 2) {
                spans[0].textContent = `Stock actual: ${alerta.stock}`;
                spans[1].textContent = `Mínimo: ${alerta.min}`;
            }
        }
    }); 