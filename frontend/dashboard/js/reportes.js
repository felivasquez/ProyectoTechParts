import supabase from './client.js';
const ctx = document.getElementById('lineChart').getContext('2d');
const {data,error} = await supabase
.from('movements')
.select('*'); 
if(error){
throw new Error('Error al obtener los movimientos: ' + error.message);
}
const nombresMeses = [  "Ene", "Feb", "Mar", "Abr", "May", "Jun","Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
let primerMes = 12;  
let ultimoMes = new Date().getMonth() + 1;
let totalEntradas = 0;
let totalSalidas = 0;

  data.forEach( movimientos => {
     const fecha = new Date(movimientos.created_at);
      const mes = fecha.getMonth() + 1; 
      if(mes < primerMes) primerMes = mes;         
  });
  let totalMeses = ultimoMes - primerMes + 1;
  const entradas = new Array(totalMeses).fill(0);
  const salidas = new Array(totalMeses).fill(0);
    data.forEach(movimientos => {
      const fecha = new Date(movimientos.created_at);
      const mes = fecha.getMonth() + 1;
      const index =  mes - primerMes;      
        if (movimientos.type === 'entrada') {
          entradas[index] += movimientos.quantity;          
            totalEntradas += movimientos.quantity;
            console.log('entrada Mes:', mes, 'Cantidad:', movimientos.quantity);
        } else if (movimientos.type === 'salida'){
          salidas[index] += movimientos.quantity; 
            totalSalidas += movimientos.quantity;
            console.log('Salida Mes:', mes, 'Cantidad:', movimientos.quantity);
        }
        
    });
    const labels = nombresMeses.slice(primerMes -1, ultimoMes);  
    totalMeses = ultimoMes - primerMes + 1;
    console.log('Total Entradas:', totalEntradas);
    console.log('Total Salidas:', totalSalidas);    
 

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