export default {
  expo: {
    name: "ZYRO",
    slug: "zyro-marketplace",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "dark",
    splash: {
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
        NSLocationWhenInUseUsageDescription: "Esta app usa tu ubicación para mostrarte colaboraciones cercanas.",
        NSCameraUsageDescription: "Esta app necesita acceso a la cámara para subir fotos de perfil.",
        NSPhotoLibraryUsageDescription: "Esta app necesita acceso a tus fotos para subir imágenes de perfil."
      }
    },
    android: {
      package: "com.zyromarketplace.app",
      versionCode: 1,
      permissions: [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    web: {
      name: "ZYRO",
      shortName: "ZYRO",
      lang: "es",
      scope: "/",
      themeColor: "#C9A961",
      description: "Marketplace premium para conectar influencers con marcas exclusivas",
      dir: "auto",
      display: "standalone",
      orientation: "portrait",
      startUrl: "/",
      backgroundColor: "#000000",
      bundler: "metro"
    },
    plugins: [
      "expo-font",
      "expo-secure-store",
      [
        "expo-build-properties",
        {
          android: {
            compileSdkVersion: 34,
            targetSdkVersion: 34,
            buildToolsVersion: "34.0.0"
          },
          ios: {
            deploymentTarget: "15.1"
          }
        }
      ]
    ],
    extra: {
      eas: {
        projectId: "f317c76a-27e7-43e9-b5eb-df12fbea32cb"
      }
    },
    owner: "nachodeborbon",
    privacy: "public",
    platforms: ["ios", "android", "web"]
  }
};