import { supabase } from './supabaseConfig.js';

const stripe = Stripe('pk_test_51SJ0SkQgvgdQqQVEfityZf2aMvcdyEZaqWfrUl0AW8XCJKuZhRxnidAl31RMNumHjsDRS1dznNk3xnIhhnWdfVS000ZqN8BajB');
let elements;

const form = document.getElementById('payment-form');
const errorMessage = document.getElementById('error-message');
const payBtn = document.getElementById('pay-btn');
const cardholderNameInput = document.getElementById('cardholder-name');
const saveCardCheckbox = document.getElementById('save-card-checkbox');
const savedCardsContainer = document.getElementById('saved-cards-container');

const DEFAULT_COUNTRY_CODE = 'AR';
const DEFAULT_POSTAL_CODE = 'C1000AAB';

// URL del backend
const BACKEND_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:4242'
    : 'https://proyectotechparts-backend.vercel.app';

// =============================
// FUNCIONES AUXILIARES
// =============================
function getCart() {
    const cart = localStorage.getItem('techparts_cart');
    return cart ? JSON.parse(cart) : [];
}

function getCartTotal() {
    const cart = getCart();
    return cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
}

function renderSavedCard(brand, last4, exp_month, exp_year) {
    savedCardsContainer.innerHTML = '';

    const cardHtml = `
        <label class="block bg-[#334155] p-4 rounded-lg border border-transparent hover:border-blue-500 cursor-pointer">
            <div class="flex justify-between items-center">
                <div class="flex items-center space-x-2">
                    <input type="radio" name="payment-method" checked class="accent-blue-600">
                    <div>
                        <p class="font-medium">${brand} ending in ${last4}</p>
                        <p class="text-sm text-gray-400">Expiry ${exp_month}/${exp_year}</p>
                    </div>
                </div>
                <span class="text-xl font-semibold">${brand.toUpperCase()}</span>
            </div>
            <div class="mt-2 text-sm text-blue-400 space-x-4">
                <button type="button">Delete</button>
                <button type="button">Edit</button>
            </div>
        </label>
    `;
    savedCardsContainer.insertAdjacentHTML('beforeend', cardHtml);
}

function renderCart() {
    const cart = getCart();
    const orderSummaryList = document.getElementById('order-summary-list');
    const cartTotal = document.getElementById('cart-total');

    if (cart.length === 0) {
        orderSummaryList.innerHTML = '<div class="text-center text-gray-500 py-8">El carrito está vacío.</div>';
        cartTotal.textContent = '$0';
        return;
    }

    let subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
}

