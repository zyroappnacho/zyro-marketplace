# 🔧 Solución: Página en Blanco en Chrome

## ❌ Problema
Cuando haces clic en el botón del `chrome-launcher.html`, Chrome abre `http://localhost:19006` pero la página se queda en blanco.

## 🎯 Causa
La página está en blanco porque **el servidor de Expo no está corriendo**. El archivo HTML solo abre la URL, pero necesitas iniciar el servidor primero.

## ✅ Solución Paso a Paso

### 🚀 Opción 1: Script Automático (Más Fácil)

1. **Abre una terminal** (cmd o PowerShell)
2. **Navega a la carpeta:**
   ```cmd
   cd C:\Users\34682\OneDrive\Escritorio\VERSIONFINALAPPINFLUENCERS\ZyroMarketplace
   ```
3. **Ejecuta el script:**
   ```cmd
   start-server-and-chrome.bat
   ```
4. **Espera** a que aparezca: "Web is waiting on http://localhost:19006"
5. **Chrome se abrirá automáticamente** con la app funcionando

### 🔧 Opción 2: Manual

1. **Abre cmd/PowerShell** en la carpeta ZyroMarketplace
2. **Instala dependencias** (solo la primera vez):
   ```cmd
   npm install
   ```
3. **Inicia el servidor:**
   ```cmd
   npx expo start --web
   ```
4. **Espera** hasta ver este mensaje:
   ```
   Web is waiting on http://localhost:19006
   ```
5. **Ahora sí**, abre Chrome y ve a: `http://localhost:19006`

## 📋 Orden Correcto de Pasos

### ❌ Incorrecto (lo que estás haciendo):
1. Abrir `chrome-launcher.html`
2. Hacer clic en "Iniciar Preview"
3. Chrome abre `http://localhost:19006` → **Página en blanco**

### ✅ Correcto:
1. **Primero**: Iniciar el servidor (`npx expo start --web`)
2. **Segundo**: Esperar a que esté listo
3. **Tercero**: Abrir Chrome en `http://localhost:19006`

## 🎯 Cómo Saber si el Servidor Está Listo

Busca estos mensajes en la terminal:
```
Web is waiting on http://localhost:19006
Metro waiting on exp://192.168.x.x:19000
```

## 🔍 Verificar que Funciona

1. **Terminal muestra**: "Web is waiting on http://localhost:19006"
2. **Chrome en** `http://localhost:19006` **muestra**: Pantalla de bienvenida de Zyro con botones "SOY INFLUENCER" y "SOY EMPRESA"

## 👥 Una Vez que Funcione

Usa estas credenciales para probar:

### 👑 Administrador
- Usuario: `admin_zyrovip`
- Contraseña: `xarrec-2paqra-guftoN`

### 📱 Influencer
- Usuario: `pruebainflu`
- Contraseña: `12345`

### 🏢 Empresa
- Haz clic en "SOY EMPRESA" para crear automáticamente

## 🚨 Problemas Comunes

### "npm no se reconoce"
**Solución**: Instala Node.js desde https://nodejs.org/

### "Puerto 19006 ocupado"
**Solución**: 
```cmd
npx expo start --web --port 19007
```
Luego ve a: `http://localhost:19007`

### Servidor se cierra solo
**Solución**: No cierres la terminal mientras uses la app

### Página sigue en blanco después de iniciar servidor
**Solución**: 
1. Espera 1-2 minutos más
2. Refresca la página (F5)
3. Verifica que no hay errores en la terminal

## 🎉 Resultado Final

Una vez que sigas estos pasos correctamente, verás:

1. **Pantalla de Bienvenida** con logo Zyro dorado
2. **Botones premium** "SOY INFLUENCER" y "SOY EMPRESA"
3. **Estética dorada** con fondos oscuros
4. **Navegación completa** por 4 pestañas (como influencer)
5. **Panel de administración** (como admin)
6. **Dashboard de empresa** (como empresa)

## 📞 Si Sigue Sin Funcionar

1. **Verifica Node.js**: `node --version`
2. **Verifica npm**: `npm --version`
3. **Reinstala dependencias**: 
   ```cmd
   rmdir /s node_modules
   npm install
   ```
4. **Intenta con otro puerto**:
   ```cmd
   npx expo start --web --port 19007
   ```

**¡El problema es simplemente que necesitas iniciar el servidor primero!** 🚀