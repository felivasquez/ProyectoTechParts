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

function getCartTotal() {
    const cart = JSON.parse(localStorage.getItem('techparts_cart')) || [];
    const total = cart.reduce((acc, item) => {
        return acc + (item.price * item.quantity);
    }, 0);
    return total;
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

async function createPaymentIntent() {
    payBtn.disabled = true;
    payBtn.textContent = 'Processing...';
    errorMessage.textContent = '';

    try {
        const saveCard = saveCardCheckbox.checked;
        const totalAmount = getCartTotal();

        console.log('Creating payment intent...', {
            amount: totalAmount,
            save_card: saveCard,
            url: `${BACKEND_URL}/api/create-payment-intent`
        });

        const response = await fetch(`${BACKEND_URL}/api/create-payment-intent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
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
        console.log('Payment intent created successfully');

        if (!elements) {
            elements = stripe.elements({
                clientSecret,
                appearance: { theme: 'night' }
            });

            const paymentElement = elements.create("payment", {
                fields: {
                    billingDetails: {
                        address: 'auto'
                    }
                }
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

// 🆕 FUNCIÓN PARA OBTENER DATOS DE DIRECCIÓN DEL FORMULARIO
function getShippingAddressFromForm() {
    // Intenta obtener los datos del formulario de checkout
    // Ajusta los IDs según tu HTML real
    return {
        fullName: document.getElementById('shipping-name')?.value || 
                  document.getElementById('name')?.value || 
                  cardholderNameInput.value ||
                  'Customer Name',
        address: document.getElementById('shipping-address')?.value || 
                 document.getElementById('address')?.value || 
                 'N/A',
        city: document.getElementById('shipping-city')?.value || 
              document.getElementById('city')?.value || 
              'Buenos Aires',
        state: document.getElementById('shipping-state')?.value || 
               document.getElementById('state')?.value || 
               'Buenos Aires',
        zipCode: document.getElementById('shipping-zip')?.value || 
                 document.getElementById('postal-code')?.value || 
                 DEFAULT_POSTAL_CODE,
        country: document.getElementById('shipping-country')?.value || 
                 document.getElementById('country')?.value || 
                 'Argentina',
        phone: document.getElementById('shipping-phone')?.value || 
               document.getElementById('phone')?.value || 
               'N/A',
        email: document.getElementById('email')?.value || 'customer@example.com'
    };
}

// 🆕 FUNCIÓN PARA MANEJAR EL ÉXITO DEL PAGO Y CREAR ORDEN
async function handleSuccessfulPayment(paymentIntent) {
    try {
        console.log('💰 Pago exitoso, creando orden en Supabase...');

        const cart = getCart();
        if (!cart || cart.length === 0) throw new Error('El carrito está vacío');

        const shippingAddress = getShippingAddressFromForm();

        console.log('📦 Datos de envío:', shippingAddress);
        console.log('🛒 Items del carrito:', cart);

        // Guardar directamente en Supabase (frontend)
        const result = await saveOrderDirectly({
            cartItems: cart,
            shippingAddress,
            billingAddress: shippingAddress,
            paymentIntent
        });

        if (!result.success) throw new Error(result.error || 'Error creando la orden');

        console.log('✅ Orden creada:', result.order);

        localStorage.removeItem('techparts_cart');

        window.location.href = `/tienda/congrats.html?order_number=${result.order.order_number}&payment_intent_client_secret=${paymentIntent.client_secret}`;

    } catch (error) {
        console.error('❌ Error en handleSuccessfulPayment:', error);
        // Mostrar error en UI
        document.getElementById('error-message').textContent = 'Error creando orden: ' + (error.message || error);
        throw error;
    }
}

// 🔄 FORMULARIO DE PAGO ACTUALIZADO
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    payBtn.disabled = true;
    payBtn.textContent = 'Confirming...';
    errorMessage.textContent = '';

    const cardHolderName = cardholderNameInput.value;

    try {
        // Determinar la URL de retorno según el entorno
        const returnUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://tiendatechparts.vercel.app/tienda/congrats.html'
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

            // 🆕 CREAR ORDEN EN SUPABASE ANTES DE LIMPIAR CARRITO
            try {
                await handleSuccessfulPayment(paymentIntent);
                // La redirección ocurre dentro de handleSuccessfulPayment
            } catch (orderError) {
                console.error('Error al crear orden:', orderError);
                
                // Aún así limpiar carrito y redirigir, pero mostrar advertencia
                localStorage.removeItem('techparts_cart');
                
                // Redirigir con parámetro de error
                window.location.href = `/tienda/congrats.html?payment_intent_client_secret=${paymentIntent.client_secret}&order_error=true`;
            }
            
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

function getCart() {
    const cart = localStorage.getItem('techparts_cart');
    return cart ? JSON.parse(cart) : [];
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

renderCart();
createPaymentIntent();