import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signInWithCredential,
  OAuthProvider,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { showErrorAlert, showSuccessAlert } from '../utils/alerts';
import { Image } from 'expo-image';
import * as LocalAuthentication from 'expo-local-authentication';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import * as AppleAuthentication from 'expo-apple-authentication';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import ResetPassword from '../components/ResetPassword';

interface AuthScreenProps {
  navigation: any;
}

export default function AuthScreen({ navigation }: AuthScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [hasSavedCredentials, setHasSavedCredentials] = useState(false);
  const [savedUserName, setSavedUserName] = useState('');
  const [showFullForm, setShowFullForm] = useState(false);
  const [isAppleAuthAvailable, setIsAppleAuthAvailable] = useState(false);
  const [isGoogleAuthAvailable, setIsGoogleAuthAvailable] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showReconnectButton, setShowReconnectButton] = useState(false);
  const auth = getAuth();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const initializeAuth = async () => {
      await checkBiometricSupport();
      await checkSavedCredentials();
      await checkAppleAuthAvailability();
      await configureGoogleSignIn();
      
      // Vérifier s'il faut afficher le bouton de reconnexion
      const storedUserId = await SecureStore.getItemAsync('userId');
      if (storedUserId) {
        // Attendre 1 seconde puis vérifier si l'utilisateur est connecté
        setTimeout(async () => {
          const currentUser = auth.currentUser;
          if (!currentUser || currentUser.uid !== storedUserId) {
            console.log('AuthScreen: Utilisateur non connecté, affichage du bouton de reconnexion');
            setShowReconnectButton(true);
          } else {
            console.log('AuthScreen: Utilisateur déjà connecté:', currentUser.uid);
          }
        }, 1000);
      }
    };
    initializeAuth();
  }, []);

  const checkBiometricSupport = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setIsBiometricSupported(compatible && enrolled);
  };

  const checkSavedCredentials = async () => {
    try {
      const savedEmail = await SecureStore.getItemAsync('userEmail');
      const savedAuthMethod = await SecureStore.getItemAsync('authMethod');
      const hasCredentials = !!(savedEmail && savedAuthMethod);
      setHasSavedCredentials(hasCredentials);
      
      if (hasCredentials) {
        try {
          if (savedAuthMethod === 'email') {
            const savedPassword = await SecureStore.getItemAsync('userPassword');
            if (savedPassword) {
              // Ne pas faire d'appel Firebase ici, juste récupérer le nom depuis le stockage
              const savedDisplayName = await SecureStore.getItemAsync('userDisplayName');
              setSavedUserName(savedDisplayName || 'Utilisateur');
            }
          } else if (savedAuthMethod === 'apple') {
            const savedDisplayName = await SecureStore.getItemAsync('userDisplayName');
            setSavedUserName(savedDisplayName || 'Utilisateur Apple');
          } else if (savedAuthMethod === 'google') {
            const savedDisplayName = await SecureStore.getItemAsync('userDisplayName');
            setSavedUserName(savedDisplayName || 'Utilisateur Google');
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des informations utilisateur:', error);
          // Ne pas nettoyer automatiquement les identifiants en cas d'erreur
          // L'utilisateur pourra toujours essayer de se reconnecter manuellement
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des identifiants:', error);
    }
  };

  const checkAppleAuthAvailability = async () => {
    try {
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      console.log('Apple Authentication disponible:', isAvailable);
      setIsAppleAuthAvailable(isAvailable);
    } catch (error) {
      console.error('Erreur lors de la vérification d\'Apple Authentication:', error);
      setIsAppleAuthAvailable(false);
    }
  };

  const configureGoogleSignIn = async () => {
    try {
      GoogleSignin.configure({
        webClientId: '632781822153-9ce3810cf7d86d1127d518.apps.googleusercontent.com', // À remplacer par votre vrai webClientId
        iosClientId: '632781822153-9ce3810cf7d86d1127d518.apps.googleusercontent.com', // À remplacer par votre vrai iosClientId
        offlineAccess: true,
      });
      
      console.log('Google Sign In configuré');
      setIsGoogleAuthAvailable(true);
    } catch (error) {
      console.error('Erreur lors de la configuration Google Sign In:', error);
      setIsGoogleAuthAvailable(false);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authentification avec Face ID',
        fallbackLabel: 'Utiliser le mot de passe',
        disableDeviceFallback: false,
        cancelLabel: 'Annuler'
      });

      if (result.success) {
        const savedEmail = await SecureStore.getItemAsync('userEmail');
        const savedAuthMethod = await SecureStore.getItemAsync('authMethod');
        
        if (savedEmail && savedAuthMethod === 'email') {
          setIsLoading(true);
          try {
            const savedPassword = await SecureStore.getItemAsync('userPassword');
            if (savedPassword) {
              await signInWithEmailAndPassword(auth, savedEmail, savedPassword);
              // Navigation sera gérée automatiquement par AuthContext
            }
          } catch (error) {
            console.error('Erreur lors de la connexion:', error);
            showErrorAlert('Erreur', 'Échec de la connexion automatique');
          } finally {
            setIsLoading(false);
          }
        } else if (savedEmail && savedAuthMethod === 'apple') {
          setIsLoading(true);
          try {
            await handleAppleAuth();
          } catch (error) {
            console.error('Erreur lors de la reconnexion Apple:', error);
            showErrorAlert('Erreur', 'Échec de la reconnexion Apple');
          } finally {
            setIsLoading(false);
          }
        } else if (savedEmail && savedAuthMethod === 'google') {
          setIsLoading(true);
          try {
            await handleGoogleQuickAuth();
          } catch (error) {
            console.error('Erreur lors de la reconnexion Google:', error);
            showErrorAlert('Erreur', 'Échec de la reconnexion Google');
          } finally {
            setIsLoading(false);
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'authentification biométrique:', error);
    }
  };

  const isPasswordValid = (pass: string) => {
    const hasMinLength = pass.length >= 8;
    const hasUpperCase = /[A-Z]/.test(pass);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    
    return hasMinLength && hasUpperCase && hasSpecialChar;
  };

  const getPasswordValidationErrors = (pass: string) => {
    const errors = [];
    if (pass.length < 8) errors.push('8 caractères minimum');
    if (!/[A-Z]/.test(pass)) errors.push('une majuscule');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) errors.push('un caractère spécial');
    return errors;
  };

  const handleAuth = async () => {
    if (!email || !password) {
      showErrorAlert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (!isLogin) {
      if (password !== confirmPassword) {
        showErrorAlert('Erreur', 'Les mots de passe ne correspondent pas');
        return;
      }

      if (!isPasswordValid(password)) {
        const errors = getPasswordValidationErrors(password);
        showErrorAlert(
          'Mot de passe invalide', 
          `Le mot de passe doit contenir au moins ${errors.join(', ')}`
        );
        return;
      }
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        
        if (!hasSavedCredentials && isBiometricSupported) {
          const shouldSave = await new Promise((resolve) => {
            Alert.alert(
              'Sauvegarder les identifiants',
              'Voulez-vous utiliser Face ID pour vous connecter plus rapidement ?',
              [
                {
                  text: 'Non',
                  onPress: () => resolve(false),
                  style: 'cancel'
                },
                {
                  text: 'Oui',
                  onPress: () => resolve(true)
                }
              ]
            );
          });

          if (shouldSave) {
            // Récupérer le nom d'utilisateur depuis Firestore si disponible
            try {
              const userDoc = await getDoc(doc(db, 'users', auth.currentUser?.uid || ''));
              const displayName = userDoc.exists() ? userDoc.data().firstName : '';
              await saveCredentials(email, password, displayName);
            } catch (error) {
              // Si on ne peut pas récupérer le nom, sauvegarder sans
              await saveCredentials(email, password);
            }
            setHasSavedCredentials(true);
          }
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid;
        
        await setDoc(doc(db, 'users', userId), {
          email: email,
          firstName: '',
          age: null,
          gender: '',
          isPremium: false,
          onboarding: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      // Navigation sera gérée automatiquement par AuthContext
    } catch (error: any) {      
      let errorMessage = 'Une erreur est survenue lors de l\'authentification';
      let errorTitle = 'Erreur';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorTitle = 'Email déjà utilisé';
          errorMessage = 'Cette adresse email est déjà utilisée';
          break;
        case 'auth/invalid-email':
          errorTitle = 'Email invalide';
          errorMessage = 'Adresse email invalide';
          break;
        case 'auth/operation-not-allowed':
          errorTitle = 'Opération non autorisée';
          errorMessage = 'Opération non autorisée';
          break;
        case 'auth/weak-password':
          errorTitle = 'Mot de passe faible';
          errorMessage = 'Le mot de passe est trop faible';
          break;
        case 'auth/user-disabled':
          errorTitle = 'Compte désactivé';
          errorMessage = 'Ce compte a été désactivé';
          break;
        case 'auth/user-not-found':
          errorTitle = 'Compte non trouvé';
          errorMessage = 'Aucun compte associé à cette adresse email';
          break;
        case 'auth/invalid-credential':
          errorTitle = 'Mot de passe incorrect';
          errorMessage = 'Mot de passe incorrect';
          break;
        case 'auth/too-many-requests':
          errorTitle = 'Trop de tentatives';
          errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard';
          break;
      }
      
      showErrorAlert(errorTitle, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setShowResetPassword(true);
  };

  const saveCredentials = async (email: string, password: string, displayName?: string) => {
    try {
      await SecureStore.setItemAsync('userEmail', email);
      await SecureStore.setItemAsync('userPassword', password);
      await SecureStore.setItemAsync('authMethod', 'email');
      if (displayName) {
        await SecureStore.setItemAsync('userDisplayName', displayName);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des identifiants:', error);
    }
  };

  const saveAppleCredentials = async (userId: string, email: string, displayName: string) => {
    try {
      await SecureStore.setItemAsync('userEmail', email);
      await SecureStore.setItemAsync('userId', userId);
      await SecureStore.setItemAsync('userDisplayName', displayName);
      await SecureStore.setItemAsync('authMethod', 'apple');
      console.log('Identifiants Apple sauvegardés localement');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des identifiants Apple:', error);
    }
  };

  const saveGoogleCredentials = async (userId: string, email: string, displayName: string) => {
    try {
      await SecureStore.setItemAsync('userEmail', email);
      await SecureStore.setItemAsync('userId', userId);
      await SecureStore.setItemAsync('userDisplayName', displayName);
      await SecureStore.setItemAsync('authMethod', 'google');
      console.log('Identifiants Google sauvegardés localement');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des identifiants Google:', error);
    }
  };

  const handleAppleAuth = async () => {
    try {
      setIsLoading(true);
      
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        showErrorAlert('Erreur', 'Apple Authentication n\'est pas disponible sur cet appareil');
        return;
      }

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const { identityToken, email, fullName } = credential;
      
      if (!identityToken) {
        showErrorAlert('Erreur', 'Token d\'identité Apple manquant');
        return;
      }

      const provider = new OAuthProvider('apple.com');
      const firebaseCredential = provider.credential({
        idToken: identityToken,
      });

      const userCredential = await signInWithCredential(auth, firebaseCredential);
      const userId = userCredential.user.uid;
      
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (!userDoc.exists()) {
        const displayName = fullName ? `${fullName.givenName || ''} ${fullName.familyName || ''}`.trim() : '';
        const userEmail = email || '';
        const isPrivateEmail = userEmail.includes('privaterelay.appleid.com');
        
        await setDoc(doc(db, 'users', userId), {
          email: userEmail,
          firstName: displayName,
          age: null,
          gender: '',
          isPremium: false,
          onboarding: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        
        await saveAppleCredentials(userId, userEmail, displayName);
      } else {
        const userData = userDoc.data();
        const displayName = userData.firstName || '';
        const userEmail = email || userData.email || '';
        
        if (!userData.email && email) {
          await setDoc(doc(db, 'users', userId), {
            email: email,
            updatedAt: new Date(),
          }, { merge: true });
        }
        
        await saveAppleCredentials(userId, userEmail, displayName);
      }
      
      // Navigation sera gérée automatiquement par AuthContext
    } catch (error: any) {
      console.error('Erreur lors de l\'authentification Apple:', error);
      
      if (error.code === 'ERR_CANCELED') {
        console.log('Authentification Apple annulée par l\'utilisateur');
      } else if (error.code === 'auth/operation-not-allowed') {
        showErrorAlert('Erreur', 'Apple Authentication n\'est pas activé dans Firebase.');
      } else if (error.code === 'auth/invalid-credential') {
        showErrorAlert('Erreur', 'Identifiants Apple invalides. Veuillez réessayer.');
      } else {
        showErrorAlert('Erreur', `Échec de la connexion avec Apple: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleQuickAuth = async () => {
    try {
      if (Platform.OS === 'android') {
        const hasPlayServices = await GoogleSignin.hasPlayServices();
        if (!hasPlayServices) {
          showErrorAlert('Erreur', 'Google Play Services n\'est pas disponible');
          return;
        }
      }

      let userInfo;
      try {
        userInfo = await GoogleSignin.signIn();
      } catch (signInError) {
        console.log('Erreur lors de l\'authentification Google:', signInError);
        return;
      }

      if (!userInfo || !userInfo.data) {
        console.log('Authentification Google annulée par l\'utilisateur');
        return;
      }

      let idToken;
      try {
        const tokens = await GoogleSignin.getTokens();
        idToken = tokens.idToken;
      } catch (tokenError) {
        console.log('Erreur lors de la récupération du token:', tokenError);
        return;
      }
      
      if (!idToken || idToken.length < 10) {
        console.log('Token Google invalide');
        return;
      }

      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      const userId = userCredential.user.uid;
      
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (!userDoc.exists()) {
        const firebaseUser = userCredential.user;
        
        await setDoc(doc(db, 'users', userId), {
          email: firebaseUser.email || '',
          firstName: firebaseUser.displayName || '',
          age: null,
          gender: '',
          isPremium: false,
          onboarding: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        
        await saveGoogleCredentials(userId, firebaseUser.email || '', firebaseUser.displayName || '');
      } else {
        const userData = userDoc.data();
        const firebaseUser = userCredential.user;
        const displayName = userData.firstName || firebaseUser.displayName || '';
        const userEmail = firebaseUser.email || userData.email || '';
        
        await saveGoogleCredentials(userId, userEmail, displayName);
      }
      
      // Navigation sera gérée automatiquement par AuthContext
    } catch (error: any) {
      console.error('Erreur lors de la reconnexion Google:', error);
      
      if (error.code === 'SIGN_IN_CANCELLED' || 
          error.code === 'SIGN_IN_REQUIRED' ||
          error.code === 'SIGN_IN_FAILED' ||
          error.message?.includes('cancelled') ||
          error.message?.includes('canceled')) {
        console.log('Authentification Google annulée par l\'utilisateur');
        return;
      } else if (error.code === 'auth/operation-not-allowed') {
        showErrorAlert('Erreur', 'Google Authentication n\'est pas activé dans Firebase.');
      } else if (error.code === 'auth/invalid-credential') {
        showErrorAlert('Erreur', 'Identifiants Google invalides. Veuillez réessayer.');
      } else {
        showErrorAlert('Erreur', `Échec de la reconnexion avec Google: ${error.message}`);
      }
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setIsLoading(true);
      
      if (Platform.OS === 'android') {
        const hasPlayServices = await GoogleSignin.hasPlayServices();
        if (!hasPlayServices) {
          showErrorAlert('Erreur', 'Google Play Services n\'est pas disponible');
          return;
        }
      }

      await GoogleSignin.hasPlayServices();
      
      try {
        await GoogleSignin.signOut();
      } catch (signOutError) {
        console.log('Déconnexion Google:', signOutError);
      }
      
      let userInfo;
      try {
        userInfo = await GoogleSignin.signIn();
      } catch (signInError) {
        console.log('Erreur lors de l\'authentification Google:', signInError);
        return;
      }

      if (!userInfo) {
        console.log('Authentification Google annulée par l\'utilisateur');
        return;
      }

      let idToken;
      try {
        const tokens = await GoogleSignin.getTokens();
        idToken = tokens.idToken;
      } catch (tokenError) {
        console.log('Erreur lors de la récupération du token:', tokenError);
        return;
      }
      
      if (!idToken || idToken.length < 10) {
        console.log('Token Google invalide');
        return;
      }

      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      const userId = userCredential.user.uid;
      
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (!userDoc.exists()) {
        const firebaseUser = userCredential.user;
        
        await setDoc(doc(db, 'users', userId), {
          email: firebaseUser.email || '',
          firstName: firebaseUser.displayName || '',
          age: null,
          gender: '',
          isPremium: false,
          onboarding: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        
        await saveGoogleCredentials(userId, firebaseUser.email || '', firebaseUser.displayName || '');
      } else {
        const userData = userDoc.data();
        const firebaseUser = userCredential.user;
        const displayName = userData.firstName || firebaseUser.displayName || '';
        const userEmail = firebaseUser.email || userData.email || '';
        
        await saveGoogleCredentials(userId, userEmail, displayName);
      }
      
      // Navigation sera gérée automatiquement par AuthContext
    } catch (error: any) {
      console.error('Erreur lors de l\'authentification Google:', error);
      
      if (error.code === 'SIGN_IN_CANCELLED' || 
          error.code === 'SIGN_IN_REQUIRED' ||
          error.code === 'SIGN_IN_FAILED' ||
          error.message?.includes('cancelled') ||
          error.message?.includes('canceled')) {
        console.log('Authentification Google annulée par l\'utilisateur');
        return;
      } else if (error.code === 'auth/operation-not-allowed') {
        showErrorAlert('Erreur', 'Google Authentication n\'est pas activé dans Firebase.');
      } else if (error.code === 'auth/invalid-credential') {
        showErrorAlert('Erreur', 'Identifiants Google invalides. Veuillez réessayer.');
      } else {
        showErrorAlert('Erreur', `Échec de la connexion avec Google: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.header, { marginTop: insets.top }]}>
            <Image source={require('../assets/images/voyage-sur-logo.png')}style={styles.logo} contentFit="cover" cachePolicy="memory-disk" />
            <Text style={styles.appSubtitle}>
              Votre compagnon santé pour des voyages en toute sérénité
            </Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>{isLogin ? '👤 Connexion' : '✍️ Inscription'}</Text>
          
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>📧 Email</Text>
              <TextInput
                style={styles.input}
                placeholder="exemple@email.com"
                textContentType="username"
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!isLoading}
                pointerEvents={isLoading ? "none" : "auto"}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>🔒 Mot de passe</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  textContentType="password"
                  placeholder="••••••••"
                  placeholderTextColor="#666"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                  pointerEvents={isLoading ? "none" : "auto"}
                />
                <TouchableOpacity 
                  style={styles.eyeIcon} 
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  <MaterialCommunityIcons 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={24} 
                    color="#666" 
                  />
                </TouchableOpacity>
              </View>
              {!isLogin && (
                <Text style={styles.passwordHint}>
                  Le mot de passe doit contenir au moins 8 caractères, une majuscule et un caractère spécial
                </Text>
              )}
            </View>
            
            {!isLogin && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>🔒 Confirmer le mot de passe</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    textContentType="newPassword"
                    placeholder="••••••••"
                    placeholderTextColor="#666"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    editable={!isLoading}
                    pointerEvents={isLoading ? "none" : "auto"}
                  />
                  <TouchableOpacity 
                    style={styles.eyeIcon} 
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    <MaterialCommunityIcons 
                      name={showConfirmPassword ? "eye-off" : "eye"} 
                      size={24} 
                      color="#666" 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            
            {isLogin && (
              <TouchableOpacity 
                style={styles.forgotPasswordButton} 
                onPress={handleForgotPassword}
                disabled={isLoading}
              >
                <Text style={styles.forgotPasswordText}>
                  🔑 Mot de passe oublié ?
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.button, isLoading && styles.buttonDisabled]} 
              onPress={isLogin ? (isBiometricSupported && !email && !password ? handleBiometricAuth : handleAuth) : handleAuth}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <View style={styles.buttonContent}>
                  {isLogin && isBiometricSupported && !email && !password && (
                    <MaterialCommunityIcons 
                      name={Platform.OS === 'ios' ? 'face-recognition' : 'fingerprint'} 
                      size={24} 
                      color="#fff" 
                      style={styles.buttonIcon}
                    />
                  )}
                  <Text style={styles.buttonText}>
                    {isLogin ? 'Se connecter' : 'S\'inscrire'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            
            {isLogin && (
              <Text style={styles.orText}>
                Ou
              </Text>
            )}

            {isLogin && isAppleAuthAvailable && (
              <TouchableOpacity 
                style={[styles.appleButton, isLoading && styles.buttonDisabled]} 
                onPress={handleAppleAuth}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <View style={styles.buttonContent}>
                    <MaterialCommunityIcons 
                      name="apple" 
                      size={24} 
                      color="#fff" 
                      style={styles.buttonIcon}
                    />
                    <Text style={styles.buttonText}>
                      Se connecter avec Apple
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            {isLogin && isGoogleAuthAvailable && (
              <TouchableOpacity 
                style={[styles.googleButton, isLoading && styles.buttonDisabled]} 
                onPress={handleGoogleAuth}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <View style={styles.buttonContent}>
                    <MaterialCommunityIcons 
                      name="google" 
                      size={24} 
                      color="#fff" 
                      style={styles.buttonIcon}
                    />
                    <Text style={styles.buttonText}>
                      Se connecter avec Google
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={styles.switchButton} 
              onPress={() => {
                if (isLogin) {
                  setIsLogin(false);
                  setConfirmPassword('');
                } else {
                  setIsLogin(true);
                  setConfirmPassword('');
                }
              }}
              disabled={isLoading}
            >
              <Text style={styles.switchText}>
                {isLogin ? '✨ Créer un compte' : '👋 Déjà un compte ? Se connecter'}
              </Text>
            </TouchableOpacity>

            {showReconnectButton && (
              <TouchableOpacity 
                style={styles.reconnectButton} 
                onPress={async () => {
                  setIsLoading(true);
                  try {
                    const storedEmail = await SecureStore.getItemAsync('userEmail');
                    const storedPassword = await SecureStore.getItemAsync('userPassword');
                    if (storedEmail && storedPassword) {
                      await signInWithEmailAndPassword(auth, storedEmail, storedPassword);
                      setShowReconnectButton(false);
                    }
                  } catch (error) {
                    console.error('Erreur lors de la reconnexion:', error);
                    showErrorAlert('Erreur', 'Impossible de se reconnecter automatiquement');
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
              >
                <MaterialCommunityIcons 
                  name="refresh" 
                  size={20} 
                  color="#60a5fa" 
                  style={styles.buttonIcon}
                />
                <Text style={styles.reconnectButtonText}>
                  🔄 Se reconnecter automatiquement
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      <ResetPassword 
        visible={showResetPassword}
        onClose={() => setShowResetPassword(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    flex: 0.25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  appTitle: {
    fontSize: 32,
    color: '#60a5fa',
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  formContainer: {
    flex: 0.75,
    backgroundColor: '#1a1a1a',
    padding: 25,
    paddingTop: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 15,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    color: '#999',
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#2d2d2d',
    borderRadius: 12,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#444',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d2d2d',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#444',
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    color: '#fff',
    fontSize: 16,
  },
  eyeIcon: {
    padding: 15,
  },
  passwordHint: {
    color: '#999',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 4,
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#60a5fa',
    padding: 16,
    borderRadius: 12,
    marginTop: 15,
    shadowColor: '#60a5fa',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  buttonDisabled: {
    backgroundColor: '#4a5568',
    shadowOpacity: 0,
  },
  appleButton: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  googleButton: {
    backgroundColor: '#4285F4',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    shadowColor: '#4285F4',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchButton: {
    marginTop: 15,
  },
  switchText: {
    color: '#60a5fa',
    textAlign: 'center',
    fontSize: 14,
  },
  orText: {
    color: '#60a5fa',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 10,
    marginBottom: 5,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: -10,
    marginBottom: 10,
    padding: 5,
  },
  forgotPasswordText: {
    color: '#60a5fa',
    fontSize: 14,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  buttonIcon: {
    marginRight: 8,
  },
  reconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    padding: 12,
    backgroundColor: 'rgba(96, 165, 250, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#60a5fa',
  },
  reconnectButtonText: {
    color: '#60a5fa',
    fontSize: 14,
    fontWeight: 'bold',
  },
  logo: {
    width: 220,
    height: 160,
    marginBottom: 5,
    borderRadius: 20,
  },
}); 