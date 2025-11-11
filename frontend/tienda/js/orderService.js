// ============================================
// frontend/tienda/js/orderService.js
// ============================================

import { supabase, getCurrentUser } from './supabaseConfig.js';

// Generar número de orden único
function generateOrderNumber() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `ORD-${timestamp}-${random}`;
}

// Calcular fecha estimada de entrega
function calculateEstimatedDelivery(daysToAdd = 7) {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString();
}

// ============================================
// FUNCIÓN PRINCIPAL: CREAR ORDEN EN SUPABASE
// ============================================

export async function createOrderInSupabase({
  cartItems,
  shippingAddress,
  billingAddress,
  paymentIntentData
}) {
  try {
    console.log('🚀 Iniciando creación de orden en Supabase...');

    // 1. Obtener usuario actual (o usar 'guest' si no está autenticado)
    const user = await getCurrentUser();
    const userId = user?.id || 'guest';

    // 2. Calcular total
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );

    // 3. Generar número de orden único
    const orderNumber = generateOrderNumber();

    // 4. Preparar datos de la orden
    const orderData = {
      user_id: userId,
      order_number: orderNumber,
      order_date: new Date().toISOString(),
      total_amount: totalAmount,
      status: 'processed',
      payment_method: 'credit_card',
      payment_status: 'completed',
      shipping_address: shippingAddress,
      billing_address: billingAddress || shippingAddress,
      estimated_delivery: calculateEstimatedDelivery()
    };

    console.log('📦 Datos de orden preparados:', orderData);

    // 5. CREAR LA ORDEN
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (orderError) {
      console.error('❌ Error creando orden:', orderError);
      throw orderError;
    }

    console.log('✅ Orden creada exitosamente:', order);

    // 6. CREAR LOS ITEMS DE LA ORDEN
    const orderItems = cartItems.map(item => ({
      order_id: order.id,
      product_id: item.id || null,
      product_name: item.name || item.title,
      product_image: item.image || item.img || '',
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
      size: item.size || null,
      color: item.color || null,
      metadata: {
        description: item.description || '',
        sku: item.sku || '',
        category: item.category || ''
      }
    }));

    console.log('📝 Insertando items de orden:', orderItems);

    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select();

    if (itemsError) {
      console.error('❌ Error creando items de orden:', itemsError);
      throw itemsError;
    }

    console.log('✅ Items de orden creados:', items);

    // 7. REGISTRAR LA TRANSACCIÓN
    const transactionData = {
      order_id: order.id,
      transaction_id: paymentIntentData.id,
      payment_provider: 'stripe',
      amount: totalAmount,
      currency: paymentIntentData.currency || 'usd',
      status: 'success',
      payment_method_details: {
        last4: paymentIntentData.charges?.data?.[0]?.payment_method_details?.card?.last4 || 'N/A',
        brand: paymentIntentData.charges?.data?.[0]?.payment_method_details?.card?.brand || 'N/A',
        exp_month: paymentIntentData.charges?.data?.[0]?.payment_method_details?.card?.exp_month || null,
        exp_year: paymentIntentData.charges?.data?.[0]?.payment_method_details?.card?.exp_year || null
      },
      metadata: {
        client_secret: paymentIntentData.client_secret,
        payment_intent_status: paymentIntentData.status,
        created_at: new Date().toISOString()
      }
    };

    console.log('💳 Registrando transacción:', transactionData);

    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert([transactionData])
      .select()
      .single();

    if (transactionError) {
      console.error('❌ Error registrando transacción:', transactionError);
      throw transactionError;
    }

    console.log('✅ Transacción registrada exitosamente:', transaction);

    // 8. RETORNAR RESULTADO EXITOSO
    return {
      success: true,
      order: order,
      items: items,
      transaction: transaction
    };

  } catch (error) {
    console.error('❌ Error general en createOrderInSupabase:', error);
    return {
      success: false,
      error: error.message || 'Error desconocido al crear la orden'
    };
  }
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

// Obtener órdenes de un usuario
export async function getUserOrders(userId, limit = 10) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*),
        transactions (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

// Obtener detalles de una orden por número
export async function getOrderByNumber(orderNumber) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*),
        transactions (*)
      `)
      .eq('order_number', orderNumber)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
}

// Actualizar estado de orden
export async function updateOrderStatus(orderId, newStatus) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating order status:', error);
    return null;
  }
}