export default {
  // App Store Connect Configuration
  ios: {
    appStoreConnect: {
      appName: "Zyro Marketplace",
      bundleId: "com.zyromarketplace.app",
      sku: "zyro-marketplace-ios",
      primaryLanguage: "es-ES",
      
      // App Information
      appInfo: {
        name: "Zyro Marketplace",
        subtitle: "Colaboraciones Premium",
        description: `Zyro es la plataforma premium que conecta influencers cualificados con empresas exclusivas para colaboraciones de alta calidad.

🌟 PARA INFLUENCERS:
• Accede a colaboraciones exclusivas con marcas premium
• Recibe productos y servicios de alta calidad
• Crea contenido auténtico y profesional
• Conecta con empresas verificadas
• Gestiona tus colaboraciones desde una app elegante

🏢 PARA EMPRESAS:
• Conecta con influencers verificados y de calidad
• Gestiona tus campañas desde un panel profesional
• Accede a métricas detalladas y analytics
• Suscripción fija sin comisiones por colaboración
• Soporte dedicado y personalizado

✨ CARACTERÍSTICAS PREMIUM:
• Diseño elegante con estética dorada
• Navegación intuitiva y fluida
• Sistema de aprobación manual para calidad
• Chat integrado entre todas las partes
• Mapa interactivo de colaboraciones
• Historial completo de actividades

🔒 SEGURIDAD Y PRIVACIDAD:
• Todos los usuarios son verificados manualmente
• Cumplimiento total con GDPR
• Datos encriptados y seguros
• Transacciones protegidas

Zyro no es solo una app, es tu puerta de entrada a colaboraciones premium y auténticas. Únete a la comunidad más exclusiva de influencers y empresas.`,
        
        keywords: "influencer,colaboraciones,marketing,empresas,premium,contenido,redes sociales,instagram,tiktok,marcas",
        
        categories: {
          primary: "BUSINESS",
          secondary: "SOCIAL_NETWORKING"
        },
        
        contentRating: "4+",
        
        // Pricing
        pricing: {
          type: "free",
          inAppPurchases: false
        }
      },
      
      // App Store Screenshots and Media
      media: {
        screenshots: {
          iphone67: [
            "./store-assets/ios/screenshots/iphone67/01-welcome.png",
            "./store-assets/ios/screenshots/iphone67/02-login.png",
            "./store-assets/ios/screenshots/iphone67/03-home.png",
            "./store-assets/ios/screenshots/iphone67/04-collaboration-detail.png",
            "./store-assets/ios/screenshots/iphone67/05-map.png",
            "./store-assets/ios/screenshots/iphone67/06-profile.png"
          ],
          iphone65: [
            "./store-assets/ios/screenshots/iphone65/01-welcome.png",
            "./store-assets/ios/screenshots/iphone65/02-login.png",
            "./store-assets/ios/screenshots/iphone65/03-home.png",
            "./store-assets/ios/screenshots/iphone65/04-collaboration-detail.png",
            "./store-assets/ios/screenshots/iphone65/05-map.png",
            "./store-assets/ios/screenshots/iphone65/06-profile.png"
          ]
        },
        
        appPreviewVideo: {
          iphone67: "./store-assets/ios/preview-video/zyro-preview-iphone67.mp4",
          iphone65: "./store-assets/ios/preview-video/zyro-preview-iphone65.mp4"
        },
        
        appIcon: "./store-assets/ios/app-icon/app-icon-1024x1024.png"
      },
      
      // Version Information
      versionInfo: {
        version: "1.0.0",
        buildNumber: "1",
        releaseNotes: `🎉 ¡Bienvenido a Zyro Marketplace!

Esta es la primera versión de nuestra plataforma premium para colaboraciones entre influencers y empresas.

✨ NUEVAS CARACTERÍSTICAS:
• Sistema de registro y aprobación manual
• Dashboard completo para empresas
• Panel de administración avanzado
• Navegación por pestañas intuitiva
• Mapa interactivo de colaboraciones
• Chat integrado entre usuarios
• Diseño premium con estética dorada
• Filtros avanzados por ciudad y categoría

🔒 SEGURIDAD:
• Verificación manual de todos los usuarios
• Cumplimiento GDPR completo
• Encriptación de datos sensibles

📱 EXPERIENCIA MÓVIL:
• Optimizado para iPhone
• Navegación fluida y elegante
• Notificaciones push inteligentes

¡Únete a la revolución de las colaboraciones premium!`
      },
      
      // Review Information
      reviewInfo: {
        firstName: "Equipo",
        lastName: "Zyro",
        phoneNumber: "+34-900-123-456",
        emailAddress: "review@zyromarketplace.com",
        demoAccount: {
          username: "demo_influencer",
          password: "Demo123!",
          notes: "Cuenta de demostración para revisar todas las funcionalidades de influencer. También pueden usar 'demo_empresa' / 'Demo123!' para el rol de empresa."
        },
        notes: `Zyro Marketplace es una plataforma premium que conecta influencers verificados con empresas exclusivas.

CÓMO PROBAR LA APP:
1. Usar cuenta demo: demo_influencer / Demo123!
2. O registrarse como nuevo usuario (requiere aprobación manual)
3. Explorar colaboraciones disponibles
4. Probar filtros por ciudad y categoría
5. Ver detalles de colaboraciones
6. Acceder al mapa interactivo
7. Revisar perfil y configuraciones

CARACTERÍSTICAS ÚNICAS:
• Todos los usuarios son verificados manualmente por el administrador
• Las empresas pagan suscripción fija (no comisiones)
• Los influencers reciben productos/servicios (no dinero)
• Diseño premium con colores dorado y negro
• Control total del administrador sobre campañas

La app cumple con todas las directrices de App Store y no contiene contenido objetable.`
      }
    }
  },
  
  // Google Play Store Configuration
  android: {
    googlePlay: {
      packageName: "com.zyromarketplace.app",
      
      // App Information
      appInfo: {
        title: "Zyro Marketplace",
        shortDescription: "Plataforma premium para colaboraciones entre influencers y empresas exclusivas",
        fullDescription: `Zyro es la plataforma premium que conecta influencers cualificados con empresas exclusivas para colaboraciones de alta calidad.

🌟 PARA INFLUENCERS:
• Accede a colaboraciones exclusivas con marcas premium
• Recibe productos y servicios de alta calidad
• Crea contenido auténtico y profesional
• Conecta con empresas verificadas
• Gestiona tus colaboraciones desde una app elegante

🏢 PARA EMPRESAS:
• Conecta con influencers verificados y de calidad
• Gestiona tus campañas desde un panel profesional
• Accede a métricas detalladas y analytics
• Suscripción fija sin comisiones por colaboración
• Soporte dedicado y personalizado

✨ CARACTERÍSTICAS PREMIUM:
• Diseño elegante con estética dorada
• Navegación intuitiva y fluida
• Sistema de aprobación manual para calidad
• Chat integrado entre todas las partes
• Mapa interactivo de colaboraciones
• Historial completo de actividades

🔒 SEGURIDAD Y PRIVACIDAD:
• Todos los usuarios son verificados manualmente
• Cumplimiento total con GDPR
• Datos encriptados y seguros
• Transacciones protegidas

🎯 CÓMO FUNCIONA:
1. Regístrate como influencer o empresa
2. Espera la aprobación manual (24-48h)
3. Explora colaboraciones disponibles
4. Solicita las que te interesen
5. Conecta y colabora con marcas premium

Zyro no es solo una app, es tu puerta de entrada a colaboraciones premium y auténticas. Únete a la comunidad más exclusiva de influencers y empresas.

📍 Disponible inicialmente en Madrid, Barcelona, Valencia y Sevilla.
🏷️ Categorías: Gastronomía, Moda, Belleza, Tecnología, Viajes y más.`,
        
        category: "BUSINESS",
        contentRating: "PEGI_3",
        
        tags: [
          "influencer",
          "colaboraciones",
          "marketing",
          "empresas",
          "premium",
          "contenido",
          "redes sociales",
          "instagram",
          "tiktok",
          "marcas",
          "negocios",
          "networking"
        ]
      },
      
      // Store Listing
      media: {
        screenshots: {
          phone: [
            "./store-assets/android/screenshots/phone/01-welcome.png",
            "./store-assets/android/screenshots/phone/02-login.png",
            "./store-assets/android/screenshots/phone/03-home.png",
            "./store-assets/android/screenshots/phone/04-collaboration-detail.png",
            "./store-assets/android/screenshots/phone/05-map.png",
            "./store-assets/android/screenshots/phone/06-profile.png",
            "./store-assets/android/screenshots/phone/07-company-dashboard.png",
            "./store-assets/android/screenshots/phone/08-admin-panel.png"
          ],
          tablet: [
            "./store-assets/android/screenshots/tablet/01-welcome.png",
            "./store-assets/android/screenshots/tablet/02-home.png",
            "./store-assets/android/screenshots/tablet/03-collaboration-detail.png"
          ]
        },
        
        featureGraphic: "./store-assets/android/feature-graphic/feature-graphic-1024x500.png",
        appIcon: "./store-assets/android/app-icon/app-icon-512x512.png",
        
        promoVideo: "https://youtu.be/your-promo-video-id"
      },
      
      // Release Information
      releaseInfo: {
        versionName: "1.0.0",
        versionCode: 1,
        releaseNotes: {
          "es-ES": `🎉 ¡Bienvenido a Zyro Marketplace!

Esta es la primera versión de nuestra plataforma premium para colaboraciones entre influencers y empresas.

✨ NUEVAS CARACTERÍSTICAS:
• Sistema de registro y aprobación manual
• Dashboard completo para empresas
• Panel de administración avanzado
• Navegación por pestañas intuitiva
• Mapa interactivo de colaboraciones
• Chat integrado entre usuarios
• Diseño premium con estética dorada
• Filtros avanzados por ciudad y categoría

🔒 SEGURIDAD:
• Verificación manual de todos los usuarios
• Cumplimiento GDPR completo
• Encriptación de datos sensibles

📱 EXPERIENCIA MÓVIL:
• Optimizado para Android
• Navegación fluida y elegante
• Notificaciones push inteligentes

¡Únete a la revolución de las colaboraciones premium!`,
          
          "en-US": `🎉 Welcome to Zyro Marketplace!

This is the first version of our premium platform for collaborations between influencers and companies.

✨ NEW FEATURES:
• Manual registration and approval system
• Complete dashboard for companies
• Advanced administration panel
• Intuitive tab navigation
• Interactive collaboration map
• Integrated chat between users
• Premium design with golden aesthetics
• Advanced filters by city and category

🔒 SECURITY:
• Manual verification of all users
• Full GDPR compliance
• Sensitive data encryption

📱 MOBILE EXPERIENCE:
• Optimized for Android
• Smooth and elegant navigation
• Smart push notifications

Join the premium collaboration revolution!`
        }
      },
      
      // Pricing and Distribution
      pricing: {
        type: "free",
        countries: ["ES", "FR", "IT", "PT", "DE", "UK", "US", "MX", "AR", "CO", "PE", "CL"]
      }
    }
  }
};