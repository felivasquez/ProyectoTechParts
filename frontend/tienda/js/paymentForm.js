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

function getCartTotal() {
    const cart = JSON.parse(localStorage.getItem('techparts_cart')) || [];
    const total = cart.reduce((acc, item) => {
        return acc + (item.price * item.quantity);
    }, 0);

    return total;
}

// Función para simular el guardado y renderizado de la tarjeta
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

        const response = await fetch("https://proyecto-tech-parts.vercel.app/api/create-payment-intent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                amount: getCartTotal(),
                save_card: saveCard,
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const { clientSecret } = await response.json();

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
        errorMessage.textContent = 'Error al iniciar el pago: ' + e.message;
        payBtn.disabled = true;
    }
}
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    payBtn.disabled = true;
    payBtn.textContent = 'Confirming...';
    errorMessage.textContent = '';

    const cardHolderName = cardholderNameInput.value;

    const { paymentIntent, error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
            return_url: 'http://127.0.0.1:4242/frontend/tienda/congrats.html',
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

    if (paymentIntent && paymentIntent.status === 'succeeded') {
        window.location.href = `congrats.html?payment_intent_client_secret=${paymentIntent.client_secret}`;
    }

    if (error) {
        errorMessage.textContent = error.message;
        payBtn.disabled = false;
        payBtn.textContent = 'Pay now';
        return;
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
        const saveCard = saveCardCheckbox.checked;

        if (saveCard) {
            if (paymentIntent.latest_charge && paymentIntent.latest_charge.payment_method_details && paymentIntent.latest_charge.payment_method_details.card) {
                const card = paymentIntent.latest_charge.payment_method_details.card;
                renderSavedCard(card.brand, card.last4, card.exp_month, card.exp_year);
            }
        }

        window.location.href = `congrats.html?payment_intent_client_secret=${paymentIntent.client_secret}`;
    } else {
        errorMessage.textContent = `Payment status: ${paymentIntent.status}. Please check the server logs.`;
        payBtn.disabled = false;
        payBtn.textContent = 'Pay now';
    }

});

// 3. Listener para recrear el Payment Intent si el usuario cambia la opción "Save card"
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
        cartContainer.innerHTML = '<div class="text-center text-gray-500 dark:text-gray-400 py-8">El carrito está vacío.</div>';
        orderSummaryList.innerHTML = '';
        cartTotal.textContent = '$0';
        return;
    }

    let subtotal = 0;
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
}
renderCart();

// Iniciar el proceso
createPaymentIntent();