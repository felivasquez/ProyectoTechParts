// server.js (Confirmado como correcto y completo)

import express from "express";
import cors from "cors";
import stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// ✅ Configurar CORS correctamente:
app.use(cors({
  origin: [
    "https://techparts.vercel.app",      // tu dominio frontend
    "https://tiendatechparts.vercel.app", // si el frontend está en otro dominio
    "http://localhost:5500"              // para pruebas locales
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
}));

app.use(express.json());

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const stripeClient = stripe(STRIPE_SECRET_KEY);

// Ejemplo de ruta:
app.post("/api/create-payment-intent", async (req, res) => {
  try {
    const { amount } = req.body;
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Para asegurarte de que funcione en Vercel:
export default app;
