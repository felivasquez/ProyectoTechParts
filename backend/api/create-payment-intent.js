import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // CORS headers - CRÍTICO
  const allowedOrigins = [
    'https://tiendatechparts.vercel.app',
    'https://dashboard-tech-parts.vercel.app',
    'http://127.0.0.1:4242',
    'http://localhost:3000'
  ];

  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Manejar preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Solo POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { amount, save_card } = req.body;

    // Validar amount
    if (!amount || amount < 50) {
      return res.status(400).json({ 
        error: "Amount must be at least $0.50 USD" 
      });
    }

    // Crear Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: "usd",
      automatic_payment_methods: { 
        enabled: true 
      },
      // Si quieres guardar la tarjeta para uso futuro
      setup_future_usage: save_card ? 'off_session' : null
    });

    return res.status(200).json({ 
      clientSecret: paymentIntent.client_secret 
    });

  } catch (error) {
    console.error("Stripe error:", error);
    return res.status(500).json({ 
      error: error.message || "Payment Intent creation failed" 
    });
  }
}