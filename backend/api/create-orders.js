import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

export default async function handler(req, res) {
  // mover/asegurar headers CORS al inicio para que siempre se envíen
  const allowedOrigins = [
    'https://tiendatechparts.vercel.app',
    'https://dashboard-tech-parts.vercel.app',
    'http://127.0.0.1:4242',
    'http://localhost:3000'
  ];

  const origin = req.headers.origin;

  // Si quieres prueba rápida, puedes usar '*' temporalmente:
  // res.setHeader('Access-Control-Allow-Origin', '*');

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    // petición puede venir sin Origin (server-to-server) -> permitir por defecto
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else {
    // origen no permitido -> no setear header (será bloqueado por el navegador)
    console.warn('CORS: origin not allowed', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  // Si tu frontend envía cookies/credenciales, deja esto true y no uses '*' arriba
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // responder preflight inmediatamente
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

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const total_amount = cartItems.reduce((sum, item) => 
      sum + (parseFloat(item.price) * (parseInt(item.quantity || 1))), 0
    );

    const orderPayload = {
      user_id: user_id || null,
      order_number: `ORD-${Date.now()}`,
      order_date: new Date().toISOString(),
      total_amount,
      status: 'pending',
      payment_method: paymentMethod || 'stripe',
      payment_status: paymentStatus || 'succeeded',
      payment_intent_id: paymentIntentId || null,
      shipping_address: shippingAddress || {},
      billing_address: billingAddress || {},
      estimated_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert([orderPayload])
      .select()
      .single();

    if (orderError) {
      console.error('Error inserting order:', orderError);
      return res.status(500).json({ error: orderError.message || 'Insert order failed' });
    }

    const orderItemsPayload = cartItems.map(item => ({
      order_id: orderData.id,
      product_id: item.id || null,
      product_name: item.name || item.product_name || '',
      unit_price: parseFloat(item.price) || 0,
      quantity: parseInt(item.quantity || 1),
      total_price: (parseFloat(item.price) || 0) * (parseInt(item.quantity || 1)),
      metadata: item.metadata || {}
    }));

    const { data: itemsData, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItemsPayload)
      .select();

    if (itemsError) {
      console.warn('Warning: order items insert error:', itemsError);
    }

    return res.status(200).json({
      success: true,
      order: orderData,
      itemsCount: itemsData?.length || 0,
      itemsError: itemsError ? itemsError.message : null
    });
  } catch (error) {
    console.error('create-orders handler error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}