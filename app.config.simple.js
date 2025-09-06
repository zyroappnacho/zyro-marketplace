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
      buildNumber: "1"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#000000"
      },
      package: "com.zyromarketplace.app",
      versionCode: 1
    },
    web: {
      favicon: "./assets/favicon.png",
      name: "Zyro Marketplace",
      shortName: "Zyro"
    },
    plugins: [
      [
        "expo-build-properties",
        {
          android: {
            compileSdkVersion: 34,
            targetSdkVersion: 34,
            minSdkVersion: 21
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
    platforms: ["ios", "android"]
  }
};