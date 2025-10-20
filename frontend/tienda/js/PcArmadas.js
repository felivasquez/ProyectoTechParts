import supabase from '../../dashboard/js/client.js';

document.addEventListener('DOMContentLoaded', () => {
     traerProductos();
     MostrarStorageAlReiniciar();
 });
async function traerProductos(){
    const {data,error} = await supabase
    .from('products')
    .select('*')
    if (error) { 
        console.error('Error fetching products:', error);
         return;
         }
         //filtros Btn 
        
        
         const procesadorButton = document.getElementById('procesador');
         const motherboardButton = document.getElementById('Motherboard');
         const memoriaRAMButton = document.getElementById('Memoria-RAM');
         
         const allProductCards = document.querySelectorAll('.product-card');
          const total = document.getElementById('total'); 
          const wattsDisplayElement = document.getElementById('watts-display');
           const amdFilterButton = document.getElementById('amd-filter'); 
           const intelFilterButton = document.getElementById('intel-filter');

           //variables globales
           const categoriasOrden = ['Procesadores', 'Placas Madre', 'Memoria RAM'];
           let indiciesCategoria = 0; 
           let filtroCategoria = null;
           let precio = {};
           //pasar a la siguiente sección por elegir un producto
           
           function totalCompra() {
            const componentesPrecioStorage = JSON.parse(localStorage.getItem('componentesPrecio')) || {}; 
            
            const suma = Object.values(precio).reduce((acc, curr) => acc + curr, 0);
            
            total.textContent = `Total: $${suma}`;
           }
           function ordenarPorCategoria() {
            indiciesCategoria++;
            if (indiciesCategoria  >= categoriasOrden.length + 1) {
              console.log('completo');
              return;
            }
            filtroCategoria = categoriasOrden[indiciesCategoria];  
            if(filtroCategoria === 'Procesadores') {
              MostrarBtn(amdFilterButton);
              MostrarBtn(intelFilterButton);
            } else  {
              OcultarBtn(amdFilterButton);
              OcultarBtn(intelFilterButton);
            }          
            
            Aplicarfiltros();
           }

           //aplicar filtros
           function Aplicarfiltros() {
           let filtros = data;
            
            if(filtroCategoria){
              filtros = filtros.filter(producto => producto.category === filtroCategoria);                          
              }  
            
          mostrarProductos(filtros);          
          }
          //econtrar palabras claves en el nombre del producto para así filtrarlo por AMD y Intel (ya que en la base de datos no hay nada que diga si es intel o AMD)
          
          
          function EncontrarPalabra(palabrasClave) {
            let filtros = data;

            filtros = filtros.filter(producto => 
              palabrasClave.some(palabra => 
                producto.name.toLowerCase().includes(palabra)
              )
            );
            mostrarProductos(filtros);
          } 
          //Funciones para mostrar y ocultar botones


          function OcultarBtn(btn) {
            btn.classList.add('hidden');

          }
          function MostrarBtn(btn) {
            btn.classList.remove('hidden');
              
          }


          //funcion para activar y desactivar botones
          function activarBtn(BotonActivo, BotonInactivo) {

            // Activar botón
            
            BotonActivo.classList.add('border-blue-600', 'text-blue-600');
            BotonActivo.classList.remove('border-transparent', 'text-gray-600');
            // Inactivar botón

            BotonInactivo.classList.remove('border-blue-600', 'text-blue-600');
            BotonInactivo.classList.add('border-transparent', 'text-gray-600');
          }


          //funcion para los botones de categoria
          function Botones(boton,categoria,botonesMostrar = [], botonesOcultar = []) {
            boton.addEventListener('click', () => {
            filtroCategoria = categoria;
            Aplicarfiltros();                 
             indiciesCategoria = categoriasOrden.indexOf(categoria);
            botonesMostrar.forEach(btn => MostrarBtn(btn));

            botonesOcultar.forEach(btn => OcultarBtn(btn));  
          });          
          }


          //mostrar todos los productos al cargar la página
          filtroCategoria = 'Procesadores';
            Aplicarfiltros()      
            MostrarBtn(amdFilterButton);
            MostrarBtn(intelFilterButton);


            //parte en donde se configura los botones para filtrar por categoría
            Botones(procesadorButton, 'Procesadores', [amdFilterButton, intelFilterButton], []);
            Botones(motherboardButton, 'Placas Madre', [], [amdFilterButton, intelFilterButton]);
            Botones(memoriaRAMButton, 'Memoria RAM', [], [amdFilterButton, intelFilterButton]);


            //filtros por AMD e INTEL
            amdFilterButton.addEventListener('click', () => {
              const palabrasClave =  ["amd", "ryzen"];
              EncontrarPalabra(palabrasClave)
              activarBtn(amdFilterButton, intelFilterButton)
            })
            intelFilterButton.addEventListener('click', () => {
              const palabrasClave =  ["intel", "core"];
              EncontrarPalabra(palabrasClave)
              activarBtn(intelFilterButton, amdFilterButton)
            })


            //funcion para mostrar los productos en el contenedor
            function mostrarProductos(array) {
           const contenedor = document.getElementById('products-grid');
           contenedor.innerHTML = ''; 
           array.forEach(productos => { 
            const productCardHTML = renderCard(productos); 
            productCardHTML.addEventListener('click', () => {
              let categoria = productos.category;
              let idcomponente = productos.id;
              precio[categoria] = productos.price;
              guardarComponentes(categoria,idcomponente)
              ordenarPorCategoria();
              totalCompra();
            })
            contenedor.appendChild(productCardHTML); 
            
       });
       }
       function guardarComponentes(tipo,idcomponente) {
        localStorage.getItem('componentesSeleccionados');
        let componentesPrecioAccountSeccion = JSON.parse(localStorage.getItem('componentesPrecio')) || {}; 
        let ComponentesSelect = JSON.parse(localStorage.getItem('componentesSeleccionados')) || {}; 
        ComponentesSelect[tipo] = idcomponente;
        componentesPrecioAccountSeccion[tipo] = precio[tipo];
        localStorage.setItem('componentesPrecio', JSON.stringify(componentesPrecioAccountSeccion));
        localStorage.setItem('componentesSeleccionados', JSON.stringify(ComponentesSelect));
       }         
}

