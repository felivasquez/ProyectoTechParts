// --- Manejo de carrito en localStorage y actualización del nav ---

// Utilidades de carrito
function getCart() {
    const cart = localStorage.getItem('techparts_cart');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem('techparts_cart', JSON.stringify(cart));
}

function addToCart(product) {
    const cart = getCart();
    const idx = cart.findIndex(item => item.id === product.id);
    if (idx !== -1) {
        cart[idx].quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    saveCart(cart);
    return cart;
}

// Actualiza badge y dropdown del carrito
export function updateCartPreview() {
    const cart = getCart();
    // Badge
    const badge = document.querySelector('[data-cart-count]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (badge) {
        badge.textContent = totalItems;
        badge.classList.toggle('hidden', totalItems === 0);
    }
    // Dropdown
    const dropdown = document.getElementById('myCartDropdown1');
    if (dropdown) {
        if (cart.length === 0) {
            dropdown.innerHTML = `<div class="text-center text-gray-500 dark:text-gray-400 py-4">El carrito está vacío.</div>`;
            return;
        }
        dropdown.innerHTML = cart.slice(0, 5).map(item => `
            <div class="grid grid-cols-2 mb-2">
                <div>
                    <span class="truncate text-sm font-semibold leading-none text-gray-900 dark:text-white">${item.name}</span>
                    <p class="mt-0.5 truncate text-sm font-normal text-gray-500 dark:text-gray-400">$${item.price}</p>
                </div>
                <div class="flex items-center justify-end gap-4">
                    <span class="text-sm text-gray-500 dark:text-gray-400">x${item.quantity}</span>
                </div>
            </div>
        `).join('') +
        `<a href="/tienda/checkout.html"
            class="mb-2 me-2 inline-flex w-full items-center justify-center rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
            role="button">
            Ir al Checkout (${cart.length} producto${cart.length > 1 ? 's' : ''})
        </a>`;
    }
}

// Delegación para botones "Agregar al carrito"
document.addEventListener('click', function (e) {
    const btn = e.target.closest('.add-to-cartBtn');
    if (btn) {
        const id = btn.dataset.id;
        const name = btn.dataset.name;
        const price = parseFloat(btn.dataset.price) || 0;
        if (!id || !name) return;
        addToCart({ id, name, price });
        updateCartPreview();
        // Toast simple
        showToast(`${name} agregado al carrito 🛒`);
    }
});

// Toast de confirmación
function showToast(msg) {
    let toast = document.getElementById('cart-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'cart-toast';
        toast.style.position = 'fixed';
        toast.style.bottom = '32px';
        toast.style.right = '32px';
        toast.style.zIndex = 9999;
        toast.style.background = '#111827';
        toast.style.color = '#fff';
        toast.style.padding = '12px 20px';
        toast.style.borderRadius = '8px';
        toast.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
        toast.style.fontSize = '1rem';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 1800);
}

// Inicializa el preview al cargar
updateCartPreview();

const carousel = document.getElementById('carousel');
const slides = carousel.children.length;
const dots = document.querySelectorAll('.dot');
let index = 0;

function showSlide(i) {
  index = (i + slides) % slides;
  carousel.style.transform = `translateX(-${index * 100}%)`;
  dots.forEach((dot, idx) => dot.classList.toggle('bg-white/30', idx === index));
}

document.getElementById('next').addEventListener('click', () => showSlide(index + 1));
document.getElementById('prev').addEventListener('click', () => showSlide(index - 1));
dots.forEach((dot, i) => dot.addEventListener('click', () => showSlide(i)));

// Auto-slide cada 5 segundos
setInterval(() => showSlide(index + 1), 3000);

// Inicializar
showSlide(0);
