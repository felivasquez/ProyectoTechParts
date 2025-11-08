import express from "express";
import cors from "cors";
import Stripe from "stripe";

const app = express();

app.use(express.json());

// 🔒 Configuración CORS — solo tus sitios frontend
app.use(cors({
  origin: [
    "https://tiendatechparts.vercel.app",
    "https://dashboard-tech-parts.vercel.app"
  ]
}));

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Endpoint de pago
app.post("/api/create-payment-intent", async (req, res) => {
  try {
    const { amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: { enabled: true }
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Ruta de prueba
app.get("/", (req, res) => {
  res.send("Servidor TechParts Backend funcionando 🚀");
});

export default app;
