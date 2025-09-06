# 🌐 Instrucciones Paso a Paso para Chrome

## 🚀 Método 1: Script Automático (Recomendado)

### Windows:
1. **Abre una terminal** (cmd o PowerShell) en la carpeta `ZyroMarketplace`
2. **Ejecuta uno de estos comandos:**
   ```cmd
   start-server-and-chrome.bat
   ```
   O:
   ```powershell
   .\start-chrome.ps1
   ```
3. **Espera** a que aparezca el mensaje "Web is waiting on http://localhost:19006"
4. **Chrome se abrirá automáticamente** con la aplicación

## 🔧 Método 2: Manual (Si el automático no funciona)

### Paso 1: Abrir Terminal
1. Abre **cmd** o **PowerShell**
2. Navega a la carpeta: `cd ruta\a\ZyroMarketplace`

### Paso 2: Instalar Dependencias (Solo la primera vez)
```bash
npm install
```

### Paso 3: Iniciar Servidor
```bash
npx expo start --web
```

### Paso 4: Esperar a que esté listo
Espera a ver este mensaje:
```
Web is waiting on http://localhost:19006
```

### Paso 5: Abrir Chrome
1. Abre **Google Chrome**
2. Ve a: `http://localhost:19006`

## 👥 Usuarios de Prueba

Una vez que la aplicación esté cargada:

### 👑 Administrador
- **Usuario**: `admin_zyrovip`
- **Contraseña**: `xarrec-2paqra-guftoN`

### 📱 Influencer
- **Usuario**: `pruebainflu`
- **Contraseña**: `12345`

### 🏢 Empresa
- Haz clic en **"SOY EMPRESA"** para crear automáticamente
- **Usuario**: `empresa_auto`
- **Contraseña**: `empresa123`

## 🔍 Solución de Problemas

### ❌ Página en Blanco
**Causa**: El servidor no está corriendo
**Solución**: 
1. Verifica que el servidor esté iniciado (paso 3 arriba)
2. Espera a ver "Web is waiting on http://localhost:19006"
3. Refresca la página en Chrome (F5)

### ❌ Error "Cannot GET /"
**Causa**: El servidor está iniciando
**Solución**: 
1. Espera 1-2 minutos más
2. Refresca la página
3. Verifica la terminal por errores

### ❌ "npm no se reconoce"
**Causa**: Node.js no está instalado
**Solución**: 
1. Descarga Node.js desde: https://nodejs.org/
2. Instala y reinicia la terminal
3. Intenta de nuevo

### ❌ Puerto 19006 ocupado
**Causa**: Otra aplicación usa el puerto
**Solución**: 
1. Cierra otras aplicaciones Expo
2. Reinicia la terminal
3. Ejecuta: `npx expo start --web --port 19007`
4. Ve a: `http://localhost:19007`

### ❌ Chrome no se abre automáticamente
**Causa**: Ruta de Chrome no encontrada
**Solución**: 
1. Abre Chrome manualmente
2. Ve a: `http://localhost:19006`

## 📱 Navegación en la App

### 🏠 Pantalla de Bienvenida
- Botón **"SOY INFLUENCER"** → Registro de influencer
- Botón **"SOY EMPRESA"** → Registro automático de empresa
- Botón **"INICIAR SESIÓN"** → Login con credenciales

### 📱 App de Influencer (4 Pestañas)
1. **Inicio**: Colaboraciones disponibles con filtros
2. **Mapa**: Ubicaciones de negocios en España
3. **Historial**: PRÓXIMOS, PASADOS, CANCELADOS
4. **Perfil**: Configuración y gestión de cuenta

### 👑 Panel de Administrador
- **Dashboard**: Estadísticas generales
- **Usuarios**: Gestión de aprobaciones
- **Campañas**: Creación de colaboraciones
- **Configuración**: Ajustes del sistema

### 🏢 Dashboard de Empresa
- **Métricas**: Estadísticas de colaboraciones
- **Influencers**: Solicitudes recibidas
- **Campañas**: Estado de colaboraciones

## 🎯 Funcionalidades para Probar

### Como Influencer:
1. **Filtrar por ciudad**: Selector "ZYRO [CIUDAD]"
2. **Filtrar por categoría**: Desplegable de categorías
3. **Ver detalles**: Clic en "Ver Detalles" de cualquier colaboración
4. **Validación de seguidores**: Iconos ✅/❌ según requisitos
5. **Gestión de perfil**: Pestaña perfil → configuraciones

### Como Administrador:
1. **Ver estadísticas**: Dashboard principal
2. **Gestionar usuarios**: Aprobar/rechazar solicitudes
3. **Crear campañas**: Formulario completo de colaboraciones

### Como Empresa:
1. **Ver métricas**: Dashboard con estadísticas
2. **Revisar solicitudes**: Influencers que han aplicado

## 🎨 Estética Premium

La aplicación incluye:
- **Colores dorados**: #C9A961, #A68B47, #D4AF37
- **Fondos oscuros**: #000000, #111111
- **Logo Zyro**: Fuente Cinzel con espaciado específico
- **Efectos premium**: Gradientes, sombras doradas, transiciones suaves

## 📊 Datos de Prueba

- **6 campañas** de ejemplo en Madrid, Barcelona y Sevilla
- **8 ciudades** habilitadas
- **8 categorías** de negocios
- **Estados variados** de colaboraciones

## 🎉 ¡Listo!

Una vez que sigas estos pasos, tendrás la preview completa de Zyro Marketplace funcionando en Chrome con todas las funcionalidades implementadas.

**¡Disfruta explorando la aplicación!** ✨