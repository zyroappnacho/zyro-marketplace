# 🧪 GUÍA COMPLETA DE TESTING - ZYRO MARKETPLACE

## 📋 ESTADO ACTUAL
- ✅ Dependencias instaladas y funcionando
- ✅ react-native-linear-gradient removido (usando expo-linear-gradient)
- ✅ crypto-js instalado para servicios de seguridad
- ✅ Configurado para Expo Go (no development build)
- ✅ Servidor funcionando en puerto 8083
- ⚠️ 15 vulnerabilidades menores (principalmente en Firebase)

## 🚀 COMANDOS RÁPIDOS

### Iniciar App en Diferentes Plataformas
```bash
# iOS Simulator
npx expo start --ios --clear

# Android Emulator  
npx expo start --android --clear

# Web Browser
npx expo start --web --clear

# Servidor con QR (para dispositivos físicos)
npx expo start --clear
```

### Script Automatizado
```bash
# Usar el script interactivo
./test-complete-app.sh
```

## 📱 TESTING EN iOS SIMULATOR

### Paso 1: Iniciar Simulator
```bash
npx expo start --ios --clear
```

### Paso 2: Funcionalidades a Probar

#### 🔐 **AUTENTICACIÓN**
- [ ] Registro de nuevo usuario (influencer/empresa)
- [ ] Login con credenciales existentes
- [ ] Logout y limpieza de sesión
- [ ] Recuperación de contraseña
- [ ] Validación de formularios

#### 👤 **PERFILES DE USUARIO**

**Influencer:**
- [ ] Completar perfil (bio, categorías, ubicación)
- [ ] Subir foto de perfil
- [ ] Configurar preferencias
- [ ] Ver estadísticas personales

**Empresa:**
- [ ] Completar perfil empresarial
- [ ] Configurar métodos de pago
- [ ] Crear colaboraciones
- [ ] Dashboard de métricas

#### 🤝 **COLABORACIONES**
- [ ] Ver lista de colaboraciones disponibles
- [ ] Filtrar por categoría y ubicación
- [ ] Aplicar a colaboraciones (influencers)
- [ ] Aprobar/rechazar aplicaciones (empresas)
- [ ] Chat entre partes
- [ ] Marcar colaboración como completada

#### 🗺️ **MAPA INTERACTIVO**
- [ ] Ver colaboraciones en mapa
- [ ] Filtros geográficos
- [ ] Clustering de marcadores
- [ ] Navegación entre mapa y lista

#### 💬 **MENSAJERÍA**
- [ ] Enviar mensajes
- [ ] Recibir notificaciones
- [ ] Historial de conversaciones
- [ ] Estados de lectura

#### 💳 **PAGOS (Solo Empresas)**
- [ ] Configurar Stripe
- [ ] Procesar pagos
- [ ] Ver historial de transacciones
- [ ] Gestionar suscripciones

#### ⚙️ **CONFIGURACIÓN**
- [ ] Cambiar configuraciones de cuenta
- [ ] Notificaciones push
- [ ] Privacidad y términos
- [ ] Cerrar sesión

## 🌐 TESTING EN WEB

### Iniciar Web
```bash
npx expo start --web --clear
```

### Funcionalidades Web Específicas
- [ ] Responsive design en diferentes tamaños
- [ ] Navegación con teclado
- [ ] Compatibilidad con navegadores
- [ ] Performance en web

## 📊 MÉTRICAS DE TESTING

### Performance
- [ ] Tiempo de carga inicial < 3s
- [ ] Navegación fluida entre pantallas
- [ ] Animaciones suaves (60fps)
- [ ] Uso eficiente de memoria

### UX/UI
- [ ] Tema oscuro consistente
- [ ] Colores dorados elegantes
- [ ] Tipografía legible
- [ ] Espaciado adecuado
- [ ] Feedback visual en interacciones

### Funcionalidad
- [ ] Todas las pantallas cargan correctamente
- [ ] Formularios validan datos
- [ ] Estados de carga visibles
- [ ] Manejo de errores apropiado
- [ ] Datos persisten correctamente

## 🐛 DEBUGGING

### Herramientas Disponibles
```bash
# Abrir debugger
npx expo start --clear
# Luego presionar 'j' para abrir debugger

# Ver logs en tiempo real
npx expo start --clear
# Los logs aparecen en la terminal
```

### Problemas Comunes y Soluciones

#### Error: "Unable to resolve module"
```bash
# Limpiar cache
npx expo start --clear
rm -rf node_modules
npm install --legacy-peer-deps
```

#### Error: "Development build not found"
```bash
# Asegurar que expo-dev-client no esté instalado
npm uninstall expo-dev-client
npx expo start --clear
```

#### Error de red/API
- Verificar que el servidor backend esté corriendo
- Comprobar URLs en .env.development
- Verificar conectividad de red

## 📋 CHECKLIST DE TESTING COMPLETO

### Pre-Testing
- [ ] Dependencias instaladas
- [ ] Cache limpio
- [ ] Configuración correcta
- [ ] Simulador/emulador funcionando

### Testing Básico
- [ ] App inicia sin crashes
- [ ] Navegación funciona
- [ ] Autenticación funciona
- [ ] Datos se cargan correctamente

### Testing Avanzado
- [ ] Todas las funcionalidades principales
- [ ] Casos edge (sin internet, datos vacíos)
- [ ] Performance bajo carga
- [ ] Compatibilidad multiplataforma

### Post-Testing
- [ ] Documentar bugs encontrados
- [ ] Verificar fixes aplicados
- [ ] Preparar para build de producción

## 🚨 ISSUES CONOCIDOS

### Vulnerabilidades (No críticas)
- Firebase dependencies con vulnerabilidades menores
- webpack-dev-server con issues de seguridad (solo desarrollo)
- Estas no afectan la funcionalidad de la app

### Workarounds Aplicados
- Usando expo-linear-gradient en lugar de react-native-linear-gradient
- @expo/webpack-config downgradeado para compatibilidad
- expo-dev-client removido para usar Expo Go

## 📞 SOPORTE

### Si encuentras problemas:
1. Revisar logs en terminal
2. Limpiar cache: `npx expo start --clear`
3. Reinstalar dependencias: `npm install --legacy-peer-deps`
4. Verificar configuración en .env.development

### Comandos de Emergencia
```bash
# Reset completo
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npx expo start --clear

# Verificar estado
npx expo doctor
npm audit
```

---

## ✅ RESULTADO ESPERADO

Después de completar este testing, deberías poder:
- ✅ Navegar por todas las pantallas sin errores
- ✅ Probar todas las funcionalidades principales
- ✅ Confirmar que la app está lista para build de producción
- ✅ Identificar cualquier bug que necesite corrección

**¡Tu app Zyro Marketplace está lista para conquistar las stores! 🚀**