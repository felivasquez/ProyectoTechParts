// Clave única para almacenar el carrito
const CART_KEY = 'techparts_cart';

// 🛒 Obtener carrito desde localStorage
export function getCart() {
  const cart = localStorage.getItem(CART_KEY);
  return cart ? JSON.parse(cart) : [];
}

// 💾 Guardar carrito en localStorage
export function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// ➕ Agregar producto al carrito
export function addToCart(product) {
  let cart = getCart();
  const existing = cart.find(item => item.id === product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart(cart);
}

// ➖ Quitar producto del carrito (una unidad)
export function removeFromCart(productId) {
  let cart = getCart();
  const index = cart.findIndex(item => item.id === productId);

  if (index !== -1) {
    if (cart[index].quantity > 1) {
      cart[index].quantity -= 1;
    } else {
      cart.splice(index, 1);
    }
  }

  saveCart(cart);
}

// 🧹 Vaciar carrito completo
export function clearCart() {
  localStorage.removeItem(CART_KEY);
}

// 💰 Calcular total
export function getCartTotal() {
  return getCart().reduce((acc, item) => acc + item.price * item.quantity, 0);
}
