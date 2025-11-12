import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

export default async function handler(req, res) {
  // Headers CORS simplificados - Vercel ya los maneja pero los reforzamos
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Responder a preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      user_id, 
      cartItems, 
      shippingAddress, 
      billingAddress, 
      paymentIntentId,
      paymentStatus,
      paymentMethod 
    } = req.body || {};

    // ... resto de tu código sin cambios
  } catch (error) {
    console.error('create-orders handler error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}