// =============================
// CREAR PAYMENT INTENT
// =============================
async function createPaymentIntent() {
    payBtn.disabled = true;
    payBtn.textContent = 'Processing...';
    errorMessage.textContent = '';

    try {
        const saveCard = saveCardCheckbox.checked;
        const totalAmount = getCartTotal();

        const response = await fetch(`${BACKEND_URL}/api/create-payment-intent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: totalAmount,
                save_card: saveCard,
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const { clientSecret } = await response.json();

        if (!elements) {
            elements = stripe.elements({
                clientSecret,
                appearance: { theme: 'night' }
            });

            const paymentElement = elements.create("payment", {
                fields: { billingDetails: { address: 'auto' } }
            });
            paymentElement.mount("#payment-element");
        } else {
            elements.update({ clientSecret });
        }

        payBtn.disabled = false;
        payBtn.textContent = 'Pay now';

    } catch (e) {
        console.error('Payment intent error:', e);
        errorMessage.textContent = 'Error al iniciar el pago: ' + e.message;
        payBtn.disabled = false;
        payBtn.textContent = 'Pay now';
    }
}

// =============================
// CREAR ORDEN EN SUPABASE
// =============================
async function saveOrderDirectly({ cartItems, shippingAddress, billingAddress, paymentIntent }) {
    try {
        // Obtener usuario autenticado
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            console.error('Usuario no autenticado:', userError);
            throw new Error('Usuario no autenticado');
        }

        console.log('👤 Usuario autenticado:', user.id);

        // Crear registro en "orders"
        const orderNumber = `TP-${Date.now()}`;
        const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        
        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert([
                {
                    user_id: user.id,
                    order_number: orderNumber,
                    order_date: new Date().toISOString(),
                    total_amount: totalAmount,
                    status: 'paid',
                    payment_method: 'card',
                    payment_status: 'succeeded',
                    payment_intent_id: paymentIntent.id,
                    shipping_address: `${shippingAddress.address}, ${shippingAddress.city}`,
                    billing_address: `${billingAddress.address}, ${billingAddress.city}`,
                    estimated_delivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                }
            ])
            .select()
            .single();

        if (orderError) {
            console.error('❌ Error creando orden:', orderError);
            throw new Error(`Error al crear orden: ${orderError.message}`);
        }

        console.log('✅ Orden creada:', orderData);
        const orderId = orderData.id;

        // Crear registros en "order_items"
        const orderItems = cartItems.map(item => ({
            order_id: orderId,
            product_id: item.id,
            product_name: item.name,
            unit_price: item.price,
            quantity: item.quantity,
            total_price: item.price * item.quantity,
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) {
            console.error('❌ Error creando items de orden:', itemsError);
            throw new Error(`Error al crear items: ${itemsError.message}`);
        }

        console.log('✅ Items de orden creados');

        // Actualizar stock de productos
        for (const item of cartItems) {
            try {
                // Obtener stock actual
                const { data: productData, error: fetchError } = await supabase
                    .from('products')
                    .select('stock, name')
                    .eq('id', item.id)
                    .single();

                if (fetchError) {
                    console.warn(`⚠️ Error obteniendo producto ${item.id}:`, fetchError.message);
                    continue;
                }

                const currentStock = productData.stock;
                const newStock = Math.max(0, currentStock - item.quantity);

                console.log(`📦 Actualizando stock de "${productData.name}": ${currentStock} → ${newStock}`);

                // Actualizar stock
                const { error: updateError } = await supabase
                    .from('products')
                    .update({ stock: newStock })
                    .eq('id', item.id);

                if (updateError) {
                    console.warn(`⚠️ Error actualizando stock del producto ${item.id}:`, updateError.message);
                    continue;
                }

                console.log(`✅ Stock actualizado para producto ${item.id}`);

            } catch (stockError) {
                console.warn(`⚠️ Error procesando stock del producto ${item.id}:`, stockError);
                // Continuar con el siguiente producto
            }
        }

        return { success: true, order: orderData };

    } catch (error) {
        console.error('❌ Error en saveOrderDirectly:', error);
        return { success: false, error: error.message };
    }
}

// =============================
// MANEJAR ÉXITO DEL PAGO
// =============================
async function handleSuccessfulPayment(paymentIntent) {
    try {
        console.log('💰 Pago exitoso, procesando orden...');

        const cart = getCart();
        if (!cart || cart.length === 0) {
            throw new Error('El carrito está vacío');
        }

        const shippingAddress = {
            address: 'Av. Siempre Viva 123',
            city: 'Buenos Aires',
            zipCode: DEFAULT_POSTAL_CODE,
            country: 'Argentina'
        };

        const result = await saveOrderDirectly({
            cartItems: cart,
            shippingAddress,
            billingAddress: shippingAddress,
            paymentIntent
        });

        if (!result.success) {
            throw new Error(result.error || 'Error al crear la orden');
        }

        console.log('✅ Orden procesada exitosamente:', result.order.order_number);

        // Limpiar carrito
        localStorage.removeItem('techparts_cart');

        // Redirección a página de confirmación
        const redirectUrl = `${window.location.origin}/tienda/congrats.html?payment_intent_client_secret=${paymentIntent.client_secret}&order_number=${result.order.order_number}`;
        console.log('🔄 Redirigiendo a:', redirectUrl);
        
        window.location.href = redirectUrl;

    } catch (error) {
        console.error('❌ Error en handleSuccessfulPayment:', error);
        errorMessage.textContent = 'Error al procesar la orden: ' + (error.message || error);
        payBtn.disabled = false;
        payBtn.textContent = 'Pay now';
        throw error;
    }
}

// =============================
// CONFIRMAR PAGO
// =============================
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    payBtn.disabled = true;
    payBtn.textContent = 'Confirming...';
    errorMessage.textContent = '';

    const cardHolderName = cardholderNameInput.value.trim();

    try {
        const returnUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://127.0.0.1:5500/tienda/congrats.html'
            : `${window.location.origin}/tienda/congrats.html`;

        const { paymentIntent, error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: returnUrl,
                payment_method_data: {
                    billing_details: {
                        name: cardHolderName || 'Customer Name',
                        address: {
                            country: DEFAULT_COUNTRY_CODE,
                            postal_code: DEFAULT_POSTAL_CODE,
                        },
                    },
                },
            },
            redirect: 'if_required',
        });

        if (error) {
            console.error('❌ Error de Stripe:', error);
            errorMessage.textContent = error.message;
            payBtn.disabled = false;
            payBtn.textContent = 'Pay now';
            return;
        }

        if (paymentIntent && paymentIntent.status === 'succeeded') {
            console.log('✅ Payment Intent exitoso:', paymentIntent.id);

            // Guardar tarjeta si está marcada la opción
            const saveCard = saveCardCheckbox.checked;
            if (saveCard && paymentIntent.latest_charge?.payment_method_details?.card) {
                const card = paymentIntent.latest_charge.payment_method_details.card;
                renderSavedCard(card.brand, card.last4, card.exp_month, card.exp_year);
            }

            // Procesar orden
            await handleSuccessfulPayment(paymentIntent);
        } else {
            const status = paymentIntent?.status || 'unknown';
            console.warn('⚠️ Estado del pago:', status);
            errorMessage.textContent = `Estado del pago: ${status}. Por favor intenta nuevamente.`;
            payBtn.disabled = false;
            payBtn.textContent = 'Pay now';
        }
    } catch (err) {
        console.error('❌ Error en confirmación:', err);
        errorMessage.textContent = 'Error al confirmar el pago: ' + err.message;
        payBtn.disabled = false;
        payBtn.textContent = 'Pay now';
    }
});

// Event listener para cambios en el checkbox
saveCardCheckbox.addEventListener('change', createPaymentIntent);

// =============================
// INICIALIZACIÓN
// =============================
console.log('🚀 Inicializando checkout...');
renderCart();
createPaymentIntent();