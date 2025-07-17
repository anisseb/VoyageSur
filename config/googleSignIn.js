import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';

// Configuration Google Sign-In avec gestion d'erreurs
export const configureGoogleSignIn = () => {
  try {
    GoogleSignin.configure({
      // iOS Client ID from GoogleService-Info.plist
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      
      // Android Client ID from google-services.json
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      
      // URL Scheme for iOS
      iosUrlScheme: 'com.googleusercontent.apps.632781822153-78i2onj98gl7dqlnn7spa0vn9o096n6u',
      
      // Scopes
      scopes: ['profile', 'email'],
      
      // Offline access
      offlineAccess: true,
      
      // Force code for refresh token
      forceCodeForRefreshToken: true,
    });
    
    console.log('Google Sign-In configuré avec succès');
  } catch (error) {
    console.error('Erreur lors de la configuration Google Sign-In:', error);
  }
};

// Fonction pour vérifier si Google Sign-In est configuré
export const isGoogleSignInConfigured = async () => {
  try {
    if (Platform.OS === 'android') {
      await GoogleSignin.hasPlayServices();
    }
    return true;
  } catch (error) {
    console.error('Google Play Services not available:', error);
    return false;
  }
};

// Fonction pour obtenir les informations de l'utilisateur connecté
export const getCurrentUser = async () => {
  try {
    const isSignedIn = await GoogleSignin.isSignedIn();
    if (isSignedIn) {
      return await GoogleSignin.getCurrentUser();
    }
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Fonction pour se déconnecter
export const signOut = async () => {
  try {
    await GoogleSignin.signOut();
    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    return false;
  }
};

// Fonction pour signer avec Google avec gestion d'erreurs robuste
export const signInWithGoogle = async () => {
  try {
    // Vérifier la configuration
    const isConfigured = await isGoogleSignInConfigured();
    if (!isConfigured) {
      throw new Error('Google Sign-In not configured properly');
    }

    // Vérifier si l'utilisateur est déjà connecté
    const isSignedIn = await GoogleSignin.isSignedIn();
    if (isSignedIn) {
      return await GoogleSignin.getCurrentUser();
    }

    // Effectuer la connexion
    const userInfo = await GoogleSignin.signIn();
    return userInfo;
  } catch (error) {
    console.error('Erreur lors de la connexion Google:', error);
    
    // Gestion spécifique des erreurs
    if (error.code === 'SIGN_IN_CANCELLED') {
      throw new Error('Connexion annulée par l\'utilisateur');
    } else if (error.code === 'SIGN_IN_REQUIRED') {
      throw new Error('Connexion requise');
    } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
      throw new Error('Google Play Services non disponible');
    } else {
      throw new Error('Erreur lors de la connexion Google: ' + error.message);
    }
  }
}; 