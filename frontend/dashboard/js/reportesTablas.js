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
    const filtros = data.filter(item => item.stock < item.min_stock && item.stock > 0)
    filtros.forEach(item => {
        let estados = null;        
        let estadoColor = null;
       if ( item.stock <= item.min_stock /2){
        estados = 'critico'; 
       }    
       else{
        estados = 'Bajo';
       }
        estadoColor = 
        estados === 'critico' 
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

//------------
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
    colors: ["#10b981", "#3b82f6", "#8b5cf6", "#E74694", "#fcd34d", "#f97316","#f23","#123"],
    chart: {      
      height: 320,
      width: "100%",
      type: "donut",
      toolbar: {
      show: true,
    }
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
//------------------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
  // Traer todas las categorías y precios (por ejemplo)
  const { data: productos, error } = await supabase
    .from('products')
    .select('category, price','type',['entrada', 'salida'],'quantity',{ascending:false});

if (error) {
  console.error('Error al traer productos:', error);
  return;
}

async function cargarGrafico() {
  // Simulación de datos que traés de Supabase

  let ordenarPor = "count"; // 🔁 alterna entre "count" o "total"
  let chart; // referencia global del gráfico

  function procesarDatos() {
    const estadisticas = {};
    productos.forEach(p => {
      if (!estadisticas[p.category]) {
        estadisticas[p.category] = { count: 0, total: 0 };
      }
      estadisticas[p.category].count += 1;
      estadisticas[p.category].total += (p.price || 0) * (p.quantity || 1);
    });

    return Object.entries(estadisticas)
      .map(([categoria, valores]) => ({
        categoria,
        count: valores.count,
        total: valores.total
      }))
      .sort((a, b) => b[ordenarPor] - a[ordenarPor]); // 🔽 orden dinámico
  }

  function renderizarGrafico() {
    const datos = procesarDatos();
    const categorias = datos.map(d => d.categoria);
    const cantidades = datos.map(d => d.count);
    const totales = datos.map(d => d.total);

    const options = {
      series: [
        {
          name: "Cantidad de productos",
          color: "#3b82f6",
          data: cantidades,
        },
        {
          name: "Precio total",
          color: "#10b981",
          data: totales,
        }
      ],
      chart: {
        type: "bar",
        height: 350,
        toolbar: { show: true },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 6,
        },
      },
      dataLabels: { enabled: false },
      legend: { show: true, position: "bottom" },
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: function (value, { seriesIndex }) {
            if (typeof value !== "number" || isNaN(value)) return "0";
            return seriesIndex === 1
              ? "$" + value.toFixed(2)
              : value + " unidades";
          }
        },
      },
      xaxis: {
        categories: categorias,
        labels: {
          style: {
            fontFamily: "Inter, sans-serif",
            cssClass: "text-xs font-normal fill-gray-500 dark:fill-gray-400",
          },
        },
      },
      grid: {
        show: true,
        strokeDashArray: 4,
        padding: { left: 2, right: 2, top: -20 },
      },
      fill: { opacity: 1 },
    };

    if (chart) chart.destroy(); // 🔄 destruir gráfico anterior
    chart = new ApexCharts(document.getElementById("bar-chart"), options);
    chart.render();
  }

  // Render inicial
  renderizarGrafico();

  // Botón para alternar criterio
  document.getElementById("ordenarBtn").addEventListener("click", () => {
    ordenarPor = ordenarPor === "count" ? "total" : "count";
    document.getElementById("ordenarBtn").textContent =
      ordenarPor === "count"
        ? "Ordenar por Precio Total"
        : "Ordenar por Cantidad";
    renderizarGrafico();
  });
}

// Ejecutar función
cargarGrafico();
});
