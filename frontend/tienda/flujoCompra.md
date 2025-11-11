## 🔄 **FLUJO COMPLETO DEL USUARIO**
```
1. Usuario agrega productos al carrito
   ↓
2. Va a checkout (paymentForm.html)
   ├─ Llena información de envío
   ├─ Llena información de tarjeta
   └─ Click "Pay now"
   ↓
3. Stripe procesa el pago
   ↓
4. ✅ Pago exitoso
   ├─ createOrderInSupabase() guarda todo en DB
   │  ├─ Tabla 'orders'
   │  ├─ Tabla 'order_items'  
   │  └─ Tabla 'transactions'
   ├─ Limpia localStorage
   └─ Redirige a congrats.html?order_number=XXX
   ↓
5. Usuario ve confirmación
   ↓
6. Usuario puede ir a orders.html
   ├─ Ve lista de todas sus órdenes
   └─ Click "View Order" → order-details.html
   ↓
7. Ve detalle completo de la orden