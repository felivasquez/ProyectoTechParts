[https://felivasquez.github.io/ProyectoTechParts/views/dashboard.html](https://felivasquez.github.io/ProyectoTechParts/frontend/dashboard/reportes.html)

<h1>Briefing - Proyecto Web: Sistema de Gestión de Componentes</h1>
<h3> 1. Descripción del cliente o empresa</h3>
<li>Nombre: TechParts S.A. </li><br>
<li>Descripción: </li>
Empresa dedicada a la distribución y venta mayorista de componentes de hardware para computadoras (placas madre, procesadores, memorias RAM, discos SSD, etc.). Cuenta con un almacén físico y desea expandir y digitalizar sus operaciones mediante una plataforma de gestión de inventario y pedidos en línea.

<h3> 2. Objetivo del proyecto </h3>
  <h5>Diseñar y desarrollar una página web que permita: </h5>
    <li>Gestionar de forma eficiente el inventario de componentes.</li>
    <li>Controlar el stock en tiempo real.</li>
    <li>Facilitar la búsqueda y categorización de productos.</li>
    <li>Registrar ingresos y egresos de componentes.</li>
    <li>Mejorar la trazabilidad y control del almacén.</li>
    <li>Posiblemente integrar un sistema de pedidos internos o para minoristas asociados.</li>
<h3> 3. Público objetivo </h3>
  <h5>Público objetivo:</h5>
  <ul>
    <li>Interno: Personal administrativo y logístico de la empresa.</li>
    <li>Externo (fase futura): Distribuidores minoristas o técnicos que compran al por mayor.</li>
    <li>Perfil técnico: Usuarios con conocimientos intermedios o avanzados en informática, que manejan términos técnicos relacionados con hardware.</li>
  </ul>

<h3> 4. Problema o necesidad que se quiere resolver </h3>
  <li>Desorganización del stock por llevar registros manuales.</li>
  <li>Pérdida de tiempo buscando componentes en el depósito.</li>
  <li>Dificultad para conocer el estado actualizado del inventario.</li>
  <li>Errores en pedidos y entregas por falta de control digitalizado.</li>
  <li>Necesidad de escalar y digitalizar procesos para mejorar la eficiencia operativa.</li>

<h3> 5. Características generales del producto o sistema </h3>
  <li> Página web responsive.</li>
  <li> Panel de administración con login seguro.</li>
  <li> CRUD (crear, leer, actualizar y eliminar) de componentes. </li>
  <li> Filtros por categoría, marca, tipo, compatibilidad, etc. </li>
  <li> Registro de movimientos de inventario (entrada/salida). </li>
  <li> Reportes automáticos (mensuales/semanales).</li>
  <li> Posible integración futura con sistemas de venta o ERP. </li>
  <li> Diseño simple, claro y funcional orientado a productividad. </li>

<h3> 6. Plazos, presupuesto aproximado, y restricciones </h3>
  <li> Plazo estimado: 6 a 8 semanas.</li>
  <li>Presupuesto: Entre 2000 y 3500 USD. </li>

  <h4> Restricciones: </h4>
  <li> Uso preferente de tecnologías web estándar (HTML, CSS, JS, PHP/MySQL). </li>
  <li> Debe poder alojarse en servidores compartidos o VPS básicos. </li>
  <li> No se requiere diseño gráfico complejo ni animaciones. </li>

<h3> 7. Ejemplos de sistemas similares (referencias) </h3>
  <li> PartKeepr (https://partkeepr.org/): Sistema open source de gestión de componentes electrónicos.</li>
  <li> Odoo Inventory (https://www.odoo.com): Módulo de inventario de ERP con funciones avanzadas. </li>
  <li> Inventree (https://inventree.readthedocs.io): Sistema de gestión de inventario para proyectos de electrónica. </li>


Payment Element

<!-- index.html -->
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Checkout con Stripe Payment Element</title>
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <style>
    /* Estilo básico (podés mejorar) */
    body { font-family: Arial, sans-serif; max-width: 720px; margin: 2rem auto; }
    .card { padding: 1.2rem; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.04);}
    #payment-element { margin: 1rem 0; }
    button { background:#6772e5; color:white; border:none; padding:0.8rem 1.2rem; border-radius:6px; cursor:pointer;}
    button:disabled { opacity:0.5; cursor:not-allowed; }
    .result { margin-top:1rem; }
  </style>
</head>
<body>
  <div class="card">
    <h2>Pago de ejemplo — Producto X</h2>
    <p>Precio: <strong>$ 1000 ARS</strong></p>

    <form id="payment-form">
      <div id="payment-element"><!-- Stripe Payment Element irá acá --></div>
      <button id="submit">Pagar</button>
      <div id="error-message" role="alert" style="color: #b00020; margin-top: .8rem;"></div>
    </form>

    <div class="result" id="result"></div>
  </div>

  <!-- Stripe.js -->
  <script src="https://js.stripe.com/v3/"></script>
  <script>
    // REEMPLAZAR por tu clave pública
    const STRIPE_PUBLISHABLE_KEY = "pk_test_XXXX_REEMPLAZAR_XXXX";

    // Endpoint en tu servidor que crea PaymentIntent y devuelve client_secret
    // Ej: https://mi-backend.example.com/create-payment-intent
    const CREATE_PAYMENT_INTENT_URL = "/create-payment-intent";

    let stripe, elements, paymentElement, clientSecret;

    async function init() {
      // Inicializar Stripe
      stripe = Stripe(STRIPE_PUBLISHABLE_KEY);

      // 1) Pedir al servidor el client_secret
      const res = await fetch(CREATE_PAYMENT_INTENT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 1000, currency: "ARS", description: "Producto X" })
      });

      const data = await res.json();
      if (!res.ok) {
        document.getElementById('error-message').textContent = data?.error || 'Error creando PaymentIntent';
        return;
      }

      clientSecret = data.client_secret;

      // 2) Crear Elements con el client_secret
      elements = stripe.elements({ clientSecret, appearance: {/* opciones de apariencia si querés */} });

      paymentElement = elements.create("payment");
      paymentElement.mount("#payment-element");
    }

    // Submit del formulario
    const form = document.getElementById("payment-form");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      document.getElementById("submit").disabled = true;
      document.getElementById("error-message").textContent = "";

      const { error } = await stripe.confirmPayment({
        // `elements` fue creado con el client_secret
        elements,
        confirmParams: {
          // URL de retorno después del pago si usás redirect (opcional)
          return_url: window.location.origin + "/result.html",
        },
        redirect: "if_required" // evita redirect si puede confirmarse in-page
      });

      if (error) {
        // Mostrar error (card declined, etc.)
        document.getElementById("error-message").textContent = error.message;
        document.getElementById("submit").disabled = false;
      } else {
        // Éxito: mostrar mensaje de confirmación simple
        document.getElementById("result").textContent = "Pago enviado. Si el pago se confirma, recibirás la confirmación.";
      }
    });

    // Inicializar al cargar
    init().catch(err => {
      console.error(err);
      document.getElementById('error-message').textContent = 'Error al inicializar Stripe.';
    });
  </script>
</body>
</html>


---

3) Backend — Opción A: Node + Express (lo más directo)

Instalación

npm init -y
npm install express stripe dotenv

server.js

// server.js
require('dotenv').config();
const express = require('express');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // tu clave secreta
const app = express();
app.use(express.json());

// CORS si hace falta
const cors = require('cors');
app.use(cors({ origin: true }));

app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount = 1000, currency = 'ars', description } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // en centavos (o en la unidad menor): ej 1000 => $10.00 si currency es USD. Para ARS Stripe usa centavos también.
      currency: currency.toLowerCase(),
      description,
      automatic_payment_methods: { enabled: true } // permite múltiples métodos en Payment Element
    });

    res.json({ client_secret: paymentIntent.client_secret });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));

.env

STRIPE_SECRET_KEY=sk_test_XXXX_REEMPLAZAR_XXXX

> Nota: el parámetro amount está en la unidad más pequeña de la moneda (centavos). Para ARS ver cómo tu cuenta Stripe configura moneda/decimales. Confirmá en tu cuenta.


