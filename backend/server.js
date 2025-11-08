import express from "express";
import cors from "cors";
import Stripe from "stripe";

const app = express();
app.use(express.json());

app.use(cors({
  origin: [
    "https://tiendatechparts.vercel.app",
    "https://dashboardtechparts.vercel.app"
  ]
}));

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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

app.get("/", (req, res) => {
  res.send("Servidor TechParts Backend funcionando 🚀");
});

export default app;
