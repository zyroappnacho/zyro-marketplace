# 🚀 Instrucciones Completas - Zyro Marketplace

## 📋 Pasos para Iniciar la App (Orden Correcto)

### 1️⃣ PRIMER PASO: Iniciar el Servidor Expo
1. **Abre una terminal** (cmd o PowerShell)
2. **Navega a la carpeta ZyroMarketplace:**
   ```cmd
   cd C:\Users\34682\OneDrive\Escritorio\VERSIONFINALAPPINFLUENCERS\ZyroMarketplace
   ```
3. **Ejecuta el servidor:**
   ```cmd
   start-expo-server.bat
   ```
   O manualmente:
   ```cmd
   npx expo start --web --port 19007
   ```

### 2️⃣ SEGUNDO PASO: Esperar a que el Servidor Esté Listo
**Busca este mensaje en la terminal:**
```
Web is waiting on http://localhost:19007
```
O:
```
Web Bundled 3311ms index.ts (1010 modules)
```

### 3️⃣ TERCER PASO: Abrir la App
1. **Abre el archivo:** `chrome-launcher.html` (doble clic)
2. **Haz clic en:** "🚀 Iniciar Zyro Marketplace"
3. **Se abrirá Chrome** con tu app React Native Web

## 🎯 Usuarios de Prueba

### 👑 Administrador (Panel Completo)
- **Usuario:** `admin_zyrovip`
- **Contraseña:** `xarrec-2paqra-guftoN`
- **Acceso:** Panel de administración completo

### 📱 Influencer (App Móvil)
- **Usuario:** `pruebainflu`
- **Contraseña:** `12345`
- **Acceso:** App completa con 4 pestañas (Inicio, Mapa, Historial, Perfil)

### 🏢 Empresa (Dashboard)
- **Registro:** Haz clic en "SOY EMPRESA" para crear automáticamente
- **Usuario:** `empresa_auto`
- **Contraseña:** `empresa123`
- **Acceso:** Dashboard limitado para empresas

## 🎨 Funcionalidades Implementadas

### ✅ Como Influencer:
- **4 Pestañas:** Inicio, Mapa, Historial, Perfil
- **Colaboraciones:** Ver y solicitar colaboraciones
- **Filtros:** Por ciudad y categoría
- **Perfil:** Gestión de datos personales
- **Historial:** Próximos, pasados, cancelados

### ✅ Como Administrador:
- **Dashboard:** Estadísticas completas
- **Gestión:** Usuarios, campañas, ingresos
- **Configuración:** Panel de administración

### ✅ Como Empresa:
- **Dashboard:** Solicitudes recibidas
- **Colaboraciones:** Gestión de colaboraciones activas
- **Estadísticas:** Alcance y métricas

## 🔧 Solución de Problemas

### ❌ "Página en Blanco"
**Causa:** El servidor Expo no está corriendo
**Solución:** Sigue el PRIMER PASO arriba

### ❌ "Puerto 19007 ocupado"
**Solución:**
```cmd
npx expo start --web --port 19008
```
Luego cambia la URL en chrome-launcher.html a `http://localhost:19008`

### ❌ "npm no se reconoce"
**Solución:** Instala Node.js desde https://nodejs.org/

### ❌ Errores de dependencias
**Solución:**
```cmd
npm install --legacy-peer-deps
```

## 🎉 Experiencia Móvil en Chrome

Para simular la experiencia móvil:

1. **Abre Chrome DevTools** (F12)
2. **Haz clic en el icono móvil** (📱) en la barra superior
3. **Selecciona un dispositivo:** iPhone 12 Pro, Pixel 5, etc.
4. **Refresca la página** (F5)

Ahora verás la app como si fuera en un móvil con:
- ✅ Navegación por pestañas en la parte inferior
- ✅ Diseño responsive
- ✅ Gestos táctiles simulados
- ✅ Tamaño de pantalla móvil

## 📱 Funcionalidades Móviles

### Navegación por Pestañas:
- **🏠 Inicio:** Lista de colaboraciones disponibles
- **🗺️ Mapa:** Mapa de España con ubicaciones
- **📅 Historial:** Colaboraciones próximas/pasadas
- **👤 Perfil:** Datos personales y configuración

### Interacciones:
- **Scroll vertical** en las listas
- **Tap** en las tarjetas para ver detalles
- **Swipe** en galerías de imágenes
- **Pull to refresh** (simulado)

## 🎯 Orden de Prueba Recomendado

1. **Inicia como Influencer** (`pruebainflu` / `12345`)
2. **Explora las 4 pestañas** para ver la experiencia móvil
3. **Solicita una colaboración** desde la pestaña Inicio
4. **Cierra sesión** y entra como Admin (`admin_zyrovip`)
5. **Revisa el panel de administración**
6. **Prueba el registro de empresa** ("SOY EMPRESA")

## 🚨 Importante

- **NO CIERRES** la terminal con el servidor Expo mientras uses la app
- **ESPERA** a que aparezca "Web is waiting" antes de abrir Chrome
- **USA** las credenciales exactas (son case-sensitive)
- **REFRESCA** la página si algo no carga correctamente

¡Disfruta explorando tu Zyro Marketplace! 🎉