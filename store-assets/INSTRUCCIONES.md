
📋 INSTRUCCIONES PARA GENERAR ASSETS

1. ICONOS PRINCIPALES (REQUERIDOS):
   
   iOS App Store:
   - App Icon: 1024x1024 PNG (sin transparencia)
   - Ubicación: ./store-assets/ios/app-icon-1024x1024.png
   
   Google Play Store:
   - App Icon: 512x512 PNG
   - Ubicación: ./store-assets/android/app-icon-512x512.png

2. SCREENSHOTS (REQUERIDOS):

   iOS Screenshots (mínimo 3, máximo 10 por tamaño):
   - iPhone 6.7": 1290x2796 (iPhone 14 Pro Max)
   - iPhone 6.1": 1179x2556 (iPhone 14 Pro)
   - iPhone 5.5": 1242x2208 (iPhone 8 Plus)
   
   Android Screenshots:
   - Phone: 1080x1920 mínimo
   - 7" Tablet: 1024x1600 mínimo
   - 10" Tablet: 1200x1920 mínimo

3. ASSETS ADICIONALES:

   Google Play Store:
   - Feature Graphic: 1024x500 PNG
   - Promo Graphic: 180x120 PNG (opcional)

4. HERRAMIENTAS RECOMENDADAS:

   Online:
   - https://appicon.co/ (genera todos los tamaños)
   - https://makeappicon.com/
   - https://canva.com (para screenshots)
   
   Local:
   - Figma/Sketch para diseño
   - Simulator/Emulator para screenshots

5. PASOS SIGUIENTES:

   a) Generar iconos PNG desde SVG:
      - Usar herramienta online o Figma
      - Exportar en alta calidad
      - Verificar que no tengan transparencia (iOS)
   
   b) Tomar screenshots:
      - Usar simuladores iOS/Android
      - Capturar pantallas principales de la app
      - Mostrar funcionalidades clave
   
   c) Ejecutar validación:
      node validate-assets.js

📱 PANTALLAS RECOMENDADAS PARA SCREENSHOTS:
1. Pantalla de login/bienvenida
2. Dashboard principal (influencer/empresa)
3. Lista de colaboraciones
4. Mapa interactivo
5. Perfil de usuario
6. Chat/mensajería
7. Configuración de pagos (empresas)

🎯 TIPS PARA SCREENSHOTS:
- Usar datos de ejemplo atractivos
- Mostrar la interfaz en español
- Incluir elementos visuales llamativos
- Evitar información personal real
- Usar el tema oscuro (marca ZYRO)
