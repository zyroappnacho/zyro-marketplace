# Zyro Marketplace - Sistema de Notificaciones Push

Este documento describe la implementación completa del sistema de notificaciones push para la aplicación Zyro Marketplace, cumpliendo con los requisitos 15.1-15.5.

## Arquitectura del Sistema

### Componentes Principales

1. **FirebaseNotificationService** - Servicio principal de Firebase Cloud Messaging
2. **NotificationService** - Servicio de notificaciones de la aplicación
3. **NotificationManager** - Gestor de eventos automáticos
4. **NotificationTypes** - Tipos y plantillas de notificaciones
5. **useNotifications** - Hook de React para gestión de notificaciones

### Flujo de Notificaciones

```
Evento de la App → NotificationManager → NotificationService → Firebase → Usuario
```

## Configuración

### 1. Dependencias Instaladas

```json
{
  "@react-native-firebase/app": "^23.1.2",
  "@react-native-firebase/messaging": "^23.1.2",
  "expo-notifications": "^0.31.4"
}
```

### 2. Configuración de Firebase

Crear archivo `.env` basado en `.env.example`:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

### 3. Inicialización en la App

```typescript
import { useNotifications } from './src/hooks/useNotifications';

function App() {
  const { initialize } = useNotifications();
  
  useEffect(() => {
    initialize();
  }, []);
}
```

## Tipos de Notificaciones

### 1. Solicitudes de Colaboración (Requisito 15.1)

**Evento**: Influencer solicita colaboración
**Destinatario**: Administrador
**Plantilla**: `COLLABORATION_REQUEST_SUBMITTED`

```typescript
await notificationManager.onCollaborationRequested(
  collaborationRequestId,
  influencerId,
  influencerName,
  campaignId,
  campaignTitle
);
```

### 2. Actualizaciones de Aprobación (Requisito 15.2)

**Evento**: Admin aprueba/rechaza usuario o colaboración
**Destinatario**: Usuario afectado
**Plantillas**: `USER_APPROVED`, `USER_REJECTED`, `COLLABORATION_REQUEST_APPROVED`

```typescript
await notificationManager.onUserStatusChanged(
  userId,
  userEmail,
  'approved',
  userName
);
```

### 3. Actualizaciones de Campañas (Requisito 15.3)

**Evento**: Nueva campaña disponible
**Destinatario**: Influencers relevantes
**Plantilla**: `NEW_CAMPAIGN_AVAILABLE`

```typescript
await notificationManager.onCampaignCreated(
  campaignId,
  campaignTitle,
  city,
  category
);
```

### 4. Recordatorios de Pago (Requisito 15.4)

**Evento**: Suscripción próxima a vencer
**Destinatario**: Empresa
**Plantilla**: `PAYMENT_REMINDER`

```typescript
await notificationManager.onPaymentReminder(
  companyId,
  planName,
  daysRemaining,
  amount
);
```

### 5. Confirmaciones (Requisito 15.5)

**Evento**: Pago exitoso, contenido entregado
**Destinatario**: Usuario relevante
**Plantillas**: `PAYMENT_SUCCESS`, contenido entregado

```typescript
await notificationManager.onPaymentSuccess(
  companyId,
  planName,
  amount,
  nextBillingDate
);
```

## Características Implementadas

### ✅ Notificaciones Push con Firebase
- Integración completa con Firebase Cloud Messaging
- Soporte para iOS y Android
- Manejo de tokens FCM

### ✅ Notificaciones Locales con Expo
- Fallback para notificaciones locales
- Programación de notificaciones
- Categorías de notificaciones

### ✅ Plantillas Personalizadas
- 15+ plantillas predefinidas en español
- Variables dinámicas en mensajes
- Consistencia en el branding

### ✅ Gestión de Permisos
- Solicitud automática de permisos
- Verificación de estado de permisos
- Manejo de permisos denegados

### ✅ Programación de Notificaciones
- Recordatorios de contenido (24h, 6h)
- Recordatorios de pago (7, 3, 1 días)
- Horarios silenciosos configurables

### ✅ Suscripciones por Temas
- Temas por rol (admin, influencer, company)
- Temas por ciudad
- Temas por categoría

### ✅ Configuración de Usuario
- Pantalla de configuración de notificaciones
- Activar/desactivar tipos específicos
- Configuración de horarios silenciosos

## Uso en la Aplicación

### Hook useNotifications

```typescript
const {
  state,
  initialize,
  requestPermissions,
  clearBadge,
  subscribeToTopics,
  onNotificationReceived
} = useNotifications();

// Escuchar notificaciones
useEffect(() => {
  const unsubscribe = onNotificationReceived((notification) => {
    console.log('Nueva notificación:', notification);
  });
  
  return unsubscribe;
}, []);
```

### Eventos Automáticos

```typescript
// En el registro de usuario
await notificationManager.onUserRegistered(
  userId,
  userEmail,
  'influencer',
  userName
);

// En solicitud de colaboración
await notificationManager.onCollaborationRequested(
  collaborationRequestId,
  influencerId,
  influencerName,
  campaignId,
  campaignTitle
);
```

## Testing

### Ejecutar Tests

```bash
npm test -- --testPathPatterns=notificationService.test.ts
```

### Cobertura de Tests

- ✅ Tipos de notificaciones
- ✅ Plantillas de mensajes
- ✅ Formateo de variables
- ✅ Validación de configuración
- ✅ Manejo de errores

## Configuración de Producción

### 1. Firebase Console
1. Crear proyecto Firebase
2. Habilitar Cloud Messaging
3. Configurar certificados iOS/Android
4. Obtener credenciales del proyecto

### 2. Variables de Entorno
```env
EXPO_PUBLIC_ENVIRONMENT=production
EXPO_PUBLIC_FIREBASE_PROJECT_ID=zyro-marketplace-prod
```

### 3. Certificados Push
- **iOS**: Configurar APNs en Firebase Console
- **Android**: Configurar FCM automáticamente

## Monitoreo y Analytics

### Métricas Disponibles
- Notificaciones enviadas
- Tasa de entrega
- Tasa de apertura
- Errores de envío

### Logging
```typescript
console.log('Notification sent:', {
  type: notification.type,
  recipient: notification.recipient,
  timestamp: new Date().toISOString()
});
```

## Troubleshooting

### Problemas Comunes

1. **Permisos Denegados**
   - Verificar configuración del dispositivo
   - Solicitar permisos nuevamente

2. **Token FCM No Disponible**
   - Verificar conexión a internet
   - Reinicializar Firebase

3. **Notificaciones No Llegan**
   - Verificar configuración Firebase
   - Comprobar certificados push

### Debug Mode

```typescript
// Habilitar logs detallados
console.log('FCM Token:', await firebaseNotificationService.getFCMToken());
console.log('Permissions:', await firebaseNotificationService.areNotificationsEnabled());
```

## Próximas Mejoras

- [ ] Notificaciones rich media (imágenes)
- [ ] Acciones personalizadas en notificaciones
- [ ] Analytics avanzados
- [ ] A/B testing de mensajes
- [ ] Segmentación avanzada de usuarios

## Soporte

Para problemas o preguntas sobre el sistema de notificaciones:

1. Revisar logs de la aplicación
2. Verificar configuración Firebase
3. Consultar documentación oficial de Firebase
4. Contactar al equipo de desarrollo