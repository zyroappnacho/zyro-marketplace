# 🔗 Configuración de Webhooks de Stripe

## **Pasos para Configurar Webhooks:**

### **1. Acceder al Dashboard de Stripe**
1. Ve a [dashboard.stripe.com](https://dashboard.stripe.com)
2. Asegúrate de estar en el modo correcto (Test/Live)

### **2. Configurar Webhook**
1. Ve a **Developers** → **Webhooks**
2. Haz clic en **"Add endpoint"**
3. **Endpoint URL**: `https://zyro-marketplace.onrender.com/webhook/stripe`
4. **Description**: "Zyro Marketplace Payment Webhooks"

### **3. Seleccionar Eventos**
Marca estos eventos importantes:
- ✅ `checkout.session.completed`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`

### **4. Obtener Webhook Secret**
1. Después de crear el webhook, copia el **Signing secret**
2. Ve a tu dashboard de Render → Environment
3. Agrega una nueva variable:
   - **Key**: `STRIPE_WEBHOOK_SECRET`
   - **Value**: [el signing secret que copiaste]

## **URLs de tu Backend Desplegado:**
- **API Principal**: `https://zyro-marketplace.onrender.com/`
- **Health Check**: `https://zyro-marketplace.onrender.com/health`
- **Stripe Checkout**: `https://zyro-marketplace.onrender.com/api/stripe/create-checkout-session`
- **Stripe Webhook**: `https://zyro-marketplace.onrender.com/webhook/stripe`

## **Verificación:**
Una vez configurado, puedes probar el webhook haciendo un pago de prueba desde tu app.