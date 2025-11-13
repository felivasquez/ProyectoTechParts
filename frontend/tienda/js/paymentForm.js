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
            return { success: false, error: 'No user logged in' };
        }

        // Crear registro en "orders"
        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert([
                {
                    user_id: user.id,
                    order_number: `TP-${Date.now()}`,
                    order_date: new Date().toISOString(),
                    total_amount: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
                    status: 'paid',
                    payment_method: 'card',
                    payment_status: 'succeeded',
                    payment_intent_id: paymentIntent.id,
                    shipping_address: `${shippingAddress.address}, ${shippingAddress.city}`,
                    billing_address: `${billingAddress.address}, ${billingAddress.city}`,
                    estimated_delivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // +5 días
                }
            ])
            .select()
            .single();

        if (orderError) {
            console.error('Error creando orden:', orderError);
            throw orderError;
        }
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

        const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
        if (itemsError) {
            console.error('Error creando items de orden:', itemsError);
            throw itemsError;
        }

        // Actualizar stock y registrar movimientos
        for (const item of cartItems) {
            // Primero, obtener el stock actual
            const { data: productData, error: fetchError } = await supabase
                .from('products')
                .select('stock')
                .eq('id', item.id)
                .single();

            if (fetchError) {
                console.error(`Error obteniendo producto ${item.id}:`, fetchError);
                continue; // Continuar con el siguiente item
            }

            const currentStock = productData.stock;
            const newStock = currentStock - item.quantity;

            // Actualizar stock usando el cliente de Supabase correctamente
            const { error: updateError } = await supabase
                .from('products')
                .update({ stock: newStock })
                .eq('id', item.id);

            if (updateError) {
                console.error(`Error actualizando stock del producto ${item.id}:`, updateError);
                continue; // Continuar con el siguiente item
            }

            // Registrar movimiento (intentar, pero no fallar si hay error)
            try {
                const movementData = {
                    type: "Salida", // Cambiado a "Salida" porque el producto sale del inventario
                    quantity: parseInt(item.quantity) || 1,
                    reason: "Venta online", // Cambiado a "Venta online" para ser más específico
                    user_id: user.id,
                    product_id: item.id,
                    order_id: orderId,
                    supplier: null // Agregado explícitamente como null
                };

                console.log('Intentando crear movimiento:', movementData);

                const { data: movementResult, error: movementError } = await supabase
                    .from('movements')
                    .insert(movementData)
                    .select();

                if (movementError) {
                    console.error(`Error registrando movimiento para producto ${item.id}:`, {
                        error: movementError,
                        message: movementError.message,
                        details: movementError.details,
                        hint: movementError.hint,
                        code: movementError.code,
                        data: movementData
                    });
                    // No lanzar error, solo registrar - el pedido ya se creó exitosamente
                } else {
                    console.log('✅ Movimiento creado exitosamente:', movementResult);
                }
            } catch (movError) {
                console.error(`Error inesperado registrando movimiento:`, movError);
                // Continuar sin fallar el pedido completo
            }
        }

        return { success: true, order: orderData };

    } catch (error) {
        console.error('Error guardando orden en Supabase:', error);
        return { success: false, error: error.message };
    }
}

// =============================
// MANEJAR ÉXITO DEL PAGO
// =============================
async function handleSuccessfulPayment(paymentIntent) {
    try {
        console.log('💰 Pago exitoso, creando orden en Supabase...');

        const cart = getCart();
        if (!cart || cart.length === 0) throw new Error('El carrito está vacío');

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

        if (!result.success) throw new Error(result.error || 'Error creando la orden');
        console.log('✅ Orden creada:', result.order);

        localStorage.removeItem('techparts_cart');

        // Redirección a página de confirmación
        window.location.href = `/tienda/congrats.html?order_number=${result.order.order_number}&payment_intent=${paymentIntent.id}`;

    } catch (error) {
        console.error('❌ Error en handleSuccessfulPayment:', error);
        document.getElementById('error-message').textContent = 'Error creando orden: ' + (error.message || error);
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

    const cardHolderName = cardholderNameInput.value;

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
            errorMessage.textContent = error.message;
            payBtn.disabled = false;
            payBtn.textContent = 'Pay now';
            return;
        }

        if (paymentIntent && paymentIntent.status === 'succeeded') {
            const saveCard = saveCardCheckbox.checked;

            if (saveCard && paymentIntent.latest_charge?.payment_method_details?.card) {
                const card = paymentIntent.latest_charge.payment_method_details.card;
                renderSavedCard(card.brand, card.last4, card.exp_month, card.exp_year);
            }

            await handleSuccessfulPayment(paymentIntent);
        } else {
            errorMessage.textContent = `Payment status: ${paymentIntent?.status || 'unknown'}. Please try again.`;
            payBtn.disabled = false;
            payBtn.textContent = 'Pay now';
        }
    } catch (err) {
        console.error('Confirmation error:', err);
        errorMessage.textContent = 'Error confirming payment: ' + err.message;
        payBtn.disabled = false;
        payBtn.textContent = 'Pay now';
    }
});

saveCardCheckbox.addEventListener('change', createPaymentIntent);

// Inicializar
renderCart();
createPaymentIntent();