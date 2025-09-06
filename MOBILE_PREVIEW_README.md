# 📱 Zyro Marketplace - Vista Previa Móvil Interactiva

## 🚀 Lanzamiento Rápido

```bash
# Método más rápido - Ejecutar vista previa
npm run mobile-preview

# O usar el archivo batch en Windows
./launch-mobile-preview.bat
```

**¡La vista previa se abrirá automáticamente en tu navegador!**

---

## ✨ Características Implementadas

### 🎨 Diseño Premium
- ✅ **Marco iPhone 14 Pro Max** - Simulación realista del dispositivo
- ✅ **Colores Premium** - Paleta dorado (#C9A961) y negro elegante
- ✅ **Tipografía Cinzel** - Logo premium con fuente serif elegante
- ✅ **Animaciones Suaves** - Transiciones y efectos visuales fluidos
- ✅ **Sombras y Efectos** - Elementos con profundidad y elegancia

### 🔐 Sistema Multirol
- ✅ **Influencer** - Navegación completa con colaboraciones
- ✅ **Empresa** - Panel de gestión de campañas y estadísticas
- ✅ **Administrador** - Dashboard completo con métricas del sistema
- ✅ **Cambio de Rol** - Switcher en tiempo real sin reiniciar

### 📱 Navegación Completa
- ✅ **Barra Inferior** - 4 íconos principales con estados activos
- ✅ **Pantalla Inicio** - Lista de colaboraciones con filtros
- ✅ **Mapa Interactivo** - Placeholder para mapa de España
- ✅ **Historial** - Pestañas de pendientes, aprobadas y rechazadas
- ✅ **Perfil** - Configuraciones completas y opciones

### 🎯 Funcionalidades Interactivas
- ✅ **Filtros Funcionales** - Por ciudad y categoría
- ✅ **Tarjetas de Colaboración** - Información completa y botones activos
- ✅ **Pantalla de Detalles** - Vista expandida de colaboraciones
- ✅ **Chat Integrado** - Interfaz de mensajería con administrador
- ✅ **Estados Visuales** - Hover, active y feedback táctil

### 📊 Datos Mock Realistas
- ✅ **Colaboraciones** - 3 ejemplos con datos completos
- ✅ **Historial** - Estados de solicitudes con fechas
- ✅ **Estadísticas** - Métricas para empresa y admin
- ✅ **Filtrado Dinámico** - Funciona con datos reales

---

## 🎮 Cómo Usar la Vista Previa

### 1. **Cambiar de Rol**
- Usa los botones en la esquina superior derecha
- Cada rol muestra diferentes pantallas y funcionalidades
- El cambio es instantáneo sin recargar

### 2. **Navegación por Pestañas**
- **Inicio**: Lista de colaboraciones con filtros
- **Mapa**: Vista de mapa interactivo
- **Historial**: Solicitudes en diferentes estados
- **Perfil**: Configuraciones y opciones de cuenta

### 3. **Interacciones Disponibles**
- Toca cualquier tarjeta de colaboración para ver detalles
- Usa los filtros de ciudad y categoría
- Navega por las pestañas del historial
- Explora las opciones del perfil
- Prueba el chat integrado

### 4. **Roles Específicos**
- **Influencer**: Experiencia completa de usuario final
- **Empresa**: Panel de gestión con estadísticas
- **Admin**: Dashboard administrativo con métricas

---

## 🛠️ Estructura Técnica

### Archivos Principales
```
ZyroMarketplace/
├── mobile-preview.html          # Vista previa completa
├── launch-mobile-preview.js     # Servidor local
├── launch-mobile-preview.bat    # Launcher para Windows
└── BUILD_INSTRUCTIONS.md       # Guía de builds
```

### Tecnologías Utilizadas
- **HTML5** - Estructura semántica
- **CSS3** - Estilos premium con gradientes y animaciones
- **JavaScript ES6** - Lógica interactiva y navegación
- **Material Icons** - Iconografía consistente
- **Google Fonts** - Tipografías Cinzel e Inter

### Responsive Design
- **iPhone 14 Pro Max** - 430x932px (referencia principal)
- **Adaptativo** - Se ajusta a pantallas más pequeñas
- **Touch Friendly** - Elementos optimizados para táctil

---

## 🎨 Guía de Diseño

### Paleta de Colores
```css
/* Colores Premium */
--gold-elegant: #C9A961    /* Dorado principal */
--gold-dark: #A68B47       /* Dorado oscuro */
--gold-bright: #D4AF37     /* Dorado brillante */
--black: #000000           /* Negro principal */
--dark-gray: #111111       /* Gris oscuro */
--medium-gray: #666666     /* Gris medio */
--light-gray: #999999      /* Gris claro */
--white: #FFFFFF           /* Blanco */
```

### Tipografías
- **Logo**: Cinzel (serif elegante)
- **Contenido**: Inter (sans-serif moderna)
- **Pesos**: 400, 500, 600, 700

### Espaciado
- **XS**: 4px - Espacios mínimos
- **SM**: 8px - Espacios pequeños
- **MD**: 16px - Espacios estándar
- **LG**: 24px - Espacios grandes
- **XL**: 32px - Espacios extra grandes

---

## 🔧 Personalización

### Modificar Datos Mock
Edita las variables en `mobile-preview.html`:
```javascript
const mockCollaborations = [
    // Añadir más colaboraciones aquí
];

const mockHistory = {
    // Modificar historial aquí
};
```

### Cambiar Colores
Modifica las variables CSS:
```css
:root {
    --primary-color: #C9A961;
    --background-color: #000000;
    /* Otros colores... */
}
```

### Añadir Nuevas Pantallas
1. Crear nueva sección HTML con clase `screen`
2. Añadir función de navegación en JavaScript
3. Actualizar el sistema de routing

---

## 📱 Comparación con App Real

### Funcionalidades Implementadas ✅
- [x] Sistema multirol completo
- [x] Navegación por pestañas
- [x] Filtros funcionales
- [x] Pantallas de detalle
- [x] Chat integrado
- [x] Diseño premium
- [x] Animaciones suaves
- [x] Estados interactivos

### Próximas Implementaciones 🔄
- [ ] Mapa real de España con ubicaciones
- [ ] Calendario de reservas
- [ ] Sistema de notificaciones
- [ ] Carga de imágenes reales
- [ ] Integración con backend
- [ ] Autenticación real
- [ ] Pagos integrados

---

## 🚀 Próximos Pasos

### 1. **Desarrollo Backend**
- API REST para colaboraciones
- Sistema de autenticación
- Base de datos con datos reales
- Integración con servicios de pago

### 2. **Funcionalidades Avanzadas**
- Notificaciones push
- Geolocalización real
- Cámara y galería
- Compartir en redes sociales

### 3. **Optimizaciones**
- Lazy loading de imágenes
- Cache de datos
- Offline capabilities
- Performance monitoring

---

## 📞 Soporte y Feedback

### Reportar Problemas
1. Describe el problema específico
2. Incluye el navegador y versión
3. Menciona el rol y pantalla afectada
4. Proporciona pasos para reproducir

### Sugerir Mejoras
- Nuevas funcionalidades
- Mejoras de UX/UI
- Optimizaciones de rendimiento
- Características adicionales

---

**🎉 ¡Disfruta explorando la vista previa de Zyro Marketplace!**

*La experiencia está diseñada para ser lo más cercana posible a la aplicación móvil final, con todas las interacciones y navegación funcionando de manera fluida y realista.*