function MostrarStorageAlReiniciar() {
  const componentesSeleccionados = JSON.parse(localStorage.getItem('componentesSeleccionados')) || {};
  const componentesPrecio = JSON.parse(localStorage.getItem('componentesPrecio')) || {};

  if (Object.keys(componentesSeleccionados).length === 0) return;
   const totalElement = document.getElementById('total');
  const totalGuardado = Object.values(componentesPrecio).reduce((acc, curr) => acc + curr, 0);
  totalElement.textContent = `Total: $${totalGuardado}`;
}
function renderCard(producto) {
  const card = `
    <button class="group overflow-hidden rounded-lg border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-800/50 transition-all duration-300 hover:shadow-lg hover:shadow-sky-400/10 cursor-pointer">
      <div class="relative overflow-hidden">
        <span class="absolute top-3 left-3 z-10 inline-flex items-center rounded-full bg-sky-400 px-2.5 py-0.5 text-xs font-medium text-gray-900">Más vendido</span>
        <span class="absolute top-3 right-3 z-10 inline-flex items-center rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-medium text-white">-18%</span>
        <div class="aspect-square overflow-hidden bg-gray-700">
        </div>
      </div>
      <div class="p-4">
        <div class="mb-2">
          <span class="inline-flex items-center rounded-md bg-gray-700 px-2 py-1 text-xs font-medium text-gray-300">${producto.category}</span>
        </div>
        <h3 class="font-semibold mb-2 text-white group-hover:text-sky-400 transition-colors line-clamp-2">
          ${producto.name}
        </h3>
        <div class="flex items-center gap-1 mb-3">
          <div class="flex">
          </div>
          <span class="text-sm text-gray-400">(124)</span>
        </div>
        <div class="flex items-center gap-2 mb-4">
          <span class="text-xl font-bold text-sky-400">$${producto.price}</span>
        </div>       
      </div>
    </button>
  `;

  const div = document.createElement('div');
  div.innerHTML = card.trim();
  return div.firstChild;
}