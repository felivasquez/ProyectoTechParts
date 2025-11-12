import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

export default async function handler(req, res) {
  // CORS
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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { 
      user_id, 
      cartItems, 
      shippingAddress, 
      billingAddress, 
      paymentIntentId,
      paymentStatus,
      paymentMethod 
    } = req.body;

    // Validar carrito
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Calcular total
    const total_amount = cartItems.reduce((sum, item) => 
      sum + (item.price * (item.quantity || 1)), 0
    );

    // 1️⃣ INSERTAR ORDEN
    const orderPayload = {
      user_id: user_id || null,
      order_number: `ORD-${Date.now()}`,
      order_date: new Date().toISOString(),
      total_amount,
      status: 'pending',
      payment_method: paymentMethod || 'stripe',
      payment_status: paymentStatus || 'succeeded',
      payment_intent_id: paymentIntentId,
      shipping_address: shippingAddress,
      billing_address: billingAddress,
      estimated_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert([orderPayload])
      .select()
      .single();

    if (orderError) {
      console.error('❌ Error inserting order:', orderError);
      return res.status(500).json({ error: orderError.message });
    }

    console.log('✅ Orden creada:', orderData.id);

    // 2️⃣ INSERTAR ITEMS DEL CARRITO
    const orderItemsPayload = cartItems.map(item => ({
      order_id: orderData.id,
      product_id: item.id,
      product_name: item.name,
      unit_price: parseFloat(item.price),
      quantity: parseInt(item.quantity) || 1,
      total_price: parseFloat(item.price) * (parseInt(item.quantity) || 1),
      metadata: item.metadata || {}
    }));

    const { error: itemsError, data: itemsData } = await supabaseAdmin
      .from('order_items')
      .insert(orderItemsPayload)
      .select();

    if (itemsError) {
      console.warn('⚠️ Error inserting order items:', itemsError);
      // No retornar error aquí, la orden ya fue creada
    }

    console.log('✅ Items guardados:', itemsData?.length);

    return res.status(200).json({ 
      success: true, 
      order: orderData,
      itemsCount: itemsData?.length || 0
    });

  } catch (error) {
    console.error('❌ Handler error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}