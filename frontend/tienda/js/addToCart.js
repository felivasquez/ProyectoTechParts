import { addToCart } from './carrito.js';

document.querySelectorAll('.add-to-cartBtn').forEach(button => {
    button.addEventListener('click', () => {
        const product = {
            id: button.dataset.id,
            name: button.dataset.name,
            price: Number(button.dataset.price)
        };


        addToCart(product);
        alert(`${product.name} agregado al carrito 🛒`);
    });
});
