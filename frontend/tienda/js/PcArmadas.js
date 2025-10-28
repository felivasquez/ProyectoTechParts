import supabase from '../../dashboard/js/client.js';

document.addEventListener('DOMContentLoaded', () => {
     traerProductos();
});

async function traerProductos(){
    const {data,error} = await supabase
    .from('products')
    .select('*')
    if (error) { 
        console.error('Error fetching products:', error);
        return;
    }
    const reponse = await fetch('js/textos.json');
    const textos = await reponse.json();    
    //filtros Btn 
    const procesadorBtn = document.getElementById('procesador');
    const motherboardBtn = document.getElementById('Motherboard');
    const memoriaRAMBtn = document.getElementById('Memoria-RAM');
    const tarjetaGraficaBtn = document.getElementById('tarjeta-Graficas');
    const AlmacenamientoBtn = document.getElementById('Almacenamiento');
    const FuenteBtn = document.getElementById('Fuente');
    const gabineteBtn = document.getElementById('Gabinete')
    const adicionalesBtn = document.getElementById('Adicionales') 


    const allProductCards = document.querySelectorAll('.product-card');
    const total = document.getElementById('total');
    const saltarBtn = document.getElementById('saltar');
    const retrocederBtn = document.getElementById('retroceder');
    const textosSeccion = document.getElementById('textos-seccion');
    const wattsDisplayElement = document.getElementById('watts-display');
    const amdFilterButton = document.getElementById('amd-filter'); 
    const intelFilterButton = document.getElementById('intel-filter');
    const tituloPc = document.getElementById('tituloPc');

    //variables globales
    const categoriasOrden = ['Procesadores', 'Placas Madre', 'Memoria RAM','Tarjetas Gráficas','Almacenamiento','Fuente','Gabinete'];
    let indiciesCategoria = 1; 
    let filtroCategoria = null;
    let precio = JSON.parse(localStorage.getItem('componentesPrecio')) || {};


    function MostrarStorageAlReiniciar() {
        const componentesSeleccionados = JSON.parse(localStorage.getItem('componentesSeleccionados')) || {};
        const componentesPrecio = JSON.parse(localStorage.getItem('componentesPrecio')) || {};
        if (Object.keys(componentesSeleccionados).length === 0) return;

        const totalElement = document.getElementById('total');
        const totalGuardado = Object.values(componentesPrecio).reduce((acc, curr) => acc + curr, 0);
        totalElement.textContent = `Total: $${totalGuardado}`;

        // Mostrar productos seleccionados al reiniciar
        Aplicarfiltros(2);
    }
    MostrarStorageAlReiniciar();

    function totalCompra() {
        const componentesPrecioStorage = JSON.parse(localStorage.getItem('componentesPrecio')) || {}; 
        const suma = Object.values(precio).reduce((acc, curr) => acc + curr, 0);
        total.textContent = `Total: $${suma}`;
    }

    //pasar a la siguiente sección por elegir un producto
    async function ordenarPorCategoria(avanzar = true) {
      
        if (avanzar) indiciesCategoria++;

        if (indiciesCategoria  >= categoriasOrden.length) {
            console.log('completo');
            indiciesCategoria = categoriasOrden.length - 1; 
            if(indiciesCategoria = categoriasOrden.length - 1){
                finalizarCompra()
            }
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
        // Mostrar el texto correspondiente 
        MostrarTextoIndice(indiciesCategoria, categoriasOrden, textos)
        Aplicarfiltros(1);
    }
    function finalizarCompra() {
        saltarBtn.innerHTML = "finalizar";
        saltarBtn.addEventListener('click',() => {
            mandarPcarmardaAcarrito()
            window.location.href = '/frontend/tienda/checkout.html';
        })        
    }
    //aplicar filtros
    function Aplicarfiltros(tipo) {
        let filtros = data;
        switch (tipo) {
            case 1:
                if (filtroCategoria) {
                    filtros = filtros.filter(producto => producto.category === filtroCategoria);
                }
                mostrarProductos(filtros);
                break;
            case 2:
                const componentesSeleccionados = JSON.parse(localStorage.getItem('componentesSeleccionados')) || {};
                const storageIDs = Object.values(componentesSeleccionados);
                filtros = filtros.filter(producto => storageIDs.includes(producto.id));
                mostrarSeleccionados(filtros); // mostrar en el contenedor de seleccionados
                break;
        }
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
            Aplicarfiltros(1);                 
            indiciesCategoria = categoriasOrden.indexOf(categoria);
            botonesMostrar.forEach(btn => MostrarBtn(btn));
            botonesOcultar.forEach(btn => OcultarBtn(btn)); 
            MostrarTextoIndice( indiciesCategoria, categoriasOrden, textos) 
        });          
    }

    //mostrar todos los productos al cargar la página
    filtroCategoria = 'Procesadores';
    Aplicarfiltros(1);      
    MostrarBtn(amdFilterButton);
    MostrarBtn(intelFilterButton);
    textosSeccion.innerHTML = textos['Procesadores'];    

    //parte en donde se configura los botones para filtrar por categoría    
    Botones(procesadorBtn, 'Procesadores', [amdFilterButton, intelFilterButton], []);
    Botones(motherboardBtn, 'Placas Madre', [], [amdFilterButton, intelFilterButton]);
    Botones(memoriaRAMBtn, 'Memoria RAM', [], [amdFilterButton, intelFilterButton]);
    Botones(tarjetaGraficaBtn, 'Tarjetas Gráficas', [], [amdFilterButton, intelFilterButton]);
    Botones(AlmacenamientoBtn, 'Almacenamiento', [], [amdFilterButton, intelFilterButton]);
    Botones(FuenteBtn, 'Fuente', [], [amdFilterButton, intelFilterButton]);
    Botones(gabineteBtn, 'Gabinete', [], [amdFilterButton, intelFilterButton]);
       
    
    //botones para saltar y retroceder entre categorías

    saltarBtn.addEventListener('click', () => {
        ordenarPorCategoria(true);
        console.log(filtroCategoria);

    });
    retrocederBtn.addEventListener('click', () => {
      if(indiciesCategoria > 0){
        ordenarPorCategoria(false);
        indiciesCategoria--;
        filtroCategoria = categoriasOrden[indiciesCategoria];
        if (filtroCategoria === 'Procesadores') {
      MostrarBtn(amdFilterButton);
      MostrarBtn(intelFilterButton);
    } else {
      OcultarBtn(amdFilterButton);
      OcultarBtn(intelFilterButton);
    }

    MostrarTextoIndice(indiciesCategoria, categoriasOrden, textos);

    Aplicarfiltros(1);

    console.log(filtroCategoria);
     }    
    });
    //textos dinámicos de cada boton    
   function MostrarTextoIndice(indiceActual, categorias, textos) {            
    for(let i = 0; i < categorias.length; i++) {
      if(indiceActual === i) {
        const categoriaActual = categorias[i];

        tituloPc.innerHTML = `Eligiendo: ${categoriaActual}` 

        if(textos[categoriaActual]) {
          textosSeccion.innerHTML = textos[categoriaActual];
      }else {
          textosSeccion.innerHTML = ''; // vacío si no hay texto
          console.warn('No se encontró texto para:', categoriaActual);
            }
    } 
  }
}

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
                Aplicarfiltros(2);
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
    function mandarPcarmardaAcarrito() {
        let storageCart = localStorage.getItem('techparts_cart')
        if(!storageCart){
            localStorage.setItem('techparts_cart', JSON.stringify([]));
            storageCart = JSON.stringify([]);            
            }
            let carrito = JSON.parse(storageCart);
            let componentesSeleccionados = JSON.parse(localStorage.getItem('componentesSeleccionados')) || [];
            let componentesPrecio = JSON.parse(localStorage.getItem('componentesPrecio')) 
           
            const componentesCompletos = Object.entries(componentesSeleccionados).map(([tipo, id]) => {
                const producto = data.find(p => p.id === id);
                return {
                    id: id,
                    name: producto ? producto.name : "desconocido",
                    categoria: tipo,
                    price: componentesPrecio[tipo] || 0,
                    quantity: 1
                };
            });
            let NuevoComponentes = componentesCompletos.filter(
                nuevo =>  !carrito.some(item => item.id === nuevo.id)                   
            );
            if(NuevoComponentes.length === 0){
                console.log('Los componentes ya están en el carrito');
                return;
            } 
            carrito.push(...NuevoComponentes);
            localStorage.setItem('techparts_cart', JSON.stringify(carrito));
            console.log('proceso completado, componentes añadidos al carrito');
        }         
    

    // función nueva para mostrar los productos seleccionados (crea nuevos spans sin borrar los anteriores)
    function mostrarSeleccionados(productosSeleccionados) {
       const contenedorN = document.getElementById('componentes-elegidos');
    contenedorN.innerHTML = ''; // Limpia antes de mostrar los nuevos seleccionados
//targeta del carrito del armado de pc :)
    productosSeleccionados.forEach(producto => {
        const cardSeleccionada = `
        <div class="group overflow-hidden rounded-lg border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-800/50 transition-all duration-300 hover:shadow-lg hover:shadow-sky-400/10 cursor-pointer ">
            <div class="flex items-start p-2 space-x-2 ">
            <div class="relative bg-gray-700">
                <img
                src="${producto.image_url}"
                alt="${producto.name}"
                class="w-24 h-30 object-contain"
                />
            </div>

            <div class="flex-1">
                <h3 class="font-semibold mb-1 text-white group-hover:text-sky-400 transition-colors line-clamp-2">
                ${producto.name}
                </h3>

                <div class="flex flex-col leading-block">
                <span class="text-sky-400 text-xl font-bold">$${producto.price}</span>
                </div>
                    <div class="pl-6 flex items-center">
                        <button id="restar" type="button" class="decrement-btn inline-flex h-5 w-5 items-center justify-center rounded-md border border-gray-300 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-100 dark:border-gray-600 bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-700" >-</button>
                            <input type="text" class="w-5 shrink-0 border-0 bg-transparent text-center text-sm font-medium text-gray-900 focus:outline-none focus:ring-0 dark:text-white" value="1" readonly />
                        <button id="sumar" type="button" class="increment-btn inline-flex h-5 w-5 items-center justify-center rounded-md border border-gray-300 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-100 dark:border-gray-600 bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-700">+</button>
                    </div>
                <div class="mt-1 flex items-center space-x-2">
                <span class="text-green-600 text-sm font-semibold flex items-center">✔️ Compatible</span>
                </div>
            </div>
            </div>
        </div>
        `;
 
    const div = document.createElement('div');
    div.innerHTML = cardSeleccionada.trim();
    contenedorN.appendChild(div.firstChild);
  });}
}
// --- RENDER CARD ---
function renderCard(producto) {
        const card = `
<button class="group overflow-hidden rounded-lg border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-800/50 transition-all duration-300 hover:shadow-lg hover:shadow-sky-400/10 cursor-pointer">
  <div class="bg-gradient-to-r to-green-0 text-white text-sm font-semibold px-3 py-1 rounded-br-xl inline-block ">
    Descuento $9.200
  </div>

  <div class="flex items-start p-2 space-x-2">
    <div class="relative bg-gray-700">
      <img
        src="${producto.image_url}" alt="${producto.name}"
        class="w-24 h-24 object-contain"
      />
    </div>

    <div class="flex-1">
      <h3 class="font-semibold mb-1 text-white group-hover:text-sky-400 transition-colors line-clamp-2">
        ${producto.name}
      </h3>

      <div class="text-yellow-600 text-xs flex items-center mb-1">
        <span>⚠️ Compatibilidades no testeadas</span>
      </div>

      <div class="flex flex-col leading-block">
        <span class="text-sky-900 text-xs line-through ">$${producto.price}</span>
        <span class="text-sky-400 text-xl font-bold ">$${producto.price - 9200}</span>
      </div>

      <div class="mt-1 flex items-center space-x-2">
        <span class="text-green-600 text-sm font-semibold flex items-center">✔️ Compatible</span>
      </div>
    </div>
  </div>
</button>

    `;
    const div = document.createElement('div');
    div.innerHTML = card.trim();
    return div.firstChild;
}