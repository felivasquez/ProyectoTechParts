document.addEventListener('DOMContentLoaded', () => {

        // --- ELEMENTOS DEL DOM ---
        const allProductCards = document.querySelectorAll('.product-card');
        const totalPriceElement = document.getElementById('total-price');
        const wattsDisplayElement = document.getElementById('watts-display');
        const amdFilterButton = document.getElementById('amd-filter');
        const intelFilterButton = document.getElementById('intel-filter');

        let selectedProduct = null;

        // --- FUNCIÓN PARA ACTUALIZAR EL TOTAL ---
        function updateSummary() {
            if (selectedProduct) {
                // Usamos toLocaleString para el formato de miles, si aplica (ej. 120.350)
                const price = parseFloat(selectedProduct.dataset.price).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                const watts = selectedProduct.dataset.watts;
                
                totalPriceElement.textContent = `Total: $ ${price}`;
                wattsDisplayElement.textContent = `(${watts} watts)`;
            } else {
                // Resetea si no hay nada seleccionado
                totalPriceElement.textContent = 'Total: $ 0';
                wattsDisplayElement.textContent = '(0 watts)';
            }
        }

        // --- FUNCIÓN PARA MANEJAR LA SELECCIÓN DE PRODUCTO ---
        function handleProductSelection(event) {
            const clickedCard = event.currentTarget;

            // 1. Deseleccionar si se hace clic en el producto ya seleccionado
            if (selectedProduct === clickedCard) {
                clickedCard.classList.remove('border-red-600', 'border-2', 'shadow-xl');
                selectedProduct = null;
            } else {
                // 2. Quita el resaltado de la tarjeta anteriormente seleccionada
                if (selectedProduct) {
                    selectedProduct.classList.remove('border-red-600', 'border-2', 'shadow-xl');
                }
                
                // 3. Resalta la nueva tarjeta seleccionada
                clickedCard.classList.add('border-red-600', 'border-2', 'shadow-xl');
                selectedProduct = clickedCard;
            }

            updateSummary();
        }

        // --- FUNCIÓN PARA FILTRAR POR MARCA ---
        function filterProducts(brand) {
            // Recorrer y filtrar las tarjetas
            allProductCards.forEach(card => {
                if (card.dataset.brand === brand) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });

            // Actualizar el estilo de los botones de filtro
            const activeClass = 'border-red-600 text-red-600';
            const inactiveClass = 'border-transparent text-gray-600';

            if (brand === 'intel') {
                intelFilterButton.className = intelFilterButton.className.replace(inactiveClass, activeClass);
                amdFilterButton.className = amdFilterButton.className.replace(activeClass, inactiveClass);
            } else if (brand === 'amd') {
                amdFilterButton.className = amdFilterButton.className.replace(inactiveClass, activeClass);
                intelFilterButton.className = intelFilterButton.className.replace(activeClass, inactiveClass);
            }
        }
        
        // --- EVENT LISTENERS E INICIALIZACIÓN ---

        // Asignar el evento de clic a cada tarjeta de producto
        allProductCards.forEach(card => {
            card.addEventListener('click', handleProductSelection);
            card.classList.add('cursor-pointer'); 
        });

        // Asignar eventos a los botones de filtro
        intelFilterButton.addEventListener('click', () => filterProducts('intel'));
        amdFilterButton.addEventListener('click', () => filterProducts('amd'));

        // Inicia mostrando los productos Intel por defecto (como en la imagen)
        filterProducts('intel'); 
    });