import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "VoyageSur",
  slug: "voyagesur",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/voyage-sur-logo.png",
  scheme: "myapp",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    ...config.ios,
    supportsTablet: true,
    usesAppleSignIn: true,
    bundleIdentifier: "com.anisse3000.voyagesur",
    infoPlist: {
      ...config.ios?.infoPlist,
      ITSAppUsesNonExemptEncryption: false,
      NSFaceIDUsageDescription: "Voyage Sûr utilise Face ID pour vous permettre de vous connecter rapidement et de manière sécurisée à votre compte.",
      SKAdNetworkItems: [
        {
          SKAdNetworkIdentifier: "v9wttpbfk9.skadnetwork"
        },
        {
          SKAdNetworkIdentifier: "n38lu8286q.skadnetwork"
        }
      ],
      googleServicesFile: process.env.EXPO_PUBLIC_GOOGLE_SERVICES_PLIST
    },
    entitlements: {
      "com.apple.developer.networking.wifi-info": true,
      "com.apple.developer.applesignin": ["Default"]
    }
  },
  android: {
    ...config.android,
    googleServicesFile: process.env.EXPO_PUBLIC_GOOGLE_SERVICES_JSON,
    adaptiveIcon: {
      foregroundImage: "./assets/images/voyage-sur-logo.png",
      backgroundColor: "#ffffff"
    },
    package: "com.anisse3000.voyagesur",
    permissions: [
      "android.permission.CAMERA",
      "android.permission.RECORD_AUDIO",
      "android.permission.USE_BIOMETRIC",
      "android.permission.USE_FINGERPRINT",
      "android.permission.INTERNET",
      "com.google.android.gms.permission.AD_ID"
    ]
  },
  plugins: [
    "expo-router",
    "expo-apple-authentication",
    [
      "@react-native-google-signin/google-signin",
      {
        "iosUrlScheme": 'com.googleusercontent.apps.632781822153-78i2onj98gl7dqlnn7spa0vn9o096n6u',
        "iosClientId": process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        "webClientId": process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
      }
    ],
    [
      "expo-splash-screen",
      {
        "enableFullScreenImage_legacy": true,
        "resizeMode": "contain",
        "ios": {
          "backgroundColor": "#ffffff",
          "image": "./assets/images/splash_icon.png"
        },
        "android": {
          "backgroundColor": "#ffffff",
          "image": "./assets/images/voyage-sur-logo.png",
          "imageWidth": 195
        }
      }
    ],
    [
      "expo-local-authentication",
      {
        "faceIDPermission": "Autoriser $(PRODUCT_NAME) à utiliser Face ID."
      }
    ],
    [
      "expo-notifications",
      {
        "icon": "./assets/images/voyage-sur-logo.png",
        "color": "#ffffff",
        "defaultChannel": "default",
        "sounds": [
          "./assets/sounds/notif.wav"
        ],
        "enableBackgroundRemoteNotifications": false
      }
    ],
    [
      "expo-secure-store",
      {
        "configureAndroidBackup": true,
        "faceIDPermission": "Autoriser $(PRODUCT_NAME) à utiliser Face ID."
      }
    ]
  ],
  experiments: {
    typedRoutes: true
  },
  extra: {
    router: {
      origin: false
    },
    eas: {
      projectId: "947c35ea-64ae-4074-8009-0630baeb6ed0"
    },
    EXPO_PUBLIC_REVENUECAT_API_KEY_IOS: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS || "",
    EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID || ""
  },
  owner: "anisse3000",
  runtimeVersion: "1.0.0",
  updates: {
    url: "https://u.expo.dev/05388435-4c2f-49e4-83a2-1ed0d62649b4"
  }
}); 