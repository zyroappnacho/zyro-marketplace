# Assets de Zyro Marketplace

Esta carpeta contiene todos los recursos estáticos necesarios para la aplicación.

## Estructura de Carpetas

```
assets/
├── fonts/           # Fuentes personalizadas (Cinzel, Inter)
├── images/          # Imágenes de la aplicación
├── icons/           # Iconos de la aplicación
├── sounds/          # Sonidos de notificaciones
└── splash/          # Pantallas de splash
```

## Assets Requeridos

### Iconos de Aplicación
- `icon.png` (1024x1024) - Icono principal de la app
- `adaptive-icon-foreground.png` (432x432) - Icono adaptativo Android (foreground)
- `adaptive-icon-background.png` (432x432) - Icono adaptativo Android (background)
- `favicon.png` (32x32) - Favicon para web

### Splash Screen
- `splash.png` (1284x2778) - Pantalla de splash principal

### Fuentes
- `fonts/Cinzel-SemiBold.ttf` - Para el logo ZYRO
- `fonts/Inter-Regular.ttf` - Texto regular
- `fonts/Inter-Medium.ttf` - Texto medium
- `fonts/Inter-SemiBold.ttf` - Texto semibold
- `fonts/Inter-Bold.ttf` - Texto bold

### Sonidos de Notificación
- `notification-sound.wav` - Sonido de notificación general
- `collaboration-request.wav` - Sonido para solicitudes de colaboración
- `success.wav` - Sonido de éxito
- `alert.wav` - Sonido de alerta urgente

### Imágenes Placeholder
- `placeholder-profile.png` - Imagen de perfil por defecto
- `placeholder-business.png` - Imagen de negocio por defecto
- `no-image.png` - Imagen cuando no hay foto disponible

## Generación de Assets

Para generar los assets necesarios:

1. **Iconos**: Usa el archivo `icon-placeholder.svg` como base
2. **Fuentes**: Descarga desde Google Fonts
3. **Sonidos**: Usa archivos .wav de alta calidad
4. **Imágenes**: Optimiza para diferentes densidades de pantalla

## Optimización

- Todas las imágenes deben estar optimizadas para móvil
- Usa formatos WebP cuando sea posible
- Mantén los archivos de sonido pequeños (< 100KB)
- Los iconos deben seguir las guías de Material Design y iOS

## Colores de Marca

- Dorado Elegante: #C9A961
- Dorado Oscuro: #A68B47
- Dorado Brillante: #D4AF37
- Negro: #000000
- Gris Oscuro: #111111