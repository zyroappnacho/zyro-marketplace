# Zyro Marketplace - Preview Completa

## 🎯 Usuarios de Prueba Configurados

### 1. Administrador
- **Usuario**: `admin_zyrovip`
- **Contraseña**: `xarrec-2paqra-guftoN`
- **Acceso**: Panel completo de administración

### 2. Influencer
- **Usuario**: `pruebainflu`
- **Contraseña**: `12345`
- **Acceso**: App completa con 4 pestañas de navegación

### 3. Empresa (Auto-creada)
- Al hacer clic en "SOY EMPRESA" se crea automáticamente un usuario empresa
- **Usuario**: `empresa_auto`
- **Contraseña**: `empresa123`
- **Acceso**: Dashboard limitado para empresas

## 🚀 Cómo Ejecutar la Preview

### Opción 1: Expo Development Build
```bash
cd ZyroMarketplace
npm install
npx expo start
```

### Opción 2: Simulador iOS/Android
```bash
cd ZyroMarketplace
npm install
npx expo run:ios    # Para iOS
npx expo run:android # Para Android
```

## 📱 Funcionalidades Implementadas

### ✅ Sistema de Autenticación
- Pantalla de bienvenida con estética premium
- Login con validación de credenciales
- Registro de influencers y empresas
- Estados de usuario (pendiente, aprobado, rechazado)

### ✅ Panel de Administración
- Dashboard con estadísticas
- Gestión de usuarios (aprobación/rechazo)
- Creación y edición de campañas
- Dashboard de ingresos
- Configuración de pagos

### ✅ App Móvil - 4 Pestañas Principales

#### 1. Pestaña Inicio (Colaboraciones)
- Selector de ciudad "ZYRO [CIUDAD]"
- Filtros por 8 categorías
- Tarjetas de colaboración con estética premium
- Validación automática de requisitos de seguidores
- Navegación a detalles de colaboración

#### 2. Pestaña Mapa
- Mapa interactivo de España
- Marcadores de ubicaciones de negocios
- Zoom ampliable/desampliable
- Información emergente de colaboraciones

#### 3. Pestaña Historial
- Sub-pestañas: PRÓXIMOS, PASADOS, CANCELADOS
- Seguimiento completo de colaboraciones
- Estados y fechas de cada colaboración

#### 4. Pestaña Perfil
- Logo Zyro grande superior izquierda
- Información de redes sociales editable
- Botón actualizable de seguidores
- Configuración de cuenta y privacidad

### ✅ Sistema de Colaboraciones
- Pantalla detallada con galería de fotos
- Información completa del negocio
- Sección "QUÉ INCLUYE"
- Requisitos de contenido obligatorio
- Mapa pequeño con ubicación
- Formulario de solicitud de colaboración

### ✅ Estética Premium
- Paleta de colores dorada (#C9A961, #A68B47, #D4AF37)
- Fondos oscuros (#000000, #111111)
- Logo Zyro con espaciado específico (Cinzel, 3px)
- Fuente Inter para textos
- Gradientes dorados y efectos premium
- Transiciones suaves y animaciones

### ✅ Datos de Prueba
- 6 campañas de ejemplo en Madrid y Barcelona
- 8 ciudades habilitadas
- 8 categorías de negocios
- Colaboraciones con diferentes requisitos de seguidores
- Estados de colaboración variados

## 🎨 Estética y Diseño

### Colores Premium
- **Dorado Elegante**: #C9A961
- **Dorado Oscuro**: #A68B47
- **Dorado Brillante**: #D4AF37
- **Negro**: #000000
- **Gris Oscuro**: #111111

### Tipografía
- **Logo**: Cinzel, peso 600, espaciado 3px
- **Textos**: Inter, varios pesos

### Componentes Premium
- Botones con gradientes dorados
- Tarjetas con bordes dorados y sombras
- Efectos hover y focus con glow dorado
- Transiciones suaves de 0.2s

## 🔧 Navegación y Flujos

### Flujo de Influencer
1. Pantalla bienvenida → "SOY INFLUENCER"
2. Registro con datos detallados
3. Estado "Pendiente de Aprobación"
4. Login con `pruebainflu` / `12345`
5. Acceso a 4 pestañas principales
6. Navegación entre colaboraciones
7. Solicitud de colaboraciones
8. Gestión de perfil

### Flujo de Empresa
1. Pantalla bienvenida → "SOY EMPRESA"
2. Auto-creación de usuario empresa
3. Login con `empresa_auto` / `empresa123`
4. Dashboard limitado con métricas
5. Vista de colaboraciones solicitadas

### Flujo de Administrador
1. Login con `admin_zyrovip` / `xarrec-2paqra-guftoN`
2. Panel de administración completo
3. Gestión de usuarios y aprobaciones
4. Creación de campañas
5. Dashboard financiero
6. Configuración de sistema

## 📊 Datos Mock Incluidos

### Campañas de Ejemplo
- Restaurante La Terraza (Madrid)
- Zen Spa & Wellness (Madrid)
- Club Exclusive (Madrid)
- Moda Sostenible Co. (Barcelona)
- Gourmet Home (Madrid)
- Hotel Boutique Sevilla (Sevilla)

### Ciudades Habilitadas
Madrid, Barcelona, Valencia, Sevilla, Bilbao, Málaga, Zaragoza, Murcia

### Categorías
Restaurantes, Movilidad, Ropa, Eventos, Delivery, Salud y Belleza, Alojamiento, Discotecas

## 🔐 Seguridad y Privacidad

### Implementado
- Encriptación de datos sensibles
- Autenticación segura con JWT
- Detección de actividad sospechosa
- Cumplimiento GDPR
- Auditoría de acciones
- Validación de entrada

### Características de Seguridad
- Bloqueo por múltiples intentos fallidos
- Sesiones con timeout
- Autenticación adicional para acciones sensibles
- Logging de seguridad

## 🚨 Notas Importantes

1. **Datos Mock**: Todos los datos son de prueba y no se conectan a APIs reales
2. **Pagos**: Sistema de pagos simulado, no procesa transacciones reales
3. **Notificaciones**: Configuradas pero requieren setup de Firebase para funcionar
4. **Mapas**: Requiere API key de Google Maps para funcionalidad completa
5. **Imágenes**: Usando placeholders, reemplazar con imágenes reales en producción

## 🎯 Casos de Uso para Testing

### Como Influencer
1. Registrarse y esperar aprobación
2. Login y explorar colaboraciones
3. Filtrar por ciudad y categoría
4. Ver detalles de colaboración
5. Solicitar colaboración (si cumple requisitos)
6. Actualizar perfil y seguidores
7. Ver historial de colaboraciones

### Como Empresa
1. Registro automático
2. Login y ver dashboard
3. Revisar métricas de colaboraciones
4. Ver influencers que han aplicado

### Como Administrador
1. Login con credenciales especiales
2. Aprobar/rechazar usuarios
3. Crear nuevas campañas
4. Configurar ciudades y categorías
5. Ver dashboard financiero
6. Gestionar configuración del sistema

## 📱 Compatibilidad

- **iOS**: 12.0+
- **Android**: API 21+ (Android 5.0)
- **Expo SDK**: 49+
- **React Native**: 0.72+

La preview está completamente funcional y permite interactuar con todas las pantallas y funcionalidades establecidas en los requirements, design y tasks.