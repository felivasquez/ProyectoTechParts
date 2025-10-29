import supabase from '../../dashboard/js/client.js';

// Traer todos los productos desde Supabase
async function fetchAllProducts() {
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
        console.error('Error al traer productos:', error);
        return [];
    }
    return data;
}

async function renderCart() {
    const cartContainer = document.getElementById('cart-container');
    const orderSummaryList = document.getElementById('order-summary-list');
    const cartTotal = document.getElementById('cart-total');

    // Traer productos completos
    const allProducts = await fetchAllProducts();

    // Tomar carrito desde localStorage
    const cartLS = JSON.parse(localStorage.getItem('techparts_cart')) || [];

    // Mapear cada item con su info completa
    const cart = cartLS.map(item => {
        const producto = allProducts.find(p => p.id === item.id);
        return {
            ...item,
            name: producto ? producto.name : item.name,
            image_url: producto ? producto.image_url : 'https://flowbite.s3.amazonaws.com/blocks/e-commerce/iphone-light.svg',
        };
    });

    if (cart.length === 0) {
        cartContainer.innerHTML = '<div class="text-center text-gray-500 dark:text-gray-400 py-8">El carrito está vacío.</div>';
        orderSummaryList.innerHTML = '';
        cartTotal.textContent = '$0';
        return;
    }

    let subtotal = 0;
    cartContainer.innerHTML = cart.map((item, idx) => `
        <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 md:p-6">
            <div class="space-y-4 md:flex md:items-center md:justify-between md:gap-6 md:space-y-0">
                <div class="w-20 shrink-0 md:order-1">
                    <img class="h-20 w-20 object-cover rounded" src="${item.image_url}" alt="${item.name}" />
                </div>
                <div class="flex items-center justify-between md:order-3 md:justify-end">
                    <div class="flex items-center">
                        <button type="button" class="decrement-btn inline-flex h-5 w-5 items-center justify-center rounded-md border border-gray-300 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-700" data-idx="${idx}">-</button>
                        <input type="text" class="w-10 shrink-0 border-0 bg-transparent text-center text-sm font-medium text-gray-900 focus:outline-none focus:ring-0 dark:text-white" value="${item.quantity}" readonly />
                        <button type="button" class="increment-btn inline-flex h-5 w-5 items-center justify-center rounded-md border border-gray-300 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-700" data-idx="${idx}">+</button>
                    </div>
                    <div class="text-end md:order-4 md:w-32">
                        <p class="text-base font-bold text-gray-900 dark:text-white">$${(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                </div>
                <div class="w-full min-w-0 flex-1 space-y-4 md:order-2 md:max-w-md">
                    <span class="text-base font-medium text-gray-900 dark:text-white">${item.name}</span>
                    <div class="flex items-center gap-4">
                        <button type="button" class="remove-btn inline-flex items-center text-sm font-medium text-red-600 hover:underline dark:text-red-500" data-idx="${idx}">Remove</button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Resumen
    orderSummaryList.innerHTML = `
        <dl class="flex items-center justify-between gap-4">
            <dt class="text-base font-normal text-gray-500 dark:text-gray-400">Subtotal</dt>
            <dd class="text-base font-medium text-gray-900 dark:text-white">$${subtotal.toLocaleString()}</dd>
        </dl>
        <dl class="flex items-center justify-between gap-4">
            <dt class="text-base font-normal text-gray-500 dark:text-gray-400">Envío</dt>
            <dd class="text-base font-medium text-gray-900 dark:text-white">$0</dd>
        </dl>
        <dl class="flex items-center justify-between gap-4">
            <dt class="text-base font-normal text-gray-500 dark:text-gray-400">Impuestos</dt>
            <dd class="text-base font-medium text-gray-900 dark:text-white">$0</dd>
        </dl>
    `;
    cartTotal.textContent = `$${subtotal.toLocaleString()}`;

    // Delegación de click para incrementar/decrementar/remover
    document.addEventListener('click', function (e) {
        const cartLocal = JSON.parse(localStorage.getItem('techparts_cart')) || [];
        if (e.target.classList.contains('increment-btn')) {
            const idx = +e.target.dataset.idx;
            cartLocal[idx].quantity += 1;
            localStorage.setItem('techparts_cart', JSON.stringify(cartLocal));
            renderCart();
        }
        if (e.target.classList.contains('decrement-btn')) {
            const idx = +e.target.dataset.idx;
            if (cartLocal[idx].quantity > 1) {
                cartLocal[idx].quantity -= 1;
                localStorage.setItem('techparts_cart', JSON.stringify(cartLocal));
                renderCart();
            }
        }
        if (e.target.classList.contains('remove-btn')) {
            const idx = +e.target.dataset.idx;
            cartLocal.splice(idx, 1);
            localStorage.setItem('techparts_cart', JSON.stringify(cartLocal));
            renderCart();
        }
    });
}

renderCart();