// server.js (Confirmado como correcto y completo)

import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
console.log('Clave de Stripe:', process.env.STRIPE_SECRET_KEY ? 'Cargada' : 'FALTA CLAVE');

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { 
    apiVersion: '2022-11-15' 
});

app.use(cors());
app.use(express.json());

app.post('/create-payment-intent', async (req, res) => {
    try {
        const { amount, save_card } = req.body; 
        
        // Define la propiedad setup_future_usage condicionalmente.
        const setupFutureUsage = save_card ? 'off_session' : undefined;

        if (amount <= 0) {
             return res.status(400).json({ error: "Amount must be a positive integer." });
        }
        
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount, 
            currency: 'usd', 
            // customer: customerId, // Descomentar si usas un Customer ID
            automatic_payment_methods: { enabled: true },
            setup_future_usage: setupFutureUsage, // ¡Correcto!
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });

    } catch (err) {
        console.error("Error creating Payment Intent:", err.message);
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));