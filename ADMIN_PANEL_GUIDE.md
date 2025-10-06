# Panel de Administrador ZYRO - Guía Completa

## 🔐 Acceso de Administrador

### Credenciales de Acceso
- **Usuario:** `admin_zyrovip`
- **Contraseña:** `xarrec-2paqra-guftoN`

### Cómo Acceder
1. Abrir la aplicación ZYRO
2. Ir a la pantalla de "Iniciar Sesión"
3. Introducir las credenciales de administrador
4. El sistema automáticamente detectará el rol de administrador y mostrará el panel completo

## 📊 Funcionalidades del Panel de Administrador

### 1. Dashboard Principal
- **Métricas en Tiempo Real:**
  - Ingresos totales y mensuales
  - Número de empresas registradas y activas
  - Total de influencers y solicitudes pendientes
  - Campañas totales y activas

- **Actividad Reciente:**
  - Registro de todas las acciones importantes
  - Timestamps de actividades
  - Historial de cambios

### 2. Gestión de Empresas
- **Visualización Completa:**
  - Lista de todas las empresas registradas
  - Estado de cada empresa (Activa/Pendiente)
  - Información de planes y pagos
  - Datos de contacto y representantes

- **Información Mostrada:**
  - Nombre de la empresa
  - Plan contratado (3, 6 o 12 meses)
  - Pago mensual
  - Email y teléfono de contacto
  - Fecha de registro
  - Estado del pago

### 3. Gestión de Influencers
- **Solicitudes Pendientes:**
  - Lista de influencers esperando aprobación
  - Información completa del perfil
  - Capturas de Instagram y TikTok subidas
  - Datos de seguidores y engagement

- **Acciones Disponibles:**
  - ✅ **Aprobar Influencer:** Activa la cuenta del influencer
  - ❌ **Rechazar Influencer:** Rechaza la solicitud con motivo
  - 👁️ **Ver Detalles:** Información completa del perfil

- **Proceso de Aprobación:**
  1. Revisar información del influencer
  2. Verificar capturas de redes sociales
  3. Aprobar o rechazar con motivo
  4. El influencer recibe notificación automática

### 4. Gestión de Campañas
- **Crear Nuevas Campañas:**
  - Formulario completo para crear campañas
  - Campos obligatorios: título, negocio, descripción
  - Configuración de requisitos y beneficios
  - Asignación automática de coordenadas

- **Gestionar Campañas Existentes:**
  - Lista de todas las campañas activas
  - Editar campañas existentes
  - Eliminar campañas (con confirmación)
  - Ver estadísticas de cada campaña

- **Campos de Campaña:**
  - Título de la campaña
  - Nombre del negocio
  - Categoría (restaurantes, ropa, eventos, etc.)
  - Ciudad
  - Descripción detallada
  - Requisitos (ej: Min. 10K seguidores)
  - Qué incluye la colaboración
  - Contenido requerido
  - Fecha límite

### 5. Dashboard Financiero
- **Resumen de Ingresos:**
  - Ingresos totales acumulados
  - Ingresos del mes actual
  - Proyecciones de ingresos

- **Métodos de Pago:**
  - Desglose por tipo de pago
  - Tarjetas de crédito/débito
  - Transferencias bancarias
  - Montos por cada método

- **Transacciones Recientes:**
  - Historial de pagos de empresas
  - Detalles de cada transacción
  - Fechas y montos
  - Estado de los pagos

### 6. Contraseña y Seguridad
- **Cambio de Contraseña:**
  - Formulario seguro para cambiar contraseña
  - Validación de contraseña actual
  - Confirmación de nueva contraseña
  - Mínimo 8 caracteres requeridos

- **Información de Seguridad:**
  - Última sesión activa
  - Intentos de acceso fallidos
  - Tiempo de expiración de sesión
  - Registro de actividades de seguridad

## 🔧 Funcionalidades Técnicas

### Almacenamiento de Datos
- Utiliza `AsyncStorage` para persistencia local
- Datos encriptados y seguros
- Backup automático de información crítica

### Servicios Integrados
- **AdminService:** Manejo de todas las operaciones administrativas
- **StorageService:** Gestión de almacenamiento de datos
- **Redux Store:** Estado global de la aplicación

### Navegación
- Navegación horizontal entre secciones
- Indicadores visuales de sección activa
- Transiciones suaves entre pantallas

## 📱 Interfaz de Usuario

### Diseño
- Tema oscuro elegante con acentos dorados (#C9A961)
- Iconos intuitivos para cada sección
- Cards organizadas para mejor legibilidad
- Gradientes y efectos visuales premium

### Responsividad
- Adaptable a diferentes tamaños de pantalla
- Optimizado para tablets y móviles
- Scrolling suave en listas largas

## 🚀 Flujo de Trabajo Típico

### 1. Inicio de Sesión Diario
1. Acceder con credenciales de administrador
2. Revisar dashboard para métricas del día
3. Verificar actividad reciente

### 2. Gestión de Solicitudes
1. Ir a sección "Influencers"
2. Revisar solicitudes pendientes
3. Aprobar o rechazar según criterios
4. Verificar que se actualicen las métricas

### 3. Creación de Campañas
1. Ir a sección "Campañas"
2. Completar formulario de nueva campaña
3. Verificar que aparezca en la lista
4. Confirmar que esté disponible para influencers

### 4. Monitoreo Financiero
1. Revisar dashboard financiero
2. Verificar transacciones recientes
3. Analizar métodos de pago más utilizados
4. Generar reportes mentales de rendimiento

## 🔒 Seguridad y Mejores Prácticas

### Acceso Seguro
- Credenciales únicas y complejas
- Sesiones con tiempo de expiración
- Registro de todas las actividades

### Gestión de Datos
- Validación de todos los inputs
- Confirmaciones para acciones críticas
- Backup automático de cambios importantes

### Privacidad
- Información sensible protegida
- Acceso restringido solo a administradores
- Logs de auditoría para trazabilidad

## 📈 Métricas y KPIs

### Métricas Principales
- **Crecimiento de Empresas:** Nuevos registros por período
- **Aprobación de Influencers:** Ratio de aprobación/rechazo
- **Ingresos:** Tendencias mensuales y anuales
- **Actividad de Campañas:** Campañas creadas vs. completadas

### Reportes Disponibles
- Resumen diario de actividades
- Análisis mensual de ingresos
- Estadísticas de usuarios por tipo
- Rendimiento de campañas por categoría

## 🛠️ Mantenimiento y Actualizaciones

### Tareas Regulares
- Revisar y aprobar solicitudes de influencers
- Crear nuevas campañas según demanda
- Monitorear métricas financieras
- Actualizar información de empresas

### Actualizaciones del Sistema
- Cambios de contraseña periódicos
- Revisión de configuraciones de seguridad
- Backup de datos importantes
- Optimización de rendimiento

## 📞 Soporte y Contacto

Para cualquier problema técnico o consulta sobre el panel de administrador:

1. Verificar esta documentación primero
2. Revisar logs de error en la consola
3. Contactar al equipo de desarrollo
4. Documentar cualquier bug encontrado

---

**Nota:** Este panel de administrador es la herramienta central para gestionar toda la plataforma ZYRO. Su uso correcto es fundamental para el funcionamiento óptimo de la aplicación y la satisfacción de usuarios e influencers.