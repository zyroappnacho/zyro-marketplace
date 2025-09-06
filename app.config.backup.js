import 'dotenv/config';

export default {
  expo: {
    name: "Zyro Marketplace",
    slug: "zyro-marketplace",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "dark",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#000000"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.zyromarketplace.app",
      buildNumber: "1",
      infoPlist: {
        NSCameraUsageDescription: "Zyro necesita acceso a la cámara para que puedas tomar fotos de tus colaboraciones y crear contenido premium.",
        NSPhotoLibraryUsageDescription: "Zyro necesita acceso a tu galería para que puedas seleccionar y compartir fotos de tus colaboraciones.",
        NSLocationWhenInUseUsageDescription: "Zyro utiliza tu ubicación para mostrarte colaboraciones cercanas y relevantes en tu ciudad.",
        NSUserNotificationsUsageDescription: "Zyro envía notificaciones sobre nuevas colaboraciones, actualizaciones de solicitudes y mensajes importantes.",
        UIBackgroundModes: ["remote-notification"],
        CFBundleDisplayName: "Zyro",
        CFBundleName: "Zyro Marketplace",
        CFBundleShortVersionString: "1.0.0",
        CFBundleVersion: "1",
        LSRequiresIPhoneOS: true,
        UIRequiredDeviceCapabilities: ["armv7"],
        UISupportedInterfaceOrientations: ["UIInterfaceOrientationPortrait"],
        UIStatusBarStyle: "UIStatusBarStyleLightContent",
        UIViewControllerBasedStatusBarAppearance: false
      },
      config: {
        usesNonExemptEncryption: false
      },
      associatedDomains: ["applinks:zyromarketplace.com"],
      scheme: "zyro"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#000000"
      },
      package: "com.zyromarketplace.app",
      versionCode: 1,
      permissions: [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "RECEIVE_BOOT_COMPLETED",
        "VIBRATE",
        "INTERNET",
        "ACCESS_NETWORK_STATE",
        "WAKE_LOCK"
      ],
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY
        }
      },
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "https",
              host: "zyromarketplace.com"
            }
          ],
          category: ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    web: {
      favicon: "./assets/favicon.png",
      name: "Zyro Marketplace",
      shortName: "Zyro",
      description: "Marketplace premium para colaboraciones entre influencers y empresas",
      themeColor: "#C9A961",
      backgroundColor: "#000000"
    },
    plugins: [
      [
        "expo-build-properties",
        {
          android: {
            compileSdkVersion: 34,
            targetSdkVersion: 34,
            buildToolsVersion: "34.0.0",
            minSdkVersion: 21,
            proguardMinifyEnabled: true,
            enableProguardInReleaseBuilds: true,
            enableHermes: true
          },
          ios: {
            deploymentTarget: "15.1",
            useFrameworks: "static"
          }
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      eas: {
        projectId: "f317c76a-27e7-43e9-b5eb-df12fbea32cb"
      },
      apiUrl: process.env.API_URL,
      environment: process.env.NODE_ENV || "production"
    },
    owner: "nachodeborbon",
    privacy: "public",
    platforms: ["ios", "android"],
    githubUrl: "https://github.com/your-username/zyro-marketplace"
  }
};