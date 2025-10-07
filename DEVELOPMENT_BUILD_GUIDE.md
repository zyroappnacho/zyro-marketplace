# 📱 GUÍA DE INSTALACIÓN - BUILD DE DESARROLLO

## 🎯 OBJETIVO
Instalar el build de desarrollo en tu iPhone 16 Plus para probar la app con credenciales reales mientras Apple revisa la app de producción.

## 📋 REQUISITOS
- ✅ iPhone 16 Plus
- ✅ Cuenta Apple Developer verificada
- ✅ Build de desarrollo creado con EAS

## 🚀 PASOS DE INSTALACIÓN

### 1️⃣ CREAR BUILD DE DESARROLLO
```bash
# Ejecutar cuando Apple verifique tu cuenta
./create-development-build.sh
```

### 2️⃣ DESCARGAR E INSTALAR
1. Ve a https://expo.dev/accounts/nachodeborbon/projects/zyromarketplace/builds
2. Encuentra tu build de desarrollo más reciente
3. Descarga el archivo .ipa
4. Instala en tu iPhone usando:
   - **Opción A:** AltStore / Sideloadly
   - **Opción B:** Xcode (si tienes Mac)
   - **Opción C:** TestFlight (si configuras distribución interna)

### 3️⃣ PROBAR CREDENCIALES
Una vez instalada, prueba estos logins:

#### 👤 PERFIL INFLUENCER
- **Email:** colabos.nachodeborbon@gmail.com
- **Contraseña:** Nacho12345
- **Funciones:** Perfil completo, colaboraciones, métricas EMV

#### 🏢 PERFIL EMPRESA
- **Email:** empresa@zyro.com
- **Contraseña:** Empresa1234
- **Funciones:** Dashboard empresarial, campañas, suscripciones

#### ⚙️ PERFIL ADMINISTRADOR
- **Email:** admin_zyrovip
- **Contraseña:** xarrec-2paqra-guftoN5
- **Funciones:** Panel completo de administración

## 🔧 SOLUCIÓN DE PROBLEMAS

### Error: "No se puede instalar"
- Verifica que el dispositivo esté registrado en tu cuenta de desarrollador
- Asegúrate de que el certificado de desarrollo sea válido

### Error: "App no se abre"
- Confía en el certificado de desarrollador en Configuración > General > Gestión de dispositivos

### Credenciales no funcionan
- Las credenciales están preconfiguradas en el build
- Si no funcionan, verifica que el build incluya el StorageService actualizado

## 📞 SOPORTE
Si tienes problemas, verifica:
1. Que tu cuenta Apple Developer esté activa
2. Que el build se haya creado correctamente
3. Que el dispositivo esté registrado

---
*Generado automáticamente para el proceso de desarrollo*
