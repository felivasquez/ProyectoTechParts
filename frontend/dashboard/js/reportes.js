import supabase from './client.js';
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
