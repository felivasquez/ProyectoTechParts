import supabase from '/backend/config/client.js';

    function getProductIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id'); // Devuelve el ID, ej: "RTX4080-123"
    }

// Llama a la base de datos de Supabase para obtener los detalles
async function fetchProductDetails(productId) {
    if (!productId) return null;

    // Filtra la tabla 'productos' usando .eq('id', productId)
    const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single(); // Esperamos un solo resultado

    if (error) {
        console.error('Error al cargar el producto:', error);
        return null;
    }

    return product;
}
function renderProductDetails(product) {
    // Si no se encontró el producto o hubo un error
    if (!product) {
        document.querySelector('.min-h-screen').innerHTML =
            '<h1 class="text-3xl font-bold text-white text-center mt-12">Producto no encontrado.</h1>';
        return;
    }

    // --- 1. Actualizar Nombre y Categoría ---
    document.querySelector('span.bg-gray-800').textContent = product.category || 'Componente';
    document.querySelector('h1.text-3xl.font-bold').textContent = product.name;

    // --- 2. Actualizar Precio ---
    const formatPrice = (price) => `$${Number(price).toLocaleString('es-CL')}`; // Formato de moneda

    document.querySelector('.text-4xl.font-bold.text-sky-400').textContent =
        formatPrice(product.price);

    // El precio tachado (si existe)
    const oldPriceElement = document.querySelector('.text-xl.text-gray-400.line-through');
    if (oldPriceElement) {
        oldPriceElement.textContent = formatPrice(product.price * 1.30); // Ejemplo: precio anterior 30% más alto
    }

    // --- 3. Actualizar Imagen ---
    // Asegúrate de que product.imagen_url apunte a la ruta de tu imagen
    const imgElement = document.querySelector('img.w-full.aspect-square.object-cover');
    if (imgElement) {
        imgElement.src = product.image_url;
        imgElement.alt = product.name;
    }

    // --- 4. Actualizar Descripción ---
    // El elemento <p> que sigue a "Descripción"
    const descriptionContainer = document.querySelector('.space-y-6 > div:last-child');
    if (descriptionContainer) {
        let descriptionParagraph = descriptionContainer.querySelector('p');
        if (!descriptionParagraph) {
            descriptionParagraph = document.createElement('p');
            descriptionContainer.appendChild(descriptionParagraph);
        }
        descriptionParagraph.textContent = product.description || 'Descripción no disponible.';
        descriptionParagraph.className = 'text-gray-400'; // Añade el estilo que falta en tu HTML
    }

    // Puedes continuar actualizando el descuento (-13%) y las reseñas si están en la DB
}
async function initProductDetails() {
    const productId = getProductIdFromUrl();

    if (productId) {
        const productData = await fetchProductDetails(productId);
        renderProductDetails(productData);
    } else {
        // Muestra un mensaje si la URL no tenía ID
        renderProductDetails(null);
    }
}

// Ejecuta la lógica al cargar el documento
document.addEventListener('DOMContentLoaded', initProductDetails);